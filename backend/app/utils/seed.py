"""Database seeding utilities."""
import os
from app.extensions import db
from app.models.user import User

def seed_admin_user():
    """Seed default admin user if no users exist."""
    # Check if any admin user exists
    if User.query.first() is None:
        # Create default admin user
        admin = User(
            username='admin',
            email='admin@school.edu',
            full_name='System Administrator',
            is_active=True,
            is_superadmin=True
        )
        
        # Set password from environment variable or use default
        admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        admin.set_password(admin_password)
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"Default admin user created: admin / {admin_password}")
        print("IMPORTANT: Please change the default password after first login!")
    else:
        print("Admin user already exists, skipping seed.")