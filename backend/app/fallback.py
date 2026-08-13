from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

from .models import (
    AnalyzeRequest,
    JobResult,
    LearningPlan,
    MatchAnalysis,
    PipelineResponse,
    Question,
    Resource,
)


@dataclass(frozen=True)
class SkillInfo:
    aliases: tuple[str, ...]
    resource: Resource
    action: str


SKILLS: dict[str, SkillInfo] = {
    "Prompt Engineering": SkillInfo(
        ("prompt", "提示词", "提示词工程"),
        Resource(title="提示词工程最佳实践", source="OpenAI 官方文档", url="https://platform.openai.com/docs/guides/prompt-engineering", time="35分钟"),
        "为目标岗位场景编写 5 条提示词测试样例，记录输入、预期、实际结果与修改理由",
    ),
    "Agent": SkillInfo(
        ("agent", "智能体", "function calling", "tool calling", "mcp"),
        Resource(title="Agent 核心机制入门", source="OpenAI 官方文档", url="https://platform.openai.com/docs/guides/agents", time="45分钟"),
        "画出一个 Agent 的输入、上下文、工具调用、异常降级与人工介入流程",
    ),
    "Dify": SkillInfo(
        ("dify", "工作流", "chatflow"),
        Resource(title="Dify 工作流快速入门", source="Dify 官方文档", url="https://docs.dify.ai/en/guides/workflow", time="40分钟"),
        "在 Dify 中复现一个包含条件分支和结构化输出的最小工作流，并检查运行日志",
    ),
    "SQL": SkillInfo(
        ("sql", "mysql", "数据库查询"),
        Resource(title="SQLBolt 交互式 SQL 教程", source="SQLBolt", url="https://sqlbolt.com/", time="50分钟"),
        "完成 SELECT、WHERE、GROUP BY 与 JOIN 练习，并用 SQL 回答一个产品漏斗问题",
    ),
    "Python": SkillInfo(
        ("python", "pandas", "数据处理"),
        Resource(title="Python 官方教程", source="Python 官方文档", url="https://docs.python.org/zh-cn/3/tutorial/", time="45分钟"),
        "用 Python 清洗一份小型用户行为数据并输出三个可解释指标",
    ),
    "RAG": SkillInfo(
        ("rag", "知识库", "向量检索", "embedding"),
        Resource(title="检索增强生成概念与实践", source="Microsoft Learn", url="https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview", time="45分钟"),
        "画出切分、向量化、检索、重排与生成链路，并说明两个常见失败点",
    ),
    "用户研究": SkillInfo(
        ("用户调研", "用户研究", "用户访谈", "可用性测试"),
        Resource(title="用户研究方法概览", source="Nielsen Norman Group", url="https://www.nngroup.com/articles/which-ux-research-methods/", time="35分钟"),
        "为目标用户写 5 个非引导式访谈问题，并整理成痛点、场景和机会点",
    ),
    "数据分析": SkillInfo(
        ("数据分析", "漏斗", "指标", "a/b", "ab测试", "数据驱动"),
        Resource(title="产品分析入门课程", source="Google Analytics Academy", url="https://skillshop.withgoogle.com/", time="40分钟"),
        "为该岗位涉及的产品定义一个北极星指标、三项过程指标与一次验证实验",
    ),
    "Figma/Axure": SkillInfo(
        ("figma", "axure", "原型", "交互设计", "ui/ux"),
        Resource(title="Figma 产品设计入门", source="Figma Learn", url="https://help.figma.com/hc/en-us/categories/360002051613", time="45分钟"),
        "把 JD 中一个核心场景画成可点击原型，补充正常、空状态与异常状态",
    ),
    "API": SkillInfo(
        ("api", "接口", "后端", "http", "异步任务"),
        Resource(title="HTTP API 基础", source="MDN Web Docs", url="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview", time="35分钟"),
        "阅读一个 API 文档，写出请求参数、响应字段、错误处理与验收用例",
    ),
    "Vibe Coding": SkillInfo(
        ("vibe coding", "ai coding", "claude code", "codex"),
        Resource(title="AI 辅助开发实践", source="GitHub Docs", url="https://docs.github.com/en/copilot", time="35分钟"),
        "用 AI 编程工具完成一个可运行的小功能，并人工检查、修改和测试生成代码",
    ),
}


def _first_match(pattern: str, text: str, default: str) -> str:
    found = re.search(pattern, text, re.IGNORECASE)
    return found.group(1).strip() if found else default


def _extract_skills(text: str) -> list[str]:
    lowered = text.lower()
    hits = [name for name, info in SKILLS.items() if any(alias.lower() in lowered for alias in info.aliases)]
    return hits or ["Agent", "数据分析", "用户研究"]


def _known(profile_skills: str, skill: str) -> bool:
    haystack = profile_skills.lower()
    info = SKILLS.get(skill)
    aliases = (skill,) if info is None else (skill, *info.aliases)
    return any(alias.lower() in haystack for alias in aliases)


