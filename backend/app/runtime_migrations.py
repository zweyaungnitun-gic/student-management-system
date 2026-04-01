from sqlalchemy import text

from app.database import engine


def apply_runtime_migrations() -> None:
    """
    Lightweight runtime schema sync for local/dev environments.

    This keeps existing DBs compatible with recent model additions
    (multi-tenant ownership columns, TEACHER role, and registration links).
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
        "ALTER TABLE IF EXISTS common_students ADD COLUMN IF NOT EXISTS email VARCHAR;",
        "CREATE INDEX IF NOT EXISTS ix_teachers_owner_admin_id ON teachers(owner_admin_id);",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_teachers_user_id ON teachers(user_id);",
        # Course tenant ownership
        "ALTER TABLE IF EXISTS courses ADD COLUMN IF NOT EXISTS owner_admin_id BIGINT;",
        "CREATE INDEX IF NOT EXISTS ix_courses_owner_admin_id ON courses(owner_admin_id);",
        # Registration Links table
        """
        CREATE TABLE IF NOT EXISTS registration_links (
            id BIGSERIAL PRIMARY KEY,
            admin_id BIGINT NOT NULL,
            token VARCHAR(64) UNIQUE NOT NULL,
            link_name VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            expires_at TIMESTAMP WITHOUT TIME ZONE,
            max_uses INTEGER,
            use_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """,
        "CREATE INDEX IF NOT EXISTS ix_registration_links_admin_id ON registration_links(admin_id);",
        "CREATE INDEX IF NOT EXISTS ix_registration_links_token ON registration_links(token);",
        # Self Registrations table
        """
        CREATE TABLE IF NOT EXISTS self_registrations (
            id BIGSERIAL PRIMARY KEY,
            registration_link_id BIGINT NOT NULL,
            -- Page 1: Personal Info
            student_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            national_id VARCHAR(50) NOT NULL,
            date_of_birth DATE,
            gender VARCHAR(10),
            phone_number VARCHAR(20),
            secondary_phone VARCHAR(20),
            current_living_address TEXT,
            home_town_address TEXT,
            religion VARCHAR(50),
            emergency_contact_name VARCHAR(100),
            emergency_contact_phone VARCHAR(20),
            parent_name VARCHAR(100),
            parent_phone VARCHAR(20),
            education_background VARCHAR(100),
            graduation_year INTEGER,
            -- Page 2: Japanese Info
            name_in_japanese VARCHAR(100),
            passport_number VARCHAR(50),
            current_japan_level VARCHAR(10),
            japan_travel_experience BOOLEAN DEFAULT FALSE,
            coe_application_experience BOOLEAN DEFAULT FALSE,
            passed_highest_jlpt_level VARCHAR(10),
            desired_job_type VARCHAR(100),
            other_desired_job_type VARCHAR(100),
            desired_location_in_japan VARCHAR(100),
            intended_study_period VARCHAR(20),
            japanese_learning_history TEXT,
            is_smoking BOOLEAN DEFAULT FALSE,
            is_alcohol_drink BOOLEAN DEFAULT FALSE,
            have_tatto BOOLEAN DEFAULT FALSE,
            hostel_preference BOOLEAN DEFAULT FALSE,
            -- Status and notes
            status VARCHAR(20) DEFAULT 'PENDING',
            admin_notes TEXT,
            memo_notes TEXT,
            submitted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP WITHOUT TIME ZONE,
            reviewed_by BIGINT
        );
        """,
        "CREATE INDEX IF NOT EXISTS ix_self_registrations_link_id ON self_registrations(registration_link_id);",
        "CREATE INDEX IF NOT EXISTS ix_self_registrations_email ON self_registrations(email);",
        "CREATE INDEX IF NOT EXISTS ix_self_registrations_status ON self_registrations(status);",
    ]

    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))

