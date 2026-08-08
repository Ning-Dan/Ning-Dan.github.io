import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonVisual } from "@/components/vla/LessonVisuals";
import { MathFormula } from "@/components/vla/MathFormula";
import { ProgressButton } from "@/components/vla/ProgressButton";
import { FrontierMatrix, WorldModelPatterns } from "@/components/vla/FrontierMatrix";
import { getModule, modules } from "@/lib/course";
import { lessonContent } from "@/lib/lessonContent";

export function generateStaticParams() { return modules.map((courseModule) => ({ slug: courseModule.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getModule(slug);
  return item ? { title: item.title, description: item.subtitle } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const courseModule = getModule(slug);
  const lesson = lessonContent[slug];
  if (!courseModule || !lesson) notFound();

  return <div className="site-shell"><section className="container page-hero"><p className="eyebrow">Module {String(courseModule.index).padStart(2, "0")} · {courseModule.phase} · {courseModule.hours} · {courseModule.level}</p><h1 className="page-title">{courseModule.title}</h1><p className="page-intro">{courseModule.subtitle}。{lesson.lead}</p></section><div className="container lesson-layout"><nav className="lesson-toc" aria-label="本章目录"><strong>本章目录</strong><a href="#theory">1. 原理与直觉</a><a href="#math">2. 数学骨架</a><a href="#practice">3. 实操与验收</a><a href="#pitfalls">4. 失效模式</a><a href="#sources">5. 来源与自测</a></nav><article className="lesson-main"><section className="lesson-section" id="theory"><h2>1. 原理与直觉</h2>{lesson.theory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<LessonVisual type={lesson.visual} />{slug === "frontier-and-deployment" && <><h3>前沿问题—改进—证据—缺陷矩阵</h3><FrontierMatrix /></>}{slug === "world-models" && <><h3>五种组合方式</h3><WorldModelPatterns /></>}</section><section className="lesson-section" id="math"><h2>2. 数学骨架</h2><MathFormula latex={lesson.formula.latex} symbols={lesson.formula.symbols} />{lesson.formula.note && <div className="insight"><strong>审校注记</strong><span>{lesson.formula.note}</span></div>}</section><section className="lesson-section" id="practice"><h2>3. 实操与验收</h2><div className="practice-card"><div className="practice-head"><span className={`status-pill status-${lesson.practice.status}`}>{lesson.practice.status}</span><h3>{lesson.practice.title}</h3></div><p>{lesson.practice.summary}</p>{lesson.practice.code && <div className="code-card"><div className="code-head"><span>运行入口</span><span>copy & verify</span></div><pre><code>{lesson.practice.code}</code></pre></div>}<div className="practice-columns"><div><h4>步骤</h4><ol>{lesson.practice.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><div><h4>通过标准</h4><ul>{lesson.practice.acceptance.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div></section><section className="lesson-section" id="pitfalls"><h2>4. 常见失效模式</h2><div className="pitfall-grid">{lesson.pitfalls.map((pitfall, index) => <div className="pitfall" key={pitfall}><span>{String(index + 1).padStart(2, "0")}</span><p>{pitfall}</p></div>)}</div></section><section className="lesson-section" id="sources"><h2>5. 来源与自测</h2><div className="source-list">{lesson.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.role}</span><strong>{source.title} ↗</strong></a>)}</div><h3>合上笔记回答</h3><ol>{lesson.review.map((question) => <li key={question}>{question}</li>)}</ol></section></article><aside className="lesson-aside"><div className="check-card"><span className="aside-label">完成标准</span><h3>{courseModule.outcome}</h3><p>{lesson.completion}</p><ProgressButton slug={courseModule.slug} /></div></aside></div></div>;
}
