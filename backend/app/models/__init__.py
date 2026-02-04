"""Database models."""
from app.models.user import User
from app.models.student_registration import StudentRegistration
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.material import Material
from app.models.schedule import Schedule

__all__ = ['User', 'StudentRegistration', 'Student', 'Teacher', 'Material', 'Schedule']