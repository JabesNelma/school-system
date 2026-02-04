"""Public API routes (no authentication required)."""
from flask import Blueprint, request, jsonify
from datetime import datetime

from app.extensions import db
from app.models.teacher import Teacher
from app.models.material import Material
from app.models.schedule import Schedule
from app.models.student_registration import StudentRegistration
from app.utils.validators import validate_email, validate_phone, validate_required

public_bp = Blueprint('public', __name__)

# ==================== TEACHERS (PUBLIC VIEW) ====================

@public_bp.route('/teachers', methods=['GET'])
def get_teachers():
    """Get all active teachers (public view)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    department = request.args.get('department')
    search = request.args.get('search')
    
    query = Teacher.query.filter_by(is_active=True)
    
    if department:
        query = query.filter_by(department=department)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Teacher.first_name.ilike(search_filter),
                Teacher.last_name.ilike(search_filter),
                Teacher.subjects.ilike(search_filter)
            )
        )
    
    pagination = query.order_by(Teacher.last_name).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'teachers': [t.to_dict() for t in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
    }), 200

@public_bp.route('/teachers/<int:teacher_id>', methods=['GET'])
def get_teacher(teacher_id):
    """Get single teacher details."""
    teacher = Teacher.query.filter_by(id=teacher_id, is_active=True).first()
    
    if not teacher:
        return jsonify({'success': False, 'message': 'Teacher not found'}), 404
    
    return jsonify({
        'success': True,
        'data': teacher.to_dict()
    }), 200

@public_bp.route('/teachers/departments', methods=['GET'])
def get_departments():
    """Get all unique departments."""
    departments = db.session.query(Teacher.department).filter_by(is_active=True).distinct().all()
    
    return jsonify({
        'success': True,
        'data': [d[0] for d in departments if d[0]]
    }), 200

# ==================== MATERIALS (PUBLIC VIEW) ====================

@public_bp.route('/materials', methods=['GET'])
def get_materials():
    """Get all public materials."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    subject = request.args.get('subject')
    grade_level = request.args.get('grade_level')
    material_type = request.args.get('type')
    search = request.args.get('search')
    
    query = Material.query.filter_by(is_public=True)
    
    if subject:
        query = query.filter_by(subject=subject)
    
    if grade_level:
        query = query.filter_by(grade_level=grade_level)
    
    if material_type:
        query = query.filter_by(material_type=material_type)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Material.title.ilike(search_filter),
                Material.description.ilike(search_filter),
                Material.author.ilike(search_filter)
            )
        )
    
    pagination = query.order_by(Material.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'materials': [m.to_dict() for m in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
    }), 200

@public_bp.route('/materials/<int:material_id>', methods=['GET'])
def get_material(material_id):
    """Get single material details."""
    material = Material.query.filter_by(id=material_id, is_public=True).first()
    
    if not material:
        return jsonify({'success': False, 'message': 'Material not found'}), 404
    
    # Increment view count
    material.view_count += 1
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': material.to_dict()
    }), 200

@public_bp.route('/materials/filters', methods=['GET'])
def get_material_filters():
    """Get available filter options for materials."""
    subjects = db.session.query(Material.subject).filter_by(is_public=True).distinct().all()
    grade_levels = db.session.query(Material.grade_level).filter_by(is_public=True).distinct().all()
    types = db.session.query(Material.material_type).filter_by(is_public=True).distinct().all()
    
    return jsonify({
        'success': True,
        'data': {
            'subjects': [s[0] for s in subjects if s[0]],
            'grade_levels': [g[0] for g in grade_levels if g[0]],
            'types': [t[0] for t in types if t[0]]
        }
    }), 200

# ==================== SCHEDULES (PUBLIC VIEW) ====================

