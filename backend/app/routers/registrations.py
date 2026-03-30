from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.registration import RegistrationCreate, RegistrationUpdate, RegistrationResponse
from app.services.registration_service import RegistrationService
from app.dependencies import get_current_active_admin, get_current_user

router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.post("/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def submit_registration(
    reg_in: RegistrationCreate, 
    db: Session = Depends(get_db)
):
    try:
        return RegistrationService.submit_registration(db, reg_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[RegistrationResponse])
def get_registrations(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return RegistrationService.get_registrations(db, status, search)

@router.get("/{reg_id}", response_model=RegistrationResponse)
def get_registration(
    reg_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    reg = RegistrationService.get_registration_by_id(db, reg_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return reg

@router.put("/{reg_id}", response_model=RegistrationResponse)
def update_registration(
    reg_id: int, 
    reg_in: RegistrationUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    reg = RegistrationService.update_registration(db, reg_id, reg_in)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return reg

@router.post("/{reg_id}/accept", response_model=RegistrationResponse)
def accept_registration(
    reg_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    reg = RegistrationService.accept_registration(db, reg_id, current_user.id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found or already processed")
    return reg

@router.post("/{reg_id}/reject", response_model=RegistrationResponse)
def reject_registration(
    reg_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    reg = RegistrationService.reject_registration(db, reg_id, current_user.id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found or already processed")
    return reg
