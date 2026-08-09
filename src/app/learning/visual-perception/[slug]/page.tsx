import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VisualPerceptionRedirect } from "./VisualPerceptionRedirect";

const tutorialPath = "/tutorials/visual-perception/6dpose.html";

const legacyChapters = {
  "map-and-problem": { anchor: "sec0", title: "怎么用这份讲义" },
  "imaging-and-depth": { anchor: "sec3", title: "成像与深度相机" },
  calibration: { anchor: "sec4", title: "标定" },
  "depth-to-pointcloud": { anchor: "sec5", title: "深度图到点云" },
  "se3-transforms": { anchor: "sec6", title: "刚体变换数学" },
  "detection-and-segmentation": { anchor: "sec7", title: "2D 前置：识别与分割" },
  "classical-coarse-pose": { anchor: "sec8", title: "经典几何法：粗位姿" },
  "learned-6d-pose": { anchor: "sec9", title: "学习法 6D" },
  "refinement-and-icp": { anchor: "sec10", title: "精配准 Refinement" },
  apriltag: { anchor: "sec11", title: "合作目标定位 AprilTag" },
  "robotic-closed-loop": { anchor: "sec12", title: "工程闭环" },
  "learning-roadmap": { anchor: "sec13", title: "学习路线一页纸" },
} as const;

type LegacySlug = keyof typeof legacyChapters;

const isLegacySlug = (slug: string): slug is LegacySlug => slug in legacyChapters;

export function generateStaticParams() {
  return Object.keys(legacyChapters).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegacySlug(slug)) return {};
  return {
    title: legacyChapters[slug].title,
    description: "该章节已合并回 Visual Perception 完整教程，页面将跳转到原文对应位置。",
  };
}

export default async function LegacyVisualPerceptionLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegacySlug(slug)) notFound();

  const chapter = legacyChapters[slug];
  const destination = `${tutorialPath}#${chapter.anchor}`;

  return (
    <div className="site-shell container">
      <section className="page-hero">
        <p className="eyebrow">Visual Perception · canonical tutorial</p>
        <h1 className="page-title">{chapter.title}</h1>
        <p className="page-intro">原来的删减版章节已停用，正在前往完整教程中的对应原文章节。</p>
        <div className="cta-row">
          <a className="button" href={destination}>立即打开完整章节 →</a>
          <Link className="button secondary" href="/learning/visual-perception">返回课程主页</Link>
        </div>
        <VisualPerceptionRedirect href={destination} />
      </section>
    </div>
  );
}
