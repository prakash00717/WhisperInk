from pathlib import Path
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from diary import Diary

# ----------------------------------------------------
# Paths
# ----------------------------------------------------

ROOT = Path(__file__).parent

UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ----------------------------------------------------
# FastAPI
# ----------------------------------------------------

app = FastAPI(
    title="WhisperInk Backend"
)

# ----------------------------------------------------
# CORS
# ----------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# Diary
# ----------------------------------------------------

diary = Diary()

# ----------------------------------------------------
# Debug Request
# ----------------------------------------------------

class DebugRequest(BaseModel):
    text: str

# ----------------------------------------------------
# Health Check
# ----------------------------------------------------

@app.get("/")
async def root():

    return {
        "status": "running",
        "service": "WhisperInk"
    }

# ----------------------------------------------------
# Diary Endpoint
# ----------------------------------------------------

@app.post("/diary")
async def diary_endpoint(
    image: UploadFile = File(...)
):

    if (
        image.content_type is None
        or not image.content_type.startswith("image/")
    ):

        raise HTTPException(
            status_code=400,
            detail="Only image uploads are supported."
        )

    image_path = UPLOAD_DIR / image.filename

    with image_path.open("wb") as buffer:

        shutil.copyfileobj(
            image.file,
            buffer
        )

    result = await diary.process(image_path)

    return result

# ----------------------------------------------------
# Debug Endpoint
# ----------------------------------------------------

@app.post("/debug")
async def debug(request: DebugRequest):

    prompt = f"""
You are the magical WhisperInk diary.

Reply naturally to the following diary entry.

Diary entry:
{request.text}

Return ONLY JSON.

{{
    "reply": "<your reply>"
}}
"""

    result = diary.gemini.chat(prompt)

    return result