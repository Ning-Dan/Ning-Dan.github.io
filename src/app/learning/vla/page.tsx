import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/lib/course";

export const metadata: Metadata = { title: "VLA 课程", description: "14 章 VLA 中文深度教程：原理、公式、实操、π₀.₅、世界模型与部署。" };

export default function VlaCoursePage() {
  return <div className="site-shell container"><section className="page-hero"><p className="eyebrow">Curriculum map · 10–14 weeks</p><h1 className="page-title">从控制器到通用机器人策略</h1><p className="page-intro">建议每周 6–8 小时。第 0–8 章建立历史、机制与 π₀.₅ 主线，第 9–12 章完成数据、世界模型、前沿与工程闭环，第 13 章做毕业项目。</p><div className="cta-row"><Link className="button secondary" href="/learning/vla/labs">实操工坊</Link><Link className="button secondary" href="/learning/vla/resources">资料与审校</Link></div></section><section className="module-grid" style={{ paddingBottom: 96 }}>{modules.map((module) => <Link className="module-card" href={`/learning/vla/${module.slug}`} key={module.slug}><div className="module-meta"><span>{String(module.index).padStart(2, "0")} · {module.phase}</span><span>{module.hours}</span></div><h3>{module.title}</h3><p>{module.subtitle}</p><div className="tag-row">{module.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></Link>)}</section></div>;
}
