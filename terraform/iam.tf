#############################################
# ECS Task Execution Role
# Allows ECS to pull images and write logs.
#############################################

resource "aws_iam_role" "ecs_task_execution_role" {

  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-task-execution-role"
  })
}

#############################################
# Attach the AWS-managed execution policy.
#############################################

resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {

  role = aws_iam_role.ecs_task_execution_role.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

#############################################
# ECS Task Role
# Used by your application code.
#############################################

resource "aws_iam_role" "ecs_task_role" {

  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-task-role"
  })
}