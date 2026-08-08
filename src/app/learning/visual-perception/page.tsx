import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Visual Perception · 6D 位姿估计",
  description: "RGBD 相机定位与 6D 位姿估计学习地图：从成像、标定、点云到位姿求解、精配准和机器人抓取闭环。",
};

export default function VisualPerceptionPage() {
  return (
    <div className="site-shell visual-perception-page">
      <section className="container page-hero visual-perception-hero">
        <p className="eyebrow">Visual Perception · Tutorial 01</p>
        <h1 className="page-title">RGBD 相机定位与<br />6D 位姿估计</h1>
        <p className="page-intro">
          一份面向机器人系统实践的学习地图：从像素、深度和坐标系出发，逐步走到物体位姿、精配准、误差预算与抓取闭环。
        </p>
        <div className="cta-row">
          <a className="button" href="/tutorials/visual-perception/6dpose.html" target="_blank" rel="noreferrer">
            独立打开完整教程 ↗
          </a>
          <Link className="button secondary" href="/learning">返回学习中心</Link>
        </div>
      </section>

      <section className="visual-tutorial-shell" aria-label="RGBD 与 6D 位姿估计完整教程">
        <iframe
          className="visual-tutorial-frame"
          src="/tutorials/visual-perception/6dpose.html"
          title="RGBD 相机定位与 6D 位姿估计学习地图"
          loading="lazy"
        />
      </section>
    </div>
  );
}
