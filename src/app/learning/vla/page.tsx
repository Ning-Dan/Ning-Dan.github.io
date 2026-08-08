import type { Metadata } from "next";
import Link from "next/link";
import { modules, studyGuidance } from "@/lib/course";

export const metadata: Metadata = { title: "VLA 课程", description: "14 章逐步带练的 VLA 中文教程：从具体样本、公式手算和 CPU Toy 实验走到数据、评估与部署。" };

export default function VlaCoursePage() {
  return <div className="site-shell container"><section className="page-hero"><p className="eyebrow">Curriculum map · 12 weeks + capstone</p><h1 className="page-title">从控制器到通用机器人策略</h1><p className="page-intro">每章都从一个具体样本开始：先手算，再照着输入代码，对照确切输出，故意制造一次失败，最后映射到真实 VLA。建议每周 6–8 小时，用 12 周完成知识主线，再用 3–5 周完成毕业项目。</p><div className="insight"><strong>关于时长：课程编排观点</strong><span>卡片上的小时数是建议学习预算，不是已确认的普遍完成时间。它包含阅读、手推、逐步实验、错误修复和带答案复盘；不同基础的学习者应以完成标准而不是计时器为准。</span></div><div className="cta-row"><Link className="button" href="/learning/vla/guide">先看学习指南 →</Link><Link className="button secondary" href="/learning/vla/labs">实操工坊</Link><Link className="button secondary" href="/learning/vla/resources">资料与审校</Link></div></section><section className="module-grid" style={{ paddingBottom: 96 }}>{modules.map((module) => { const guidance = studyGuidance[module.level]; return <Link className="module-card" href={`/learning/vla/${module.slug}`} key={module.slug}><div className="module-meta"><span>{String(module.index).padStart(2, "0")} · {module.phase}</span><span className={`study-label ${guidance.tone}`}>{guidance.label}</span></div><h3>{module.title}</h3><p>{module.subtitle}</p><div className="tag-row"><span className="tag">建议 {module.hours}</span>{module.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></Link>; })}</section></div>;
}
