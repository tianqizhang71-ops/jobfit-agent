from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class ProfileInput(BaseModel):
    name: str = ""
    intent: str = "AI 产品经理实习生"
    education: str = "硕士"
    major: str = "应用统计"
    gradYear: str = "2028"
    city: str = "北京"
    days: str = "5"
    months: str = "3"
    skills: str = "Python、R、SQL、Dify"


class AnalyzeRequest(BaseModel):
    jd_text: str = Field(min_length=20, max_length=30000)
    profile: ProfileInput
    source_url: str | None = None
    force_refresh: bool = False


class Resource(BaseModel):
    title: str
    source: str
    url: str
    time: str = "30分钟"


class Question(BaseModel):
    q: str
    options: list[str] = Field(min_length=2, max_length=6)
    answer: int = Field(ge=0)
    explanation: str = ""


class LearningPlan(BaseModel):
    gap: str
    duration: str = "7天"
    outcome: str
    example: str
    resources: list[Resource]
    steps: list[str] = Field(min_length=1)
    questions: list[Question] = Field(min_length=1)


class JobResult(BaseModel):
    id: str
    company: str = "用户上传 JD"
    title: str
    city: str
    schedule: str
    months: str
    scheduleDays: int
    durationMonths: int
    degree: str
    gradYears: list[int]
    baseScore: int
    tags: list[str]
    keywords: list[str]
    requiredSkills: list[str]
    reason: str
    color: str = "#155eef"


class MatchAnalysis(BaseModel):
    score: int = Field(ge=0, le=100)
    recommendation: Literal["建议投递", "补强后投递", "暂不建议投递"]
    matchedSkills: list[str]
    missingSkills: list[str]
    hardConstraints: list[str]
    summary: str


class PipelineResponse(BaseModel):
    request_id: str
    mode: Literal["demo", "kimi"]
    cached: bool = False
    job: JobResult
    analysis: MatchAnalysis
    learning: LearningPlan


class GradeRequest(BaseModel):
    questions: list[Question]
    answers: list[int]


class GradeResponse(BaseModel):
    score: int
    correct: int
    total: int
    passed: bool
    feedback: list[str]
