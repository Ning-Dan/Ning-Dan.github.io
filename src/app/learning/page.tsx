import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "学习中心", description: "VLA、视觉感知与 model-based control 的系统学习路线。" };

const tracks = [
  { status: "ACTIVE · 18 CHAPTERS · 13 LABS", title: "Vision-Language-Action", subtitle: "从控制工程师的视角理解 VLA", description: "数学地基、ACT、Transformer 与动作表示、Diffusion / Flow、π₀.₅、后训练、数据评估和控制系统集成。", href: "/learning/vla", cta: "进入完整课程 →", className: "active" },
  { status: "ACTIVE · 12 CHAPTERS", title: "Visual Perception", subtitle: "为机器人建立可靠的视觉状态", description: "从 RGB-D 成像、标定与点云开始，贯通检测分割、经典几何法、学习法 6D 位姿估计、ICP 精配准与机器人抓取闭环。", href: "/learning/visual-perception", cta: "进入完整课程 →", className: "visual" },
  { status: "FOUNDATION", title: "Model-based Control", subtitle: "把已有经验整理成可复用知识", description: "动力学、轨迹优化、MPC、阻抗控制、WBC 与安全约束，将作为连接学习策略和真实机器人的基础层。", href: "/learning#roadmap", cta: "规划中", className: "foundation" },
];

export default function LearningPage() {
  return <div className="site-shell">
    <section className="page-hero container personal-page-hero"><p className="eyebrow">Learning center</p><h1 className="page-title">一个主题一条路线，<br />每条路线都走到能做事情。</h1><p className="page-intro">这里不是收藏链接的书签页。每个主题都包含必要原理、关键公式、可执行实验、工程边界和阶段性成果。</p></section>
    <section className="container learning-track-list">
      {tracks.map((track, index) => <article className={`learning-track ${track.className}`} key={track.title}><div className="track-index">{String(index + 1).padStart(2, "0")}</div><div className="track-main"><span>{track.status}</span><h2>{track.title}</h2><strong>{track.subtitle}</strong><p>{track.description}</p></div><Link href={track.href}>{track.cta}</Link></article>)}
    </section>
    <section className="container section roadmap-section" id="roadmap"><div className="personal-section-head"><div><p className="eyebrow">Extensible by design</p><h2>以后增加新方向，<br />不需要重做网站。</h2></div><p>统一课程结构会复用到每个主题：背景与历史、核心原理、关键论文、最小实验、标准工具链、系统项目和复盘清单。</p></div><div className="roadmap-flow"><div><span>01</span><strong>建立印象</strong><small>历史、问题与整体结构</small></div><div><span>02</span><strong>重点理解</strong><small>关键机制与公式</small></div><div><span>03</span><strong>亲手实现</strong><small>最小代码与验证</small></div><div><span>04</span><strong>系统落地</strong><small>评估、部署与边界</small></div></div></section>
  </div>;
}
