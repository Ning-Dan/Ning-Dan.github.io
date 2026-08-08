import type { Metadata } from "next";
import Link from "next/link";
import { studyGuidance } from "@/lib/course";
import { visualPerceptionModules } from "@/lib/visualPerceptionCourse";

export const metadata: Metadata = {
  title: "Visual Perception · 6D 位姿估计课程",
  description: "12 章原生中文课程：从 RGB-D 成像、标定与点云，到粗位姿、ICP、评估和机器人抓取闭环。",
};

export default function VisualPerceptionPage() {
  return (
    <div className="site-shell container">
      <section className="page-hero">
        <p className="eyebrow">Visual Perception · 12 modules · project driven</p>
        <h1 className="page-title">RGB-D 与 6D 位姿估计</h1>
        <p className="page-intro">
          保留原学习地图的完整主线，改造成与 VLA 相同的逐章课程：每章明确学习深度、原理、公式、动手步骤、验收、失效模式、来源和自测。建议先用两周打通最短闭环，再逐步增加遮挡、杂乱和新物体。
        </p>
        <div className="insight">
          <strong>关于时长：课程编排观点</strong>
          <span>每章小时数是包含阅读、推导、采集、实验和验收的建议预算，不是普遍完成时间。章节内会逐项列出时间去向；应以产出和通过标准为准。</span>
        </div>
        <div className="cta-row">
          <Link className="button" href="/learning/visual-perception/map-and-problem">开始第一章 →</Link>
          <a className="button secondary" href="/tutorials/visual-perception/6dpose.html" target="_blank" rel="noreferrer">查看原始长版 ↗</a>
          <Link className="button secondary" href="/learning">返回学习中心</Link>
        </div>
      </section>

      <section className="lesson-section" aria-labelledby="evidence-title">
        <h2 id="evidence-title">证据标签怎么读</h2>
        <div className="practice-columns">
          <div>
            <h4>已确认事实</h4>
            <p>可由成像几何、论文或官方文档直接支持；关键公式和模型能力附原始来源。</p>
            <h4>合理推测</h4>
            <p>由已知机制推出，但仍依赖场景或实现；正文会说明推测前提。</p>
          </div>
          <div>
            <h4>工程建议 / 个人观点</h4>
            <p>用于缩短调试和选型路径，不包装成普遍事实；阈值必须在自己的数据上验证。</p>
            <h4>暂无法验证</h4>
            <p>设备、环境或闭源实现信息不足时明确保留，不用单次 demo 代替证据。</p>
          </div>
        </div>
      </section>

      <section className="module-grid" style={{ paddingBottom: 96 }}>
        {visualPerceptionModules.map((module) => {
          const guidance = studyGuidance[module.level];
          return (
            <Link className="module-card" href={`/learning/visual-perception/${module.slug}`} key={module.slug}>
              <div className="module-meta">
                <span>{String(module.index).padStart(2, "0")} · {module.phase}</span>
                <span className={`study-label ${guidance.tone}`}>{guidance.label}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.subtitle}</p>
              <div className="tag-row">
                <span className="tag">建议 {module.hours}</span>
                {module.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
