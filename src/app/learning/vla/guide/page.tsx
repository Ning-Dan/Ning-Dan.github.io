import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VLA 学习指南",
  description: "VLA 教程的先修诊断、分层路线、12 周学习节奏、阶段验收与闭环学习方法。",
};

const routes = [
  {
    id: "CORE · 8 WEEKS",
    title: "关键主线",
    body: "适合先建立可靠骨架。重点完成 0、2–7、9–10 章和一个 ACT/SmolVLA 小闭环；历史与前沿章节先建立索引。",
  },
  {
    id: "STANDARD · 12 WEEKS",
    title: "完整路线",
    body: "推荐路线。逐章完成公式、自测与实验，再用 2–4 周毕业项目把数据、baseline、VLA、评测和部署接口连起来。",
  },
  {
    id: "ENGINEER · 16–20 WEEKS",
    title: "工程深挖",
    body: "在完整路线后复现一个官方模型配方，补齐延迟、失败归因、扰动评测与真机安全层，形成可复现工程报告。",
  },
];

const prerequisites = [
  ["数学最小集", "能读矩阵乘法、条件概率、期望、梯度和常微分方程；SO(3)/SE(3) 只需先理解坐标系与复合。"],
  ["机器学习最小集", "知道训练/验证/测试切分、过拟合、反向传播、batch、checkpoint；不要求先精通大模型训练。"],
  ["机器人最小集", "理解观测、状态、动作、闭环、控制周期、末端与关节空间；第 0 章会统一这些语言。"],
  ["编程最小集", "能运行 Python、读 shape、创建隔离环境、看日志并保存结果；先从无 GPU 的 L0 实验开始。"],
  ["硬件不是门槛", "没有机械臂也能完成核心原理、toy 实验与 LIBERO 路线；真机只用于最后验证系统边界。"],
];

const schedule = [
  ["WEEK 0–2", "建立共同语言", "先修自检；第 0–2 章；完成 toy BC、条件打乱和闭环分布偏移解释。"],
  ["WEEK 3–4", "读懂 VLA 内部", "第 3–5 章；画清 token、mask、动作契约、chunk horizon 与执行 horizon。"],
  ["WEEK 5–6", "掌握生成式动作", "第 6–7 章；分别跑通 diffusion 多峰直觉与 flow 方向单测。"],
  ["WEEK 7–8", "从模型到数据", "第 8–9 章；理解 π₀.₅ 边界，并完成数据门禁、ACT baseline 和 rollout 记录。"],
  ["WEEK 9–10", "形成全局认知", "第 10–11 章；按约束选型，区分 VLA、层级策略、世界模型与规划器。"],
  ["WEEK 11–12", "部署与综合", "第 12 章；完成延迟预算、安全 sandwich 和失败树；随后进入第 13 章毕业项目。"],
];

const gates = [
  ["GATE A · 会训练", "32 个样本能过拟合；打乱语言或遮挡图像后性能按预期下降；能解释 train loss 不等于 rollout。"],
  ["GATE B · 会定义动作", "能写出 action contract，声明 frame、unit、dt、mask 和逆变换；chunk 队列不重放过期动作。"],
  ["GATE C · 会读模型", "拿到任意 VLA 图，能指出视觉/语言/状态入口、动作 head、训练目标、推理过程和部署频率。"],
  ["GATE D · 会做实验", "同一数据和安全协议下比较 ACT 与 VLA；报告成功率、样本数、p99 延迟和失败类型。"],
  ["GATE E · 会交付", "另一位工程师能按你的数据卡、配置、checkpoint、评测脚本和日志复现实验。"],
];

const rhythm = [
  ["01 · 预检 20 分钟", "先闭卷回答本章自测，标出真正不会的概念。"],
  ["02 · 原理 90 分钟", "读直觉、公式和符号；必须能解释每个量的 shape、frame、unit 与时间含义。"],
  ["03 · 实验 2–4 小时", "先跑最小样例，再主动制造一个失败；保留配置、seed、日志和验收结果。"],
  ["04 · 复盘 30 分钟", "合上页面重画系统图，回答自测，并写下一条仍不确定的结论。"],
];

const studyLevels = [
  ["了解即可", "历史、模型名和前沿索引：建立位置感，知道它解决什么，不背实现细节。"],
  ["必须掌握", "核心机制与系统边界：能闭卷解释、画出数据流，并回答本章自测。"],
  ["慢推 + 动手", "关键公式与动作生成：逐项核对符号和 shape，实验必须亲手跑并制造一次失败。"],
  ["综合验收", "数据、适配、部署与项目：用 rollout、失败归因和可复现交付证明掌握。"],
];

export default function VlaGuidePage() {
  return (
    <div className="site-shell container">
      <section className="page-hero">
        <p className="eyebrow">Study contract · Learn to build, not recite</p>
        <h1 className="page-title">把 14 章走成一条<br />可以验收的学习路径</h1>
        <p className="page-intro">“单站闭环”不等于拒绝原论文，而是概念、公式、实验步骤和验收标准都在本站完成；外部链接只承担证据核对与随版本变化的 API 参考。</p>
        <div className="cta-row"><Link className="button" href="/learning/vla/control-to-vla">开始第 0 章 →</Link><Link className="button secondary" href="/learning/vla">查看全部章节</Link></div>
      </section>

      <section className="lesson-section">
        <p className="eyebrow">What deserves your time</p>
        <h2>看到这四种标识，就知道该学到什么深度</h2>
        <div className="roadmap-flow">{studyLevels.map(([title, body], index) => <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{body}</small></div>)}</div>
      </section>

      <section className="lesson-section">
        <p className="eyebrow">Choose your depth</p>
        <h2>三条路线，不用每个人都以同样速度前进</h2>
        <div className="track-grid">{routes.map((route) => <article className="track-card" key={route.id}><span className="track-number">{route.id}</span><h3>{route.title}</h3><p>{route.body}</p></article>)}</div>
      </section>

      <section className="lesson-section">
        <p className="eyebrow">Prerequisite diagnostic</p>
        <h2>开始前只需要这些</h2>
        <div className="module-grid">{prerequisites.map(([title, body]) => <article className="module-card" key={title}><div className="module-meta"><span>READY CHECK</span><span>✓</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="lesson-section">
        <p className="eyebrow">Recommended pace</p>
        <h2>12 周主线 + 2–4 周毕业项目</h2>
        <div className="module-grid">{schedule.map(([week, title, body]) => <article className="module-card" key={week}><div className="module-meta"><span>{week}</span><span>6–8h</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="lesson-section">
        <p className="eyebrow">Mastery gates</p>
        <h2>通过验收，再进入下一阶段</h2>
        <div className="source-list">{gates.map(([title, body]) => <article className="source-card guide-gate" key={title}><span>{title}</span><strong>{body}</strong></article>)}</div>
      </section>

      <section className="lesson-section" style={{ paddingBottom: 96 }}>
        <p className="eyebrow">One chapter loop</p>
        <h2>每章都按同一个闭环学习</h2>
        <div className="roadmap-flow">{rhythm.map(([title, body]) => <div key={title}><span>{title.split(" · ")[0]}</span><strong>{title.split(" · ")[1]}</strong><small>{body}</small></div>)}</div>
      </section>
    </div>
  );
}
