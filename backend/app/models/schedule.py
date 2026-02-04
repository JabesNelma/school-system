"""Schedule/Class timetable model."""
from datetime import datetime
from app.extensions import db

class Schedule(db.Model):
    """Class schedule/timetable model."""
    __tablename__ = 'schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    grade_level = db.Column(db.String(20), nullable=False)
    section = db.Column(db.String(10))
    day_of_week = db.Column(db.String(10), nullable=False)  # Monday, Tuesday, etc.
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    room = db.Column(db.String(30))
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'))
    description = db.Column(db.Text)
    is_recurring = db.Column(db.Boolean, default=True)
    effective_from = db.Column(db.Date, nullable=False)
    effective_until = db.Column(db.Date)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='schedules_created')
    
    def to_dict(self):
        """Convert schedule to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'subject': self.subject,
            'grade_level': self.grade_level,
            'section': self.section,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'room': self.room,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'description': self.description,
            'is_recurring': self.is_recurring,
            'effective_from': self.effective_from.isoformat() if self.effective_from else None,
            'effective_until': self.effective_until.isoformat() if self.effective_until else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Schedule {self.title} - {self.day_of_week}>'