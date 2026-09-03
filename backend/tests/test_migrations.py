import os
from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_config_and_script_discovery():
    """Verify Alembic setup can locate migration scripts and revision tree."""
    ini_path = "alembic.ini" if os.path.exists("alembic.ini") else "backend/alembic.ini"
    alembic_cfg = Config(ini_path)
    if os.path.exists("alembic.ini"):
        alembic_cfg.set_main_option("script_location", "alembic")
    script = ScriptDirectory.from_config(alembic_cfg)
    revisions = list(script.walk_revisions())
    assert len(revisions) >= 2
    head_revision = script.get_current_head()
    assert head_revision == "002_row_level_security"
