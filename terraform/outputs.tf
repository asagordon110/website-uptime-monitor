# Backend ECR repo URL
output "backend_ecr_url" {
  value = aws_ecr_repository.backend.repository_url
}

# Frontend ECR repo URL
output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
}

# RDS endpoint address
output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "rds_port" {
  value = aws_db_instance.postgres.port
}

output "rds_database" {
  value = aws_db_instance.postgres.db_name
}

# ALB DNS name
output "alb_dns_name" {
  value = aws_lb.app.dns_name
}