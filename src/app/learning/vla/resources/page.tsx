import type { Metadata } from "next";

export const metadata: Metadata = { title: "VLA 资料与审校", description: "VLA 教程使用的官方课程、论文、项目仓库与复现边界。" };

const sources = [
  ["Hugging Face Robotics Course", "课程骨架清楚、LeRobot 导向明确；未发布单元不冒充已完成内容。", "https://huggingface.co/learn/robotics-course/unit0/1"],
  ["Robot Learning: A Tutorial", "2025 年系统教程，覆盖 BC、RL 与 generalist policy，并提供 LeRobot 示例；用作理论广度基线。", "https://arxiv.org/abs/2510.12403"],
  ["LeRobot", "数据格式、ACT/SmolVLA 等策略与训练入口的工程主线；实际实验需固定版本。", "https://github.com/huggingface/lerobot"],
  ["OpenVLA", "动作 token、LoRA、LIBERO 评估和服务化接口的重要公开实现。", "https://github.com/openvla/openvla"],
  ["openpi", "π₀ / π₀.₅、连续 action expert、LeRobot 数据转换与远程推理的官方实现。", "https://github.com/Physical-Intelligence/openpi"],
  ["π₀.₅", "必修案例：高层语言子任务、连续动作与开放世界泛化；明确论文系统与公开 openpi 的复现边界。", "https://www.pi.website/blog/pi05"],
  ["Real-Time Chunking", "动作块异步实时执行：固定已承诺前缀并对剩余动作做生成式 inpainting。", "https://www.pi.website/research/real_time_chunking"],
  ["FAST", "DCT + 量化 + BPE 压缩高频动作序列，解释动作 token 从朴素 binning 到时序压缩的变化。", "https://www.pi.website/research/fast"],
  ["Isaac GR00T", "大模型 VLA 的端到端训练与部署参考；高算力进阶路线，不作为 8GB 入门主线。", "https://github.com/NVIDIA/Isaac-GR00T"],
];

export default function ResourcesPage() {
  return <div className="site-shell container"><section className="page-hero"><p className="eyebrow">Research & review log</p><h1 className="page-title">参考了什么，改进了什么</h1><p className="page-intro">本站不把单个教程换皮。每条主线都回到原论文、官方项目页或维护中的官方仓库交叉核对，并记录算力与版本边界。</p></section><section className="module-grid" style={{ paddingBottom: 96 }}>{sources.map(([title, note, url]) => <a className="module-card" href={url} target="_blank" rel="noreferrer" key={title}><div className="module-meta"><span>Primary source</span><span>↗</span></div><h3>{title}</h3><p>{note}</p></a>)}</section></div>;
}
