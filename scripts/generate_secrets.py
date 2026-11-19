#!/usr/bin/env python3
"""
Production Secrets Generator for Naseer Plywood & Hardware

Generates high-entropy, cryptographically secure secrets for:
- SECRET_KEY (FastAPI JWT signature key)
- POSTGRES_PASSWORD (Database authentication)
- ADMIN_INITIAL_PASSWORD (Initial Super Admin bootstrap)

Usage:
    python3 scripts/generate_secrets.py [--env-file .env.production]
"""

import argparse
import secrets
import string
import sys
from pathlib import Path


def generate_alphanumeric_password(length: int = 32) -> str:
    """Generate a secure alphanumeric password with special characters."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    # Ensure at least one lowercase, uppercase, digit, and special char
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*()-_=+"),
    ]
    password += [secrets.choice(chars) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


def generate_secret_key(length: int = 64) -> str:
    """Generate a high-entropy URL-safe token for JWT cryptographic signing."""
    return secrets.token_urlsafe(length)


def main():
    parser = argparse.ArgumentParser(description="Generate production secrets.")
    parser.add_argument(
        "--env-file",
        help="Optional path to output a populated .env file (e.g., .env.production)",
        default=None,
    )
    args = parser.parse_args()

    secret_key = generate_secret_key(48)
    postgres_password = generate_alphanumeric_password(32)
    admin_bootstrap_password = generate_alphanumeric_password(24)

    print("======================================================================")
    print("PRODUCTION SECRETS GENERATED (CRYPTOGRAPHICALLY SECURE)")
    print("======================================================================")
    print(f"SECRET_KEY:              {secret_key}")
    print(f"POSTGRES_PASSWORD:       {postgres_password}")
    print(f"ADMIN_INITIAL_PASSWORD:  {admin_bootstrap_password}")
    print("======================================================================")
    print("WARNING: Never commit real production secrets to version control!")
    print("Store them in a secure secret manager or encrypted vault.")
    print("======================================================================")

    if args.env_file:
        output_path = Path(args.env_file)
        if output_path.exists():
            print(f"Error: Target file {output_path} already exists. Aborting overwrite.")
            sys.exit(1)

        template_path = Path(".env.production.template")
        if not template_path.exists():
            print("Error: .env.production.template not found.")
            sys.exit(1)

        content = template_path.read_text(encoding="utf-8")
        content = content.replace("GENERATE_SECRET_KEY_HERE", secret_key)
        content = content.replace("GENERATE_POSTGRES_PASSWORD_HERE", postgres_password)
        content = content.replace("GENERATE_ADMIN_INITIAL_PASSWORD_HERE", admin_bootstrap_password)

        output_path.write_text(content, encoding="utf-8")
        print(f"Successfully wrote production environment file to: {output_path}")


if __name__ == "__main__":
    main()
