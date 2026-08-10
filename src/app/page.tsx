import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "首页",
  description: "从 model-based 运动控制出发，系统学习 VLA、世界模型与具身智能。",
};

const focusItems = [
  ["01", "VLA fundamentals", "从条件策略、动作表示到 action chunk"],
  ["02", "π₀.₅ & flow matching", "理解 Physical Intelligence 的高低层联合路线"],
  ["03", "Control integration", "把学习策略接回 IK、MPC、阻抗与安全层"],
];

const entryCards = [
  { code: "LEARN / 01", title: "学习中心", description: "按主题组织的长期知识库。VLA 是第一条完整路线，视觉感知与更多方向已经预留入口。", href: "/learning", accent: "blue" },
  { code: "BUILD / 02", title: "项目与实验", description: "不只记录结论，也保留能运行的代码、实验边界、失败原因和工程决策。", href: "/projects", accent: "coral" },
  { code: "ABOUT / 03", title: "关于这个网站", description: "一个 model-based 运动控制工程师理解具身智能、连接理论与真实系统的匿名工作台。", href: "/about", accent: "mint" },
];

export default function Home() {
  return (
    <div className="site-shell personal-site">
      <section className="personal-hero container">
        <div className="personal-hero-copy">
          <div className="availability"><span /> CURRENT FOCUS · VLA</div>
          <p className="eyebrow">Motion control · Embodied intelligence</p>
          <h1>把控制理论，<em>接到具身智能上。</em></h1>
          <p className="hero-copy">我是一名偏 model-based 方向的运动控制算法工程师。这里记录我如何从熟悉的动力学、优化与闭环控制出发，系统学习 VLA，并把它真正接入机器人系统。</p>
          <div className="cta-row">
            <Link className="button" href="/learning">进入学习中心 →</Link>
            <Link className="button secondary" href="/projects">查看正在做的项目</Link>
          </div>
        </div>

        <aside className="now-card" aria-label="当前研究方向">
          <div className="now-card-head"><span>NOW / 2026</span><i aria-hidden="true" /></div>
          <h2>正在深入</h2>
          <div className="focus-list">
            {focusItems.map(([index, title, detail]) => (
              <div className="focus-item" key={index}><span>{index}</span><div><strong>{title}</strong><small>{detail}</small></div></div>
            ))}
          </div>
          <Link href="/learning/vla">打开完整 VLA 路线 <span>↗</span></Link>
        </aside>
      </section>

      <section className="identity-strip">
        <div className="container identity-grid">
          <div><span>BACKGROUND</span><strong>Model-based control</strong></div>
          <div><span>CURRENT</span><strong>Vision-Language-Action</strong></div>
          <div><span>NEXT</span><strong>Visual perception</strong></div>
          <div><span>METHOD</span><strong>Learn · Build · Verify</strong></div>
        </div>
      </section>

      <section className="section container">
        <div className="personal-section-head">
          <div><p className="eyebrow">Explore the notebook</p><h2>这不是简历陈列页，<br />而是一张持续生长的技术地图。</h2></div>
          <p>内容按“理解原理 → 跑通实验 → 接入系统 → 复盘边界”组织。每个主题都能独立扩展，不需要推倒现有网站重来。</p>
        </div>
        <div className="personal-entry-grid">
          {entryCards.map((card) => (
            <Link className={`personal-entry-card ${card.accent}`} href={card.href} key={card.code}>
              <span>{card.code}</span><div className="entry-arrow">↗</div><h3>{card.title}</h3><p>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container featured-work">
        <div className="featured-copy">
          <p className="eyebrow">Featured learning project</p>
          <h2>VLA：从第一性原理到可运行系统</h2>
          <p>18 章中文深度教程，覆盖数学地基、ACT、动作 token、Diffusion / Flow、π₀.₅、世界模型、后训练与部署；配套 13 个经过执行验证的 Python 实验。</p>
          <div className="featured-links">
            <Link href="/learning/vla">查看课程地图 →</Link>
            <Link href="/learning/vla/labs">进入实操工坊 →</Link>
            <Link href="/learning/vla/resources">查看资料与审校 →</Link>
          </div>
        </div>
        <div className="featured-diagram" aria-label="VLA 与控制系统分层">
          <div><span>01</span><strong>Vision + Language</strong><small>理解场景与任务</small></div><i>↓</i>
          <div><span>02</span><strong>VLA policy</strong><small>生成动作块</small></div><i>↓</i>
          <div><span>03</span><strong>Safety + Control</strong><small>约束、跟踪与执行</small></div>
        </div>
      </section>

      <section className="personal-manifesto"><div className="container"><span className="manifesto-number">01</span><blockquote>“先建立正确的直觉，再用最小实验验证；最后把模型放回真实控制系统里讨论。”</blockquote><p>本站的学习原则</p></div></section>
    </div>
  );
}
