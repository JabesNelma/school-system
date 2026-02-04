"""Admin API routes (JWT authentication required)."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date

from app.extensions import db
from app.models.user import User
from app.models.student_registration import StudentRegistration
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.material import Material
from app.models.schedule import Schedule
from app.utils.validators import validate_email, validate_phone, validate_required
from app.utils.helpers import generate_student_id, generate_teacher_id

admin_bp = Blueprint('admin', __name__)

# ==================== DASHBOARD STATS ====================

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics."""
    stats = {
        'total_students': Student.query.filter_by(status='active').count(),
        'total_teachers': Teacher.query.filter_by(is_active=True).count(),
        'pending_registrations': StudentRegistration.query.filter_by(status='pending').count(),
        'total_materials': Material.query.filter_by(is_public=True).count(),
        'total_schedules': Schedule.query.count(),
        'recent_registrations': [
            r.to_dict() for r in StudentRegistration.query.filter_by(status='pending')
            .order_by(StudentRegistration.created_at.desc())
            .limit(5).all()
        ]
    }
    
    return jsonify({'success': True, 'data': stats}), 200

# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all admin users."""
    users = User.query.all()
    return jsonify({
        'success': True,
        'data': [u.to_dict() for u in users]
    }), 200

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    """Create new admin user."""
    data = request.get_json()
    
    # Validate required fields
    required = ['username', 'email', 'password', 'full_name']
    is_valid, error = validate_required(data, required)
    if not is_valid:
        return jsonify({'success': False, 'message': error}), 400
    
    # Check if username/email exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409
    
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        is_active=data.get('is_active', True),
        is_superadmin=data.get('is_superadmin', False)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User created successfully',
        'data': user.to_dict()
    }), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update admin user."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already exists'}), 409
        user.email = data['email']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'password' in data:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'data': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete admin user."""
    current_user_id = get_jwt_identity()
    
    if current_user_id == user_id:
        return jsonify({'success': False, 'message': 'Cannot delete yourself'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User deleted successfully'}), 200

# ==================== STUDENT REGISTRATIONS ====================

@admin_bp.route('/registrations', methods=['GET'])
@jwt_required()
def get_registrations():
    """Get all student registrations."""
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = StudentRegistration.query
    
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(StudentRegistration.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'registrations': [r.to_dict() for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    }), 200

@admin_bp.route('/registrations/<int:reg_id>/approve', methods=['POST'])
@jwt_required()
def approve_registration(reg_id):
    """Approve student registration and create student record."""
    current_user_id = get_jwt_identity()
    registration = StudentRegistration.query.get(reg_id)
    
    if not registration:
        return jsonify({'success': False, 'message': 'Registration not found'}), 404
    
    if registration.status != 'pending':
        return jsonify({'success': False, 'message': f'Registration is already {registration.status}'}), 400
    
    data = request.get_json() or {}
    
    # Create student record
    student = Student(
        student_id=generate_student_id(),
        first_name=registration.first_name,
        last_name=registration.last_name,
        email=registration.email,
        phone=registration.phone,
        date_of_birth=registration.date_of_birth,
        gender=registration.gender,
        address=registration.address,
        enrollment_date=date.today(),
        grade_level=data.get('grade_level', registration.grade_applying),
        section=data.get('section'),
        parent_name=registration.parent_name,
        parent_phone=registration.parent_phone,
        parent_email=registration.parent_email,
        emergency_contact=registration.emergency_contact,
        emergency_phone=registration.emergency_phone,
        medical_notes=registration.medical_notes,
        status='active',
        registration_id=registration.id
    )
    
    # Update registration
    registration.status = 'approved'
    registration.reviewed_by = current_user_id
    registration.reviewed_at = datetime.utcnow()
    registration.admin_notes = data.get('admin_notes', registration.admin_notes)
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registration approved and student enrolled',
        'data': {
            'registration': registration.to_dict(),
            'student': student.to_dict()
        }
    }), 200

@admin_bp.route('/registrations/<int:reg_id>/reject', methods=['POST'])
@jwt_required()
def reject_registration(reg_id):
    """Reject student registration."""
    current_user_id = get_jwt_identity()
    registration = StudentRegistration.query.get(reg_id)
    
    if not registration:
        return jsonify({'success': False, 'message': 'Registration not found'}), 404
    
    if registration.status != 'pending':
        return jsonify({'success': False, 'message': f'Registration is already {registration.status}'}), 400
    
    data = request.get_json() or {}
    
    registration.status = 'rejected'
    registration.reviewed_by = current_user_id
    registration.reviewed_at = datetime.utcnow()
    registration.admin_notes = data.get('admin_notes', 'Registration rejected')
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registration rejected',
        'data': registration.to_dict()
    }), 200

# ==================== STUDENTS ====================

@admin_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    """Get all students."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    grade = request.args.get('grade')
    search = request.args.get('search')
    
    query = Student.query
    
    if status:
        query = query.filter_by(status=status)
    if grade:
        query = query.filter_by(grade_level=grade)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Student.first_name.ilike(search_filter),
                Student.last_name.ilike(search_filter),
                Student.student_id.ilike(search_filter),
                Student.email.ilike(search_filter)
            )
        )
    
    pagination = query.order_by(Student.last_name).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'students': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    }), 200

