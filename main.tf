provider "aws" {
  region = "us-east-1"  # Change this if you are in a different region (e.g., ap-south-1)
}

# --- 1. Get the latest Ubuntu 22.04 Image ID automatically ---
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Official Ubuntu Owner ID)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- 2. Create Security Group (Firewall) ---
resource "aws_security_group" "web_sg" {
  name        = "jenkins-prod-sg"
  description = "Allow SSH, HTTP, and Jenkins traffic"

  # SSH Access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For production, replace this with your specific IP
  }

  # HTTP (Website) Access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins Port (8080)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend Port (Example: 4000 - Optional if backend is exposed directly)
  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound Traffic (Allow servers to download updates/Docker images)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- 3. Create Jenkins Server ---
resource "aws_instance" "jenkins_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  
  # REPLACE THIS with your actual key name from AWS Console -> EC2 -> Key Pairs
  key_name      = "your-key-name" 
  
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "Jenkins-Server"
  }
}

# --- 4. Create Production Server ---
resource "aws_instance" "prod_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  
  # REPLACE THIS with your actual key name
  key_name      = "hotel"
  
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "Hotel-Production-Server"
  }
}

# --- 5. Print the IPs at the end ---
output "jenkins_public_ip" {
  value = aws_instance.jenkins_server.public_ip
  description = "Use this IP to access Jenkins (http://IP:8080)"
}

output "prod_public_ip" {
  value = aws_instance.prod_server.public_ip
  description = "Use this IP for your Hotel Website"
}