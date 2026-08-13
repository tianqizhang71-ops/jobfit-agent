from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from .models import AnalyzeRequest, PipelineResponse, Resource


def _load_local_env() -> None:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as file:
        for raw in file:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env()


def _json_from_text(content: str) -> dict[str, Any]:
    clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.IGNORECASE)
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", clean, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


class KimiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("KIMI_API_KEY") or os.getenv("MOONSHOT_API_KEY")
        self.base_url = os.getenv("KIMI_BASE_URL", "https://api.moonshot.cn/v1").rstrip("/")
        self.model = os.getenv("KIMI_MODEL", "kimi-k3")

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    async def _completion(self, messages: list[dict[str, Any]], *, use_search: bool = False) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        tools = [{"type": "builtin_function", "function": {"name": "$web_search"}}]
        finish_reason: str | None = None
        rounds = 0
        async with httpx.AsyncClient(timeout=120) as client:
            while finish_reason is None or finish_reason == "tool_calls":
                rounds += 1
                if rounds > 6:
                    raise RuntimeError("Kimi 工具调用轮数超过限制")
                payload: dict[str, Any] = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": 0.1,
                    "max_tokens": 12000,
                }
                if use_search:
                    payload["tools"] = tools
                response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                response.raise_for_status()
                choice = response.json()["choices"][0]
                finish_reason = choice.get("finish_reason")
                message = choice["message"]
                if finish_reason == "tool_calls":
                    messages.append(message)
                    for tool_call in message.get("tool_calls", []):
                        arguments = json.loads(tool_call["function"]["arguments"])
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call["id"],
                            "name": tool_call["function"]["name"],
                            "content": json.dumps(arguments, ensure_ascii=False),
                        })
                else:
                    return message.get("content", "")
        raise RuntimeError("Kimi 未返回有效结果")

    async def analyze(self, request: AnalyzeRequest, baseline: PipelineResponse) -> PipelineResponse:
        schema = {
            "job": {"company": "string", "title": "string", "city": "string", "degree": "string", "scheduleDays": 5, "durationMonths": 3, "requiredSkills": ["string"]},
            "analysis": {"score": 0, "recommendation": "建议投递|补强后投递|暂不建议投递", "matchedSkills": ["string"], "missingSkills": ["string"], "hardConstraints": ["string"], "summary": "string"},
            "learning": {"gap": "string", "duration": "7天", "outcome": "string", "example": "string", "steps": ["string"], "questions": [{"q": "string", "options": ["string"], "answer": 0, "explanation": "string"}]},
        }
        prompt = f"""你是 JobFit Agent。请解析陌生 JD，并与求职者画像比较，目标是让实习求职者用最短时间达到面试可用水平，而不是精通。
只输出一个合法 JSON 对象，不要 Markdown。严格采用以下结构：{json.dumps(schema, ensure_ascii=False)}
规则：分数必须基于硬条件和技能证据；missingSkills 必须来自 JD；steps 和 questions 必须针对本 JD，不得写通用套话；每题必须有唯一正确答案。

求职者画像：{request.profile.model_dump_json(ensure_ascii=False)}
JD：
{request.jd_text}
"""
        content = await self._completion([
            {"role": "system", "content": "你是严谨的招聘需求分析与学习评测专家。"},
            {"role": "user", "content": prompt},
        ])
        parsed = _json_from_text(content)
        merged = baseline.model_dump()
        for section in ("job", "analysis", "learning"):
            if isinstance(parsed.get(section), dict):
                merged[section].update({key: value for key, value in parsed[section].items() if value not in (None, "", [])})
        merged["mode"] = "kimi"
        merged["job"]["schedule"] = f"每周{merged['job']['scheduleDays']}天"
        merged["job"]["months"] = f"{merged['job']['durationMonths']}个月"
        merged["job"]["keywords"] = [merged["job"]["title"], *merged["job"]["requiredSkills"]]
        merged["job"]["reason"] = merged["analysis"]["summary"]
        result = PipelineResponse.model_validate(merged)
        result.learning.resources = await self.search_resources(result.analysis.missingSkills, result.learning.resources)
        return result

    async def search_resources(self, skills: list[str], fallback: list[Resource]) -> list[Resource]:
        if not skills:
            return fallback
        prompt = f"""联网搜索以下求职技能的权威、可直接学习的资料：{', '.join(skills[:4])}。
优先官方文档、大学公开课、GitHub 官方仓库；排除营销软文和无法打开的聚合页。
只输出合法 JSON：{{"resources":[{{"title":"...","source":"...","url":"https://...","time":"30分钟"}}]}}。
每项技能最多 2 条，URL 必须来自本次搜索结果。"""
        try:
            content = await self._completion([
                {"role": "system", "content": "你负责联网检索并筛选权威学习资源。"},
                {"role": "user", "content": prompt},
            ], use_search=True)
            parsed = _json_from_text(content)
            resources = [Resource.model_validate(item) for item in parsed.get("resources", [])]
            return resources[:8] or fallback
        except Exception:
            return fallback
