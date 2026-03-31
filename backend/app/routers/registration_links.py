from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import secrets
import os

from app.database import get_db
from app.models.registration_link import RegistrationLink, SelfRegistration
from app.models.user import User, Role
from app.schemas.registration_link import (
    RegistrationLinkCreate, RegistrationLinkResponse, RegistrationLinkUpdate,
    SelfRegistrationCreate, SelfRegistrationResponse, SelfRegistrationUpdate,
    SelfRegistrationListResponse
)
from app.dependencies import get_current_staff, get_current_user

router = APIRouter(prefix="/registration-links", tags=["registration-links"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ==================== Registration Link Management ====================

@router.post("/", response_model=RegistrationLinkResponse, status_code=status.HTTP_201_CREATED)
def create_registration_link(
    link_data: RegistrationLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new unique registration link for the current admin"""
    # Generate unique token
    token = secrets.token_urlsafe(32)
    
    db_link = RegistrationLink(
        admin_id=current_user.id,
        token=token,
        link_name=link_data.link_name,
        expires_at=link_data.expires_at,
        max_uses=link_data.max_uses,
        is_active=True,
        use_count=0
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    
    # Add full URL
    response = RegistrationLinkResponse.from_orm(db_link)
    response.full_url = f"{FRONTEND_URL}/register/{token}"
    return response

@router.get("/", response_model=List[RegistrationLinkResponse])
def get_my_registration_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all registration links created by the current admin"""
    links = db.query(RegistrationLink).filter(
        RegistrationLink.admin_id == current_user.id
    ).order_by(RegistrationLink.created_at.desc()).all()
    
    # Add full URLs
    result = []
    for link in links:
        response = RegistrationLinkResponse.from_orm(link)
        response.full_url = f"{FRONTEND_URL}/register/{link.token}"
        result.append(response)
    
    return result

@router.get("/{link_id}", response_model=RegistrationLinkResponse)
def get_registration_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific registration link"""
    link = db.query(RegistrationLink).filter(
        RegistrationLink.id == link_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Registration link not found")
    
    response = RegistrationLinkResponse.from_orm(link)
    response.full_url = f"{FRONTEND_URL}/register/{link.token}"
    return response

@router.put("/{link_id}", response_model=RegistrationLinkResponse)
def update_registration_link(
    link_id: int,
    link_data: RegistrationLinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a registration link (name, active status, expiration, max uses)"""
    link = db.query(RegistrationLink).filter(
        RegistrationLink.id == link_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Registration link not found")
    
    if link_data.link_name is not None:
        link.link_name = link_data.link_name
    if link_data.is_active is not None:
        link.is_active = link_data.is_active
    if link_data.expires_at is not None:
        link.expires_at = link_data.expires_at
    if link_data.max_uses is not None:
        link.max_uses = link_data.max_uses
    
    link.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(link)
    
    response = RegistrationLinkResponse.from_orm(link)
    response.full_url = f"{FRONTEND_URL}/register/{link.token}"
    return response

@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registration_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a registration link"""
    link = db.query(RegistrationLink).filter(
        RegistrationLink.id == link_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Registration link not found")
    
    db.delete(link)
    db.commit()
    return None

@router.post("/{link_id}/regenerate", response_model=RegistrationLinkResponse)
def regenerate_token(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regenerate a new token for an existing link"""
    link = db.query(RegistrationLink).filter(
        RegistrationLink.id == link_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Registration link not found")
    
    # Generate new token
    link.token = secrets.token_urlsafe(32)
    link.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(link)
    
    response = RegistrationLinkResponse.from_orm(link)
    response.full_url = f"{FRONTEND_URL}/register/{link.token}"
    return response


# ==================== Public Self-Registration (No Auth Required) ====================

@router.get("/public/validate/{token}")
def validate_registration_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Validate if a registration token is valid and active"""
    link = db.query(RegistrationLink).filter(
        RegistrationLink.token == token
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Invalid registration link")
    
    if not link.is_active:
        raise HTTPException(status_code=400, detail="This registration link is no longer active")
    
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This registration link has expired")
    
    if link.max_uses and link.use_count >= link.max_uses:
        raise HTTPException(status_code=400, detail="This registration link has reached its maximum usage limit")
    
    return {
        "valid": True,
        "link_name": link.link_name,
        "admin_id": link.admin_id
    }

@router.post("/public/register", response_model=SelfRegistrationResponse, status_code=status.HTTP_201_CREATED)
def submit_self_registration(
    registration: SelfRegistrationCreate,
    db: Session = Depends(get_db)
):
    """Submit a self-registration via public link (no authentication required)"""
    # Validate token
    link = db.query(RegistrationLink).filter(
        RegistrationLink.token == registration.token
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Invalid registration link")
    
    if not link.is_active:
        raise HTTPException(status_code=400, detail="This registration link is no longer active")
    
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This registration link has expired")
    
    if link.max_uses and link.use_count >= link.max_uses:
        raise HTTPException(status_code=400, detail="This registration link has reached its maximum usage limit")
    
    # Check if email already exists in pending registrations
    existing = db.query(SelfRegistration).filter(
        SelfRegistration.email == registration.page1.email,
        SelfRegistration.status == "PENDING"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="A pending registration with this email already exists")
    
    # Create registration
    page1 = registration.page1
    page2 = registration.page2
    
    db_registration = SelfRegistration(
        registration_link_id=link.id,
        
        # Page 1 data
        student_name=page1.student_name,
        email=page1.email,
        national_id=page1.national_id,
        date_of_birth=page1.date_of_birth,
        gender=page1.gender,
        phone_number=page1.phone_number,
        secondary_phone=page1.secondary_phone,
        current_living_address=page1.current_living_address,
        home_town_address=page1.home_town_address,
        religion=page1.religion,
        emergency_contact_name=page1.emergency_contact_name,
        emergency_contact_phone=page1.emergency_contact_phone,
        parent_name=page1.parent_name,
        parent_phone=page1.parent_phone,
        education_background=page1.education_background,
        graduation_year=page1.graduation_year,
        
        # Page 2 data
        name_in_japanese=page2.name_in_japanese,
        passport_number=page2.passport_number,
        current_japan_level=page2.current_japan_level,
        japan_travel_experience=page2.japan_travel_experience,
        coe_application_experience=page2.coe_application_experience,
        passed_highest_jlpt_level=page2.passed_highest_jlpt_level,
        desired_job_type=page2.desired_job_type,
        other_desired_job_type=page2.other_desired_job_type,
        desired_location_in_japan=page2.desired_location_in_japan,
        intended_study_period=page2.intended_study_period,
        japanese_learning_history=page2.japanese_learning_history,
        is_smoking=page2.is_smoking,
        is_alcohol_drink=page2.is_alcohol_drink,
        have_tatto=page2.have_tatto,
        hostel_preference=page2.hostel_preference,
        memo_notes=page2.memo_notes,
        
        # Default status
        status="PENDING"
    )
    
    db.add(db_registration)
    
    # Increment link use count
    link.use_count += 1
    
    db.commit()
    db.refresh(db_registration)
    
    return db_registration


# ==================== Admin Review of Self-Registrations ====================

@router.get("/self-registrations/pending", response_model=List[SelfRegistrationListResponse])
def get_pending_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending self-registrations for the current admin's links"""
    registrations = db.query(SelfRegistration).join(RegistrationLink).filter(
        RegistrationLink.admin_id == current_user.id,
        SelfRegistration.status == "PENDING"
    ).order_by(SelfRegistration.submitted_at.desc()).all()
    
    return registrations

@router.get("/self-registrations/all", response_model=List[SelfRegistrationListResponse])
def get_all_my_registrations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all self-registrations for the current admin's links with optional status filter"""
    query = db.query(SelfRegistration).join(RegistrationLink).filter(
        RegistrationLink.admin_id == current_user.id
    )
    
    if status:
        query = query.filter(SelfRegistration.status == status)
    
    registrations = query.order_by(SelfRegistration.submitted_at.desc()).all()
    return registrations

@router.get("/self-registrations/{registration_id}", response_model=SelfRegistrationResponse)
def get_registration_detail(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific self-registration"""
    registration = db.query(SelfRegistration).join(RegistrationLink).filter(
        SelfRegistration.id == registration_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return registration

@router.put("/self-registrations/{registration_id}/status", response_model=SelfRegistrationResponse)
def update_registration_status(
    registration_id: int,
    update_data: SelfRegistrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the status of a self-registration (approve/reject)"""
    registration = db.query(SelfRegistration).join(RegistrationLink).filter(
        SelfRegistration.id == registration_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if update_data.status:
        registration.status = update_data.status
        registration.reviewed_at = datetime.utcnow()
        registration.reviewed_by = current_user.id
    
    if update_data.admin_notes is not None:
        registration.admin_notes = update_data.admin_notes
    
    db.commit()
    db.refresh(registration)
    
    return registration

@router.post("/self-registrations/{registration_id}/convert", response_model=dict)
def convert_to_student(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert an approved self-registration to a full student record"""
    from app.services.student_service import StudentService
    from app.schemas.student import StudentCreate, AdditionalStudentInfoBase
    
    registration = db.query(SelfRegistration).join(RegistrationLink).filter(
        SelfRegistration.id == registration_id,
        RegistrationLink.admin_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if registration.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Registration must be approved before converting to student")
    
    # Check if student already exists
    from app.models.student import Student
    existing = db.query(Student).filter(Student.national_id == registration.national_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A student with this National ID already exists")
    
    # Create student data
    additional_info = None
    if any([
        registration.name_in_japanese, registration.passport_number, 
        registration.current_japan_level, registration.desired_job_type
    ]):
        additional_info = AdditionalStudentInfoBase(
            name_in_japanese=registration.name_in_japanese,
            passport_number=registration.passport_number,
            current_japan_level=registration.current_japan_level,
            japan_travel_experience=registration.japan_travel_experience,
            coe_application_experience=registration.coe_application_experience,
            passed_highest_jlpt_level=registration.passed_highest_jlpt_level,
            secondary_phone=registration.secondary_phone,
            father_name=registration.parent_name,
            desired_job_type=registration.desired_job_type,
            other_desired_job_type=registration.other_desired_job_type,
            is_smoking=registration.is_smoking,
            is_alcohol_drink=registration.is_alcohol_drink,
            have_tatto=registration.have_tatto,
            hostel_preference=registration.hostel_preference,
            memo_notes=registration.memo_notes,
            attending_class_related_status=registration.status,
            contact_viber=registration.phone_number
        )
    
    student_data = StudentCreate(
        student_name=registration.student_name,
        national_id=registration.national_id,
        date_of_birth=registration.date_of_birth,
        gender=registration.gender,
        phone_number=registration.phone_number,
        current_living_address=registration.current_living_address,
        home_town_address=registration.home_town_address,
        additional_info=additional_info
    )
    
    # Create the student
    student = StudentService.create_student(db, student_data, current_user.id)
    
    return {
        "message": "Student created successfully",
        "student_id": student.id,
        "student_code": student.student_id
    }
