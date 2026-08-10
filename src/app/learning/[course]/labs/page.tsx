import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpenCourse } from "@/lib/openCourses";
import { labAnchor, openCourseLabs } from "@/lib/openCourseLabs";

export function generateStaticParams() {
  return Object.keys(openCourseLabs).map((course) => ({ course }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getOpenCourse(slug);
  if (!course) return {};
  return { title: `${course.shortTitle} · 实验工坊`, description: `${course.title} 的可运行代码、在线源码与下载入口。` };
}

export default async function CourseLabsPage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getOpenCourse(slug);
  const catalog = openCourseLabs[slug];
  if (!course || !catalog) notFound();

  const labs = catalog.map((lab) => ({
    ...lab,
    code: fs.readFileSync(path.join(process.cwd(), "public", "labs", slug, lab.file), "utf8"),
    publicPath: `/labs/${slug}/${lab.file}`,
  }));

  return (
    <div className={`site-shell open-course-page course-${course.slug}`}>
      <section className="container open-labs-hero">
        <p className="course-breadcrumb"><Link href={`/learning/${course.slug}`}>{course.shortTitle} 课程地图</Link><span>/</span>实验工坊</p>
        <p className="eyebrow">RUN · READ · VERIFY</p>
        <h1 className="page-title">{course.shortTitle}<br />实验工坊</h1>
        <p className="page-intro">这里同时提供浏览器内源码、运行命令和原始文件下载。直接打开 <code>.py</code> 时，GitHub Pages 会把它作为下载文件返回；这不是 404，所以在线阅读请使用本页。</p>
        <div className="open-labs-stats"><strong>{labs.length}</strong><span>个独立实验</span><small>全部使用 CPU 路径完成验收；每个脚本末尾都有 PASS 断言。</small></div>
      </section>

      <div className="container open-labs-layout">
        <nav className="open-labs-index" aria-label="实验目录">
          <strong>实验目录</strong>
          {labs.map((lab, index) => <a href={`#${labAnchor(lab.file)}`} key={lab.file}><span>{String(index + 1).padStart(2, "0")}</span>{lab.title}</a>)}
        </nav>

        <main className="open-labs-main">
          {labs.map((lab, index) => (
            <article className="open-lab-card" id={labAnchor(lab.file)} key={lab.file}>
              <header><span>LAB {String(index + 1).padStart(2, "0")}</span><h2>{lab.title}</h2><p>{lab.summary}</p></header>
              <div className="open-lab-run"><span>运行命令</span><code>python3 public/labs/{slug}/{lab.file}</code></div>
              <div className="open-lab-actions">
                <a href={lab.publicPath} download>下载 {lab.file}</a>
                <a href={`https://github.com/Ning-Dan/Ning-Dan.github.io/blob/main/public/labs/${slug}/${lab.file}`} target="_blank" rel="noreferrer">在 GitHub 查看 ↗</a>
              </div>
              <div className="open-lab-source"><div><span>PYTHON</span><span>{lab.file}</span></div><pre tabIndex={0}><code>{lab.code}</code></pre></div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
