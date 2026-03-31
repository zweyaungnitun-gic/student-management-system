from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.test import Test
from app.schemas.test import TestCreate, TestUpdate

class TestService:
    @staticmethod
    def get_all_tests(db: Session, course_id: Optional[int] = None) -> List[Test]:
        query = db.query(Test)
        if course_id:
            query = query.filter(Test.course_id == course_id)
        return query.all()

    @staticmethod
    def get_test_by_id(db: Session, test_id: int) -> Optional[Test]:
        return db.query(Test).filter(Test.test_id == test_id).first()

    @staticmethod
    def create_test(db: Session, test_in: TestCreate) -> Test:
        db_test = Test(**test_in.model_dump())
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def update_test(db: Session, test_id: int, test_in: TestUpdate) -> Optional[Test]:
        db_test = db.query(Test).filter(Test.test_id == test_id).first()
        if not db_test:
            return None
        
        update_data = test_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_test, key, value)
        
        db.commit()
        db.refresh(db_test)
        return db_test

    @staticmethod
    def delete_test(db: Session, test_id: int) -> bool:
        db_test = db.query(Test).filter(Test.test_id == test_id).first()
        if not db_test:
            return False
        
        db.delete(db_test)
        db.commit()
        return True
