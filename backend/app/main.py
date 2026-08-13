from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .fallback import build_demo_pipeline
from .kimi import KimiClient
from .models import AnalyzeRequest, GradeRequest, GradeResponse, PipelineResponse
from .store import get_run, init_db, save_run


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="JobFit Agent API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4173", "http://127.0.0.1:4173", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str | bool]:
    kimi = KimiClient()
    return {"status": "ok", "mode": "kimi" if kimi.enabled else "demo", "kimi_configured": kimi.enabled}


@app.post("/api/pipeline/analyze", response_model=PipelineResponse)
async def analyze(request: AnalyzeRequest) -> PipelineResponse:
    baseline = build_demo_pipeline(request)
    kimi = KimiClient()
    if not request.force_refresh:
        cached = get_run(baseline.request_id)
        if cached and (cached.mode == "kimi" or not kimi.enabled):
            return cached
    result = baseline
    if kimi.enabled:
        try:
            result = await kimi.analyze(request, baseline)
        except Exception as exc:
            result.analysis.summary += f"（真实模型暂时不可用，已回退到本地规则：{type(exc).__name__}）"
    save_run(result)
    return result


@app.post("/api/assessments/grade", response_model=GradeResponse)
async def grade(request: GradeRequest) -> GradeResponse:
    if len(request.questions) != len(request.answers):
        raise HTTPException(status_code=400, detail="题目和答案数量不一致")
    correct = sum(answer == question.answer for question, answer in zip(request.questions, request.answers))
    total = len(request.questions)
    score = round(correct / max(1, total) * 100)
    feedback = [
        question.explanation or f"第 {index + 1} 题正确答案为选项 {question.answer + 1}"
        for index, (question, answer) in enumerate(zip(request.questions, request.answers))
        if answer != question.answer
    ]
    return GradeResponse(score=score, correct=correct, total=total, passed=score >= 70, feedback=feedback)
