import Link from "next/link";
import { getModule } from "@/lib/course";
import { getCourseContext, runningExample } from "@/lib/courseSpine";

export function ChapterBridge({ slug }: { slug: string }) {
  const context = getCourseContext(slug);
  if (!context) return null;

  return (
    <section className="container course-bridge" aria-label="课程主线与本章交付">
      <div className="course-bridge-case">
        <div>
          <span>全课程贯穿案例</span>
          <h2>{runningExample.title}</h2>
          <p>{runningExample.task}</p>
        </div>
        <dl>
          <div><dt>观测</dt><dd>{runningExample.observation}</dd></div>
          <div><dt>动作</dt><dd>{runningExample.action}</dd></div>
          <div><dt>执行</dt><dd>{runningExample.execution}</dd></div>
        </dl>
        <small>{runningExample.boundary}</small>
      </div>

      <div className="course-bridge-artifacts" aria-label="本章工程交接">
        <article><span>INPUT · 本章接收</span><p>{context.item.receives}</p><i aria-hidden="true">01</i></article>
        <article><span>QUESTION · 核心问题</span><p>{context.item.question}</p><i aria-hidden="true">02</i></article>
        <article><span>OUTPUT · 交给下一章</span><p>{context.item.contributes}</p><i aria-hidden="true">03</i></article>
      </div>
      <p className="course-bridge-next"><span>{context.item.role}</span><strong>为什么继续：</strong>{context.item.bridge}</p>
    </section>
  );
}

export function ChapterPager({ slug }: { slug: string }) {
  const context = getCourseContext(slug);
  if (!context) return null;
  const previous = context.previousSlug ? getModule(context.previousSlug) : undefined;
  const next = context.nextSlug ? getModule(context.nextSlug) : undefined;

  return (
    <nav className="container chapter-pager" aria-label="课程章节导航">
      {previous ? <Link href={`/learning/vla/${previous.slug}`}><span>← 上一章</span><strong>{previous.title}</strong></Link> : <span />}
      {next ? <Link href={`/learning/vla/${next.slug}`}><span>下一章 →</span><strong>{next.title}</strong></Link> : <Link href="/learning/vla"><span>完成主线 →</span><strong>返回课程地图</strong></Link>}
    </nav>
  );
}