@admin_bp.route('/students', methods=['POST'])
@jwt_required()
def create_student():
    """Create new student directly."""
    data = request.get_json()
    
    required = ['first_name', 'last_name', 'email', 'date_of_birth', 'gender', 
                'parent_name', 'parent_phone', 'grade_level']
    is_valid, error = validate_required(data, required)
    if not is_valid:
        return jsonify({'success': False, 'message': error}), 400
    
    # Parse date of birth
    try:
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Parse enrollment date
    enrollment_date = date.today()
    if data.get('enrollment_date'):
        try:
            enrollment_date = datetime.strptime(data['enrollment_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid enrollment date format'}), 400
    
    student = Student(
        student_id=generate_student_id(),
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        date_of_birth=dob,
        gender=data['gender'],
        address=data.get('address'),
        enrollment_date=enrollment_date,
        grade_level=data['grade_level'],
        section=data.get('section'),
        parent_name=data['parent_name'],
        parent_phone=data['parent_phone'],
        parent_email=data.get('parent_email'),
        emergency_contact=data.get('emergency_contact', data['parent_name']),
        emergency_phone=data.get('emergency_phone', data['parent_phone']),
        medical_notes=data.get('medical_notes'),
        status=data.get('status', 'active')
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Student created successfully',
        'data': student.to_dict()
    }), 201

@admin_bp.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    """Get single student."""
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404
    
    return jsonify({'success': True, 'data': student.to_dict()}), 200

@admin_bp.route('/students/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student."""
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404
    
    data = request.get_json()
    
    updatable_fields = [
        'first_name', 'last_name', 'email', 'phone', 'gender',
        'address', 'grade_level', 'section', 'parent_name',
        'parent_phone', 'parent_email', 'emergency_contact',
        'emergency_phone', 'medical_notes', 'status'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(student, field, data[field])
    
    if 'date_of_birth' in data:
        try:
            student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Student updated successfully',
        'data': student.to_dict()
    }), 200

