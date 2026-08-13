from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from .models import PipelineResponse


DB_PATH = Path(__file__).resolve().parents[1] / "jobfit.db"


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS pipeline_runs (
                request_id TEXT PRIMARY KEY,
                response_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def get_run(request_id: str) -> PipelineResponse | None:
    with sqlite3.connect(DB_PATH) as connection:
        row = connection.execute("SELECT response_json FROM pipeline_runs WHERE request_id = ?", (request_id,)).fetchone()
    if not row:
        return None
    result = PipelineResponse.model_validate(json.loads(row[0]))
    result.cached = True
    return result


def save_run(result: PipelineResponse) -> None:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            "INSERT OR REPLACE INTO pipeline_runs(request_id, response_json) VALUES (?, ?)",
            (result.request_id, result.model_dump_json()),
        )
