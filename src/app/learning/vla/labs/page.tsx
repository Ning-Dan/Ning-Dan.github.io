import type { Metadata } from "next";

export const metadata: Metadata = { title: "VLA 实操工坊", description: "按硬件分层的 VLA 可运行实验与验证边界。" };

const labs = [
  ["L0", "纯 Python 小实验", "本机直接运行", "动作量化、行为克隆、chunk 执行、1D flow matching"],
  ["L1", "LeRobot + ACT", "4060 Ti 8GB", "隔离环境中检查数据、训练小策略并完成仿真回放"],
  ["L2", "SmolVLA / LIBERO", "8GB 推理边界", "先做 smoke test；小 batch 训练属于探索项，不承诺稳定"],
  ["L3", "π₀.₅ / OpenVLA-OFT / GR00T", "Linux 云 GPU", "openpi 官方边界：推理 >8GB、LoRA >22.5GB、全量微调 >70GB；通过远程策略服务接入控制栈"],
];

export default function LabsPage() {
  return <div className="site-shell container"><section className="page-hero"><p className="eyebrow">Hands-on ladder</p><h1 className="page-title">先跑通机制，再消耗算力</h1><p className="page-intro">所有实验分层标注硬件与验证边界。Isaac 环境不直接塞入 LeRobot；LeRobot、π₀.₅/openpi 使用各自独立环境，避免 Python / PyTorch / JAX / CUDA 互相污染。</p></section><section className="track-grid" style={{ paddingBottom: 50 }}>{labs.map(([id, title, hardware, description]) => <article className="track-card" key={id}><span className="track-number">{id} · {hardware}</span><h3>{title}</h3><p>{description}</p></article>)}</section><section className="lesson-section" style={{ maxWidth: 800, paddingBottom: 96 }}><h2>已执行验证的最小实验</h2><div className="cta-row"><a className="button secondary" href="/labs/chunked_controller.py" download>chunk 执行器</a><a className="button secondary" href="/labs/action_tokenizer.py" download>动作量化器</a><a className="button secondary" href="/labs/flow_matching_1d.py" download>1D Flow</a><a className="button secondary" href="/labs/toy_behavior_cloning.py" download>Toy BC</a></div><p>依赖：Python 3.10+ 标准库。本站代码会区分“已验证、配方核验、云端必做”；能安装不等于能加载模型，能推理也不等于能在 8GB 上训练。</p><div className="insight"><strong>部署边界</strong><span>4060 Ti 8GB 主线是 toy-VLA、LeRobot 数据检查与 ACT；π₀.₅、OpenVLA-OFT 和 GR00T 放在云端/策略服务器，不在本机页面里虚假承诺可训练。</span></div></section></div>;
}
