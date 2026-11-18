import argparse
import sys
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import AdminRole, AdminUser
from app.db.seed import seed_database


def create_admin(email: str, password: str, full_name: str, role: str = "super_admin"):
    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()
        if existing:
            print(f"Error: Admin with email {email} already exists.")
            sys.exit(1)

        try:
            admin_role = AdminRole(role)
        except ValueError:
            print(f"Error: Invalid role {role}. Allowed roles: {[r.value for r in AdminRole]}")
            sys.exit(1)

        admin = AdminUser(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=admin_role,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Successfully created admin user: {admin.email} (Role: {admin.role.value})")
    finally:
        db.close()


def run_seed():
    db = SessionLocal()
    try:
        counts = seed_database(db)
        print("Database seeded successfully:")
        for k, v in counts.items():
            print(f"  - {k}: {v}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Hardware Store Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create-admin", help="Create an initial admin user")
    create_parser.add_argument("--email", required=True, help="Admin email address")
    create_parser.add_argument("--password", required=True, help="Admin password")
    create_parser.add_argument("--name", default="Super Administrator", help="Admin full name")
    create_parser.add_argument("--role", default="super_admin", help="Admin role")

    subparsers.add_parser("seed-db", help="Seed database with initial categories, brands, and products")

    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.password, args.name, args.role)
    elif args.command == "seed-db":
        run_seed()


if __name__ == "__main__":
    main()
