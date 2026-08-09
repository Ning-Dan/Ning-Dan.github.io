import type { Metadata } from "next";
import Link from "next/link";
import { VlaKnowledgeMap } from "@/components/vla/VlaKnowledgeMap";
import { modules, studyGuidance } from "@/lib/course";

export const metadata: Metadata = { title: "VLA 课程", description: "18 章知识地图式 VLA 中文教程：从公式手算和 CPU Toy 走到后训练、Thor 双臂移动机器人部署与评估。" };

export default function VlaCoursePage() {
  return <div className="site-shell container"><section className="page-hero"><p className="eyebrow">Curriculum map · core + deployment track</p><h1 className="page-title">从控制器到通用机器人策略</h1><p className="page-intro">每章都从一个具体样本开始：先手算，再照着输入代码，对照确切输出，故意制造一次失败，最后映射到真实 VLA。新增数学、ACT、后训练与 π₀.₅×Thor 全身部署四章；完成时间以 Gate 产出为准，不以看完页面为准。</p><div className="insight"><strong>关于时长：课程编排观点</strong><span>卡片上的小时数是建议学习预算，不是已确认的普遍完成时间。它包含阅读、手推、逐步实验、错误修复和带答案复盘；采集、长训练、真机审批和硬件调试墙钟时间另计。</span></div><div className="cta-row"><Link className="button" href="/learning/vla/mobile-dual-arm-pi-deployment">进入 Thor 双臂部署 22 步 →</Link><Link className="button secondary" href="/learning/vla/guide">学习指南</Link><Link className="button secondary" href="/learning/vla/labs">实操工坊</Link><Link className="button secondary" href="/learning/vla/resources">资料与审校</Link></div></section><VlaKnowledgeMap /><section className="lesson-section" style={{ paddingBottom: 96 }}><p className="eyebrow">All chapters</p><h2>按章节查看</h2><div className="module-grid">{modules.map((module) => { const guidance = studyGuidance[module.level]; return <Link className="module-card" href={`/learning/vla/${module.slug}`} key={module.slug}><div className="module-meta"><span>{String(module.index).padStart(2, "0")} · {module.phase}</span><span className={`study-label ${guidance.tone}`}>{guidance.label}</span></div><h3>{module.title}</h3><p>{module.subtitle}</p><div className="tag-row"><span className="tag">建议 {module.hours}</span>{module.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></Link>; })}</div></section></div>;
}
