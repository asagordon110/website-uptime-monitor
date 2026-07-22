#############################################
# General project variables
#############################################

variable "aws_region" {
  description = "AWS region in which resources will be deployed"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name used to prefix project resources"
  type        = string
  default     = "uptime-monitor"
}

#############################################
# Networking variables
#############################################

variable "vpc_cidr" {
  description = "CIDR block for the project VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for the first public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for the second public subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_1_cidr" {
  description = "CIDR block for the first private subnet"
  type        = string
  default     = "10.0.101.0/24"
}

variable "private_subnet_2_cidr" {
  description = "CIDR block for the second private subnet"
  type        = string
  default     = "10.0.102.0/24"
}

variable "az_1" {
  description = "First availability zone"
  type        = string
  default     = "us-east-1a"
}

variable "az_2" {
  description = "Second availability zone"
  type        = string
  default     = "us-east-1b"
}

#############################################
# Database variables
#############################################

variable "db_username" {
  description = "Master username for the PostgreSQL database"
  type        = string
  default     = "postgres"
}

#############################################
# Amazon Bedrock variables
#############################################

variable "bedrock_model_id" {
  description = "Amazon Bedrock model used for incident analysis"
  type        = string
  default     = "amazon.nova-lite-v1:0"
}