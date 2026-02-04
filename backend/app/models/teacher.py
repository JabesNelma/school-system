"""Teacher model."""
from datetime import datetime
from app.extensions import db

class Teacher(db.Model):
    """Teacher model."""
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    subjects = db.Column(db.Text, nullable=False)  # Comma-separated subjects
    qualification = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, default=0)
    joining_date = db.Column(db.Date, nullable=False)
    address = db.Column(db.Text)
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedules = db.relationship('Schedule', backref='teacher', lazy='dynamic')
    
    def to_dict(self):
        """Convert teacher to dictionary."""
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'subjects': self.subjects.split(',') if self.subjects else [],
            'subjects_text': self.subjects,
            'qualification': self.qualification,
            'experience_years': self.experience_years,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'address': self.address,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Teacher {self.teacher_id}: {self.first_name} {self.last_name}>'