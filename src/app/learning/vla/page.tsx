import type { Metadata } from "next";
import Link from "next/link";
import { CourseSignalHero } from "@/components/vla/CourseSignalHero";
import { VlaKnowledgeMap } from "@/components/vla/VlaKnowledgeMap";

export const metadata: Metadata = { title: "VLA 课程", description: "18 章知识地图式 VLA 中文教程：从公式手算和 CPU Toy 走到后训练、Thor 双臂移动机器人部署与评估。" };

export default function VlaCoursePage() {
  return (
    <div className="site-shell vla-course-page">
      <CourseSignalHero />
      <div className="container">
        <VlaKnowledgeMap />
        <section className="course-operations" aria-labelledby="course-operations-title">
          <div>
            <p className="eyebrow">Use the course</p>
            <h2 id="course-operations-title">阅读不是终点，交付物才是。</h2>
            <p>建议时长是课程编排预算，不是已确认的普遍完成时间；采集、长训练、真机审批和硬件调试的墙钟时间另计。</p>
          </div>
          <nav aria-label="VLA 课程辅助入口">
            <Link href="/learning/vla/guide"><span>01 / 先规划</span><strong>学习指南与阶段 Gate</strong><i>→</i></Link>
            <Link href="/learning/vla/labs"><span>02 / 再验证</span><strong>13 个已运行 Toy 实验</strong><i>→</i></Link>
            <Link href="/learning/vla/resources"><span>03 / 查证据</span><strong>资料来源与审校边界</strong><i>→</i></Link>
            <Link href="/learning/vla/mobile-dual-arm-pi-deployment"><span>04 / 做交付</span><strong>Thor 双臂部署 22 步</strong><i>→</i></Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
