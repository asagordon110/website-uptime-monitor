#############################################
# Public Application Load Balancer
#############################################

resource "aws_lb" "app" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  internal           = false

  security_groups = [
    aws_security_group.alb_sg.id
  ]

  subnets = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id
  ]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-alb"
  })
}

#############################################
# Frontend target group
#############################################

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.uptime_monitor_vpc.id
  target_type = "ip"

  health_check {
    enabled = true

    path     = "/"
    protocol = "HTTP"
    port     = "traffic-port"

    matcher = "200"

    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-frontend-tg"
  })
}

#############################################
# Backend target group
#############################################

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-backend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.uptime_monitor_vpc.id
  target_type = "ip"

  health_check {
    enabled = true

    path     = "/health"
    protocol = "HTTP"
    port     = "traffic-port"

    matcher = "200"

    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-tg"
  })
}

#############################################
# HTTP listener
#
# Normal browser traffic goes to the frontend.
#############################################

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn

  port     = 80
  protocol = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

#############################################
# Backend listener rule
#
# API traffic and the public health endpoint
# are forwarded to the Express backend.
#############################################

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = [
        "/api/*",
        "/health"
      ]
    }
  }
}