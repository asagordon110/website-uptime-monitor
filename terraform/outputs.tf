# Backend ECR repo URL
output "backend_ecr_url" {
  value = aws_ecr_repository.backend.repository_url
}

# Frontend ECR repo URL
output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
}