@public_bp.route('/schedules', methods=['GET'])
def get_schedules():
    """Get all public schedules."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    grade_level = request.args.get('grade_level')
    section = request.args.get('section')
    day = request.args.get('day')
    
    query = Schedule.query
    
    if grade_level:
        query = query.filter_by(grade_level=grade_level)
    
    if section:
        query = query.filter_by(section=section)
    
    if day:
        query = query.filter_by(day_of_week=day)
    
    pagination = query.order_by(
        db.case(
            (Schedule.day_of_week == 'Monday', 1),
            (Schedule.day_of_week == 'Tuesday', 2),
            (Schedule.day_of_week == 'Wednesday', 3),
            (Schedule.day_of_week == 'Thursday', 4),
            (Schedule.day_of_week == 'Friday', 5),
            (Schedule.day_of_week == 'Saturday', 6),
            (Schedule.day_of_week == 'Sunday', 7),
        ),
        Schedule.start_time
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'data': {
            'schedules': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
    }), 200

@public_bp.route('/schedules/filters', methods=['GET'])
def get_schedule_filters():
    """Get available filter options for schedules."""
    grade_levels = db.session.query(Schedule.grade_level).distinct().all()
    sections = db.session.query(Schedule.section).distinct().all()
    
    return jsonify({
        'success': True,
        'data': {
            'grade_levels': [g[0] for g in grade_levels if g[0]],
            'sections': [s[0] for s in sections if s[0]],
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
    }), 200

# ==================== STUDENT REGISTRATION ====================

@public_bp.route('/register', methods=['POST'])
def register_student():
    """Submit student registration form."""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = [
        'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'gender', 'address',
        'parent_name', 'parent_phone', 'grade_applying',
        'emergency_contact', 'emergency_phone'
    ]
    
    is_valid, error_msg = validate_required(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_msg}), 400
    
    # Validate email
    is_valid, error_msg = validate_email(data['email'])
    if not is_valid:
        return jsonify({'success': False, 'message': f"Invalid email: {error_msg}"}), 400
    
    # Validate phone numbers
    for phone_field in ['phone', 'parent_phone', 'emergency_phone']:
        is_valid, error_msg = validate_phone(data[phone_field])
        if not is_valid:
            return jsonify({'success': False, 'message': f"Invalid {phone_field}: {error_msg}"}), 400
    
    # Check if email already has a pending registration
    existing = StudentRegistration.query.filter_by(
        email=data['email'],
        status='pending'
    ).first()
    
    if existing:
        return jsonify({
            'success': False,
            'message': 'You already have a pending registration. Please wait for approval.'
        }), 409
    
    # Parse date of birth
    try:
        date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Create registration
    registration = StudentRegistration(
        first_name=data['first_name'].strip(),
        last_name=data['last_name'].strip(),
        email=data['email'].lower().strip(),
        phone=data['phone'].strip(),
        date_of_birth=date_of_birth,
        gender=data['gender'],
        address=data['address'].strip(),
        parent_name=data['parent_name'].strip(),
        parent_phone=data['parent_phone'].strip(),
        parent_email=data.get('parent_email', '').lower().strip() if data.get('parent_email') else None,
        previous_school=data.get('previous_school', '').strip() if data.get('previous_school') else None,
        grade_applying=data['grade_applying'],
        emergency_contact=data['emergency_contact'].strip(),
        emergency_phone=data['emergency_phone'].strip(),
        medical_notes=data.get('medical_notes', '').strip() if data.get('medical_notes') else None,
        status='pending'
    )
    
    db.session.add(registration)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registration submitted successfully! We will contact you soon.',
        'data': {
            'registration_id': registration.id,
            'status': registration.status
        }
    }), 201

@public_bp.route('/register/check', methods=['GET'])
def check_registration_status():
    """Check registration status by email."""
    email = request.args.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    registration = StudentRegistration.query.filter_by(email=email).order_by(
        StudentRegistration.created_at.desc()
    ).first()
    
    if not registration:
        return jsonify({'success': False, 'message': 'No registration found'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'status': registration.status,
            'submitted_at': registration.created_at.isoformat(),
            'reviewed_at': registration.reviewed_at.isoformat() if registration.reviewed_at else None,
            'admin_notes': registration.admin_notes
        }
    }), 200