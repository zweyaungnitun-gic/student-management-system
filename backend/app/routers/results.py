from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.test_result import TestResultCreate, TestResultUpdate, TestResultResponse
from app.services.test_result_service import TestResultService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/results", tags=["results"])

@router.get("/test/{test_id}", response_model=List[TestResultResponse])
def get_results_by_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TestResultService.get_results_by_test(db, test_id)

@router.get("/student/{student_id}", response_model=List[TestResultResponse])
def get_results_by_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TestResultService.get_results_by_student(db, student_id)

@router.get("/{result_id}", response_model=TestResultResponse)
def get_result(
    result_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    result = TestResultService.get_result_by_id(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Test Result not found")
    return result

@router.post("/", response_model=TestResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(
    result_in: TestResultCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TestResultService.create_result(db, result_in)

@router.put("/{result_id}", response_model=TestResultResponse)
def update_result(
    result_id: int, 
    result_in: TestResultUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    result = TestResultService.update_result(db, result_id, result_in)
    if not result:
        raise HTTPException(status_code=404, detail="Test Result not found")
    return result

@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(
    result_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not TestResultService.delete_result(db, result_id):
        raise HTTPException(status_code=404, detail="Test Result not found")
    return None
