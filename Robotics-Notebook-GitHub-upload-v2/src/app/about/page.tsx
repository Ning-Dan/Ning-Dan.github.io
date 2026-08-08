import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "关于", description: "一个匿名的运动控制与具身智能技术工作台。" };

export default function AboutPage() {
  return <div className="site-shell"><section className="page-hero container personal-page-hero about-hero"><p className="eyebrow">About · Privacy first</p><h1 className="page-title">从确定性的控制模型，<br />走向开放世界的机器人智能。</h1><p className="page-intro">本站暂不公开真实姓名、头像、单位、邮箱或地点；内容本身是唯一身份。</p></section><section className="container about-grid"><div className="about-role-card"><span className="about-monogram">MC</span><div><strong>Motion Control Algorithm Engineer</strong><small>Model-based robotics · Embodied AI</small></div></div><div className="about-story"><h2>我在做什么</h2><p>我的专业背景是运动控制算法，工作方式偏 model-based：理解系统、写清假设、定义状态与约束，再让算法在闭环中接受验证。</p><p>学习 VLA 的目标不是追逐模型名字，而是理解它如何利用视觉和语言生成机器人行为、哪些能力来自数据规模、哪些问题仍需要世界模型，以及如何与经典控制和安全系统合理分层。</p><p>这个网站同时是学习笔记、教程、实验记录和个人项目入口。它会随着学习继续扩展到视觉感知及其他机器人方向。</p></div></section><section className="container section principles-section"><p className="eyebrow">Working principles</p><div className="principle-grid"><article><span>01</span><h3>模型要写清假设</h3><p>公式中的每一项、坐标系、单位和时序都应明确，否则无法进入真实系统。</p></article><article><span>02</span><h3>代码要经过验证</h3><p>至少检查 shape、数值稳定性、可重复性、小样本过拟合和保存加载一致性。</p></article><article><span>03</span><h3>结论要标注边界</h3><p>区分论文报告、官方实现、本站核验和未验证推断，不把“能安装”写成“能部署”。</p></article></div><div className="cta-row"><Link className="button" href="/learning">查看学习中心 →</Link></div></section></div>;
}
