# Shared tags applied to AWS resources.
locals {
  common_tags = {
    Project     = var.project_name
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}