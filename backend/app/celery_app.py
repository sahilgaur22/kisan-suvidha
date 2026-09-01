from celery import Celery
from celery.schedules import crontab
from app.config import settings

# Initialize Celery App Instance
celery_app = Celery(
    "kisan_suvidha",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.recalculate_slots",
        "app.tasks.cleanup_expired_slots",
    ],
)

# Celery Configuration
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    # Periodic Beat Schedule
    beat_schedule={
        "cleanup-expired-slots-every-15-mins": {
            "task": "app.tasks.cleanup_expired_slots.cleanup_expired_slots",
            "schedule": crontab(minute="*/15"),
        },
    },
)
