"""Student registration model for pending registrations."""
from datetime import datetime
from app.extensions import db

class StudentRegistration(db.Model):
    """Student registration model for pending approvals."""
    __tablename__ = 'student_registrations'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text, nullable=False)
    parent_name = db.Column(db.String(100), nullable=False)
    parent_phone = db.Column(db.String(20), nullable=False)
    parent_email = db.Column(db.String(120))
    previous_school = db.Column(db.String(200))
    grade_applying = db.Column(db.String(20), nullable=False)
    emergency_contact = db.Column(db.String(100), nullable=False)
    emergency_phone = db.Column(db.String(20), nullable=False)
    medical_notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    admin_notes = db.Column(db.Text)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    reviewer = db.relationship('User', backref='registrations_reviewed')
    
    def to_dict(self):
        """Convert registration to dictionary."""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'address': self.address,
            'parent_name': self.parent_name,
            'parent_phone': self.parent_phone,
            'parent_email': self.parent_email,
            'previous_school': self.previous_school,
            'grade_applying': self.grade_applying,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'medical_notes': self.medical_notes,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<StudentRegistration {self.first_name} {self.last_name}>'