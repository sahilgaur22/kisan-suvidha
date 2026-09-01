import app.tasks.recalculate_slots
import app.tasks.cleanup_expired_slots
from app.celery_app import celery_app


def test_celery_app_configuration():
    """Verify Celery app initialization, timezone, and registered task imports."""
    assert celery_app.main == "kisan_suvidha"
    assert celery_app.conf.timezone == "Asia/Kolkata"
    assert "app.tasks.recalculate_slots.recalculate_center_queue" in celery_app.tasks
    assert "app.tasks.cleanup_expired_slots.cleanup_expired_slots" in celery_app.tasks
