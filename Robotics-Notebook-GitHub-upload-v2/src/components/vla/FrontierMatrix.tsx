const frontiers = [
  { name: "OpenVLA-OFT", problem: "离散逐 token 动作慢、原微调效果不足", change: "并行连续 action chunk、L1、FiLM 增强语言 grounding", result: "官方报告 LIBERO 76.5→97.1，吞吐约 26×", limit: "每个 suite 单独训练；7B 仍重；L1 多峰能力弱于 flow/diffusion", href: "https://openvla-oft.github.io/" },
  { name: "FAST", problem: "高频逐维量化产生超长 token 序列", change: "时间维 DCT→量化→低频优先展平→BPE", result: "机械动作频域稀疏，官方报告训练最高约快 5×", limit: "autoregressive 推理仍慢；tokenizer 需适配新动作域", href: "https://www.pi.website/research/fast" },
  { name: "X-VLA", problem: "异构机器人混训会梯度冲突和负迁移", change: "embodiment soft prompt + 专用 I/O projection + 平衡采样", result: "共享语义同时保留本体接口差异；新增参数很少", limit: "新机器人仍需 head/prompt 和数据，不是 zero-shot 通用动作空间", href: "https://arxiv.org/abs/2510.10274" },
  { name: "GR00T N1.7", problem: "人形数据少、跨本体与部署链复杂", change: "人类视频、相对 EEF、flow DiT、LeRobot/ONNX/TensorRT", result: "官方 benchmark 报告多项提升，部署工具链完整", limit: "截至 2026.08 无独立同行评审 N1.7 报告；多为特定 specialist", href: "https://github.com/NVIDIA/Isaac-GR00T" },
  { name: "RTC", problem: "大 VLA 延迟造成停顿和 chunk 边界不连续", change: "固定已承诺前缀，对剩余动作做 flow/diffusion inpainting", result: "300ms+ 注入延迟下仍完成多项精细动态任务", limit: "增加推理计算与系统复杂度；不提供低层稳定性证明", href: "https://www.pi.website/research/real_time_chunking" },
  { name: "π*0.6 / RECAP", problem: "成功示范不包含策略自己的失败状态", change: "自主 rollout、纠正、value、advantage-conditioned VLA 与离线 RL", result: "让策略从失败和干预中改进，官方 espresso 应用显著提升", limit: "真实 rollout 与人工纠正成本高；暂无完整公开复现", href: "https://www.pi.website/blog/pistar06" },
  { name: "VLA-JEPA", problem: "纯 BC 表征不显式学习动作导致的未来变化", change: "latent action-conditioned future prediction + flow action learning", result: "人类视频主要改善鲁棒、恢复与 regrasp", limit: "8×A100 级训练；部分标准指标无增益；复现需防未来信息泄漏", href: "https://arxiv.org/abs/2602.10098" },
  { name: "3D / 触觉 VLA", problem: "RGB 对深度、遮挡、接触和滑移观测不足", change: "点云/Ego3D/触觉 token，与视觉语言动作联合", result: "在插接、遮挡与空间操作中改善", limit: "标定与同步更难；多数任务域窄；不等于已解决力控", href: "https://arxiv.org/abs/2505.09577" },
];

const worldPatterns = [
  { name: "候选评分 / MPC", body: "VLA 采样多个 chunk，world model rollout，value/碰撞代价重排。最可解释，但慢且会利用模型错误。" },
  { name: "表征预训练", body: "预测未来 latent 以迫使表示关注动作因果，如 VLA-JEPA。部署可不显式 rollout，但训练昂贵、需严防未来泄漏。" },
  { name: "视觉/语言子目标", body: "世界模型或高层策略给 waypoint，VLA 负责伺服。π₀.₅ 是语言层级，不是显式世界模型；π₀.7 进一步尝试视觉子目标。" },
  { name: "数据与评测引擎", body: "动作条件世界模型生成/评估 rollout，再用真实结果纠偏。可扩数据，但模型偏差可能与策略共同强化。" },
  { name: "联合训练", body: "共享 encoder，同时优化动作、latent dynamics、VLM 和 value loss。最紧耦合，也最容易出现负迁移、坍塌和因果泄漏。" },
];

export function FrontierMatrix() {
  return <div className="frontier-matrix">{frontiers.map((item) => <a href={item.href} target="_blank" rel="noreferrer" key={item.name}><div className="frontier-name"><strong>{item.name}</strong><span>↗</span></div><dl><div><dt>旧问题</dt><dd>{item.problem}</dd></div><div><dt>怎么改</dt><dd>{item.change}</dd></div><div><dt>为何/证据</dt><dd>{item.result}</dd></div><div><dt>仍有缺陷</dt><dd>{item.limit}</dd></div></dl></a>)}</div>;
}

export function WorldModelPatterns() {
  return <div className="world-patterns">{worldPatterns.map((item, index) => <div key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong><p>{item.body}</p></div>)}</div>;
}
