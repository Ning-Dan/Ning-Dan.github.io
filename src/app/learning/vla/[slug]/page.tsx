import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <div className="site-shell">
      <section className="container page-hero">
        <p className="eyebrow">
          Module {String(courseModule.index).padStart(2, "0")} · {courseModule.phase} · 建议学习预算 {courseModule.hours}
        </p>
        <h1 className="page-title">{courseModule.title}</h1>
        <p className="page-intro">{courseModule.subtitle}。{lesson.lead}</p>
        <div className={`study-mode-card ${guidance.tone}`}>
          <strong>{guidance.label}</strong>
          <span>{guidance.instruction}</span>
        </div>
      </section>

      <div className="container lesson-layout">
        <nav className="lesson-toc" aria-label="本章目录">
          <strong>本章目录</strong>
          {(objectives || timePlan) && <a href="#route">0. 学习路线</a>}
          <a href="#practice">1. 跟着做</a>
          <a href="#theory">2. 原理备查</a>
          {lesson.deepDive?.map((section, index) => (
            <a className="toc-sub" href={`#deep-dive-${index}`} key={section.title}>
              {section.title.replace(/^\d+\.\s*/, "")}
            </a>
          ))}
          <a href="#math">3. 数学备查</a>
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

          <section className="lesson-section" id="practice">
            <h2>1. 跟着做：从第一步做到可解释的结果</h2>
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

          <section className="lesson-section" id="theory">
            <h2>2. 完整原理与直觉备查</h2>
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
            <h2>3. 数学骨架备查</h2>
            <MathFormula latex={lesson.formula.latex} symbols={lesson.formula.symbols} />
            {lesson.formula.note && (
              <div className="insight"><strong>审校注记</strong><span>{lesson.formula.note}</span></div>
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
    </div>
  );
}
