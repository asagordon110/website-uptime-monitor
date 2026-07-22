#############################################
# RDS subnet group
# Places RDS inside the private subnets.
#############################################

resource "aws_db_subnet_group" "rds_subnet_group" {
  name = "${var.project_name}-rds-subnet-group"

  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rds-subnet-group"
  })
}

#############################################
# PostgreSQL database
#############################################

resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "uptime_monitor"
  username = var.db_username
  port     = 5432

  # RDS generates the master password and stores it
  # in AWS Secrets Manager.
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  publicly_accessible = false
  multi_az            = false

  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  backup_retention_period = 7

  # Suitable for a temporary portfolio/demo environment.
  skip_final_snapshot = true
  deletion_protection = false

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-postgres"
  })
}