"""Input validation utilities."""
import re
from email_validator import validate_email as email_validator, EmailNotValidError

def validate_email(email):
    """Validate email address."""
    try:
        email_validator(email)
        return True, None
    except EmailNotValidError as e:
        return False, str(e)

def validate_phone(phone):
    """Validate phone number."""
    # Basic phone validation - allows digits, spaces, dashes, plus, and parentheses
    pattern = r'^[\d\s\-\+\(\)]+$'
    if not phone or not re.match(pattern, phone):
        return False, "Invalid phone number format"
    
    # Check minimum length (at least 7 digits)
    digits_only = re.sub(r'\D', '', phone)
    if len(digits_only) < 7:
        return False, "Phone number must have at least 7 digits"
    
    return True, None

def validate_required(data, required_fields):
    """Validate required fields in data."""
    missing = []
    for field in required_fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
            missing.append(field)
    
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

def validate_date_string(date_str):
    """Validate date string format (YYYY-MM-DD)."""
    try:
        from datetime import datetime
        datetime.strptime(date_str, '%Y-%m-%d')
        return True, None
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"