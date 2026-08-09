import type { Metadata } from "next";
import Link from "next/link";

const tutorialPath = "/tutorials/visual-perception/6dpose.html";

const originalSections = [
  { anchor: "sec0", number: "00", phase: "使用说明", title: "怎么用这份讲义" },
  { anchor: "sec1", number: "01", phase: "快速通道", title: "运控背景读者的新难点" },
  { anchor: "sec2", number: "02", phase: "问题边界", title: "SLAM 与物体 6D 位姿" },
  { anchor: "sec3", number: "03", phase: "L1", title: "成像与深度相机" },
  { anchor: "sec4", number: "04", phase: "L2", title: "标定" },
  { anchor: "sec5", number: "05", phase: "L3", title: "深度图 → 点云" },
  { anchor: "sec6", number: "06", phase: "L4", title: "刚体变换数学" },
  { anchor: "sec7", number: "07", phase: "L5", title: "2D 前置：识别与分割" },
  { anchor: "sec8", number: "08", phase: "L6", title: "经典几何法：粗位姿" },
  { anchor: "sec9", number: "09", phase: "L7", title: "学习法 6D" },
  { anchor: "sec10", number: "10", phase: "L8", title: "精配准 Refinement" },
  { anchor: "sec11", number: "11", phase: "L9", title: "合作目标定位 AprilTag" },
  { anchor: "sec12", number: "12", phase: "L10", title: "工程闭环" },
  { anchor: "sec13", number: "13", phase: "路线", title: "学习路线一页纸" },
  { anchor: "sec14", number: "14", phase: "附录", title: "符号速查" },
  { anchor: "sec15", number: "15", phase: "收束", title: "一句话收尾" },
] as const;

export const metadata: Metadata = {
  title: "Visual Perception · RGB-D 与 6D 位姿估计",
  description: "完整的 RGB-D 相机定位与 6D 位姿估计中文教程；本页只提供导航，正文统一来自自包含长版教程。",
};

export default function VisualPerceptionPage() {
  return (
    <div className="site-shell container">
      <section className="page-hero">
        <p className="eyebrow">Visual Perception · one canonical tutorial</p>
        <h1 className="page-title">RGB-D 与 6D 位姿估计</h1>
        <p className="page-intro">
          这里不再维护一份删减后的逐章正文。知识地图、完整讲义、公式、表格、代码和示意图统一保存在同一个自包含 HTML 中；本页只负责入口与章节导航。
        </p>
        <div className="insight">
          <strong>唯一正文来源</strong>
          <span>从下面任一入口进入的都是同一份完整教程。教程顶部会一直保留“返回课程主页”，链接在当前标签页打开，因此浏览器返回和页面内返回都可用。</span>
        </div>
        <div className="cta-row">
          <a className="button" href={`${tutorialPath}#sec0`}>从使用说明开始 →</a>
          <a className="button secondary" href={tutorialPath}>打开完整知识地图</a>
          <Link className="button secondary" href="/learning">返回学习中心</Link>
        </div>
      </section>

      <section className="lesson-section" aria-labelledby="chapter-title" style={{ marginBottom: 96 }}>
        <p className="eyebrow">Original chapter index</p>
        <h2 id="chapter-title">直接进入原文章节</h2>
        <p>这些卡片只定位到原 HTML 的章节锚点，不包含第二份改写正文。</p>
        <div className="module-grid" style={{ marginTop: 24 }}>
          {originalSections.map((section) => (
            <a className="module-card" href={`${tutorialPath}#${section.anchor}`} key={section.anchor}>
              <div className="module-meta">
                <span>{section.number} · {section.phase}</span>
                <span>原文 →</span>
              </div>
              <h3>{section.title}</h3>
              <div className="tag-row"><span className="tag">完整内容</span></div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
