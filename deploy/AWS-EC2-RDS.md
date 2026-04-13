# Deploy on AWS EC2 + Amazon RDS (Docker)

Goal: one app container on EC2 (public IP) and MySQL on RDS.

## 1. RDS (MySQL)

1. Create a **MySQL** DB instance (same major version as local dev if possible).
2. Initial database name: **`fma`** (or keep default and create `fma` in MySQL).
3. Note **endpoint**, **port** (3306), **master username/password**.
4. Security group **inbound**: **MySQL (3306)** from the **EC2 instance security group** only (not `0.0.0.0/0`).

Build the URL (URL-encode characters like `@` `:` `#` in the password):

`mysql://USERNAME:PASSWORD@endpoint.region.rds.amazonaws.com:3306/fma`

## 2. EC2

1. Launch an instance (Amazon Linux 2023, t3.small or larger).
2. Security group **inbound**:
   - **SSH (22)** from your IP.
   - **HTTP (80)** from `0.0.0.0/0` (or restrict to your IP) — matches `PUBLIC_PORT=80` in compose.
3. **Associate a public IPv4 address** (or use Elastic IP).

## 3. One-time Docker install on the instance

SSH in, then either:

```bash
sudo bash deploy/ec2-bootstrap.sh
```

or manually install Docker and [Docker Compose v2](https://docs.docker.com/compose/install/linux/).

Log out and back in so `ec2-user` is in the `docker` group.

## 4. App + database schema

On the instance:

```bash
git clone <your-repo-url> food-management-system
cd food-management-system
cp deploy/env.production.example .env
nano .env   # set DATABASE_URL, JWT_SECRET, VITE_APP_ID, STATIC_ADMIN_PHONE, etc.
```

Apply schema to RDS (from your laptop **or** the EC2 host if `pnpm`/`drizzle-kit` is installed; RDS SG must allow your source):

```bash
export DATABASE_URL='mysql://...'
pnpm install
pnpm exec drizzle-kit push
```

Or run a one-off migrate from any machine that can reach RDS.

## 5. Start the stack

From the repo root on EC2:

```bash
docker compose up -d --build
```

Browse: **`http://YOUR_PUBLIC_IP`**

## 6. HTTPS (recommended)

Put **Application Load Balancer** + ACM certificate in front of EC2, target group → instance port **80** (or 3000 if you map differently). Set `TRUST_PROXY_HOPS=1` (default) so secure cookies work.

## Troubleshooting

- **502 / connection refused**: check `docker compose ps`, security groups, and `PUBLIC_PORT`.
- **DB errors**: verify RDS SG allows **EC2 SG** on 3306; test `DATABASE_URL` with `mysql` client from EC2.
- **Session / login issues behind HTTPS**: ensure ALB sends `X-Forwarded-Proto: https` and keep `TRUST_PROXY_HOPS` aligned with your proxy chain.
