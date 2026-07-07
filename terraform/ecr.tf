# Backend Docker image repository.
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-ecr"
  })
}

# Frontend Docker image repository.
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-frontend-ecr"
  })
}