def _question_for(skill: str) -> Question:
    actions = {
        "Prompt Engineering": ("评测提示词效果时，最可靠的第一步是什么？", ["只看一次回答", "先定义测试集与通过标准", "不断增加提示词长度", "只比较模型价格"], 1),
        "SQL": ("分析注册到激活的转化率，最适合先准备什么？", ["用户注册和激活事件数据", "员工通讯录", "产品截图", "模型参数"], 0),
        "用户研究": ("用户访谈中哪种问题更容易获得真实信息？", ["你是不是很喜欢这个功能？", "请回忆最近一次使用它的过程", "这个设计很好吧？", "你会每天使用吗？"], 1),
        "API": ("验收一个 Agent 工具调用接口时，除成功结果外还必须检查什么？", ["按钮颜色", "异常码、超时和字段缺失", "公司规模", "模型名称长度"], 1),
    }
    q, options, answer = actions.get(skill, (f"学习 {skill} 后，怎样证明已达到面试可用水平？", ["只说看过教程", "完成岗位场景作品并能解释取舍", "背诵所有定义", "只收藏资料"], 1))
    return Question(q=q, options=options, answer=answer, explanation="面试可用强调可展示产出、可解释过程和可验证结果。")


def build_demo_pipeline(request: AnalyzeRequest) -> PipelineResponse:
    text = request.jd_text
    profile = request.profile
    required = _extract_skills(text)
    matched = [skill for skill in required if _known(profile.skills, skill)]
    missing = [skill for skill in required if skill not in matched]
    if not missing:
        missing = [required[-1]]
    city = next((item for item in ("北京", "上海", "杭州", "深圳", "广州", "成都", "武汉", "南京") if item in text), profile.city)
    title = _first_match(r"(?:职位|岗位|招聘)?[：:\s]*([^\n]{2,30}(?:实习生|产品经理|工程师|负责人))", text, profile.intent)
    title = re.sub(r"^[：:\s]+", "", title)[:30]
    company = _first_match(r"(?:公司|团队)[：:\s]*([^\n，。]{2,20})", text, "用户上传 JD")
    days = int(_first_match(r"每周(?:到岗|实习)?\s*(\d)\s*天", text, profile.days))
    duration = int(_first_match(r"(?:连续实习|实习时长|实习)\s*(\d)\s*个?月", text, profile.months))
    degree = next((item for item in ("博士", "硕士", "本科", "大专") if item in text), "本科")
    grad_years = [int(year) for year in re.findall(r"20(?:2[6-9]|3\d)", text)] or [int(profile.gradYear)]
    skill_ratio = len(matched) / max(1, len(required))
    city_ok = city == profile.city
    time_ok = days <= int(profile.days) and duration <= int(profile.months)
    score = min(96, round(48 + skill_ratio * 32 + (10 if city_ok else 0) + (10 if time_ok else 0)))
    recommendation = "建议投递" if score >= 75 else "补强后投递" if score >= 58 else "暂不建议投递"
    gap = "、".join(missing[:3])
    resources = [SKILLS[skill].resource for skill in missing[:3] if skill in SKILLS]
    steps = [SKILLS[skill].action for skill in missing[:3] if skill in SKILLS]
    if not steps:
        steps = [f"围绕 {gap} 完成一个目标岗位场景练习，并记录验证结果"]
    while len(steps) < 3:
        steps.append("使用 STAR 结构复盘今日练习：背景、任务、行动、结果与改进")
    questions = [_question_for(skill) for skill in missing[:3]]
    while len(questions) < 3:
        questions.append(_question_for(required[len(questions) % len(required)]))
    digest = hashlib.sha256((text + profile.model_dump_json()).encode("utf-8")).hexdigest()[:12]
    job = JobResult(
        id=f"upload-{digest}", company=company, title=title, city=city,
        schedule=f"每周{days}天", months=f"{duration}个月", scheduleDays=days,
        durationMonths=duration, degree=degree, gradYears=sorted(set(grad_years)),
        baseScore=max(50, score - 12), tags=["用户上传", "AI 岗位"],
        keywords=[title, *required], requiredSkills=required,
        reason=f"已根据你的画像识别 {len(matched)} 项已具备能力和 {len(missing)} 项待补能力。",
    )
    analysis = MatchAnalysis(
        score=score, recommendation=recommendation, matchedSkills=matched,
        missingSkills=missing, hardConstraints=[f"地点：{'满足' if city_ok else f'岗位在{city}，意向为{profile.city}'}", f"实习时间：{'满足' if time_ok else '不满足'}"],
        summary=f"当前最值得补强的是 {gap}；目标是能在面试中讲清场景、方案、验证和结果。",
    )
    learning = LearningPlan(
        gap=gap, duration=f"{max(3, min(14, len(missing) * 3 + 2))}天",
        outcome=f"完成一份围绕 {gap} 的岗位场景作品，并能回答方案取舍与验证方式",
        example=f"示例：从 JD 的“{required[0]}”要求出发，说明你如何拆解任务、完成最小作品并用测试结果证明有效。",
        resources=resources, steps=steps[:5], questions=questions[:5],
    )
    return PipelineResponse(request_id=digest, mode="demo", job=job, analysis=analysis, learning=learning)
