from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.config import get_settings
from app.models import ConversationRequest, ConversationResponse
from app.orchestrator import ConversationOrchestrator

logger = structlog.get_logger()
orchestrator: ConversationOrchestrator = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global orchestrator
    orchestrator = ConversationOrchestrator()
    logger.info("AI Orchestrator started")
    yield
    await orchestrator.close()
    logger.info("AI Orchestrator stopped")

settings = get_settings()

app = FastAPI(
    title="Aivora AI Orchestrator",
    description="AI conversation loop for voice receptionist",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-orchestrator"}

@app.post("/conversation", response_model=ConversationResponse)
async def process_conversation(request: ConversationRequest):
    try:
        response = await orchestrator.process_conversation(request)
        return response
    except Exception as e:
        logger.error("Conversation processing failed", error=str(e))
        raise HTTPException(status_code=500, detail="Conversation processing failed")

@app.get("/")
async def root():
    return {"service": "Aivora AI Orchestrator", "version": "0.1.0"}