require("dotenv").config();

const {
  BedrockRuntimeClient,
  ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// Read the AWS region and model ID from the environment.
const region = process.env.AWS_REGION || "us-east-1";
const modelId =
  process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0";

// The SDK will use your configured AWS CLI credentials locally.
const client = new BedrockRuntimeClient({
  region,
});

async function testBedrock() {
  try {
    const command = new ConverseCommand({
      modelId,

      system: [
        {
          text: `
You are a cautious site reliability engineering assistant.
Analyze only the monitoring evidence supplied by the user.
Do not present a possible cause as a confirmed root cause.
          `.trim(),
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
                    name: "Example API",
                    url: "https://example.com/health",
                  },
                  recentChecks: [
                    {
                      status: "UP",
                      statusCode: 200,
                      responseTimeMs: 145,
                      errorMessage: null,
                    },
                    {
                      status: "DOWN",
                      statusCode: 503,
                      responseTimeMs: 4875,
                      errorMessage: null,
                    },
                    {
                      status: "DOWN",
                      statusCode: 503,
                      responseTimeMs: 5021,
                      errorMessage: null,
                    },
                  ],
                  instructions: [
                    "Summarize the incident.",
                    "Assign LOW, MEDIUM, HIGH, or CRITICAL severity.",
                    "List likely causes.",
                    "List recommended troubleshooting actions.",
                  ],
                },
                null,
                2
              ),
            },
          ],
        },
      ],

      inferenceConfig: {
        maxTokens: 600,
        temperature: 0.1,
      },
    });

    const response = await client.send(command);

    const responseText = response.output?.message?.content
      ?.map((block) => block.text || "")
      .join("")
      .trim();

    if (!responseText) {
      throw new Error("Bedrock returned an empty response.");
    }

    console.log("\nBedrock connection successful:\n");
    console.log(responseText);
  } catch (error) {
    console.error("\nBedrock test failed.");
    console.error("Error name:", error.name);
    console.error("Message:", error.message);

    process.exitCode = 1;
  }
}

testBedrock();