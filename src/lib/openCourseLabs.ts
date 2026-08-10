export type OpenCourseLabEntry = {
  file: string;
  title: string;
  summary: string;
};

export const openCourseLabs: Record<string, OpenCourseLabEntry[]> = {
  "diffusion-flow": [
    { file: "ode_sde_euler.py", title: "Euler、Euler–Maruyama 与 Brownian 方差", summary: "先用一维数值例核对确定性步长和 √Δt 随机增量。" },
    { file: "lab1_ode_sde_complete.py", title: "Lab 1：ODE、SDE、OU 与 Langevin", summary: "对齐官方 Lab 1 的完整 CPU 闭环，检查轨迹统计和稳态分布。" },
    { file: "conditional_flow_matching.py", title: "Conditional Flow Matching 前置检查", summary: "核对 CondOT 路径端点、条件速度和边缘方差。" },
    { file: "lab2_gmm_flow_score.py", title: "Lab 2：二维 GMM Flow 与 Score", summary: "训练轻量 CFM/score 模型，并执行 ODE、SDE 与任意分布桥接。" },
    { file: "score_and_cfg.py", title: "Gaussian Score 与 CFG 系数", summary: "用有限差分和边界条件检查两个常见公式错误。" },
    { file: "latent_patch_shapes.py", title: "Latent 与 Patch Shape 账本", summary: "验证压缩比例、patchify 和 unpatchify 的形状守恒。" },
    { file: "lab3_dit_vae_latent_smoke.py", title: "Lab 3：CFG、DiT、VAE 与 Latent CFM", summary: "覆盖 label dropout、Fourier、attention、AdaLN、VAE loss 和 latent 训练单步。" },
    { file: "discrete_ctmc.py", title: "离散 CTMC 与 Kolmogorov Forward Equation", summary: "验证 rate matrix、概率守恒、小步转移和两状态解析解。" },
  ],
  cs336: [
    { file: "toy_bpe.py", title: "Toy Byte-Pair Encoding", summary: "从 UTF-8 bytes 出发执行 merge，并核对 token 数和压缩率。" },
    { file: "resource_accounting.py", title: "Transformer 资源账本", summary: "计算参数、训练状态、激活和基础 FLOPs。" },
    { file: "causal_lm_math.py", title: "Causal Attention 与 NLL", summary: "用三 token 小矩阵检查 mask、softmax 和 next-token loss。" },
    { file: "roofline_attention.py", title: "Roofline、HBM Traffic 与 Online Softmax", summary: "区分计算/I/O 复杂度，并验证分块 softmax 等价性。" },
    { file: "kernel_benchmark_protocol.py", title: "Kernel Benchmark 协议", summary: "检查 warm-up、分位数、occupancy、mask 和 fusion traffic。" },
    { file: "collectives_sim.py", title: "并行训练 Collectives", summary: "单进程模拟 all-reduce、reduce-scatter 和 all-gather。" },
    { file: "scaling_fit.py", title: "Scaling Law 拟合与失败外推", summary: "比较随机留出和最大尺度留出，暴露 regime change。" },
    { file: "inference_capacity.py", title: "KV Cache 与 Continuous Batching", summary: "离散模拟请求到达、完成和 slot reuse。" },
    { file: "minhash_dedup.py", title: "MinHash-LSH 近重复审计", summary: "比较 exact hash、Jaccard、MinHash 与候选复核。" },
    { file: "grpo_mechanics.py", title: "GRPO / GSPO 数值机制", summary: "检查 std 口径、clipping、长度归一化和 importance ratio。" },
    { file: "multimodal_smoke.py", title: "视觉 Patch、对比损失与 Projector", summary: "核对视觉 token 数、CLIP/SigLIP loss、projector shape 和 mask。" },
  ],
  cs285: [
    { file: "dagger_distribution_shift.py", title: "BC、分布偏移与 DAgger", summary: "让策略访问训练外状态，再用专家查询修复闭环漂移。" },
    { file: "policy_gradient_bandit.py", title: "Policy Gradient Baseline 方差", summary: "隔离验证 baseline 不改变期望梯度、只降低方差。" },
    { file: "trajectory_policy_gradient.py", title: "Trajectory Gaussian REINFORCE", summary: "比较 full-return 与 causal reward-to-go，并训练连续策略均值。" },
    { file: "actor_critic_td.py", title: "TD Actor–Critic", summary: "用 TD error 同时训练 stochastic actor 与 critic。" },
    { file: "q_learning_replay_target.py", title: "Replay、Target Network 与 Double Q", summary: "训练 Q 表和双 Q 表，拆开动作选择与估值。" },
    { file: "model_based_mpc.py", title: "Ensemble Dynamics、CEM 与 MPC", summary: "用 sampled planning 和 on-policy aggregation 修正模型。" },
    { file: "count_based_exploration.py", title: "Count Bonus 稀疏奖励探索", summary: "只修改奖励，不让策略偷看未知转移。" },
    { file: "kde_ex2_novelty.py", title: "KDE 与 EX2-style Novelty", summary: "比较密度估计和 exemplar classification 的新颖度信号。" },
  ],
};

export function labAnchor(file: string) {
  return file.replace(/\.py$/, "");
}

export function labViewerHref(courseSlug: string, publicPath: string) {
  const file = publicPath.split("/").pop() ?? publicPath;
  return `/learning/${courseSlug}/labs#${labAnchor(file)}`;
}
