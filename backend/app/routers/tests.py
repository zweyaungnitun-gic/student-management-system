from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.test import TestCreate, TestUpdate, TestResponse
from app.services.test_service import TestService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("/", response_model=List[TestResponse])
def get_tests(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TestService.get_all_tests(db, course_id)

@router.get("/{test_id}", response_model=TestResponse)
def get_test(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    test = TestService.get_test_by_id(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: TestCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TestService.create_test(db, test_in)

@router.put("/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int, 
    test_in: TestUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    test = TestService.update_test(db, test_id, test_in)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not TestService.delete_test(db, test_id):
        raise HTTPException(status_code=404, detail="Test not found")
    return None
