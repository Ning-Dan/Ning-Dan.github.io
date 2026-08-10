import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterBridge, ChapterPager } from "@/components/vla/ChapterBridge";
import { DerivationSequence } from "@/components/vla/DerivationSequence";
import { FrontierMatrix, WorldModelPatterns } from "@/components/vla/FrontierMatrix";
import { GuidedWalkthrough } from "@/components/vla/GuidedWalkthrough";
import { LessonVisual } from "@/components/vla/LessonVisuals";
import { MathFormula } from "@/components/vla/MathFormula";
import { ProgressButton } from "@/components/vla/ProgressButton";
import { getModule, modules, studyGuidance } from "@/lib/course";
import { lessonContent } from "@/lib/lessonContent";
import { lessonStudyPlans } from "@/lib/lessonStudyPlans";
import { lessonWalkthroughs } from "@/lib/lessonWalkthroughs";

export function generateStaticParams() {
  return modules.map((courseModule) => ({ slug: courseModule.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getModule(slug);
  return item ? { title: item.title, description: item.subtitle } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const courseModule = getModule(slug);
  const lesson = lessonContent[slug];
  const walkthrough = lessonWalkthroughs[slug];
  if (!courseModule || !lesson) notFound();

  const guidance = studyGuidance[courseModule.level];
  const studyPlan = lessonStudyPlans[slug];
  const objectives = lesson.objectives || studyPlan?.objectives;
  const timePlan = lesson.timePlan || studyPlan?.timePlan;

  return (
    <div className="site-shell lesson-page">
      <section className="container lesson-signal-hero">
        <p className="course-breadcrumb"><Link href="/learning/vla">VLA 课程地图</Link><span>/</span>{courseModule.phase}</p>
        <div className="lesson-signal-grid">
          <div className="lesson-module-index" aria-label={`第 ${courseModule.index} 章`}>
            <span>MODULE</span>
            <strong>{String(courseModule.index).padStart(2, "0")}</strong>
            <small>{String(courseModule.index + 1).padStart(2, "0")} / {modules.length}</small>
          </div>
          <div className="lesson-hero-copy">
            <p className="eyebrow">{courseModule.phase} · 建议学习预算 {courseModule.hours}</p>
            <h1 className="page-title">{courseModule.title}</h1>
            <p className="page-intro"><strong>{courseModule.subtitle}</strong>{lesson.lead}</p>
          </div>
          <aside className={`study-mode-card ${guidance.tone}`}>
            <span>{guidance.label}</span>
            <strong>{courseModule.outcome}</strong>
            <p>{guidance.instruction}</p>
          </aside>
        </div>
      </section>

      <ChapterBridge slug={slug} />

      <div className="container lesson-layout">
        <nav className="lesson-toc" aria-label="本章目录">
          <strong>本章目录</strong>
          {(objectives || timePlan) && <a href="#route">0. 学习路线</a>}
          <a href="#theory">1. 原理主线</a>
          {lesson.deepDive?.map((section, index) => (
            <a className="toc-sub" href={`#deep-dive-${index}`} key={section.title}>
              {section.title.replace(/^\d+\.\s*/, "")}
            </a>
          ))}
          <a href="#math">2. 推导与数值例</a>
          <a href="#practice">3. 跟着做</a>
          <a href="#pitfalls">4. 失效模式</a>
          <a href="#sources">5. 来源与答案</a>
        </nav>

        <article className="lesson-main">
          {(objectives || timePlan) && (
            <section className="lesson-section" id="route">
              <h2>0. 这章怎么学</h2>
              {objectives && (
                <>
                  <p>完成本章后，你应当能够：</p>
                  <ul className="objective-list">{objectives.map((item) => <li key={item}>{item}</li>)}</ul>
                </>
              )}
              {timePlan && (
                <div className="time-plan">
                  {timePlan.map((item) => (
                    <article key={`${item.duration}-${item.title}`}>
                      <span>{item.duration}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.activity}</p>
                        <small>产出：{item.deliverable}</small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="lesson-section" id="theory">
            <h2>1. 完整原理与直觉</h2>
            {lesson.theory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {lesson.deepDive?.map((section, index) => (
              <div className="deep-dive" id={`deep-dive-${index}`} key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.takeaways && (
                  <div className="key-takeaways">
                    <strong>这一节必须带走</strong>
                    <ul>{section.takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                )}
              </div>
            ))}
            <LessonVisual type={lesson.visual} />
            {slug === "frontier-and-deployment" && (
              <><h3>前沿问题—改进—证据—缺陷矩阵</h3><FrontierMatrix /></>
            )}
            {slug === "world-models" && (
              <><h3>五种组合方式</h3><WorldModelPatterns /></>
            )}
          </section>

          <section className="lesson-section" id="math">
            <h2>2. 核心推导与数值例</h2>
            {lesson.derivations && <DerivationSequence derivations={lesson.derivations} />}
            {lesson.derivations && <h3>公式速查</h3>}
            <MathFormula latex={lesson.formula.latex} symbols={lesson.formula.symbols} />
            {lesson.formula.note && (
              <div className="insight"><strong>审校注记</strong><span>{lesson.formula.note}</span></div>
            )}
          </section>

          <section className="lesson-section" id="practice">
            <h2>3. 跟着做：把本章产物交给下一章</h2>
            {walkthrough ? (
              <>
                <GuidedWalkthrough walkthrough={walkthrough} status={lesson.practice.status} />
                <details className="practice-summary">
                  <summary>完成后查看本章最终验收摘要</summary>
                  <ul>{lesson.practice.acceptance.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
              </>
            ) : (
              <div className="practice-card">
                <div className="practice-head">
                  <span className={`status-pill status-${lesson.practice.status}`}>
                    {lesson.practice.status === "已验证" ? "本地 Toy 脚本已验证" : lesson.practice.status}
                  </span>
                  <h3>{lesson.practice.title}</h3>
                </div>
                <p>{lesson.practice.summary}</p>
                {lesson.practice.code && (
                  <div className="code-card">
                    <div className="code-head"><span>运行入口</span><span>copy &amp; verify</span></div>
                    <pre><code>{lesson.practice.code}</code></pre>
                  </div>
                )}
                <ol>{lesson.practice.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              </div>
            )}
          </section>

          <section className="lesson-section" id="pitfalls">
            <h2>4. 常见失效模式</h2>
            <div className="pitfall-grid">
              {lesson.pitfalls.map((pitfall, index) => (
                <div className="pitfall" key={pitfall}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{pitfall}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="lesson-section" id="sources">
            <h2>5. 来源与带答案自测</h2>
            <div className="source-list">
              {lesson.sources.map((source) => (
                <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                  <span>{source.role}</span><strong>{source.title} ↗</strong>
                </a>
              ))}
            </div>
            {walkthrough?.knowledgeCheck ? (
              <>
                <h3>先自己回答，再展开参考答案</h3>
                <div className="knowledge-checks">
                  {walkthrough.knowledgeCheck.map((item, index) => (
                    <details key={item.question}>
                      <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3>合上笔记回答</h3>
                <ol>{lesson.review.map((question) => <li key={question}>{question}</li>)}</ol>
              </>
            )}
          </section>
        </article>

        <aside className="lesson-aside">
          <div className="check-card">
            <span className="aside-label">完成标准</span>
            <h3>{courseModule.outcome}</h3>
            <p>{lesson.completion}</p>
            <ProgressButton slug={courseModule.slug} />
          </div>
        </aside>
      </div>
      <ChapterPager slug={slug} />
    </div>
  );
}
