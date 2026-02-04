"""Helper utility functions."""
from datetime import datetime
from app.extensions import db

def generate_student_id():
    """Generate a unique student ID."""
    from app.models.student import Student
    
    year = datetime.now().year
    prefix = f"STD{year}"
    
    # Get the last student ID with this prefix
    last_student = Student.query.filter(
        Student.student_id.like(f"{prefix}%")
    ).order_by(Student.student_id.desc()).first()
    
    if last_student:
        # Extract the number and increment
        try:
            last_num = int(last_student.student_id.replace(prefix, ""))
            new_num = last_num + 1
        except ValueError:
            new_num = 1
    else:
        new_num = 1
    
    return f"{prefix}{new_num:05d}"

def generate_teacher_id():
    """Generate a unique teacher ID."""
    from app.models.teacher import Teacher
    
    year = datetime.now().year
    prefix = f"TCH{year}"
    
    # Get the last teacher ID with this prefix
    last_teacher = Teacher.query.filter(
        Teacher.teacher_id.like(f"{prefix}%")
    ).order_by(Teacher.teacher_id.desc()).first()
    
    if last_teacher:
        # Extract the number and increment
        try:
            last_num = int(last_teacher.teacher_id.replace(prefix, ""))
            new_num = last_num + 1
        except ValueError:
            new_num = 1
    else:
        new_num = 1
    
    return f"{prefix}{new_num:05d}"

def format_datetime(dt):
    """Format datetime for display."""
    if not dt:
        return None
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def format_date(d):
    """Format date for display."""
    if not d:
        return None
    return d.strftime('%Y-%m-%d')

def format_time(t):
    """Format time for display."""
    if not t:
        return None
    return t.strftime('%H:%M')