@admin_bp.route('/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    """Delete student."""
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Student deleted successfully'}), 200

# ==================== TEACHERS ====================

@admin_bp.route('/teachers', methods=['GET'])
@jwt_required()
def get_all_teachers():
    """Get all teachers (including inactive)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Teacher.query.order_by(Teacher.last_name).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'teachers': [t.to_dict() for t in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    }), 200

@admin_bp.route('/teachers', methods=['POST'])
@jwt_required()
def create_teacher():
    """Create new teacher."""
    data = request.get_json()
    
    required = ['first_name', 'last_name', 'email', 'phone', 'department', 'subjects']
    is_valid, error = validate_required(data, required)
    if not is_valid:
        return jsonify({'success': False, 'message': error}), 400
    
    # Parse joining date
    joining_date = date.today()
    if data.get('joining_date'):
        try:
            joining_date = datetime.strptime(data['joining_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid joining date format'}), 400
    
    teacher = Teacher(
        teacher_id=generate_teacher_id(),
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data['phone'],
        department=data['department'],
        subjects=data['subjects'] if isinstance(data['subjects'], str) else ','.join(data['subjects']),
        qualification=data.get('qualification'),
        experience_years=data.get('experience_years', 0),
        joining_date=joining_date,
        address=data.get('address'),
        bio=data.get('bio'),
        profile_image=data.get('profile_image'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(teacher)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Teacher created successfully',
        'data': teacher.to_dict()
    }), 201

@admin_bp.route('/teachers/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_admin(teacher_id):
    """Get single teacher (admin view)."""
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'success': False, 'message': 'Teacher not found'}), 404
    
    return jsonify({'success': True, 'data': teacher.to_dict()}), 200

@admin_bp.route('/teachers/<int:teacher_id>', methods=['PUT'])
@jwt_required()
def update_teacher(teacher_id):
    """Update teacher."""
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'success': False, 'message': 'Teacher not found'}), 404
    
    data = request.get_json()
    
    updatable_fields = [
        'first_name', 'last_name', 'email', 'phone', 'department',
        'qualification', 'experience_years', 'address', 'bio',
        'profile_image', 'is_active'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(teacher, field, data[field])
    
    if 'subjects' in data:
        teacher.subjects = data['subjects'] if isinstance(data['subjects'], str) else ','.join(data['subjects'])
    
    if 'joining_date' in data:
        try:
            teacher.joining_date = datetime.strptime(data['joining_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Teacher updated successfully',
        'data': teacher.to_dict()
    }), 200

@admin_bp.route('/teachers/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher(teacher_id):
    """Delete teacher."""
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({'success': False, 'message': 'Teacher not found'}), 404
    
    db.session.delete(teacher)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Teacher deleted successfully'}), 200

# ==================== MATERIALS ====================

@admin_bp.route('/materials', methods=['GET'])
@jwt_required()
def get_all_materials():
    """Get all materials (admin view)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Material.query.order_by(Material.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'materials': [m.to_dict() for m in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    }), 200

@admin_bp.route('/materials', methods=['POST'])
@jwt_required()
def create_material():
    """Create new material."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    required = ['title', 'subject', 'grade_level', 'material_type']
    is_valid, error = validate_required(data, required)
    if not is_valid:
        return jsonify({'success': False, 'message': error}), 400
    
    material = Material(
        title=data['title'],
        description=data.get('description'),
        subject=data['subject'],
        grade_level=data['grade_level'],
        material_type=data['material_type'],
        file_url=data.get('file_url'),
        external_link=data.get('external_link'),
        file_size=data.get('file_size'),
        file_format=data.get('file_format'),
        author=data.get('author'),
        publisher=data.get('publisher'),
        is_public=data.get('is_public', True),
        uploaded_by=current_user_id
    )
    
    db.session.add(material)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Material created successfully',
        'data': material.to_dict()
    }), 201

@admin_bp.route('/materials/<int:material_id>', methods=['GET'])
@jwt_required()
def get_material_admin(material_id):
    """Get single material (admin view)."""
    material = Material.query.get(material_id)
    if not material:
        return jsonify({'success': False, 'message': 'Material not found'}), 404
    
    return jsonify({'success': True, 'data': material.to_dict()}), 200

@admin_bp.route('/materials/<int:material_id>', methods=['PUT'])
@jwt_required()
def update_material(material_id):
    """Update material."""
    material = Material.query.get(material_id)
    if not material:
        return jsonify({'success': False, 'message': 'Material not found'}), 404
    
    data = request.get_json()
    
    updatable_fields = [
        'title', 'description', 'subject', 'grade_level', 'material_type',
        'file_url', 'external_link', 'file_size', 'file_format',
        'author', 'publisher', 'is_public'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(material, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Material updated successfully',
        'data': material.to_dict()
    }), 200

@admin_bp.route('/materials/<int:material_id>', methods=['DELETE'])
@jwt_required()
def delete_material(material_id):
    """Delete material."""
    material = Material.query.get(material_id)
    if not material:
        return jsonify({'success': False, 'message': 'Material not found'}), 404
    
    db.session.delete(material)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Material deleted successfully'}), 200

# ==================== SCHEDULES ====================

@admin_bp.route('/schedules', methods=['GET'])
@jwt_required()
def get_all_schedules():
    """Get all schedules (admin view)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Schedule.query.order_by(Schedule.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'schedules': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    }), 200

