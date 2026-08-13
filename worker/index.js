const SKILLS = {
  "Prompt Engineering": {
    aliases: ["prompt", "提示词", "提示词工程"],
    resource: { title: "提示词工程最佳实践", source: "OpenAI 官方文档", url: "https://platform.openai.com/docs/guides/prompt-engineering", time: "35分钟" },
    action: "为目标岗位场景编写 5 条提示词测试样例，记录输入、预期、实际结果与修改理由",
  },
  Agent: {
    aliases: ["agent", "智能体", "function calling", "tool calling", "mcp"],
    resource: { title: "Agent 核心机制入门", source: "OpenAI 官方文档", url: "https://platform.openai.com/docs/guides/agents", time: "45分钟" },
    action: "画出一个 Agent 的输入、上下文、工具调用、异常降级与人工介入流程",
  },
  Dify: {
    aliases: ["dify", "工作流", "chatflow"],
    resource: { title: "Dify 工作流快速入门", source: "Dify 官方文档", url: "https://docs.dify.ai/en/guides/workflow", time: "40分钟" },
    action: "在 Dify 中复现一个包含条件分支和结构化输出的最小工作流，并检查运行日志",
  },
  SQL: {
    aliases: ["sql", "mysql", "数据库查询"],
    resource: { title: "SQLBolt 交互式 SQL 教程", source: "SQLBolt", url: "https://sqlbolt.com/", time: "50分钟" },
    action: "完成 SELECT、WHERE、GROUP BY 与 JOIN 练习，并用 SQL 回答一个产品漏斗问题",
  },
  Python: {
    aliases: ["python", "pandas", "数据处理"],
    resource: { title: "Python 官方教程", source: "Python 官方文档", url: "https://docs.python.org/zh-cn/3/tutorial/", time: "45分钟" },
    action: "用 Python 清洗一份小型用户行为数据并输出三个可解释指标",
  },
  RAG: {
    aliases: ["rag", "知识库", "向量检索", "embedding"],
    resource: { title: "检索增强生成概念与实践", source: "Microsoft Learn", url: "https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview", time: "45分钟" },
    action: "画出切分、向量化、检索、重排与生成链路，并说明两个常见失败点",
  },
  用户研究: {
    aliases: ["用户调研", "用户研究", "用户访谈", "可用性测试"],
    resource: { title: "用户研究方法概览", source: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/which-ux-research-methods/", time: "35分钟" },
    action: "为目标用户写 5 个非引导式访谈问题，并整理成痛点、场景和机会点",
  },
  数据分析: {
    aliases: ["数据分析", "漏斗", "指标", "a/b", "ab测试", "数据驱动"],
    resource: { title: "产品分析入门课程", source: "Google Skillshop", url: "https://skillshop.withgoogle.com/", time: "40分钟" },
    action: "为该岗位涉及的产品定义一个北极星指标、三项过程指标与一次验证实验",
  },
  "Figma/Axure": {
    aliases: ["figma", "axure", "原型", "交互设计", "ui/ux"],
    resource: { title: "Figma 产品设计入门", source: "Figma Learn", url: "https://help.figma.com/hc/en-us/categories/360002051613", time: "45分钟" },
    action: "把 JD 中一个核心场景画成可点击原型，补充正常、空状态与异常状态",
  },
  API: {
    aliases: ["api", "接口", "后端", "http", "异步任务"],
    resource: { title: "HTTP API 基础", source: "MDN Web Docs", url: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview", time: "35分钟" },
    action: "阅读一个 API 文档，写出请求参数、响应字段、错误处理与验收用例",
  },
  "Vibe Coding": {
    aliases: ["vibe coding", "ai coding", "claude code", "codex"],
    resource: { title: "AI 辅助开发实践", source: "GitHub Docs", url: "https://docs.github.com/en/copilot", time: "35分钟" },
    action: "用 AI 编程工具完成一个可运行的小功能，并人工检查、修改和测试生成代码",
  },
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

const findFirst = (pattern, text, fallback) => text.match(pattern)?.[1]?.trim() || fallback;

function extractSkills(text) {
  const lowered = text.toLowerCase();
  const hits = Object.entries(SKILLS)
    .filter(([, info]) => info.aliases.some((alias) => lowered.includes(alias.toLowerCase())))
    .map(([skill]) => skill);
  return hits.length ? hits : ["Agent", "数据分析", "用户研究"];
}

function profileHasSkill(profileSkills, skill) {
  const lowered = String(profileSkills || "").toLowerCase();
  return [skill, ...(SKILLS[skill]?.aliases || [])].some((alias) => lowered.includes(alias.toLowerCase()));
}

function questionFor(skill) {
  const questions = {
    "Prompt Engineering": ["评测提示词效果时，最可靠的第一步是什么？", ["只看一次回答", "先定义测试集与通过标准", "不断增加提示词长度", "只比较模型价格"], 1],
    SQL: ["分析注册到激活的转化率，最适合先准备什么？", ["用户注册和激活事件数据", "员工通讯录", "产品截图", "模型参数"], 0],
    用户研究: ["用户访谈中哪种问题更容易获得真实信息？", ["你是不是很喜欢这个功能？", "请回忆最近一次使用它的过程", "这个设计很好吧？", "你会每天使用吗？"], 1],
    API: ["验收一个 Agent 工具调用接口时，除成功结果外还必须检查什么？", ["按钮颜色", "异常码、超时和字段缺失", "公司规模", "模型名称长度"], 1],
  };
  const [q, options, answer] = questions[skill] || [
    `学习 ${skill} 后，怎样证明已达到面试可用水平？`,
    ["只说看过教程", "完成岗位场景作品并能解释取舍", "背诵所有定义", "只收藏资料"],
    1,
  ];
  return { q, options, answer, explanation: "面试可用强调可展示产出、可解释过程和可验证结果。" };
}

async function shortHash(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].slice(0, 6).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function buildDemoPipeline(input) {
  const text = input.jd_text;
  const profile = input.profile;
  const requiredSkills = extractSkills(text);
  const matchedSkills = requiredSkills.filter((skill) => profileHasSkill(profile.skills, skill));
  let missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  if (!missingSkills.length) missingSkills = [requiredSkills.at(-1)];
  const cities = ["北京", "上海", "杭州", "深圳", "广州", "成都", "武汉", "南京"];
  const city = cities.find((item) => text.includes(item)) || profile.city;
  const title = findFirst(/(?:职位|岗位|招聘)?[：:\s]*([^\n]{2,30}(?:实习生|产品经理|工程师|负责人))/, text, profile.intent).replace(/^[：:\s]+/, "").slice(0, 30);
  const company = findFirst(/(?:公司|团队)[：:\s]*([^\n，。]{2,20})/, text, "用户上传 JD");
  const scheduleDays = Number(findFirst(/每周(?:到岗|实习)?\s*(\d)\s*天/, text, profile.days)) || 5;
  const durationMonths = Number(findFirst(/(?:连续实习|实习时长|实习)\s*(\d)\s*个?月/, text, profile.months)) || 3;
  const degree = ["博士", "硕士", "本科", "大专"].find((item) => text.includes(item)) || "本科";
  const gradYears = [...new Set([...text.matchAll(/20(?:2[6-9]|3\d)/g)].map((match) => Number(match[0])))];
  if (!gradYears.length) gradYears.push(Number(profile.gradYear));
  const cityOk = city === profile.city;
  const timeOk = scheduleDays <= Number(profile.days) && durationMonths <= Number(profile.months);
  const skillRatio = matchedSkills.length / Math.max(1, requiredSkills.length);
  const score = Math.min(96, Math.round(48 + skillRatio * 32 + (cityOk ? 10 : 0) + (timeOk ? 10 : 0)));
  const recommendation = score >= 75 ? "建议投递" : score >= 58 ? "补强后投递" : "暂不建议投递";
  const priorities = missingSkills.slice(0, 3);
  const gap = priorities.join("、");
  const steps = priorities.map((skill) => SKILLS[skill]?.action).filter(Boolean);
  while (steps.length < 3) steps.push("使用 STAR 结构复盘今日练习：背景、任务、行动、结果与改进");
  const questions = priorities.map(questionFor);
  while (questions.length < 3) questions.push(questionFor(requiredSkills[questions.length % requiredSkills.length]));
  const requestId = await shortHash(`${text}${JSON.stringify(profile)}`);
  return {
    request_id: requestId,
    mode: "demo",
    cached: false,
    job: {
      id: `upload-${requestId}`, company, title, city,
      schedule: `每周${scheduleDays}天`, months: `${durationMonths}个月`, scheduleDays, durationMonths,
      degree, gradYears: gradYears.sort(), baseScore: Math.max(50, score - 12),
      tags: ["用户上传", "AI 岗位"], keywords: [title, ...requiredSkills], requiredSkills,
      reason: `已根据你的画像识别 ${matchedSkills.length} 项已具备能力和 ${missingSkills.length} 项待补能力。`,
      color: "#155eef",
    },
    analysis: {
      score, recommendation, matchedSkills, missingSkills,
      hardConstraints: [`地点：${cityOk ? "满足" : `岗位在${city}，意向为${profile.city}`}`, `实习时间：${timeOk ? "满足" : "不满足"}`],
      summary: `当前最值得补强的是 ${gap}；目标是能在面试中讲清场景、方案、验证和结果。`,
    },
    learning: {
      gap, duration: `${Math.max(3, Math.min(14, missingSkills.length * 3 + 2))}天`,
      outcome: `完成一份围绕 ${gap} 的岗位场景作品，并能回答方案取舍与验证方式`,
      example: `示例：从 JD 的“${requiredSkills[0]}”要求出发，说明你如何拆解任务、完成最小作品并用测试结果证明有效。`,
      resources: priorities.map((skill) => SKILLS[skill]?.resource).filter(Boolean),
      steps: steps.slice(0, 5), questions: questions.slice(0, 5),
    },
  };
}

function parseModelJson(content) {
  const clean = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(clean); } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("模型没有返回 JSON");
    return JSON.parse(clean.slice(start, end + 1));
  }
}

async function kimiCompletion(env, messages) {
  const apiKey = env.KIMI_API_KEY || env.MOONSHOT_API_KEY;
  const baseUrl = String(env.KIMI_BASE_URL || "https://api.moonshot.cn/v1").replace(/\/$/, "");
  const model = env.KIMI_MODEL || "kimi-k3";
  const tools = [{ type: "builtin_function", function: { name: "$web_search" } }];
  for (let round = 0; round < 6; round += 1) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages, tools, temperature: 0.1, max_tokens: 12000 }),
    });
    if (!response.ok) throw new Error(`Kimi API ${response.status}`);
    const choice = (await response.json()).choices[0];
    if (choice.finish_reason !== "tool_calls") return choice.message.content || "";
    messages.push(choice.message);
    for (const toolCall of choice.message.tool_calls || []) {
      const args = JSON.parse(toolCall.function.arguments);
      messages.push({ role: "tool", tool_call_id: toolCall.id, name: toolCall.function.name, content: JSON.stringify(args) });
    }
  }
  throw new Error("Kimi 工具调用轮数超过限制");
}

