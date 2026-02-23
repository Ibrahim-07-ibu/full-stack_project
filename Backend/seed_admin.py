import sys
import os

# Get the Backend directory (where this script is located)
backend_root = os.path.dirname(os.path.abspath(__file__))
# Get project root
project_root = os.path.dirname(backend_root)

if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Chdir to root so .env is found
os.chdir(project_root)

from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.users import User
from pwd_utils import hash_password

def seed_admin():
    print("Checking for Admin user...")
    db = SessionLocal()
    try:
        admin_email = "admin@homebuddy.com"
        admin_pwd = "admin123"
        
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if admin:
            print(f"Admin user already exists with role: {admin.role}")
            if admin.role != "admin":
                print("Updating role to admin...")
                admin.role = "admin"
                db.commit()
                print("Role updated.")
            
            print("Updating password to 'admin123' to be sure...")
            admin.password = hash_password(admin_pwd)
            db.commit()
            print("Password updated.")
        else:
            print("Admin user not found. Creating...")
            new_admin = User(
                name="System Administrator",
                email=admin_email,
                password=hash_password(admin_pwd),
                phone="0000000000",
                address="Internal System",
                role="admin",
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            print("Admin user created successfully!")

    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
