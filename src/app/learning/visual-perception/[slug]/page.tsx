import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MathFormula } from "@/components/vla/MathFormula";
import { ProgressButton } from "@/components/vla/ProgressButton";
import { studyGuidance } from "@/lib/course";
import {
  getVisualPerceptionModule,
  visualPerceptionLessons,
  visualPerceptionModules,
  visualPerceptionStudyPlans,
} from "@/lib/visualPerceptionCourse";

export function generateStaticParams() {
  return visualPerceptionModules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const courseModule = getVisualPerceptionModule(slug);
  return courseModule ? { title: courseModule.title, description: courseModule.subtitle } : {};
}

export default async function VisualPerceptionLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const courseModule = getVisualPerceptionModule(slug);
  const lesson = visualPerceptionLessons[slug];
  const plan = visualPerceptionStudyPlans[slug];
  if (!courseModule || !lesson || !plan) notFound();

  const guidance = studyGuidance[courseModule.level];
  const position = visualPerceptionModules.findIndex((item) => item.slug === slug);
  const previous = visualPerceptionModules[position - 1];
  const next = visualPerceptionModules[position + 1];

  return (
    <div className="site-shell">
      <section className="container page-hero">
        <p className="eyebrow">Visual Perception {String(courseModule.index).padStart(2, "0")} · {courseModule.phase} · {courseModule.hours}</p>
        <h1 className="page-title">{courseModule.title}</h1>
        <p className="page-intro">{courseModule.subtitle}。{lesson.lead}</p>
        <div className={`study-mode-card ${guidance.tone}`}>
          <strong>{guidance.label}</strong>
          <span>{guidance.instruction}</span>
        </div>
        <div className="insight">
          <strong>证据口径</strong>
          <span>公式与外部能力优先依据本章原始来源；流程取舍属于“工程建议”，必须用你的相机、物体和数据复测。缺少公开证据的结论不会写成已确认事实。</span>
        </div>
      </section>

      <div className="container lesson-layout">
        <nav className="lesson-toc" aria-label="本章目录">
          <strong>本章目录</strong>
          <a href="#study-plan">0. 这章怎么学</a>
          <a href="#theory">1. 原理与直觉</a>
          <a href="#math">2. 数学骨架</a>
          <a href="#practice">3. 实操与验收</a>
          <a href="#pitfalls">4. 失效模式</a>
          <a href="#sources">5. 来源与自测</a>
        </nav>

        <article className="lesson-main">
          <section className="lesson-section" id="study-plan">
            <h2>0. 这章怎么学</h2>
            <div className="practice-columns">
              <div>
                <h3>学完要做到</h3>
                <ul>{plan.objectives.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>开始前确认</h3>
                <ul>{plan.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
            <h3>时间花在哪里（共 {courseModule.hours}）</h3>
            <div className="source-list">
              {plan.timePlan.map((block) => (
                <div className="source-card" key={`${block.minutes}-${block.task}`}>
                  <span>{block.minutes} 分钟</span>
                  <strong>{block.task}</strong>
                  <p>产出：{block.output}</p>
                </div>
              ))}
            </div>
            <div className="insight">
              <strong>看不懂 / 跑不通先查</strong>
              <span>{plan.debugging.join("；")}</span>
            </div>
          </section>

          <section className="lesson-section" id="theory">
            <h2>1. 原理与直觉</h2>
            {lesson.theory.map((paragraph, index) => (
              <div key={paragraph}>
                <h3>{index < 2 ? "已确认事实" : index === 2 ? "机制推导与适用边界" : "工程建议 / 个人观点"}</h3>
                <p>{paragraph}</p>
              </div>
            ))}
          </section>

          <section className="lesson-section" id="math">
            <h2>2. 数学骨架</h2>
            <MathFormula latex={lesson.formula.latex} symbols={lesson.formula.symbols} />
            {lesson.formula.note && <div className="insight"><strong>推导边界</strong><span>{lesson.formula.note}</span></div>}
          </section>

          <section className="lesson-section" id="practice">
            <h2>3. 实操与验收</h2>
            <div className="practice-card">
              <div className="practice-head">
                <span className={`status-pill status-${lesson.practice.status}`}>{lesson.practice.status}</span>
                <h3>{lesson.practice.title}</h3>
              </div>
              <p><strong>工程建议：</strong>{lesson.practice.summary}</p>
              {lesson.practice.code && <div className="code-card"><div className="code-head"><span>运行入口</span><span>copy & verify</span></div><pre><code>{lesson.practice.code}</code></pre></div>}
              <div className="practice-columns">
                <div><h4>动手步骤</h4><ol>{lesson.practice.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
                <div><h4>通过标准</h4><ul>{lesson.practice.acceptance.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </div>
          </section>

          <section className="lesson-section" id="pitfalls">
            <h2>4. 常见失效模式</h2>
            <div className="pitfall-grid">
              {lesson.pitfalls.map((pitfall, index) => <div className="pitfall" key={pitfall}><span>{String(index + 1).padStart(2, "0")}</span><p>{pitfall}</p></div>)}
            </div>
          </section>

          <section className="lesson-section" id="sources">
            <h2>5. 来源与自测</h2>
            <div className="source-list">
              {lesson.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.role}</span><strong>{source.title} ↗</strong></a>)}
            </div>
            <h3>合上笔记回答</h3>
            <ol>{lesson.review.map((question) => <li key={question}>{question}</li>)}</ol>
            <div className="cta-row">
              {previous && <Link className="button secondary" href={`/learning/visual-perception/${previous.slug}`}>← 上一章</Link>}
              <Link className="button secondary" href="/learning/visual-perception">课程地图</Link>
              {next && <Link className="button" href={`/learning/visual-perception/${next.slug}`}>下一章 →</Link>}
            </div>
          </section>
        </article>

        <aside className="lesson-aside">
          <div className="check-card">
            <span className="aside-label">完成标准</span>
            <h3>{courseModule.outcome}</h3>
            <p>{lesson.completion}</p>
            <ProgressButton slug={courseModule.slug} course="visual-perception" />
          </div>
        </aside>
      </div>
    </div>
  );
}
