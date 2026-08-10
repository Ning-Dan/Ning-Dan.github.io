export type CourseModule = {
  index: number;
  slug: string;
  phase: "桥接" | "核心" | "系统" | "前沿" | "实战";
  title: string;
  subtitle: string;
  hours: string;
  level: "印象" | "重点" | "手推" | "综合";
  tags: string[];
  outcome: string;
};

export const studyGuidance: Record<CourseModule["level"], { label: string; instruction: string; tone: string }> = {
  印象: { label: "了解即可", instruction: "建立时间线与全局位置感，能说出它解决什么问题；不要求记住模型细节。", tone: "overview" },
  重点: { label: "必须掌握", instruction: "放慢速度，合上页面后能解释机制、画出数据流，并说清适用边界。", tone: "mastery" },
  手推: { label: "慢推 + 动手", instruction: "公式逐项核对 shape、frame、unit 与时间含义；本章实验必须亲手运行并制造一次失败。", tone: "derive" },
  综合: { label: "综合验收", instruction: "不要停在阅读；用数据、baseline、rollout、失败归因和可复现交付证明掌握。", tone: "integrate" },
};

export const modules: CourseModule[] = [
  { index: 0, slug: "control-to-vla", phase: "桥接", title: "从控制律到条件策略", subtitle: "用闭环、状态与滚动时域重画 VLA 地图", hours: "2.5h", level: "重点", tags: ["闭环", "策略", "POMDP"], outcome: "能解释 VLA 放在机器人控制栈的哪一层，以及它不该替代什么。" },
  { index: 1, slug: "math-foundations", phase: "桥接", title: "VLA 数学地基", subtitle: "从 NLL、KL 到 advantage、policy gradient 与 ODE", hours: "5h", level: "手推", tags: ["Probability", "RL", "ODE"], outcome: "能从统一符号表推导 VLA 训练、生成与后训练中反复出现的核心公式。" },
  { index: 2, slug: "history", phase: "桥接", title: "VLA 为什么诞生", subtitle: "从单任务模仿到跨任务、跨场景的视觉语言动作模型", hours: "2h", level: "印象", tags: ["History", "RT-2", "Bottleneck"], outcome: "能沿时间线解释每一代方法解决了什么，以及为什么仍然不够。" },
  { index: 3, slug: "behavior-cloning", phase: "桥接", title: "模仿学习与 Behavior Cloning", subtitle: "从监督学习目标到 covariate shift，再到数据闭环", hours: "4h", level: "手推", tags: ["BC", "DAgger", "数据"], outcome: "能从演示轨迹训练一个最小视觉条件策略并判断失效模式。" },
  { index: 4, slug: "act-cvae", phase: "核心", title: "ACT 与 CVAE", subtitle: "动作块、潜变量、ELBO 与 temporal ensemble 的完整桥梁", hours: "5h", level: "手推", tags: ["ACT", "CVAE", "Temporal Ensemble"], outcome: "能解释并实现 ACT 的训练/推理信息流，而不只把 ACT 当成一个 baseline 名称。" },
  { index: 5, slug: "action-chunking", phase: "核心", title: "Action Chunking 与闭环执行", subtitle: "预测未来一段，执行一小段，然后重新观测", hours: "4h", level: "手推", tags: ["Chunk", "Receding Horizon", "Latency"], outcome: "实现带延迟预算和安全裁剪的分块策略执行器。" },
  { index: 6, slug: "multimodal-transformer", phase: "核心", title: "多模态 Transformer", subtitle: "图像、语言、本体状态如何进入同一条件模型", hours: "5h", level: "手推", tags: ["VLM", "Attention", "Token"], outcome: "读懂典型 VLA 的输入拼接、注意力掩码与训练目标。" },
  { index: 7, slug: "action-representations", phase: "核心", title: "动作表示与跨本体归一化", subtitle: "离散 bin、FAST、连续 action head 与坐标系选择", hours: "5h", level: "手推", tags: ["Tokenization", "FAST", "Normalization"], outcome: "为新机器人定义可学习、可部署且可比较的动作空间。" },
  { index: 8, slug: "diffusion-policy", phase: "核心", title: "Diffusion Policy", subtitle: "为什么多峰动作分布适合用条件去噪生成", hours: "6h", level: "手推", tags: ["Score", "Denoising", "Multimodal"], outcome: "手推训练目标并训练一个能采出双峰的一维最小 DDPM，说明升级到动作块还缺什么。" },
  { index: 9, slug: "flow-matching", phase: "核心", title: "Flow Matching 与 π₀", subtitle: "从噪声到动作的速度场，以及 π₀ action expert", hours: "5h", level: "手推", tags: ["ODE", "Flow", "π0"], outcome: "区分 diffusion 与 flow matching，并写出方向正确的一维条件流。" },
  { index: 10, slug: "pi05", phase: "系统", title: "π₀.₅：开放世界 VLA", subtitle: "高层语言子任务、连续动作与开放场景泛化", hours: "2.5h 核心 + 3.5h 选做", level: "重点", tags: ["Physical Intelligence", "π0.5", "Open-world"], outcome: "能解释 π₀.₅ 相对 π₀ 改了什么，并跑通官方 LIBERO 推理/微调链路的云端版本。" },
  { index: 11, slug: "vla-families", phase: "系统", title: "VLA 架构谱系与选型", subtitle: "OpenVLA/OFT、SmolVLA、Octo、GR00T 的关键取舍", hours: "3h", level: "重点", tags: ["Architecture", "OpenVLA", "GR00T"], outcome: "按数据、算力、频率、动作精度和开源程度选择基线。" },
  { index: 12, slug: "data-and-adaptation", phase: "系统", title: "数据工程、微调与评估", subtitle: "LeRobot/RLDS、LoRA/OFT、数据门禁与 rollout 评测", hours: "8h", level: "综合", tags: ["LeRobot", "LoRA", "Evaluation"], outcome: "设计一次可复现的 VLA 适配实验，并能定位 loss 正常但 rollout 失败的原因。" },
  { index: 13, slug: "post-training", phase: "系统", title: "VLA 后训练与数据闭环", subtitle: "从纠错 SFT、DAgger 到 reward model、offline/online RL", hours: "7h", level: "综合", tags: ["HIL", "DAgger", "RL"], outcome: "能根据基础策略成功率、奖励可信度和安全条件选择后训练方法，并设计不会污染测试集的数据闭环。" },
  { index: 14, slug: "world-models", phase: "前沿", title: "VLA × 世界模型", subtitle: "反应式策略、未来预测、规划与联合训练的边界", hours: "5h", level: "重点", tags: ["World Model", "Planning", "Long Horizon"], outcome: "能区分 policy 与 dynamics model，并设计 VLA+world model 的组合架构。" },
  { index: 15, slug: "frontier-and-deployment", phase: "前沿", title: "前沿方向与实时部署", subtitle: "RTC、推理时计算、3D/触觉、人类视频与安全系统", hours: "7h", level: "综合", tags: ["RTC", "3D", "Safety"], outcome: "能按“改进—证据—缺陷”读新论文，并搭出 VLA→安全过滤→低层控制闭环。" },
  { index: 16, slug: "mobile-dual-arm-pi-deployment", phase: "实战", title: "π₀.₅ × Thor 双臂移动机器人部署", subtitle: "双臂、双自由度腰部、移动底盘与 Jetson AGX Thor 的 22 步实操", hours: "30–60h + 采集/训练墙钟", level: "综合", tags: ["π0.5", "Jetson Thor", "Whole-body"], outcome: "交付可审计的全身 action contract、openpi 适配、Thor 性能报告、分级真机灰度与后训练闭环。" },
  { index: 17, slug: "capstone", phase: "实战", title: "毕业项目：语言驱动操作", subtitle: "从 LIBERO/Isaac Lab 到自己的机械臂任务", hours: "25–40h", level: "综合", tags: ["LIBERO", "Isaac Lab", "Report"], outcome: "交付数据、ACT baseline、VLA、评估、部署接口与失败复盘的完整工程包。" },
];

export const getModule = (slug: string) => modules.find((item) => item.slug === slug);