@admin_bp.route('/schedules', methods=['POST'])
@jwt_required()
def create_schedule():
    """Create new schedule."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    required = ['title', 'subject', 'grade_level', 'day_of_week', 'start_time', 'end_time', 'effective_from']
    is_valid, error = validate_required(data, required)
    if not is_valid:
        return jsonify({'success': False, 'message': error}), 400
    
    # Parse dates and times
    try:
        effective_from = datetime.strptime(data['effective_from'], '%Y-%m-%d').date()
        effective_until = None
        if data.get('effective_until'):
            effective_until = datetime.strptime(data['effective_until'], '%Y-%m-%d').date()
        
        # Parse time strings (HH:MM)
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    except ValueError as e:
        return jsonify({'success': False, 'message': f'Invalid date/time format: {str(e)}'}), 400
    
    schedule = Schedule(
        title=data['title'],
        subject=data['subject'],
        grade_level=data['grade_level'],
        section=data.get('section'),
        day_of_week=data['day_of_week'],
        start_time=start_time,
        end_time=end_time,
        room=data.get('room'),
        teacher_id=data.get('teacher_id'),
        description=data.get('description'),
        is_recurring=data.get('is_recurring', True),
        effective_from=effective_from,
        effective_until=effective_until,
        created_by=current_user_id
    )
    
    db.session.add(schedule)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Schedule created successfully',
        'data': schedule.to_dict()
    }), 201

@admin_bp.route('/schedules/<int:schedule_id>', methods=['GET'])
@jwt_required()
def get_schedule_admin(schedule_id):
    """Get single schedule (admin view)."""
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'success': False, 'message': 'Schedule not found'}), 404
    
    return jsonify({'success': True, 'data': schedule.to_dict()}), 200

@admin_bp.route('/schedules/<int:schedule_id>', methods=['PUT'])
@jwt_required()
def update_schedule(schedule_id):
    """Update schedule."""
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'success': False, 'message': 'Schedule not found'}), 404
    
    data = request.get_json()
    
    updatable_fields = [
        'title', 'subject', 'grade_level', 'section', 'day_of_week',
        'room', 'teacher_id', 'description', 'is_recurring'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(schedule, field, data[field])
    
    # Parse times
    if 'start_time' in data:
        try:
            schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid start time format'}), 400
    
    if 'end_time' in data:
        try:
            schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid end time format'}), 400
    
    # Parse dates
    if 'effective_from' in data:
        try:
            schedule.effective_from = datetime.strptime(data['effective_from'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid effective_from date format'}), 400
    
    if 'effective_until' in data:
        try:
            schedule.effective_until = datetime.strptime(data['effective_until'], '%Y-%m-%d').date() if data['effective_until'] else None
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid effective_until date format'}), 400
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Schedule updated successfully',
        'data': schedule.to_dict()
    }), 200

@admin_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
@jwt_required()
def delete_schedule(schedule_id):
    """Delete schedule."""
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'success': False, 'message': 'Schedule not found'}), 404
    
    db.session.delete(schedule)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Schedule deleted successfully'}), 200