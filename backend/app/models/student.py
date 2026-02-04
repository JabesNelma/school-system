"""Student model for approved/enrolled students."""
from datetime import datetime
from app.extensions import db

class Student(db.Model):
    """Student model for enrolled students."""
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text)
    enrollment_date = db.Column(db.Date, nullable=False)
    grade_level = db.Column(db.String(20), nullable=False)
    section = db.Column(db.String(10))
    parent_name = db.Column(db.String(100), nullable=False)
    parent_phone = db.Column(db.String(20), nullable=False)
    parent_email = db.Column(db.String(120))
    emergency_contact = db.Column(db.String(100), nullable=False)
    emergency_phone = db.Column(db.String(20), nullable=False)
    medical_notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, inactive, graduated, transferred
    registration_id = db.Column(db.Integer, db.ForeignKey('student_registrations.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    registration = db.relationship('StudentRegistration', backref='student_record')
    
    def to_dict(self):
        """Convert student to dictionary."""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'address': self.address,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'grade_level': self.grade_level,
            'section': self.section,
            'parent_name': self.parent_name,
            'parent_phone': self.parent_phone,
            'parent_email': self.parent_email,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'medical_notes': self.medical_notes,
            'status': self.status,
            'registration_id': self.registration_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Student {self.student_id}: {self.first_name} {self.last_name}>'