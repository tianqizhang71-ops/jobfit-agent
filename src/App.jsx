import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconAdjustments,
  IconArrowRight,
  IconBook2,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconChartDonut3,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconClipboardCheck,
  IconClock,
  IconEdit,
  IconExternalLink,
  IconFileDescription,
  IconHelpCircle,
  IconLink,
  IconListCheck,
  IconMapPin,
  IconMessageCircle,
  IconPhoto,
  IconPlus,
  IconRobot,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconTargetArrow,
  IconTrash,
  IconUpload,
  IconUserCircle,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyzeJd } from "./api";

const NAV_ITEMS = [
  { id: "discover", label: "岗位发现", icon: IconTargetArrow },
  { id: "analysis", label: "匹配分析", icon: IconChartDonut3 },
  { id: "plan", label: "学习计划", icon: IconBook2 },
  { id: "assessment", label: "技能测评", icon: IconClipboardCheck },
  { id: "resume", label: "简历更新", icon: IconFileDescription },
];

const STAGES = [
  { id: "profile", label: "建立画像" },
  { id: "discover", label: "发现岗位" },
  { id: "plan", label: "补齐能力" },
  { id: "assessment", label: "技能验收" },
  { id: "resume", label: "准备投递" },
];

const JOBS = [
  {
    id: 1,
    company: "字节跳动",
    title: "AI 产品经理实习生",
    city: "北京",
    schedule: "每周5天",
    months: "3个月",
    scheduleDays: 5,
    durationMonths: 3,
    degree: "本科",
    gradYears: [2027, 2028],
    baseScore: 78,
    tags: ["产品与设计", "大型互联网"],
    keywords: ["AI产品经理", "产品经理", "Agent", "大模型", "AI产品"],
    requiredSkills: ["Python", "SQL", "Dify", "Prompt"],
    reason: "你具备需求分析与用户洞察能力，符合 AI 产品需求。",
    color: "#155eef",
  },
  {
    id: 2,
    company: "小米科技",
    title: "AI 产品实习生",
    city: "北京",
    schedule: "每周5天",
    months: "3个月",
    scheduleDays: 5,
    durationMonths: 3,
    degree: "硕士",
    gradYears: [2028],
    baseScore: 74,
    tags: ["产品与设计", "智能硬件"],
    keywords: ["AI产品经理", "产品实习生", "数据分析", "智能硬件"],
    requiredSkills: ["Python", "数据分析", "原型", "用户研究"],
    reason: "你对产品体验与数据驱动有实践，能支持 AI 产品迭代。",
    color: "#f46a19",
  },
  {
    id: 3,
    company: "美团",
    title: "AI 产品实习生",
    city: "北京",
    schedule: "每周5天",
    months: "3个月",
    scheduleDays: 5,
    durationMonths: 3,
    degree: "本科",
    gradYears: [2027, 2028],
    baseScore: 72,
    tags: ["产品与设计", "生活服务"],
    keywords: ["AI产品经理", "产品实习生", "用户研究", "数据分析"],
    requiredSkills: ["SQL", "Python", "用户研究", "A/B测试"],
    reason: "你擅长数据分析与用户研究，有助于提升产品体验。",
    color: "#1677ff",
  },
  {
    id: 4,
    company: "百度秒哒",
    title: "AI 产品实习生",
    city: "北京",
    schedule: "每周4天",
    months: "4个月",
    scheduleDays: 4,
    durationMonths: 4,
    degree: "本科",
    gradYears: [2027, 2028],
    baseScore: 70,
    tags: ["Vibe Coding", "Agent"],
    keywords: ["AI产品经理", "AI产品", "Vibe Coding", "Agent", "产品实习生"],
    requiredSkills: ["Python", "Vibe Coding", "Agent", "原型"],
    reason: "你有 AI 工作流实践和原型能力，可迁移到 AI Native 应用建设。",
    color: "#5b5ce2",
  },
  {
    id: 5,
    company: "商汤科技",
    title: "AIGC 产品实习生",
    city: "上海",
    schedule: "每周5天",
    months: "3个月",
    scheduleDays: 5,
    durationMonths: 3,
    degree: "硕士",
    gradYears: [2027, 2028],
    baseScore: 76,
    tags: ["AIGC", "多模态"],
    keywords: ["AI产品经理", "AIGC", "多模态", "产品实习生"],
    requiredSkills: ["Python", "Prompt", "多模态", "竞品分析"],
    reason: "你的统计分析和 AI 工作流经历可用于多模态产品评测与迭代。",
    color: "#6d5dfc",
  },
  {
    id: 6,
    company: "哔哩哔哩",
    title: "AI 内容产品实习生",
    city: "上海",
    schedule: "每周4天",
    months: "3个月",
    scheduleDays: 4,
    durationMonths: 3,
    degree: "本科",
    gradYears: [2027, 2028],
    baseScore: 72,
    tags: ["内容产品", "数据分析"],
    keywords: ["AI产品经理", "内容产品", "AIGC", "数据分析"],
    requiredSkills: ["SQL", "Python", "内容指标", "A/B测试"],
    reason: "你的 Python、SQL 与用户分析能力适合内容效果评估和产品实验。",
    color: "#00a1d6",
  },
];

const DEFAULT_SOURCES = [
  { id: "boss", name: "BOSS直聘", url: "https://www.zhipin.com/web/geek/job?query=AI%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86&city=101010100", color: "green" },
  { id: "zhaopin", name: "智联招聘", url: "https://www.zhaopin.com/", color: "orange" },
  { id: "shixiseng", name: "实习僧", url: "https://www.shixiseng.com/interns", color: "blue" },
];

const DEFAULT_PROFILE = {
  name: "",
  intent: "AI 产品经理实习生",
  education: "硕士",
  major: "应用统计",
  gradYear: "2028",
  city: "北京",
  days: "5",
  months: "3",
  skills: "Python、R、SQL、Dify",
};

const FILTER_DEFAULTS = { city: "北京", education: "不限", gradYear: "2028", days: "5", months: "3" };

const SKILL_BARS = [
  { name: "产品能力", value: 84, target: 80 },
  { name: "Agent 实践", value: 76, target: 80 },
  { name: "数据分析", value: 88, target: 75 },
  { name: "提示词评测", value: 62, target: 78 },
  { name: "工程沟通", value: 70, target: 72 },
];

const GAP_DATA = [
  { name: "已满足", value: 7, color: "#12a150" },
  { name: "待补强", value: 2, color: "#f59e0b" },
  { name: "硬门槛", value: 1, color: "#e5484d" },
];

const WEEK_TASKS = [
  { day: "周一", title: "理解 Prompt 评测框架", time: "60分钟", status: "done" },
  { day: "周二", title: "设计 10 条评测样例", time: "75分钟", status: "today" },
  { day: "周三", title: "复盘 Bad Case 并改写", time: "60分钟", status: "pending" },
  { day: "周四", title: "完成 Agent 工作流说明", time: "90分钟", status: "pending" },
  { day: "周五", title: "模拟面试 + 5题小测", time: "45分钟", status: "pending" },
];

const QUESTIONS = [
  {
    q: "评估一个对话 Agent 时，哪种做法最能验证其在真实场景中的稳定性？",
    options: ["只测试一条标准问题", "建立覆盖正常与异常场景的评测集", "仅比较响应速度", "让模型自评"],
    answer: 1,
  },
  {
    q: "发现 Agent 输出不稳定时，产品经理首先应该做什么？",
    options: ["直接更换大模型", "增加更多功能", "归类 Bad Case 并定位失败环节", "隐藏失败结果"],
    answer: 2,
  },
  {
    q: "面试中说明 Prompt 优化项目，最有说服力的表达结构是什么？",
    options: ["工具名称清单", "背景—方案—评测—结果", "只展示最终提示词", "强调使用了最新模型"],
    answer: 1,
  },
];

