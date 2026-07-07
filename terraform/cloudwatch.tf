# Stores backend container logs.
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-logs"
  })
}

# Stores frontend container logs.
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-frontend"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-frontend-logs"
  })
}