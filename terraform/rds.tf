# Places RDS only inside private subnets.
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

# PostgreSQL database for uptime monitor.
resource "aws_db_instance" "postgres" {
  identifier                  = "${var.project_name}-postgres"
  engine                      = "postgres"
  engine_version              = "16"
  instance_class              = "db.t3.micro"
  allocated_storage           = 20
  storage_type                = "gp3"
  db_name                     = "uptime_monitor"
  username                    = var.db_username
  password                    = var.db_password
  port                        = 5432
  db_subnet_group_name        = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids      = [aws_security_group.rds_sg.id]
  publicly_accessible         = false
  skip_final_snapshot         = true
  deletion_protection         = false
  storage_encrypted           = true
  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false
  multi_az                    = false
  backup_retention_period     = 7


  tags = merge(local.common_tags, {
    Name = "${var.project_name}-postgres"
  })
}