async function enrichWithKimi(env, input, baseline) {
  const schema = {
    job: { company: "string", title: "string", city: "string", degree: "string", scheduleDays: 5, durationMonths: 3, requiredSkills: ["string"] },
    analysis: { score: 0, recommendation: "建议投递|补强后投递|暂不建议投递", matchedSkills: ["string"], missingSkills: ["string"], hardConstraints: ["string"], summary: "string" },
    learning: { gap: "string", duration: "7天", outcome: "string", example: "string", resources: [{ title: "string", source: "string", url: "https://...", time: "30分钟" }], steps: ["string"], questions: [{ q: "string", options: ["string"], answer: 0, explanation: "string" }] },
  };
  const prompt = `你是 JobFit Agent。请解析陌生 JD，与求职者画像比较，并联网查找权威学习资料。目标是让实习求职者用最短时间达到面试可用水平，而不是精通。\n只输出合法 JSON，不要 Markdown，严格采用此结构：${JSON.stringify(schema)}\nmissingSkills 必须来自 JD；资源优先官方文档或大学公开课；步骤、题目必须针对本 JD；每题有唯一正确答案。\n求职者画像：${JSON.stringify(input.profile)}\nJD：\n${input.jd_text}`;
  const content = await kimiCompletion(env, [
    { role: "system", content: "你是严谨的招聘需求分析、学习资源检索与技能评测专家。" },
    { role: "user", content: prompt },
  ]);
  const parsed = parseModelJson(content);
  const result = structuredClone(baseline);
  for (const section of ["job", "analysis", "learning"]) {
    if (parsed[section] && typeof parsed[section] === "object") Object.assign(result[section], parsed[section]);
  }
  result.mode = "kimi";
  result.job.schedule = `每周${result.job.scheduleDays}天`;
  result.job.months = `${result.job.durationMonths}个月`;
  result.job.keywords = [result.job.title, ...result.job.requiredSkills];
  result.job.reason = result.analysis.summary;
  return result;
}

async function handleApi(request, env, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    const enabled = Boolean(env.KIMI_API_KEY || env.MOONSHOT_API_KEY);
    return json({ status: "ok", mode: enabled ? "kimi" : "demo", kimi_configured: enabled });
  }
  if (request.method === "POST" && url.pathname === "/api/pipeline/analyze") {
    let input;
    try { input = await request.json(); } catch { return json({ detail: "请求内容不是有效 JSON" }, 400); }
    if (!input?.profile || typeof input.jd_text !== "string" || input.jd_text.trim().length < 20) {
      return json({ detail: "请提供至少 20 个字的完整 JD 和求职者画像" }, 422);
    }
    const baseline = await buildDemoPipeline(input);
    if (!(env.KIMI_API_KEY || env.MOONSHOT_API_KEY)) return json(baseline);
    try { return json(await enrichWithKimi(env, input, baseline)); }
    catch (error) {
      baseline.analysis.summary += `（大模型暂时不可用，已自动使用规则模式：${error.name || "Error"}）`;
      return json(baseline);
    }
  }
  if (url.pathname.startsWith("/api/")) return json({ detail: "接口不存在" }, 404);
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiResponse = await handleApi(request, env, url);
    if (apiResponse) return apiResponse;

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) return response;

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
