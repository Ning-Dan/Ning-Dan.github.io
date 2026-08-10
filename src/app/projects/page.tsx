import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "项目", description: "VLA 教程、可运行实验与经典控制接口设计。" };

const projects = [
  { number: "01", status: "持续更新", title: "VLA 学习与实战", description: "面向运动控制工程师的 18 章系统教程。不是论文摘要集合，而是从数学直觉、代码实验走到机器人接口的完整路线。", tags: ["VLA", "π₀.₅", "World Models", "中文教程"], href: "/learning/vla" },
  { number: "02", status: "代码已验证", title: "Toy VLA Lab", description: "用小型、可运行的 Python 实验验证动作量化、action chunk、行为克隆与一维 flow matching，先排除机制误解再上大模型。", tags: ["Python", "Flow Matching", "Action Chunk"], href: "/learning/vla/labs" },
  { number: "03", status: "系统设计", title: "VLA × 经典控制接口", description: "定义 VLA 动作块如何经过坐标变换、反归一化、限幅、安全过滤、IK/MPC/阻抗控制，最终进入真实机器人。", tags: ["Control", "Safety", "Deployment"], href: "/learning/vla/frontier-and-deployment" },
];

export default function ProjectsPage() {
  return <div className="site-shell container"><section className="page-hero personal-page-hero"><p className="eyebrow">Selected work</p><h1 className="page-title">用项目证明理解，<br />用验证约束结论。</h1><p className="page-intro">当前展示个人学习项目与可复用实验。以后可以继续加入真实机器人项目、开源代码、论文复现和工程总结。</p></section><section className="project-list">{projects.map((project) => <Link className="project-row" href={project.href} key={project.number}><span className="project-number">{project.number}</span><div className="project-content"><span className="project-status">{project.status}</span><h2>{project.title}</h2><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div><span className="project-arrow">↗</span></Link>)}</section></div>;
}
