from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.test_result import TestResult
from app.models.test import Test
from app.schemas.test_result import TestResultCreate, TestResultUpdate

class TestResultService:
    @staticmethod
    def get_results_by_test(db: Session, test_id: int) -> List[TestResult]:
        return db.query(TestResult).filter(TestResult.test_id == test_id).all()

    @staticmethod
    def get_results_by_student(db: Session, student_id: int) -> List[TestResult]:
        return db.query(TestResult).filter(TestResult.student_id == student_id).all()

    @staticmethod
    def get_result_by_id(db: Session, result_id: int) -> Optional[TestResult]:
        return db.query(TestResult).filter(TestResult.id == result_id).first()

    @staticmethod
    def create_result(db: Session, result_in: TestResultCreate) -> TestResult:
        # Check if pass/fail
        test = db.query(Test).filter(Test.id == result_in.test_id).first()
        is_passed = False
        if test and result_in.marks_obtained >= test.passing_marks:
            is_passed = True
            
        db_result = TestResult(
            **result_in.model_dump(),
            is_passed=is_passed
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result

    @staticmethod
    def update_result(db: Session, result_id: int, result_in: TestResultUpdate) -> Optional[TestResult]:
        db_result = db.query(TestResult).filter(TestResult.id == result_id).first()
        if not db_result:
            return None
        
        update_data = result_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_result, key, value)
            
        # Recalculate is_passed if marks changed
        if "marks_obtained" in update_data:
            test = db.query(Test).filter(Test.id == db_result.test_id).first()
            if test:
                db_result.is_passed = db_result.marks_obtained >= test.passing_marks

        db.commit()
        db.refresh(db_result)
        return db_result

    @staticmethod
    def delete_result(db: Session, result_id: int) -> bool:
        db_result = db.query(TestResult).filter(TestResult.id == result_id).first()
        if not db_result:
            return False
        
        db.delete(db_result)
        db.commit()
        return True
