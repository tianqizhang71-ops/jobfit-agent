from fastapi.testclient import TestClient

from backend.app.main import app


SAMPLE = """AI 产品经理实习生
地点：上海，每周到岗5天，连续实习3个月，本科及以上。
负责 Agent 产品需求分析、PRD、用户研究和数据分析；要求熟悉 Prompt Engineering、Dify、SQL，并能设计效果评测。"""


def test_pipeline_is_dynamic_without_api_key(monkeypatch, tmp_path):
    monkeypatch.delenv("KIMI_API_KEY", raising=False)
    monkeypatch.delenv("MOONSHOT_API_KEY", raising=False)
    with TestClient(app) as client:
        response = client.post("/api/pipeline/analyze", json={
            "jd_text": SAMPLE,
            "force_refresh": True,
            "profile": {
                "name": "王", "intent": "AI 产品经理实习生", "education": "硕士",
                "major": "应用统计", "gradYear": "2028", "city": "上海",
                "days": "5", "months": "3", "skills": "Python、Dify",
            },
        })
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "demo"
    assert data["job"]["city"] == "上海"
    assert "SQL" in data["job"]["requiredSkills"]
    assert data["learning"]["steps"]
    assert data["learning"]["questions"]


def test_grade():
    with TestClient(app) as client:
        response = client.post("/api/assessments/grade", json={
            "questions": [{"q": "1+1?", "options": ["1", "2"], "answer": 1}],
            "answers": [1],
        })
    assert response.json()["score"] == 100
