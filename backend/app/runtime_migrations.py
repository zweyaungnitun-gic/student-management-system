from sqlalchemy import text

from app.database import engine


def apply_runtime_migrations() -> None:
    """
    Lightweight runtime schema sync for local/dev environments.

    This keeps existing DBs compatible with recent model additions
    (multi-tenant ownership columns and TEACHER role).
    """
    statements = [
        # New enum value for user role
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'role_enum'
            ) THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = 'role_enum' AND e.enumlabel = 'TEACHER'
                ) THEN
                    ALTER TYPE role_enum ADD VALUE 'TEACHER';
                END IF;
            END IF;
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """,
        # Teacher ownership + login mapping columns
        "ALTER TABLE IF EXISTS teachers ADD COLUMN IF NOT EXISTS owner_admin_id BIGINT;",
        "ALTER TABLE IF EXISTS teachers ADD COLUMN IF NOT EXISTS user_id BIGINT;",
        "CREATE INDEX IF NOT EXISTS ix_teachers_owner_admin_id ON teachers(owner_admin_id);",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_teachers_user_id ON teachers(user_id);",
        # Course tenant ownership
        "ALTER TABLE IF EXISTS courses ADD COLUMN IF NOT EXISTS owner_admin_id BIGINT;",
        "CREATE INDEX IF NOT EXISTS ix_courses_owner_admin_id ON courses(owner_admin_id);",
    ]

    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))

