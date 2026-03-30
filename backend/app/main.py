from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth

app = FastAPI(
    title=settings.app_name,
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
origins = [
    settings.frontend_origin,
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, students, courses, teachers, enrollments, tests, results, registrations, dashboard, users

app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(teachers.router, prefix="/api")
app.include_router(enrollments.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(results.router, prefix="/api")
app.include_router(registrations.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}