const JOB_LEARNING = {
  1: {
    gap: "Prompt 评测与 Agent 异常处理",
    duration: "7天",
    outcome: "完成一份回访 Agent 评测表，并能用“背景—方案—评测—结果”讲清调优过程",
    example: "示例：输入“查询明天待回访用户”；预期输出必须包含姓名、电话和回访时间；实际少了电话，则标记不通过并记录原因。",
    resources: [
      { title: "Dify：30分钟工作流入门", source: "Dify 官方文档", url: "https://docs.dify.ai/en/guides/application-orchestrate/creating-an-application", time: "30分钟" },
      { title: "从样例到评测：构建最小测试集", source: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall", time: "35分钟" },
    ],
    steps: ["打开 Dify 教程，理解输入变量、条件分支和运行日志", "用表格写 6 条测试样例：输入、预期输出、实际输出、是否通过", "至少加入 2 条异常输入：字段缺失、模糊意图，并记录修改方案"],
    questions: [
      { q: "为回访 Agent 设计最小评测集时，第一步是什么？", options: ["先换模型", "先明确任务和通过标准", "只收集成功案例", "直接写简历"], answer: 1 },
      { q: "输入是“查一下明天要回访的人”，预期输出应写什么？", options: ["模型自由发挥", "姓名、电话、计划回访时间等明确字段", "只写一句正确", "不设预期"], answer: 1 },
      { q: "发现字段缺失时最合适的处理是？", options: ["编造字段", "分类为 Bad Case 并补校验或追问", "删除样例", "重复调用直到成功"], answer: 1 },
    ],
  },
  2: {
    gap: "用户研究与数据驱动迭代",
    duration: "5天",
    outcome: "完成一页用户问题分析，能从数据现象提出假设和验证方案",
    example: "示例：现象是新用户第二天回访率下降；先按来源和首日行为分组，再判断是用户质量还是首日体验造成。",
    resources: [
      { title: "pandas 入门教程", source: "pandas 官方文档", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", time: "45分钟" },
      { title: "PRD 应包含什么", source: "Figma 产品指南", url: "https://www.figma.com/resource-library/product-requirements-document/", time: "25分钟" },
    ],
    steps: ["阅读 pandas 表格数据与统计汇总章节", "选择一个产品指标，写出现象、用户问题和两个可能原因", "写一页改进方案：目标用户、核心流程、指标和验收标准"],
    questions: [
      { q: "看到次日留存下降，产品经理首先应该做什么？", options: ["直接改版", "分群并定位流失环节", "增加弹窗", "停止统计"], answer: 1 },
      { q: "用户访谈最应该避免什么？", options: ["开放式追问", "诱导用户认同自己的方案", "记录原话", "询问真实场景"], answer: 1 },
      { q: "一个可验证的产品假设应包含什么？", options: ["只写功能", "用户、变化和预期指标", "只写竞品", "只写时间"], answer: 1 },
    ],
  },
  3: {
    gap: "SQL 分析与 A/B 测试基础",
    duration: "6天",
    outcome: "能写出查询漏斗数据的 SQL，并解释一个基础实验指标",
    example: "示例：进入页面 100 人、点击 40 人、完成 20 人，则点击转化率为 40%，完成转化率为 20%。",
    resources: [
      { title: "SQL SELECT、筛选与 JOIN 互动课", source: "SQLBolt", url: "https://sqlbolt.com/", time: "60分钟" },
      { title: "准确率、精确率和召回率", source: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall", time: "30分钟" },
    ],
    steps: ["完成 SQLBolt 的 SELECT、WHERE、JOIN 三个互动练习", "写一条查询：按日期统计进入页面、点击和完成的人数", "计算点击转化率，并写出实验组与对照组的判断规则"],
    questions: [
      { q: "需要合并用户表和行为表，通常使用什么？", options: ["ORDER BY", "JOIN", "DELETE", "DROP"], answer: 1 },
      { q: "转化率的常见计算方式是？", options: ["完成人数/进入人数", "进入人数/完成人数", "人数相加", "只看总量"], answer: 0 },
      { q: "A/B 测试中对照组的作用是什么？", options: ["增加样本", "提供没有新方案时的比较基线", "保证结果上涨", "替代用户访谈"], answer: 1 },
    ],
  },
  4: {
    gap: "Vibe Coding 原型与 Agent 产品化",
    duration: "7天",
    outcome: "产出一个可运行的小原型，并能说明需求拆解、验证和迭代",
    example: "示例：用户任务是上传 JD 后看到三项能力差距；验收标准是 1 分钟内完成上传并能理解下一步。",
    resources: [
      { title: "Vibe Coding 实战教程", source: "GitHub 官方文档", url: "https://docs.github.com/en/copilot/tutorials/vibe-coding", time: "90分钟" },
      { title: "Dify 工作流快速入门", source: "Dify 官方文档", url: "https://docs.dify.ai/en/guides/application-orchestrate/creating-an-application", time: "30分钟" },
    ],
    steps: ["按 GitHub 教程把模糊想法拆成用户故事和验收标准", "用 AI Coding 生成可运行的单页原型并人工检查关键代码", "让 1 名同学试用，记录一个问题并完成一次修改"],
    questions: [
      { q: "Vibe Coding 前最重要的准备是什么？", options: ["先选颜色", "明确用户任务和验收标准", "一次生成全部代码", "忽略测试"], answer: 1 },
      { q: "AI 生成代码后应该怎么做？", options: ["直接发布", "检查、运行并验证核心路径", "删除注释", "只看页面"], answer: 1 },
      { q: "原型验证最有价值的证据是什么？", options: ["开发者觉得好", "目标用户完成任务的观察与反馈", "代码行数", "使用最新模型"], answer: 1 },
    ],
  },
  5: {
    gap: "多模态产品评测与竞品分析",
    duration: "6天",
    outcome: "完成一份图文生成产品的竞品对比和 8 条评测样例",
    example: "示例：同一张商品图和文案要求分别测试两款工具，对比信息保真、文字错误和两次生成的一致性。",
    resources: [
      { title: "Dify 文件与图像输入工作流", source: "Dify 官方文档", url: "https://docs.dify.ai/en/guides/application-orchestrate/creating-an-application", time: "40分钟" },
      { title: "分类评测指标互动练习", source: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course/exercises", time: "35分钟" },
    ],
    steps: ["选择两个多模态产品，按用户场景、输入、输出和失败模式对比", "设计 8 条图文输入样例，写清预期输出与不可接受结果", "复测两次并记录一致性、内容安全和可用性问题"],
    questions: [
      { q: "多模态产品评测为什么需要覆盖不同输入类型？", options: ["页面更好看", "不同模态可能触发不同失败模式", "减少样例", "避免记录结果"], answer: 1 },
      { q: "竞品分析最应该围绕什么？", options: ["公司大小", "同一用户任务下的体验与结果", "Logo", "融资轮次"], answer: 1 },
      { q: "重复输入得到明显不同结果时应记录为什么问题？", options: ["稳定性", "加载速度", "字号", "登录"], answer: 0 },
    ],
  },
  6: {
    gap: "内容指标、SQL 与实验设计",
    duration: "5天",
    outcome: "完成内容推荐漏斗分析，并能提出一个可验证的迭代方案",
    example: "示例：曝光 1000、点击 200、播放完成 50；先定位点击后流失，再设计播放页改版实验。",
    resources: [
      { title: "SQL 互动基础课", source: "SQLBolt", url: "https://sqlbolt.com/", time: "60分钟" },
      { title: "pandas 统计汇总教程", source: "pandas 官方文档", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/06_calculate_statistics.html", time: "35分钟" },
    ],
    steps: ["完成 SQLBolt 的聚合与 JOIN 练习", "定义曝光、点击、播放完成三层漏斗并写查询思路", "针对最大流失环节写一个实验方案和成功指标"],
    questions: [
      { q: "内容漏斗分析首先要做什么？", options: ["立即改算法", "定义每个环节和事件口径", "只看播放量", "增加标签"], answer: 1 },
      { q: "统计各内容类型平均完成率常用什么？", options: ["GROUP BY", "DROP TABLE", "INSERT", "ALTER"], answer: 0 },
      { q: "实验指标应在什么时候定义？", options: ["结果出来以后", "上线实验之前", "复盘时", "不需要定义"], answer: 1 },
    ],
  },
};

function getLearning(job) { return job?.dynamicLearning || JOB_LEARNING[job?.id] || JOB_LEARNING[1]; }

function scoreJob(job, profile) {
  const skills = profile.skills.toLowerCase();
  const skillHits = job.requiredSkills.filter((skill) => skills.includes(skill.toLowerCase())).length;
  const skillScore = Math.round((skillHits / job.requiredSkills.length) * 18);
  const cityScore = job.city === profile.city ? 8 : 0;
  const timeScore = job.scheduleDays <= Number(profile.days) && job.durationMonths <= Number(profile.months) ? 6 : 0;
  return Math.min(96, job.baseScore + skillScore + cityScore + timeScore);
}

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function Sidebar({ page, setPage, openCoach }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-title">JobFit Agent</div>
        <div className="brand-subtitle">AI 实习匹配与学习教练</div>
      </div>
      <nav className="nav-list" aria-label="主要功能">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={classNames("nav-item", page === item.id && "active")}
              onClick={() => setPage(item.id)}
            >
              <Icon size={21} stroke={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button className="coach-launcher" onClick={openCoach}>
        <span className="coach-icon"><IconMessageCircle size={20} /></span>
        <span><strong>专属职业教练</strong><small>随时为你提供建议</small></span>
        <span className="unread-dot" />
        <IconChevronRight size={18} />
      </button>
    </aside>
  );
}

function Journey({ page, setPage, openProfile }) {
  const stageIndex = { profile: 0, discover: 1, analysis: 1, plan: 2, assessment: 3, resume: 4 }[page] ?? 1;
  const routes = ["profile", "discover", "plan", "assessment", "resume"];
  return (
    <div className="journey" aria-label="求职进度">
      {STAGES.map((stage, index) => (
        <button key={stage.id} className={classNames("journey-step", index === stageIndex && "current", index < stageIndex && "done")} onClick={() => index === 0 ? openProfile() : setPage(routes[index])}>
          <span className="step-line before" />
          <span className="step-number">{index < stageIndex ? <IconCheck size={14} /> : index + 1}</span>
          <span className="step-label">{stage.label}</span>
          <span className="step-line after" />
        </button>
      ))}
    </div>
  );
}

function ProfileCard({ profile, openProfile }) {
  const facts = [
    [IconCalendar, `${profile.gradYear}届`],
    [IconShieldCheck, `${profile.major}${profile.education}`],
    [IconMapPin, profile.city],
    [IconClock, `每周${profile.days}天 · ${profile.months}个月`],
  ];
  const verifiedSkills = profile.skills.split(/[、,，]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 4);
  return (
    <section className="side-card profile-card">
      <div className="card-title-row"><strong>我的画像完成度</strong><span className="profile-percent">100%</span></div>
      <div className="progress"><span style={{ width: "100%" }} /></div>
      <p className="muted">画像已建立，可随时修改求职偏好</p>
      <button className="text-link" onClick={openProfile}>编辑画像 <IconChevronRight size={15} /></button>
      <div className="profile-facts">
        {facts.map(([FactIcon, label]) => <span key={label}><FactIcon size={17} />{label}</span>)}
      </div>
      <div className="verified">
        <strong>已验证技能 <IconShieldCheck size={16} color="#12a150" /></strong>
        <div className="skill-pills">{verifiedSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      </div>
    </section>
  );
}

function SourceAndImport({ sources, sourcesOpen, setSourcesOpen, setSourceModal, setImportModal, openExternal, removeSource }) {
  return (
    <>
      <section className="side-card source-card" data-tour="sources">
        <button className="accordion-head" onClick={() => setSourcesOpen(!sourcesOpen)}>
          <strong>我的招聘来源</strong>
          <span>{sourcesOpen ? `${sources.length}个` : "已收起"}</span>
          {sourcesOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </button>
        {sourcesOpen && (
          <div className="accordion-body">
            {sources.map((source) => (
              <div className="source-row" key={source.id}>
                <span className={classNames("source-logo", `source-${source.color}`)}><IconWorld size={15} /></span>
                <span>{source.name}</span>
                <a className="source-open" href={source.url} target="_blank" rel="noreferrer" onClick={() => openExternal(source)}>打开 <IconExternalLink size={13} /></a>
                <button className="source-remove" aria-label={`删除${source.name}`} title="删除" onClick={() => removeSource(source.id)}><IconTrash size={15} /></button>
              </div>
            ))}
            <div className="source-actions">
              <button onClick={() => setSourceModal(true)}><IconPlus size={17} />添加招聘网站</button>
              <span className="source-hint">可添加任意招聘网站</span>
            </div>
          </div>
        )}
      </section>
      <section className="side-card manual-card">
        <div className="card-title-row"><strong>手动添加 JD</strong><IconHelpCircle size={16} /></div>
        <button className="outline-action" onClick={() => setImportModal("text")}><IconFileDescription size={18} />粘贴 JD 文本</button>
        <button className="outline-action" onClick={() => setImportModal("file")}><IconUpload size={18} />上传 JD 截图或文件</button>
        <button className="manual-link" onClick={() => setImportModal("link")}><IconLink size={16} />粘贴岗位链接</button>
        <small>支持文本、PNG、JPG、PDF、DOCX、TXT</small>
      </section>
    </>
  );
}

function JobRow({ job, selectJob }) {
  return (
    <button className="job-row" onClick={() => selectJob(job)}>
      <span className="company-mark" style={{ background: job.color }}><IconBuilding size={27} /></span>
      <span className="job-main">
        <strong>{job.title}</strong>
        <span className="company-name">{job.company} · {job.city}</span>
        <span className="job-tags">{job.tags.map((tag) => <em key={tag}>{tag}</em>)}</span>
        <span className="job-reason">匹配理由：{job.reason}</span>
      </span>
      <span className="job-meta"><span><IconMapPin size={16} />{job.city}</span><span><IconBriefcase size={16} />{job.schedule}</span><span><IconClock size={16} />{job.months}</span></span>
      <span className="job-score"><small>匹配度</small><strong>{job.score}%</strong></span>
      <IconChevronRight size={21} />
    </button>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return <label className="filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select><IconChevronDown size={16} /></label>;
}

function DiscoverPage({ profile, selectJob, openProfile, sources, removeSource, sourcesOpen, setSourcesOpen, setSourceModal, setImportModal, openExternal }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ ...FILTER_DEFAULTS, city: profile.city, education: profile.education, gradYear: profile.gradYear, days: profile.days, months: profile.months });
  useEffect(() => setFilters({ city: profile.city, education: profile.education, gradYear: profile.gradYear, days: profile.days, months: profile.months }), [profile.city, profile.education, profile.gradYear, profile.days, profile.months]);
  const normalize = (value) => value.toLowerCase().replace(/\s+/g, "");
  const terms = normalize(searchQuery).split(/[、,，/]+/).filter(Boolean);
  const visibleJobs = JOBS.filter((job) => {
    const haystack = normalize(`${job.title}${job.company}${job.tags.join("")}${job.keywords.join("")}`);
    const searchMatch = !terms.length || terms.every((term) => haystack.includes(term) || (term === "ai产品经理" && haystack.includes("ai产品")));
    const cityMatch = filters.city === "不限" || job.city === filters.city;
    const degreeRank = { 本科: 1, 硕士: 2, 博士: 3 };
    const educationMatch = filters.education === "不限" || degreeRank[filters.education] >= degreeRank[job.degree];
    const yearMatch = filters.gradYear === "不限" || job.gradYears.includes(Number(filters.gradYear));
    const daysMatch = filters.days === "不限" || job.scheduleDays <= Number(filters.days);
    const monthsMatch = filters.months === "不限" || job.durationMonths <= Number(filters.months);
    return searchMatch && cityMatch && educationMatch && yearMatch && daysMatch && monthsMatch;
  }).map((job) => ({ ...job, score: scoreJob(job, profile) })).sort((a, b) => b.score - a.score);
  const submitSearch = () => setSearchQuery(searchInput.trim());
  const reset = () => { setSearchInput(""); setSearchQuery(""); setFilters({ ...FILTER_DEFAULTS, city: "不限", education: "不限", gradYear: "不限", days: "不限", months: "不限" }); };
  return (
    <div className="page-grid discover-page">
      <main className="main-column">
        <div className="search-area" data-tour="search">
        <div className="search-row">
          <div className="search-box"><IconSearch size={20} /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(event) => event.key === "Enter" && submitSearch()} placeholder="搜索岗位名称、公司或技能" /></div>
          <button className="primary-button" onClick={submitSearch}>搜索</button>
        </div>
        <div className="filters">
          <FilterSelect label="地区" value={filters.city} options={["不限", "北京", "上海", "杭州", "深圳"]} onChange={(value) => setFilters({ ...filters, city: value })} />
          <FilterSelect label="学历" value={filters.education} options={["不限", "本科", "硕士"]} onChange={(value) => setFilters({ ...filters, education: value })} />
          <FilterSelect label="毕业届次" value={filters.gradYear} options={["不限", "2027", "2028", "2029"]} onChange={(value) => setFilters({ ...filters, gradYear: value })} />
          <FilterSelect label="每周" value={filters.days} options={["不限", "3", "4", "5"]} onChange={(value) => setFilters({ ...filters, days: value })} />
          <FilterSelect label="实习" value={filters.months} options={["不限", "3", "4", "6"]} onChange={(value) => setFilters({ ...filters, months: value })} />
          <button className="reset" onClick={reset}>重置</button>
        </div>
        </div>
        <section className="section-block jobs-section" data-tour="jobs">
          <div className="section-heading"><div><h2>{searchQuery ? `“${searchQuery}”的搜索结果` : "为你推荐的岗位"} <IconHelpCircle size={17} /></h2><p>基于你的画像和筛选条件，共找到 {visibleJobs.length} 个岗位</p></div><button onClick={reset}>查看全部岗位 <IconChevronRight size={16} /></button></div>
          <div className="job-list">
            {visibleJobs.length ? visibleJobs.map((job) => <JobRow key={job.id} job={job} selectJob={selectJob} />) : <div className="empty"><strong>没有符合全部条件的岗位</strong><span>可点击“重置”放宽筛选，或换一个岗位关键词。</span><button className="secondary-button" onClick={reset}>清除搜索与筛选</button></div>}
          </div>
        </section>
      </main>
      <aside className="right-column">
        <ProfileCard profile={profile} openProfile={openProfile} />
        <SourceAndImport {...{ sources, removeSource, sourcesOpen, setSourcesOpen, setSourceModal, setImportModal, openExternal }} />
      </aside>
    </div>
  );
}

function AnalysisPage({ setPage, targetJob }) {
  const learning = getLearning(targetJob);
  const analysis = targetJob.dynamicAnalysis || {
    score: 82,
    recommendation: "建议投递",
    matchedSkills: targetJob.requiredSkills.slice(0, Math.max(1, targetJob.requiredSkills.length - 2)),
    missingSkills: targetJob.requiredSkills.slice(-2),
    hardConstraints: ["学历要求：满足", "实习时间：满足"],
    summary: "已经具备面试基础，补齐关键能力会更稳。",
  };
  const skillBars = targetJob.requiredSkills.slice(0, 5).map((skill) => ({
    name: skill,
    value: analysis.matchedSkills.includes(skill) ? 84 : 48,
    target: 78,
  }));
  const gapData = [
    { name: "已具备", value: analysis.matchedSkills.length, color: "#246bfd" },
    { name: "待补强", value: analysis.missingSkills.length, color: "#f5a623" },
  ].filter((item) => item.value > 0);
  return (
    <div className="content-page">
      <header className="page-title-row"><div><p className="eyebrow">目标岗位 · {targetJob.company}{targetJob.agentMode && ` · ${targetJob.agentMode === "kimi" ? "Kimi + 联网检索" : "本地规则演示"}`}</p><h1>{targetJob.title}匹配分析</h1><p>先判断能否投递，再决定最短补强路径。</p></div><button className="secondary-button" onClick={() => setPage("discover")}><IconEdit size={17} />更换目标岗位</button></header>
      <section className="score-summary">
        <div className="score-ring"><span>综合匹配</span><strong>{analysis.score}</strong><small>/ 100</small></div>
        <div className="score-copy"><span className="ready-badge"><IconCircleCheck size={17} />{analysis.recommendation}</span><h2>{analysis.summary}</h2><p>当前岗位最优先补强：{learning.gap}。计划会根据这份 JD 单独生成。</p><button className="primary-button" onClick={() => setPage("plan")}>生成{learning.duration}面试冲刺计划 <IconArrowRight size={18} /></button></div>
        <div className="thresholds">{analysis.hardConstraints.slice(0, 2).map((item) => <div key={item}><IconCheck size={16} /><span>{item.split("：")[0]}</span><strong>{item.split("：").slice(1).join("：") || "已检查"}</strong></div>)}<div className="warning"><IconAdjustments size={16} /><span>技能门槛</span><strong>待补{analysis.missingSkills.length}项</strong></div></div>
      </section>
      <div className="analysis-grid">
        <section className="panel">
          <div className="panel-head"><div><h2>能力对比</h2><p>蓝色为当前能力，虚线目标为岗位面试线</p></div></div>
          <div className="chart-wrap bar-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillBars.length ? skillBars : SKILL_BARS} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#596579", fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#8a94a6", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f5f8ff" }} />
                <Bar dataKey="value" name="当前能力" fill="#246bfd" radius={[5, 5, 0, 0]} barSize={30} isAnimationActive={false} />
                <Bar dataKey="target" name="岗位面试线" fill="#dbe5ff" radius={[5, 5, 0, 0]} barSize={30} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel gap-panel">
          <div className="panel-head"><div><h2>要求覆盖情况</h2><p>{analysis.matchedSkills.length + analysis.missingSkills.length} 项核心技能要求</p></div></div>
          <div className="donut-row">
            <ResponsiveContainer width="52%" height={205}>
              <PieChart><Pie data={gapData} dataKey="value" innerRadius={56} outerRadius={82} paddingAngle={3} isAnimationActive={false}>{gapData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
            <div className="legend">{gapData.map((item) => <div key={item.name}><span style={{ background: item.color }} /><em>{item.name}</em><strong>{item.value}项</strong></div>)}</div>
          </div>
          <div className="gap-list"><strong>最优先补强</strong><span>{learning.gap}</span><span>验收：{learning.outcome}</span></div>
        </section>
      </div>
      <section className="panel evidence-panel">
        <div className="panel-head"><div><h2>岗位要求与证据</h2><p>面试时可以直接使用的项目证据</p></div></div>
        <div className="evidence-table"><div className="evidence-row header"><span>岗位要求</span><span>你的证据</span><span>判断</span></div>{targetJob.requiredSkills.map((skill) => { const passed = analysis.matchedSkills.includes(skill); return <div className="evidence-row" key={skill}><span>{skill}</span><span>{passed ? `画像中已记录 ${skill}，面试时还需用项目证据说明` : `尚未找到可验证证据，已加入 ${learning.duration} 冲刺计划`}</span><b className={passed ? "pass" : "develop"}>{passed ? "满足" : "待补强"}</b></div>; })}</div>
      </section>
    </div>
  );
}

function PlanPage({ setPage, setQuizPrompt, targetJob }) {
  const [todayDone, setTodayDone] = useState(false);
  const [view, setView] = useState("today");
  const learning = getLearning(targetJob);
  const [completedSteps, setCompletedSteps] = useState([]);
  useEffect(() => { setTodayDone(false); setCompletedSteps([]); setView("today"); }, [targetJob.id]);
  const toggleStep = (index) => setCompletedSteps((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  const completeToday = () => { if (completedSteps.length !== learning.steps.length) return; setTodayDone(true); setQuizPrompt(true); };
  const weekTasks = learning.steps.map((step, index) => ({ day: `第${index + 1}天`, title: step, time: index === 0 ? "45分钟" : "60分钟", status: completedSteps.includes(index) ? "done" : index === completedSteps.length ? "today" : "pending" }));
  return (
    <div className="content-page">
      <header className="page-title-row"><div><p className="eyebrow">{targetJob.company} · {targetJob.title}</p><h1>{learning.duration}面试学习计划</h1><p>根据当前 JD 的能力差距生成；更换岗位后计划和测评会同步重建。</p></div><div className="plan-goal"><span>本轮目标</span><strong>达到可面试线</strong><small>预计每天 45–90 分钟</small></div></header>
      <section className="plan-progress panel"><div><div className="card-title-row"><strong>今日步骤</strong><span>{completedSteps.length} / {learning.steps.length}</span></div><div className="progress"><span style={{ width: `${(completedSteps.length / learning.steps.length) * 100}%` }} /></div></div><div className="milestone"><IconTargetArrow size={21} /><span><strong>验收标准</strong>{learning.outcome}</span></div></section>
      <div className="view-tabs"><button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>今日任务</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>本周计划</button></div>
      {view === "today" ? (
        <div className="today-grid">
          <section className="panel focus-task">
            <div className="task-kicker"><span>今日重点</span><small><IconClock size={15} />约 75 分钟</small></div>
            <h2>{learning.gap}</h2>
            <p>先按下面步骤完成实际产出。勾选代表你亲自完成，不会再默认打勾。</p>
            <div className="task-example"><strong>先看一个例子</strong><span>{learning.example}</span></div>
            <div className="task-steps">{learning.steps.map((step, index) => <label key={step}><input type="checkbox" checked={completedSteps.includes(index)} onChange={() => toggleStep(index)} />{step}</label>)}</div>
            <div className="deliverable"><IconFileDescription size={20} /><span><strong>本轮产出</strong>{learning.outcome}</span></div>
            <button className="primary-button" disabled={todayDone || completedSteps.length !== learning.steps.length} onClick={completeToday}>{todayDone ? <><IconCheck size={18} />今日目标已完成</> : completedSteps.length !== learning.steps.length ? `还需完成 ${learning.steps.length - completedSteps.length} 步` : <>完成今日目标 <IconArrowRight size={18} /></>}</button>
          </section>
          <aside className="resource-stack"><section className="panel resource-card"><div className="interview-icon"><IconBook2 size={24} /></div><h2>从这里开始学</h2>{learning.resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><span><strong>{resource.title}</strong><small>{resource.source} · {resource.time}</small></span><IconExternalLink size={17} /></a>)}</section><section className="panel interview-card"><h2>做完怎么验收</h2><p>{learning.outcome}</p><button className="secondary-button" onClick={() => setPage("assessment")}>预览本岗位测评题</button></section></aside>
        </div>
      ) : (
        <section className="panel week-plan">
          {weekTasks.map((task) => <div key={task.day} className={classNames("week-row", task.status)}><span className="day-badge">{task.day}</span><span className="status-icon">{task.status === "done" ? <IconCheck size={17} /> : task.status === "today" ? "今" : ""}</span><div><strong>{task.title}</strong><small>{task.time}</small></div><span className="week-status">{task.status === "done" ? "已完成" : task.status === "today" ? "进行中" : "待开始"}</span></div>)}
        </section>
      )}
    </div>
  );
}

function AssessmentPage({ setPage, setResumePrompt, targetJob }) {
  const learning = getLearning(targetJob);
  const questions = learning.questions;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const passCount = Math.max(1, Math.ceil(questions.length * 0.7));
  const choose = (answer) => {
    const next = [...answers, answer];
    setAnswers(next);
    if (index === questions.length - 1) setFinished(true); else setIndex(index + 1);
  };
  const score = answers.reduce((sum, answer, i) => sum + (answer === questions[i].answer ? 1 : 0), 0);
  if (!started) return (
    <div className="content-page assessment-intro">
      <header className="page-title-row"><div><p className="eyebrow">{targetJob.company} · 技能验收</p><h1>{learning.gap}</h1><p>题目根据当前目标 JD 生成，更换岗位后会同步变化。</p></div></header>
      <section className="assessment-hero panel"><div className="assessment-symbol"><IconClipboardCheck size={38} /></div><h2>达到“可面试”即可通过</h2><p>{questions.length} 道针对目标 JD 的场景题。通过后会把已验证技能写入简历草稿。</p><div className="assessment-facts"><span><IconClock size={18} /><strong>{Math.max(3, questions.length * 2)}分钟</strong><small>预计用时</small></span><span><IconListCheck size={18} /><strong>{questions.length}题</strong><small>核心场景</small></span><span><IconTargetArrow size={18} /><strong>≥ {passCount}题</strong><small>通过标准</small></span></div><button className="primary-button" onClick={() => setStarted(true)}>开始小测 <IconArrowRight size={18} /></button></section>
    </div>
  );
  if (finished) return (
    <div className="content-page result-page">
      <section className="result-card panel"><span className="result-icon"><IconCircleCheck size={42} /></span><p className="eyebrow">测评完成</p><h1>{score >= passCount ? "已达到可面试线" : "还需一次短补强"}</h1><div className="result-score"><strong>{score}/{questions.length}</strong><span>正确题数</span></div><p>{score >= passCount ? `你已通过“${learning.gap}”验收，可以把对应产出写入目标岗位简历。` : "建议回到当前岗位学习计划，按资料完成未掌握步骤后再测。"}</p><div className="result-actions">{score >= passCount ? <button className="primary-button" onClick={() => { setResumePrompt(true); setPage("resume"); }}>更新目标岗位简历 <IconArrowRight size={18} /></button> : <button className="primary-button" onClick={() => setPage("plan")}>回到补强课程</button>}<button className="secondary-button" onClick={() => { setStarted(false); setIndex(0); setAnswers([]); setFinished(false); }}>重新测评</button></div></section>
    </div>
  );
  const question = questions[index];
  return (
    <div className="content-page quiz-page">
      <div className="quiz-top"><span>{targetJob.company} · 岗位技能小测</span><strong>{index + 1} / {questions.length}</strong></div><div className="progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <section className="quiz-card panel"><span className="question-type">场景判断</span><h1>{question.q}</h1><div className="option-list">{question.options.map((option, optionIndex) => <button key={option} onClick={() => choose(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div></section>
    </div>
  );
}

function ResumePage({ resumePrompt, targetJob }) {
  const [generated, setGenerated] = useState(resumePrompt);
  return (
    <div className="content-page">
      <header className="page-title-row"><div><p className="eyebrow">针对目标岗位</p><h1>简历更新建议</h1><p>只写入经过测评或有项目证据支持的能力，不夸大经历。</p></div><button className="secondary-button"><IconUpload size={17} />上传当前简历</button></header>
      {!generated ? <section className="empty-resume panel"><IconSparkles size={36} /><h2>完成技能测评后生成针对性简历</h2><p>JobFit 会结合目标 JD、学习产出和测评结果，生成可确认的修改草稿。</p><button className="primary-button" onClick={() => setGenerated(true)}>查看示例草稿</button></section> : (
        <>
          <section className="resume-status panel"><div><span className="ready-badge"><IconShieldCheck size={17} />已验证能力</span><h2>建议新增 1 条项目成果，改写 2 处表达</h2><p>目标岗位：{targetJob.company} · {targetJob.title}</p></div><button className="primary-button">下载新版本</button></section>
          <div className="resume-compare">
            <section className="panel resume-column old"><div className="panel-head"><h2>修改前</h2><span>原简历</span></div><article><h3>Dify 客户回访智能助手</h3><p>参与智能助手工作流搭建，能够查询待回访客户信息，并添加用户标签和提醒。</p></article></section>
            <section className="panel resume-column new"><div className="panel-head"><h2>修改后</h2><span>目标岗位版</span></div><article><h3>Dify 客户回访智能助手</h3><p>面向每日新增 500+ 客户数据的回访场景，设计 Dify 工作流并协同开发对接数据库接口，实现客户查询、画像标签、回访时间和意向度管理；构建覆盖字段缺失与模糊意图的评测集，使用千问 3.6B 复测并沉淀 Bad Case。</p><div className="resume-tags"><span>真实业务</span><span>Agent 工作流</span><span>效果评测</span></div></article></section>
          </div>
          <section className="panel resume-check"><h2>写入依据</h2><div><span><IconCheck size={17} />项目材料已提供</span><span><IconCheck size={17} />Prompt 评测已通过</span><span><IconCheck size={17} />未添加无法验证的量化结果</span></div></section>
        </>
      )}
    </div>
  );
}

function NoTarget({ setPage }) {
  return <div className="content-page"><section className="empty-resume panel"><IconTargetArrow size={38} /><h2>先选择一个目标岗位</h2><p>学习计划和技能测评必须基于具体 JD 生成，避免不同岗位使用同一套内容。</p><button className="primary-button" onClick={() => setPage("discover")}>去岗位发现选择 JD</button></section></div>;
}

function ProfileModal({ profile, close, save, firstRun }) {
  const [draft, setDraft] = useState(profile);
  const update = (key, value) => setDraft({ ...draft, [key]: value });
  const canSave = draft.name.trim() && draft.intent.trim() && draft.major.trim();
  return <div className="overlay profile-overlay"><section className="modal profile-modal">{!firstRun && <button className="modal-close" onClick={close}><IconX size={20} /></button>}<div className="profile-modal-head"><span><IconUserCircle size={30} /></span><div><p className="eyebrow">第一步 · 建立画像</p><h2>{firstRun ? "先认识你，再推荐岗位" : "编辑我的求职画像"}</h2><p>这些信息只用于筛选实习岗位和生成学习计划，之后可以随时修改。</p></div></div><div className="profile-form"><label>怎么称呼你<input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：世钰" autoFocus /></label><label>目标岗位<input value={draft.intent} onChange={(event) => update("intent", event.target.value)} placeholder="例如：AI 产品经理实习生" /></label><label>学历<select value={draft.education} onChange={(event) => update("education", event.target.value)}><option>本科</option><option>硕士</option><option>博士</option></select></label><label>专业<input value={draft.major} onChange={(event) => update("major", event.target.value)} placeholder="例如：应用统计" /></label><label>毕业年份<select value={draft.gradYear} onChange={(event) => update("gradYear", event.target.value)}><option>2027</option><option>2028</option><option>2029</option></select></label><label>意向城市<select value={draft.city} onChange={(event) => update("city", event.target.value)}><option>北京</option><option>上海</option><option>杭州</option><option>深圳</option></select></label><label>每周可实习<select value={draft.days} onChange={(event) => update("days", event.target.value)}><option value="3">3天</option><option value="4">4天</option><option value="5">5天</option></select></label><label>可连续实习<select value={draft.months} onChange={(event) => update("months", event.target.value)}><option value="3">3个月</option><option value="4">4个月</option><option value="6">6个月</option></select></label><label className="full">已掌握技能<input value={draft.skills} onChange={(event) => update("skills", event.target.value)} placeholder="用顿号分隔，例如：Python、SQL、Dify" /></label></div><div className="modal-actions profile-actions">{!firstRun && <button className="secondary-button" onClick={close}>取消</button>}<button className="primary-button" disabled={!canSave} onClick={() => save(draft)}>保存画像，查看岗位 <IconArrowRight size={18} /></button></div></section></div>;
}

function AddSourceModal({ close, addAndOpen }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  return <div className="overlay"><section className="modal source-modal"><button className="modal-close" onClick={close}><IconX size={20} /></button><h2>添加招聘网站</h2><p>添加后会显示在右侧招聘来源中，点击“打开”将在新标签页访问原网站。</p><label>网站名称<input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：腾讯招聘" /></label><label>网站网址<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://careers.tencent.com/" /></label><p className="privacy-note"><IconShieldCheck size={17} />JobFit 只保存网站入口，不会获取第三方账号或登录信息。</p><div className="modal-actions"><button className="secondary-button" onClick={close}>取消</button><button className="primary-button" disabled={!name.trim() || !url.trim()} onClick={() => addAndOpen(name, url)}>保存并打开</button></div></section></div>;
}

function ImportModal({ mode, close, onAnalyze }) {
  const [text, setText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titles = { text: "粘贴 JD 文本", file: "上传 JD 截图或文件", link: "粘贴岗位链接", choose: "把岗位交给 Agent 分析" };
  const submit = async () => {
    setError("");
    let jdText = text.trim();
    if (mode === "file") {
      if (!file) { setError("请先选择 TXT 文件；PDF、DOCX 与截图识别将在下一步接入。"); return; }
      if (!file.name.toLowerCase().endsWith(".txt")) { setError("当前真实分析链路先支持 TXT。你也可以复制文件中的 JD 文本后使用“粘贴 JD”。"); return; }
      jdText = (await file.text()).trim();
    }
    if (jdText.length < 20) { setError("请提供至少 20 个字的完整 JD，只有链接无法可靠判断岗位要求。"); return; }
    setLoading(true);
    try {
      await onAnalyze({ jdText, sourceUrl: sourceUrl.trim() });
    } catch (submitError) {
      setError(submitError.message || "分析失败，请检查后端是否已启动。");
      setLoading(false);
    }
  };
  if (mode === "choose") return <div className="overlay"><section className="modal import-choice"><button className="modal-close" onClick={close}><IconX size={20} /></button><h2>要把刚找到的岗位交给 Agent 分析吗？</h2><p>请选择一种方式，导入前你可以预览并确认内容。</p><div className="import-options"><button onClick={() => onAnalyze("text", true)}><IconFileDescription /><span><strong>粘贴 JD 文本</strong><small>推荐：立即进入真实分析链路</small></span><IconChevronRight /></button><button onClick={() => onAnalyze("file", true)}><IconUpload /><span><strong>上传 TXT 文件</strong><small>PDF / DOCX / 截图识别下一阶段开放</small></span><IconChevronRight /></button><button onClick={() => onAnalyze("link", true)}><IconLink /><span><strong>记录岗位链接并粘贴 JD</strong><small>保留招聘来源，同时分析正文</small></span><IconChevronRight /></button></div><p className="privacy-note"><IconShieldCheck size={17} />不会自动读取其他网站页面、账号或聊天信息。</p></section></div>;
  return <div className="overlay"><section className="modal import-modal"><button className="modal-close" onClick={close} disabled={loading}><IconX size={20} /></button><h2>{titles[mode]}</h2><p>导入前请确认内容不包含手机号、身份证号等敏感信息。</p>{mode === "text" && <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="粘贴完整职位描述…" autoFocus />}{mode === "link" && <><input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" autoFocus /><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="再粘贴该页面中的完整 JD 正文…" /></>}{mode === "file" && <label className="dropzone"><IconUpload size={30} /><strong>{file ? file.name : "点击选择 TXT 文件"}</strong><span>当前版本支持 TXT；其他文件可先复制文字</span><input type="file" accept=".txt,text/plain" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>}{error && <p className="import-error">{error}</p>}<div className="modal-actions"><button className="secondary-button" onClick={close} disabled={loading}>取消</button><button className="primary-button" onClick={submit} disabled={loading}>{loading ? "Agent 正在解析并搜索资料…" : "分析 JD"}</button></div></section></div>;
}

function ReturnPrompt({ close, openImport }) {
  return <div className="return-prompt"><button className="prompt-close" onClick={close}><IconX size={18} /></button><div className="return-icon"><IconUpload size={28} /></div><div><h3>刚从招聘网站回来？</h3><p>如果你复制了 JD 或保存了截图，我可以现在帮你分析岗位匹配度。</p></div><div className="prompt-actions"><button className="primary-button" onClick={() => openImport("choose")}>导入并分析</button><button className="later-button" onClick={close}>稍后</button></div><small><IconShieldCheck size={14} />只有在你确认后才会读取或上传内容。</small></div>;
}

const PAGE_HELP = {
  discover: "岗位发现用于搜索、筛选和收藏适合你的岗位。系统会结合画像中的城市、毕业年份、学历和实习时间排序；点击岗位后进入匹配分析。",
  analysis: "匹配分析用于判断你是否值得投递这个岗位。它会拆出学历、出勤等硬门槛，展示你已有的简历证据，并把能力差距压缩成最优先补的 1–2 项。",
  plan: "学习计划会把能力差距拆成每天 60–90 分钟、最长一周的面试冲刺任务。目标是达到可面试线，不是把技能学到精通。",
  assessment: "技能测评用岗位场景题和项目追问检查你能否讲清、做对并处理异常。达到通过线后，技能才会被标记为已验证。",
  resume: "简历更新会把目标 JD、项目证据和测评结果合并成修改草稿。只写有材料或测评支撑的能力，并保留修改前后对照。",
};

function Coach({ close, page, setPage, setImportModal }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(`你当前在“${NAV_ITEMS.find((item) => item.id === page)?.label}”。${PAGE_HELP[page]}`);
  useEffect(() => setReply(`你已进入“${NAV_ITEMS.find((item) => item.id === page)?.label}”。${PAGE_HELP[page]}`), [page]);
  const actions = [
    ["解释当前板块", () => setReply(PAGE_HELP[page])],
    ["匹配分析有什么用？", () => setReply(PAGE_HELP.analysis)],
    ["查看学习进度", () => { setReply("你已完成本周 2/7 天，当前要补强 Prompt 评测。正在带你前往学习计划。"); setTimeout(() => setPage("plan"), 500); }],
    ["上传一个 JD", () => setImportModal("choose")],
    ["带我去技能测评", () => { setReply("已为你定位到 Prompt 评测小测。"); setTimeout(() => setPage("assessment"), 400); }],
  ];
  const send = () => {
    const query = message.trim();
    if (!query) return;
    if (/匹配|分析|符合|差距/.test(query)) setReply(PAGE_HELP.analysis);
    else if (/学习|课程|计划|进度/.test(query)) setReply(`${PAGE_HELP.plan} 你目前完成 2/7 天，下一项是建立 Prompt 评测集。`);
    else if (/测评|测试|小测|验收/.test(query)) setReply(PAGE_HELP.assessment);
    else if (/简历|投递/.test(query)) setReply(PAGE_HELP.resume);
    else if (/岗位|搜索|筛选|招聘/.test(query)) setReply(PAGE_HELP.discover);
    else if (/当前|板块|页面|这里|功能|用处/.test(query)) setReply(PAGE_HELP[page]);
    else setReply("我可以解释岗位发现、匹配分析、学习计划、技能测评和简历更新，也可以带你跳转或导入 JD。请告诉我具体板块或技能。");
    setMessage("");
  };
  return <section className="coach-panel"><header><span><IconRobot size={21} /></span><div><strong>专属职业教练</strong><small>在线 · 了解岗位，也了解你的进度</small></div><button onClick={close}><IconX size={19} /></button></header><div className="coach-messages"><div className="bot-message">{reply}</div><div className="coach-actions">{actions.map(([label, handler]) => <button key={label} onClick={handler}>{label}<IconChevronRight size={15} /></button>)}</div></div><div className="coach-input"><input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="问岗位、技能或学习问题…" /><button onClick={send}><IconSend size={18} /></button></div></section>;
}

function Onboarding({ close, setPage }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "搜索并筛选岗位", body: "输入岗位名称、公司或技能；下方每个筛选项都可以独立选择或重置。", selector: "[data-tour='search']", placement: "below" },
    { title: "查看岗位匹配分析", body: "点击任意岗位，查看硬性门槛、匹配证据和最优先补强能力。", selector: "[data-tour='jobs']", placement: "above" },
    { title: "访问外部招聘网站", body: "点击“打开”会在新标签页进入原招聘网站；复制 JD 或截图后回到 JobFit 再导入。", selector: "[data-tour='sources']", placement: "left" },
  ];
  const current = steps[step];
  const [rect, setRect] = useState(null);
  useEffect(() => {
    setPage("discover");
    const updateRect = () => {
      const target = document.querySelector(current.selector);
      if (target) { const box = target.getBoundingClientRect(); setRect({ top: box.top, left: box.left, width: box.width, height: box.height }); }
    };
    const timer = window.setTimeout(updateRect, 30);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", updateRect); window.removeEventListener("scroll", updateRect, true); };
  }, [current.selector, setPage]);
  if (!rect) return null;
  const popoverStyle = current.placement === "left" ? { top: Math.max(20, rect.top), left: Math.max(20, rect.left - 410) } : current.placement === "above" ? { top: Math.max(20, rect.top - 210), left: Math.min(window.innerWidth - 410, rect.left + rect.width / 2 - 190) } : { top: Math.min(window.innerHeight - 220, rect.top + rect.height + 24), left: Math.min(window.innerWidth - 410, rect.left + rect.width / 2 - 190) };
  return <div className="tour-layer"><div className="tour-highlight" style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} /><section className="tour-popover" style={popoverStyle}><h2>{current.title}</h2><p>{current.body}</p><div className="tour-actions"><span>{step + 1} / {steps.length}</span><button onClick={close}>跳过引导</button>{step > 0 && <button className="secondary-button" onClick={() => setStep(step - 1)}>上一步</button>}<button className="primary-button" onClick={() => step === steps.length - 1 ? close() : setStep(step + 1)}>{step === steps.length - 1 ? "完成" : "下一步"}</button></div></section></div>;
}

export function App() {
  const initialPage = new URLSearchParams(window.location.search).get("page");
  const [page, setPage] = useState(NAV_ITEMS.some((item) => item.id === initialPage) ? initialPage : "discover");
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("jobfit-profile")) || DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; }
  });
  const [profileOpen, setProfileOpen] = useState(() => !window.localStorage.getItem("jobfit-profile"));
  const [targetJob, setTargetJob] = useState(() => {
    try { const saved = JSON.parse(window.localStorage.getItem("jobfit-target-job")); return saved?.dynamicLearning ? saved : JOBS.find((job) => job.id === saved?.id) || null; } catch { return null; }
  });
  const [sources, setSources] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("jobfit-sources")) || DEFAULT_SOURCES; } catch { return DEFAULT_SOURCES; }
  });
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [sourceModal, setSourceModal] = useState(false);
  const [importModal, setImportModal] = useState(null);
  const [returnPrompt, setReturnPrompt] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [quizPrompt, setQuizPrompt] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const externalVisitPending = useRef(false);
  const title = useMemo(() => NAV_ITEMS.find((item) => item.id === page)?.label, [page]);
  const navigate = (next) => {
    setPage(next);
    const url = new URL(window.location.href);
    url.searchParams.set("page", next);
    window.history.replaceState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const handleReturn = () => {
      if (document.visibilityState === "visible" && externalVisitPending.current) {
        externalVisitPending.current = false;
        window.setTimeout(() => setReturnPrompt(true), 350);
      }
    };
    document.addEventListener("visibilitychange", handleReturn);
    window.addEventListener("focus", handleReturn);
    return () => { document.removeEventListener("visibilitychange", handleReturn); window.removeEventListener("focus", handleReturn); };
  }, []);
  const saveProfile = (nextProfile) => { setProfile(nextProfile); setTargetJob(null); setResumePrompt(false); window.localStorage.setItem("jobfit-profile", JSON.stringify(nextProfile)); window.localStorage.removeItem("jobfit-target-job"); setProfileOpen(false); navigate("discover"); };
  const selectJob = (job) => { setTargetJob(job); setResumePrompt(false); window.localStorage.setItem("jobfit-target-job", JSON.stringify(job)); navigate("analysis"); };
  const requireTarget = (next) => { if (targetJob) navigate(next); else navigate("discover"); };
  const addSource = (name, rawUrl) => {
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const next = [...sources, { id: `custom-${Date.now()}`, name: name.trim(), url, color: "blue" }];
    setSources(next); window.localStorage.setItem("jobfit-sources", JSON.stringify(next)); setSourceModal(false); externalVisitPending.current = true; window.open(url, "_blank", "noopener,noreferrer");
  };
  const removeSource = (id) => { const next = sources.filter((source) => source.id !== id); setSources(next); window.localStorage.setItem("jobfit-sources", JSON.stringify(next)); };
  const openExternal = () => { setReturnPrompt(false); externalVisitPending.current = true; };
  const handleImportAnalyze = async (input, choosing = false) => {
    if (choosing) { setImportModal(input); return; }
    const result = await analyzeJd({ jdText: input.jdText, sourceUrl: input.sourceUrl, profile });
    const dynamicJob = {
      ...result.job,
      dynamicLearning: result.learning,
      dynamicAnalysis: result.analysis,
      agentMode: result.mode,
      requestId: result.request_id,
    };
    setImportModal(null);
    setReturnPrompt(false);
    selectJob(dynamicJob);
  };
  const displayName = profile.name.trim() ? `${profile.name.trim()}同学` : "同学";
  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={navigate} openCoach={() => setCoachOpen(true)} />
      <div className="workspace">
        <header className="topbar"><div><h1>你好，{displayName}</h1><p>2026年08月12日&nbsp;&nbsp;星期三</p></div><button className="help-button" onClick={() => setTourOpen(true)}><IconHelpCircle size={18} />重新查看新手指引</button></header>
        <Journey page={page} setPage={requireTarget} openProfile={() => setProfileOpen(true)} />
        {page === "discover" && <DiscoverPage profile={profile} selectJob={selectJob} openProfile={() => setProfileOpen(true)} {...{ sources, removeSource, sourcesOpen, setSourcesOpen, setSourceModal, setImportModal, openExternal }} />}
        {page === "analysis" && (targetJob ? <AnalysisPage setPage={navigate} targetJob={targetJob} /> : <NoTarget setPage={navigate} />)}
        {page === "plan" && (targetJob ? <PlanPage key={targetJob.id} setPage={navigate} setQuizPrompt={setQuizPrompt} targetJob={targetJob} /> : <NoTarget setPage={navigate} />)}
        {page === "assessment" && (targetJob ? <AssessmentPage key={targetJob.id} setPage={navigate} setResumePrompt={setResumePrompt} targetJob={targetJob} /> : <NoTarget setPage={navigate} />)}
        {page === "resume" && (targetJob ? <ResumePage resumePrompt={resumePrompt} targetJob={targetJob} /> : <NoTarget setPage={navigate} />)}
      </div>
      {page === "discover" && returnPrompt && !coachOpen && <ReturnPrompt close={() => setReturnPrompt(false)} openImport={setImportModal} />}
      {coachOpen && <Coach close={() => setCoachOpen(false)} page={page} setPage={requireTarget} setImportModal={setImportModal} />}
      {profileOpen && <ProfileModal profile={profile} close={() => setProfileOpen(false)} save={saveProfile} firstRun={!window.localStorage.getItem("jobfit-profile")} />}
      {sourceModal && <AddSourceModal close={() => setSourceModal(false)} addAndOpen={addSource} />}
      {importModal && <ImportModal mode={importModal} close={() => setImportModal(null)} onAnalyze={handleImportAnalyze} />}
      {quizPrompt && <div className="overlay"><section className="modal nudge-modal"><span className="nudge-icon"><IconClipboardCheck size={30} /></span><h2>今日学习目标已完成</h2><p>要用 5 分钟小测确认是否达到面试可用水平吗？</p><div className="modal-actions"><button className="secondary-button" onClick={() => setQuizPrompt(false)}>跳过</button><button className="primary-button" onClick={() => { setQuizPrompt(false); navigate("assessment"); }}>开始小测</button></div></section></div>}
      {tourOpen && <Onboarding close={() => setTourOpen(false)} setPage={navigate} />}
      <div className="sr-only" aria-live="polite">当前页面：{title}</div>
    </div>
  );
}
