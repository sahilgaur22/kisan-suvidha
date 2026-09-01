from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_config_and_script_discovery():
    """Verify Alembic setup can locate migration scripts and revision tree."""
    alembic_cfg = Config("backend/alembic.ini")
    script = ScriptDirectory.from_config(alembic_cfg)
    revisions = list(script.walk_revisions())
    assert len(revisions) >= 2
    head_revision = script.get_current_head()
    assert head_revision == "002_row_level_security"
