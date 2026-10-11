"""
Palestinian Names Archive — FastAPI Backend
Serves real search, sort, and statistics operations on the dataset.
"""
import asyncio
import logging
import os
from contextlib import asynccontextmanager, suppress
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import records, agent
from data.loader import get_records
from data.sync import refresh_dataset

async def refresh_loop():
    while True:
        try:
            await asyncio.to_thread(refresh_dataset)
        except Exception:
            logging.getLogger(__name__).exception('Names refresh failed; retaining last valid snapshot')
        await asyncio.sleep(24 * 3600)


@asynccontextmanager
async def lifespan(app):
    get_records()
    task = asyncio.create_task(refresh_loop()) if os.getenv('DATA_SYNC_ENABLED', 'true').lower() != 'false' else None
    try:
        yield
    finally:
        if task:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task


app = FastAPI(title="أسماء لا تُنسى — API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(records.router, prefix="/api")
app.include_router(agent.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "أسماء لا تُنسى — Archive API", "status": "running"}
