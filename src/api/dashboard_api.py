"""FastAPI dashboard for SpeakerAgent.AI.

Serves endpoints that the frontend (Vercel/Next.js) calls to display leads.
Includes APScheduler for daily scout cron job.
"""

import logging
import os
import threading
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config.settings import Settings
from src.api.airtable import AirtableAPI

logger = logging.getLogger(__name__)


# ── Scheduler ───────────────────────────────────────────────

def _run_daily_scout():
    """Run the scout pipeline as a background job."""
    try:
        from src.agent.scout import run_scout
        settings = Settings()
        profile_path = settings.SCOUT_PROFILE_PATH
        speaker_id = settings.SCOUT_SPEAKER_ID
        logger.info(f"[CRON] Starting daily scout for {speaker_id}")
        summary = run_scout(
            profile_path=profile_path,
            speaker_id=speaker_id,
        )
        logger.info(
            f"[CRON] Scout complete: pushed {summary.get('pushed', 0)} leads, "
            f"RED={summary.get('triage_counts', {}).get('RED', 0)} "
            f"YELLOW={summary.get('triage_counts', {}).get('YELLOW', 0)}"
        )
    except Exception as e:
        logger.error(f"[CRON] Scout failed: {e}", exc_info=True)


_scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start scheduler on startup, shut down on exit."""
    global _scheduler
    settings = Settings()
    if settings.ENABLE_CRON:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger

        _scheduler = BackgroundScheduler()
        # 6 AM EST = 11:00 UTC
        _scheduler.add_job(
            _run_daily_scout,
            CronTrigger(hour=11, minute=0, timezone='UTC'),
            id='daily_scout',
            replace_existing=True,
        )
        _scheduler.start()
        logger.info("[CRON] Daily scout scheduled for 11:00 UTC (6 AM EST)")
    yield
    if _scheduler:
        _scheduler.shutdown()
        logger.info("[CRON] Scheduler shut down")


# ── App ─────────────────────────────────────────────────────

app = FastAPI(
    title="SpeakerAgent.AI Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — driven by CORS_ORIGINS env var (comma-separated)
_allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
_allowed_origins = [o.strip() for o in _allowed_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init on startup
_settings = None
_airtable = None


def get_airtable() -> AirtableAPI:
    global _settings, _airtable
    if _airtable is None:
        _settings = Settings()
        _airtable = AirtableAPI(
            api_key=_settings.AIRTABLE_API_KEY,
            base_id=_settings.AIRTABLE_BASE_ID,
            leads_table=_settings.LEADS_TABLE,
            speakers_table=_settings.SPEAKERS_TABLE,
        )
    return _airtable


class StatusUpdate(BaseModel):
    status: str


# ── Health ──────────────────────────────────────────────────

@app.get("/health")
def health_check():
    cron_active = _scheduler is not None and _scheduler.running if _scheduler else False
    try:
        at = get_airtable()
        ok = at.health_check()
        return {
            "status": "healthy" if ok else "degraded",
            "airtable": ok,
            "cron_active": cron_active,
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e), "cron_active": cron_active}


# ── Leads ───────────────────────────────────────────────────

@app.get("/api/leads")
def list_leads(
    speaker_id: str = Query(..., description="Speaker ID to filter by"),
    status: Optional[str] = Query(None),
    triage: Optional[str] = Query(None),
):
    """Get all leads for a speaker, with optional filters."""
    at = get_airtable()
    records = at.get_leads(
        speaker_id=speaker_id,
        status=status or '',
        triage=triage or '',
    )
    return {
        "count": len(records),
        "leads": [
            {"id": r["id"], **r.get("fields", {})}
            for r in records
        ]
    }


@app.get("/api/leads/stats")
def lead_stats(speaker_id: str = Query(...)):
    """Aggregated lead statistics for a speaker."""
    at = get_airtable()
    stats = at.get_lead_stats(speaker_id)
    return stats


@app.get("/api/leads/{lead_id}")
def get_lead(lead_id: str):
    """Get a single lead by Airtable record ID."""
    at = get_airtable()
    record = at.get_lead_by_id(lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"id": record["id"], **record.get("fields", {})}


@app.put("/api/leads/{lead_id}/status")
def update_lead_status(lead_id: str, body: StatusUpdate):
    """Update lead status (New -> Contacted -> Replied -> Booked -> Passed)."""
    valid = {'New', 'Contacted', 'Replied', 'Booked', 'Passed'}
    if body.status not in valid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid)}"
        )
    at = get_airtable()
    result = at.update_lead(lead_id, {'Lead Status': body.status})
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update lead")
    return {"id": result["id"], **result.get("fields", {})}


# ── Scout (manual trigger) ─────────────────────────────────

@app.post("/api/scout/run")
def trigger_scout():
    """Manually trigger a scout run (runs in background thread)."""
    thread = threading.Thread(target=_run_daily_scout, daemon=True)
    thread.start()
    return {"status": "started", "message": "Scout pipeline running in background"}


# ── Speaker ─────────────────────────────────────────────────

@app.get("/api/speaker/{speaker_id}")
def get_speaker(speaker_id: str):
    """Get speaker profile from Airtable."""
    at = get_airtable()
    record = at.get_speaker(speaker_id)
    if not record:
        raise HTTPException(status_code=404, detail="Speaker not found")
    return {"id": record["id"], **record.get("fields", {})}


# ── Dashboard (combined) ────────────────────────────────────

@app.get("/api/dashboard/{speaker_id}")
def dashboard(speaker_id: str):
    """Combined dashboard data: profile + stats + top leads."""
    at = get_airtable()

    # Stats
    stats = at.get_lead_stats(speaker_id)

    # Top 5 leads by score
    all_leads = at.get_leads(speaker_id=speaker_id)
    sorted_leads = sorted(
        all_leads,
        key=lambda r: r.get('fields', {}).get('Match Score', 0),
        reverse=True,
    )
    top_leads = [
        {"id": r["id"], **r.get("fields", {})}
        for r in sorted_leads[:5]
    ]

    # Speaker profile
    speaker = at.get_speaker(speaker_id)
    speaker_data = None
    if speaker:
        speaker_data = {"id": speaker["id"], **speaker.get("fields", {})}

    return {
        "speaker": speaker_data,
        "stats": stats,
        "top_leads": top_leads,
    }
