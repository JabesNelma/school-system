"""Material/Learning resource model."""
from datetime import datetime
from app.extensions import db

class Material(db.Model):
    """Learning material/resource model."""
    __tablename__ = 'materials'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    subject = db.Column(db.String(50), nullable=False)
    grade_level = db.Column(db.String(20), nullable=False)
    material_type = db.Column(db.String(30), nullable=False)  # document, video, link, book, etc.
    file_url = db.Column(db.String(500))
    external_link = db.Column(db.String(500))
    file_size = db.Column(db.String(20))
    file_format = db.Column(db.String(10))
    author = db.Column(db.String(100))
    publisher = db.Column(db.String(100))
    is_public = db.Column(db.Boolean, default=True)
    download_count = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    uploader = db.relationship('User', backref='materials_uploaded')
    
    def to_dict(self):
        """Convert material to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'grade_level': self.grade_level,
            'material_type': self.material_type,
            'file_url': self.file_url,
            'external_link': self.external_link,
            'file_size': self.file_size,
            'file_format': self.file_format,
            'author': self.author,
            'publisher': self.publisher,
            'is_public': self.is_public,
            'download_count': self.download_count,
            'view_count': self.view_count,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Material {self.title}>'