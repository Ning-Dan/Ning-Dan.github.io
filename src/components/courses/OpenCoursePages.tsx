import Link from "next/link";
import { MathFormula } from "@/components/vla/MathFormula";
import { ProgressButton } from "@/components/vla/ProgressButton";
import type { OpenCourse, OpenCourseChapter } from "@/lib/openCourseTypes";
import { labViewerHref, openCourseLabs } from "@/lib/openCourseLabs";

const sourceKindLabel = {
  course: "课程主页",
  notes: "讲义",
  slides: "Slides",
  video: "视频",
  assignment: "作业",
  paper: "论文",
  code: "代码",
} as const;

export function OpenCourseLanding({ course }: { course: OpenCourse }) {
  const labCount = openCourseLabs[course.slug]?.length ?? 0;
  return (
    <div className={`site-shell open-course-page course-${course.slug}`}>
      <section className="container open-course-hero">
        <p className="eyebrow">COURSE {course.provider}</p>
        <div className="open-course-hero-grid">
          <div>
            <h1 className="page-title">{course.title}</h1>
            <p className="page-intro">{course.description}</p>
          </div>
          <aside className="open-course-source-card">
            <span>原课与改编边界</span>
            <p>{course.provenance}</p>
            <p>{course.licenseNote}</p>
            <a href={course.sourceUrl} target="_blank" rel="noreferrer">查看官方课程 ↗</a>
            {labCount > 0 && <Link href={`/learning/${course.slug}/labs`}>进入实验工坊 · {labCount} 个实验 →</Link>}
          </aside>
        </div>
      </section>

      <section className="container open-course-overview">
        <div>
          <p className="eyebrow">BEFORE YOU START</p>
          <h2>先确认预备知识</h2>
          <ul>{course.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p className="eyebrow">AFTER THE COURSE</p>
          <h2>学完要能做什么</h2>
          <ul>{course.outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="container open-course-map" aria-labelledby="open-course-map-title">
        <header>
          <p className="eyebrow">TEXTBOOK + CODE</p>
          <h2 id="open-course-map-title">按原课主线往下学</h2>
          <p>每章先解释概念，再进入推导、课堂例子和代码实验。来源栏会区分讲义、slides、录像、论文与代码。</p>
        </header>
        <div className="open-course-chapters">
          {course.chapters.map((chapter) => (
            <Link href={`/learning/${course.slug}/${chapter.slug}`} key={chapter.slug}>
              <span>{String(chapter.index).padStart(2, "0")}</span>
              <div><small>{chapter.duration}</small><h3>{chapter.title}</h3><p>{chapter.summary}</p></div>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="container open-course-coverage" aria-labelledby="open-course-coverage-title">
        <header><p className="eyebrow">SOURCE COVERAGE</p><h2 id="open-course-coverage-title">原课内容和资料落在哪里</h2><p>这张表同时检查 lecture、PDF/slides、录像和作业。合并章节不等于省略原课内容。</p></header>
        <div role="table" aria-label="原课覆盖表">
          {course.coverage.map((item) => <div role="row" key={`${item.source}-${item.mappedTo}`}><strong role="cell">{item.source}</strong><span role="cell">{item.mappedTo}</span>{item.note && <small role="cell">{item.note}</small>}</div>)}
        </div>
      </section>
    </div>
  );
}

export function OpenCourseLesson({ course, chapter }: { course: OpenCourse; chapter: OpenCourseChapter }) {
  const chapterIndex = course.chapters.findIndex((item) => item.slug === chapter.slug);
  const previous = course.chapters[chapterIndex - 1];
  const next = course.chapters[chapterIndex + 1];
  const progressKey = `${course.slug}-${chapter.slug}`;
  const pitfallsNumber = chapter.lab ? 4 : 3;
  const sourcesNumber = chapter.lab ? 5 : 4;
  const labCommand = chapter.lab?.file ? `python3 ${chapter.lab.file.startsWith("/") ? `public${chapter.lab.file}` : chapter.lab.file}` : null;
  const labHref = chapter.lab?.file
    ? chapter.lab.file.startsWith("/")
      ? chapter.lab.file
      : `/${chapter.lab.file.replace(/^public\//, "")}`
    : null;
  const labPreviewHref = chapter.lab?.file ? labViewerHref(course.slug, chapter.lab.file) : null;
  const slideSources = chapter.sources.filter((source) => source.kind === "slides");
  const companionSources = chapter.sources.filter((source) => source.kind === "assignment" || source.kind === "code");

  return (
    <div className={`site-shell lesson-page open-course-lesson course-${course.slug}`}>
      <section className="container lesson-signal-hero">
        <p className="course-breadcrumb"><Link href={`/learning/${course.slug}`}>{course.shortTitle} 课程地图</Link><span>/</span>{course.provider}</p>
        <div className="lesson-signal-grid">
          <div className="lesson-module-index" aria-label={`第 ${chapter.index} 章`}>
            <span>MODULE</span><strong>{String(chapter.index).padStart(2, "0")}</strong><small>{String(chapter.index).padStart(2, "0")} / {course.chapters.length}</small>
          </div>
          <div className="lesson-hero-copy">
            <p className="eyebrow">{course.provider} · 建议学习预算 {chapter.duration}</p>
            <h1 className="page-title">{chapter.title}</h1>
            <p className="page-intro"><strong>{chapter.subtitle}</strong>{chapter.summary}</p>
          </div>
          <aside className="study-mode-card derive">
            <span>本章完成标准</span>
            <strong>{chapter.objectives[0]}</strong>
            <p>至少完成数值例、自测和本章实验；只看视频不算完成。</p>
          </aside>
        </div>
      </section>

      <div className="container lesson-layout">
        <nav className="lesson-toc" aria-label="本章目录">
          <strong>本章目录</strong>
          <a href="#route">0. 学习目标</a>
          <a href="#concepts">1. 概念讲解</a>
          <a href="#theory">2. 推导与课堂例子</a>
          {(chapter.recordings?.length ?? 0) > 0 && <a href="#recordings">录像</a>}
          {(slideSources.length > 0 || companionSources.length > 0) && <a href="#original-materials">Slides / PDF / 代码</a>}
          {chapter.lab && <a href="#practice">3. 代码实验</a>}
          <a href="#pitfalls">{pitfallsNumber}. 常见误区</a>
          <a href="#sources">{sourcesNumber}. 来源与自测</a>
        </nav>

        <article className="lesson-main">
          <section className="lesson-section" id="route">
            <h2>0. 这章学到什么程度</h2>
            <p>进入本章前需要：</p>
            <ul>{chapter.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
            <p>完成本章后，你应当能够：</p>
            <ul className="objective-list">{chapter.objectives.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="lesson-section" id="concepts">
            <h2>1. 先把概念讲清楚</h2>
            <p>这里沿用原课程的符号和例子，但把课堂里省略的中间步骤补出来。先理解对象和问题，再读公式。</p>
            <div className="concept-explanation-list">
              {chapter.concepts.map((concept, index) => (
                <article className="concept-explanation" key={concept.name}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{concept.name}</h3></header>
                  <dl>
                    <div><dt>是什么</dt><dd>{concept.explanation}</dd></div>
                    <div><dt>为什么需要</dt><dd>{concept.why}</dd></div>
                    <div><dt>原课例子</dt><dd>{concept.example}</dd></div>
                    <div><dt>边界与误区</dt><dd>{concept.boundary}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="lesson-section" id="theory">
            <h2>2. 从直觉走到公式</h2>
            {chapter.sections.map((section, index) => (
              <section className="open-course-section" key={section.title}>
                <p className="section-marker">{String(index + 1).padStart(2, "0")}</p>
                <h3>{section.title}</h3>
                <p className="section-intuition">{section.intuition}</p>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.formula && (
                  <>
                    <MathFormula latex={section.formula.latex} symbols={section.formula.symbols} />
                    <div className="insight"><strong>公式在说什么</strong><span>{section.formula.explanation}</span></div>
                  </>
                )}
                {section.example && (
                  <div className="worked-example">
                    <strong>{section.example.title}</strong>
                    <ol>{section.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    <p><b>结果：</b>{section.example.result}</p>
                  </div>
                )}
                {section.figures?.map((figure) => (
                  <figure className="course-key-figure" key={`${figure.src}-${figure.page ?? figure.title}`}>
                    <header><span>原课关键图</span><strong>{figure.title}</strong></header>
                    {figure.kind === "pdf-page" ? (
                      <div className="course-key-figure-frame">
                        <iframe
                          src={`${figure.src}#page=${figure.page ?? 1}&view=FitH`}
                          title={`${figure.title}，第 ${figure.page ?? 1} 页`}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      // Remote course images remain at the original source instead of being re-hosted.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={figure.src} alt={figure.caption} loading="lazy" />
                    )}
                    <figcaption><p>{figure.caption}</p><small>{figure.credit}</small><a href={figure.href} target="_blank" rel="noreferrer">查看原文件 ↗</a></figcaption>
                  </figure>
                ))}
                {section.checks && <div className="key-takeaways"><strong>检查自己是否读懂</strong><ul>{section.checks.map((item) => <li key={item}>{item}</li>)}</ul></div>}
              </section>
            ))}
          </section>

          {(chapter.recordings?.length ?? 0) > 0 && (
            <section className="lesson-section" id="recordings">
              <h2>原课录像</h2>
              <p>录像由原课程的 YouTube 频道提供。正文按可核对的课件、讲义和录像信息整理对应主线；若课程没有可合法核对的字幕，本站不会把概述冒充逐字转录。</p>
              <div className="course-recordings">
                {chapter.recordings?.map((recording) => (
                  <figure key={recording.youtubeId}>
                    <div><iframe src={`https://www.youtube-nocookie.com/embed/${recording.youtubeId}`} title={recording.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
                    <figcaption><strong>{recording.title}</strong><span>{recording.note}</span></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {(slideSources.length > 0 || companionSources.length > 0) && (
            <section className="lesson-section" id="original-materials">
              <h2>原课 Slides、PDF 与代码资料</h2>
              <p>正文只放帮助理解的关键图页；完整课件保留官方链接，避免把整份 PDF 搬进教程。</p>
              {slideSources.map((source) => (
                <article className="course-pdf" key={source.url}>
                  <header><span>SLIDES / PDF</span><strong>{source.title}</strong></header>
                  <p>{source.note ?? "原课 PDF。若浏览器不支持内嵌预览，请使用下方链接打开。"}</p>
                  <a href={source.url} target="_blank" rel="noreferrer">在新窗口打开原文件 ↗</a>
                </article>
              ))}
              {companionSources.length > 0 && (
                <div className="course-companion-links">
                  {companionSources.map((source) => {
                    const isLocalLab = source.url.startsWith("/labs/");
                    const href = isLocalLab ? labViewerHref(course.slug, source.url) : source.url;
                    return <a href={href} target={isLocalLab ? undefined : "_blank"} rel={isLocalLab ? undefined : "noreferrer"} key={`${source.kind}-${source.url}`}>
                      <span>{sourceKindLabel[source.kind]}</span><strong>{source.title} {isLocalLab ? "→" : "↗"}</strong>{source.note && <p>{source.note}</p>}
                    </a>;
                  })}
                </div>
              )}
            </section>
          )}

          {chapter.lab && (
            <section className="lesson-section" id="practice">
              <h2>3. 代码实验：{chapter.lab.title}</h2>
              <div className="practice-card">
                <p>{chapter.lab.goal}</p>
                {labCommand && <div className="code-card"><div className="code-head"><span>运行入口</span><span>CPU / verify</span></div><pre><code>{labCommand}</code></pre></div>}
                <div className="open-lab-inline-actions">
                  {labPreviewHref && <Link className="text-link" href={labPreviewHref}>在线查看源码 →</Link>}
                  {labHref && <a className="text-link" href={labHref} download>下载本章脚本 ↓</a>}
                </div>
                <ol>{chapter.lab.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <h3>验收输出</h3>
                <ul>{chapter.lab.expected.map((item) => <li key={item}>{item}</li>)}</ul>
                <p className="source-note">与原课的关系：{chapter.lab.sourceNote}</p>
              </div>
            </section>
          )}

          <section className="lesson-section" id="pitfalls">
            <h2>{pitfallsNumber}. 常见误区</h2>
            <div className="pitfall-grid">{chapter.pitfalls.map((pitfall, index) => <div className="pitfall" key={pitfall}><span>{String(index + 1).padStart(2, "0")}</span><p>{pitfall}</p></div>)}</div>
          </section>

          <section className="lesson-section" id="sources">
            <h2>{sourcesNumber}. 原课来源与带答案自测</h2>
            <div className="source-list">
              {chapter.sources.map((source) => {
                const isLocalLab = source.url.startsWith("/labs/");
                const href = isLocalLab ? labViewerHref(course.slug, source.url) : source.url;
                return <a href={href} target={isLocalLab ? undefined : "_blank"} rel={isLocalLab ? undefined : "noreferrer"} key={`${source.kind}-${source.url}`}>
                  <span>{sourceKindLabel[source.kind]}</span><strong>{source.title} {isLocalLab ? "→" : "↗"}</strong>{source.note && <p>{source.note}</p>}
                </a>;
              })}
            </div>
            <h3>先回答，再展开</h3>
            <div className="knowledge-checks">
              {chapter.exercises.map((item, index) => <details key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </section>
        </article>

        <aside className="lesson-aside">
          <div className="check-card"><span className="aside-label">完成标准</span><h3>{chapter.objectives[0]}</h3><p>教材、例子、代码和自测都能独立复现。</p><ProgressButton slug={progressKey} /></div>
        </aside>
      </div>

      <nav className="container chapter-pager" aria-label="章节翻页">
        {previous ? <Link href={`/learning/${course.slug}/${previous.slug}`}><span>← 上一章</span><strong>{previous.title}</strong></Link> : <span />}
        {next ? <Link href={`/learning/${course.slug}/${next.slug}`}><span>下一章 →</span><strong>{next.title}</strong></Link> : <Link href={`/learning/${course.slug}`}><span>返回</span><strong>课程地图</strong></Link>}
      </nav>
    </div>
  );
}
