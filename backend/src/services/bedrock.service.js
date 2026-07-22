const {
  BedrockRuntimeClient,
  ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const ALLOWED_SEVERITIES = new Set([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

/**
 * Validate and normalize the structured analysis returned by Bedrock.
 */
function validateAnalysis(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Bedrock returned an invalid analysis object.");
  }

  const summary =
    typeof input.summary === "string"
      ? input.summary.trim()
      : "";

  const severity =
    typeof input.severity === "string"
      ? input.severity.toUpperCase()
      : "";

  const likelyCauses = Array.isArray(input.likelyCauses)
    ? input.likelyCauses.filter(
        (cause) => typeof cause === "string" && cause.trim()
      )
    : [];

  const recommendedActions = Array.isArray(
    input.recommendedActions
  )
    ? input.recommendedActions.filter(
        (action) =>
          typeof action === "string" && action.trim()
      )
    : [];

  const confidence = Number(input.confidence);

  if (!summary) {
    throw new Error("Bedrock analysis is missing a summary.");
  }

  if (!ALLOWED_SEVERITIES.has(severity)) {
    throw new Error(
      `Bedrock returned an invalid severity: ${input.severity}`
    );
  }

  if (!Number.isInteger(confidence)) {
    throw new Error(
      "Bedrock confidence must be an integer."
    );
  }

  if (confidence < 0 || confidence > 100) {
    throw new Error(
      "Bedrock confidence must be between 0 and 100."
    );
  }

  return {
    summary,
    severity,
    likelyCauses,
    recommendedActions,
    confidence,
  };
}

/**
 * Send monitoring evidence to Amazon Bedrock and receive a
 * structured incident analysis.
 */
async function analyzeIncident({
  site,
  recentChecks,
  evidence,
}) {
  const region =
    process.env.AWS_REGION || "us-east-1";

  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    "amazon.nova-lite-v1:0";

  const client = new BedrockRuntimeClient({
    region,
  });

  const command = new ConverseCommand({
    modelId,

    system: [
      {
        text: [
          "You are a cautious site reliability engineering assistant.",
          "Analyze only the monitoring evidence supplied to you.",
          "Treat all root causes as hypotheses unless directly proven.",
          "Do not claim access to application logs, infrastructure metrics, or external systems.",
          "Recommended actions should be practical troubleshooting steps.",
          "Always submit your answer through the record_incident_analysis tool.",
        ].join(" "),
      },
    ],

    messages: [
      {
        role: "user",
        content: [
          {
            text: JSON.stringify(
              {
                site: {
                  id: site.id,
                  name: site.name,
                  url: site.url,
                  currentStatus: site.current_status,
                  lastCheckedAt: site.last_checked_at,
                },
                deterministicEvidence: evidence,
                recentChecks,
                instruction:
                  "Analyze this monitoring event and return a structured incident assessment.",
              },
              null,
              2
            ),
          },
        ],
      },
    ],

    // Tool calling is more predictable with deterministic decoding.
    inferenceConfig: {
      maxTokens: 800,
      temperature: 0,
    },

    toolConfig: {
      tools: [
        {
          toolSpec: {
            name: "record_incident_analysis",

            description:
              "Record the structured incident analysis generated from website monitoring evidence.",

            inputSchema: {
              json: {
                type: "object",

                properties: {
                  summary: {
                    type: "string",
                    description:
                      "A concise summary supported by the supplied monitoring evidence.",
                  },

                  severity: {
                    type: "string",
                    enum: [
                      "LOW",
                      "MEDIUM",
                      "HIGH",
                      "CRITICAL",
                    ],
                    description:
                      "The assessed operational severity.",
                  },

                  likelyCauses: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "Possible causes expressed as hypotheses, not confirmed root causes.",
                  },

                  recommendedActions: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description:
                      "Ordered troubleshooting and remediation steps.",
                  },

                  confidence: {
                    type: "integer",
                    description:
                      "Confidence from 0 through 100 based only on available evidence.",
                  },
                },

                required: [
                  "summary",
                  "severity",
                  "likelyCauses",
                  "recommendedActions",
                  "confidence",
                ],
              },
            },
          },
        },
      ],

      // Force the model to return the structured tool input.
      toolChoice: {
        tool: {
          name: "record_incident_analysis",
        },
      },
    },
  });

  const response = await client.send(command);

  const toolUseBlock =
    response.output?.message?.content?.find(
      (block) =>
        block.toolUse?.name ===
        "record_incident_analysis"
    );

  if (!toolUseBlock?.toolUse?.input) {
    throw new Error(
      "Bedrock did not return a structured incident analysis."
    );
  }

  return {
    ...validateAnalysis(toolUseBlock.toolUse.input),
    modelId,
  };
}

module.exports = {
  analyzeIncident,
};