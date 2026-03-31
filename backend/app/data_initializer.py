import logging
import os
import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import SessionLocal
from app.models.student import RegistrationStatus, Student
from app.models.user import User, Role
from app.core.security import get_password_hash
from app.services.student_service import StudentService
from app.services.user_service import UserService

logger = logging.getLogger(__name__)


def ensure_user(
    db: Session,
    *,
    username: str,
    email: str,
    password: str,
    role: Role,
    school_name: str | None = None,
) -> User:
    """
    Idempotently creates (or updates) a user record.

    - Matches existing users by `username` or `email`
    - Ensures `role` is correct
    - If the existing user has no password set, we set it to the provided one
    """
    existing = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    if existing:
        changed = False
        if existing.role != role:
            existing.role = role
            changed = True
        if (existing.password is None or existing.password == "") and password:
            existing.password = get_password_hash(password)
            changed = True
        if school_name is not None and existing.school_name != school_name:
            existing.school_name = school_name
            changed = True

        if changed:
            db.commit()
            db.refresh(existing)
        return existing

    db_user = User(
        user_id=UserService.generate_user_id(db),
        username=username,
        email=email,
        password=get_password_hash(password),
        role=role,
        school_name=school_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def init_sample_students_for_admin(
    db: Session,
    created_by: int = 2,
    target_count: int = 20,
) -> int:
    """
    Mirrors the Java DataInitializer:
    - If admin user `created_by` has fewer than `target_count` students,
      inserts additional "Sample Student N" rows until the target is reached.

    Returns the number of students added.
    """
    current_count = db.query(Student).filter(Student.created_by == created_by).count()
    logger.info("Checking for sample students for admin %s...", created_by)

    if current_count >= target_count:
        logger.info("Admin %s already has %s students. No more added.", created_by, current_count)
        return 0

    students_to_add = target_count - current_count
    logger.info("Adding %s sample students for admin %s to reach %s...", students_to_add, created_by, target_count)

    base_dob = date(2000, 1, 1)
    today = date.today()

    # Java logic: for (int i = 1; i <= studentsToAdd; i++) { ... idx = count + i; ... }
    for i in range(1, students_to_add + 1):
        idx = current_count + i

        student = Student(
            student_name=f"Sample Student {idx}",
            student_id=StudentService.generate_student_id(db),
            national_id=f"NID-{uuid.uuid4().hex[:8]}",
            gender="Male" if idx % 2 == 0 else "Female",
            date_of_birth=base_dob + timedelta(days=idx),
            enrolled_date=today,
            registration_status=RegistrationStatus.ACCEPTED,
            created_by=created_by,
            created_at=today,
            updated_at=today,
        )

        db.add(student)
        # Flush so the generated IDs and subsequent queries see inserted rows in the same transaction.
        db.flush()
        logger.info("Saved student: %s with ID: %s", student.student_name, student.student_id)

    db.commit()
    logger.info("Finished adding sample students.")
    return students_to_add


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    db = SessionLocal()
    try:
        # Default bootstrap credentials (override via env vars if desired).
        super_admin = ensure_user(
            db,
            username=os.getenv("SUPER_ADMIN_USERNAME", "superadmin"),
            email=os.getenv("SUPER_ADMIN_EMAIL", "superadmin@example.com"),
            password=os.getenv("SUPER_ADMIN_PASSWORD", "superadmin123"),
            role=Role.SUPER_ADMIN,
            school_name=os.getenv("DEFAULT_SCHOOL_NAME"),
        )
        admin = ensure_user(
            db,
            username=os.getenv("ADMIN_USERNAME", "admin2"),
            email=os.getenv("ADMIN_EMAIL", "admin2@example.com"),
            password=os.getenv("ADMIN_PASSWORD", "admin123"),
            role=Role.ADMIN,
            school_name=os.getenv("DEFAULT_SCHOOL_NAME"),
        )

        # Seed students created by the DB primary-key of the ADMIN user.
        init_sample_students_for_admin(db, created_by=int(admin.id))
    finally:
        db.close()


if __name__ == "__main__":
    main()

