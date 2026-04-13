#!/usr/bin/env bash
# One-time setup on Amazon Linux 2023 (or similar) to run Docker + Compose.
# Usage (as root or with sudo):
#   curl -fsSL https://raw.githubusercontent.com/.../ec2-bootstrap.sh | sudo bash
# Or copy this file to the instance and: sudo bash ec2-bootstrap.sh
#
# After this: install git, clone your repo, copy deploy/env.production.example to .env,
# edit DATABASE_URL for RDS, then: docker compose up -d --build

set -euo pipefail

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Run with sudo"
  exit 1
fi

if command -v dnf &>/dev/null; then
  dnf -y update
  dnf -y install docker docker-compose-plugin git
  systemctl enable docker
  systemctl start docker
elif command -v yum &>/dev/null; then
  yum -y update
  yum -y install docker git
  systemctl enable docker
  systemctl start docker
  # Compose plugin may be available as: yum install docker-compose-plugin
else
  echo "Unsupported package manager; install Docker manually."
  exit 1
fi

# Allow ec2-user to use docker (log out/in to apply)
if id ec2-user &>/dev/null; then
  usermod -aG docker ec2-user
fi

echo "Docker and Compose are installed."
echo "Next: clone repo, create .env from deploy/env.production.example, run: docker compose up -d --build"
echo "Open EC2 security group inbound TCP \${PUBLIC_PORT:-80} to the internet (or your IP)."
