export const runningExample = {
  title: "语言驱动桌面抓取",
  task: "双相机机械臂根据中文指令抓取指定物体，并在闭环中纠正偏差。",
  observation: "最近 K=2 帧双相机 RGB、机器人状态 qₜ 与语言指令 ℓ",
  action: "H=16、dₐ=7 的末端增量动作块，tool frame，Δt=50 ms",
  execution: "20 Hz 动作参考、每 E=4 步重观测、独立高频伺服与安全层",
  boundary: "这些数字是全课程共用的教学合同，不是任意机器人的默认配置。",
} as const;

export const courseBands = [
  { id: "01", title: "机器人与数学地基", note: "先统一系统边界、符号和训练假设", slugs: ["control-to-vla", "math-foundations", "history"] },
  { id: "02", title: "从演示到动作块", note: "BC → ACT，把训练、短时轨迹与闭环接起来", slugs: ["behavior-cloning", "act-cvae", "action-chunking"] },
  { id: "03", title: "多模态与动作生成", note: "条件如何进入模型，动作如何被表示和采样", slugs: ["multimodal-transformer", "action-representations", "diffusion-policy", "flow-matching"] },
  { id: "04", title: "代表系统与适配", note: "先读 π₀.₅，再比较模型家族和数据工程", slugs: ["pi05", "vla-families", "data-and-adaptation"] },
  { id: "05", title: "经验改进与长期决策", note: "失败数据、后训练与世界模型", slugs: ["post-training", "world-models"] },
  { id: "06", title: "部署与交付", note: "从通用实时系统到 Thor 全身机器人", slugs: ["frontier-and-deployment", "mobile-dual-arm-pi-deployment", "capstone"] },
] as const;

export type CourseSlug = typeof courseBands[number]["slugs"][number];

export const courseSequence = courseBands.flatMap((band) => [...band.slugs]) as CourseSlug[];

type CourseSpineItem = {
  role: "教材主线" | "专题索引" | "工程项目";
  question: string;
  receives: string;
  contributes: string;
  bridge: string;
};

export const courseSpine: Record<CourseSlug, CourseSpineItem> = {
  "control-to-vla": {
    role: "教材主线",
    question: "VLA 在闭环控制栈里负责什么，又绝不能绕过什么？",
    receives: "一个尚未分层的语言驱动抓取任务",
    contributes: "五层闭环图、时间预算和 v1 action contract",
    bridge: "下一步先统一所有公式、张量和时间下标，避免后面每章重新定义动作。",
  },
  "math-foundations": {
    role: "教材主线",
    question: "同一个动作块怎样贯穿监督学习、潜变量、生成模型和后训练？",
    receives: "五层闭环图与 H=16、dₐ=7 的动作合同",
    contributes: "全课程唯一符号表、shape/unit/reduction 约定",
    bridge: "有了共同语言，再用历史章建立问题索引，不把模型名当成原理。",
  },
  history: {
    role: "专题索引",
    question: "每一代机器人策略究竟补了上一代的哪个缺口？",
    receives: "统一系统边界与数学符号",
    contributes: "问题—方法—证据—未解决项时间线",
    bridge: "历史最终落到第一个可训练基线：从演示数据拟合 Behavior Cloning。",
  },
  "behavior-cloning": {
    role: "教材主线",
    question: "怎样从演示学会动作，以及为什么离线 loss 正常仍会闭环失败？",
    receives: "统一样本 schema、动作合同和 episode 数据",
    contributes: "BC baseline、冻结切分、checkpoint 与 rollout 失败报告",
    bridge: "单步均值策略不足以表达短时轨迹和多种动作风格，下一章升级为 ACT。",
  },
  "act-cvae": {
    role: "教材主线",
    question: "怎样用潜变量和动作块同时建模短时轨迹与动作多样性？",
    receives: "BC 数据、同一 action contract 和失败报告",
    contributes: "ACT 训练/推理图、masked chunk loss、temporal ensemble 与统一策略接口",
    bridge: "ACT 已能预测动作块，下一章解决动作块何时查询、执行多少以及过期后怎么办。",
  },
  "action-chunking": {
    role: "教材主线",
    question: "动作块如何在真实时间中滚动执行而不重放过期动作？",
    receives: "ACT 的 H×dₐ 输出与 observation_time",
    contributes: "E/H/Δt 策略、异步队列、TTL 与 controlled-stop 规则",
    bridge: "执行合同稳定后，再研究视觉、语言和本体状态如何进入条件模型。",
  },
  "multimodal-transformer": {
    role: "教材主线",
    question: "图像、语言、状态和动作查询怎样共享信息而不泄漏标签？",
    receives: "统一观测 schema、动作块和时间协议",
    contributes: "token/shape 表、attention mask 与条件消融测试",
    bridge: "条件已经进入模型，下一步决定模型到底输出怎样的动作表示。",
  },
  "action-representations": {
    role: "教材主线",
    question: "连续物理动作怎样被编码、归一化并跨本体复用？",
    receives: "Transformer 条件表示与 v1 action contract",
    contributes: "tokenizer/continuous head 对照、统计 revision 和可逆 adapter",
    bridge: "动作语义固定后，才可以公平比较不同的概率生成头。",
  },
  "diffusion-policy": {
    role: "教材主线",
    question: "怎样用条件去噪表达 BC 均值无法覆盖的多峰动作？",
    receives: "同一 H×dₐ 动作块、条件编码和归一化统计",
    contributes: "DDPM 前向/反向推导、双峰实验和动作块 sampler 接口",
    bridge: "保留同一任务与接口，下一章只把离散去噪过程替换为连续速度场。",
  },
  "flow-matching": {
    role: "教材主线",
    question: "怎样学习从噪声到动作的连续速度场并正确积分？",
    receives: "Diffusion 的同协议基线与多峰评测",
    contributes: "Flow Matching 路径、ODE solver、方向单测与 action expert 接口",
    bridge: "掌握连续 action expert 后，可以读懂 π₀/π₀.₅ 的系统组合。",
  },
  pi05: {
    role: "教材主线",
    question: "预训练 VLM、semantic action 与连续 action expert 怎样组成开放场景 VLA？",
    receives: "多模态条件模型、Flow Matching 和统一动作合同",
    contributes: "π₀→π₀.₅ 架构图、训练阶段表和复现边界",
    bridge: "理解一个代表系统后，再按同一字段比较其他模型家族。",
  },
  "vla-families": {
    role: "专题索引",
    question: "在数据、算力、频率和开源边界约束下，哪个模型值得先跑？",
    receives: "π₀.₅ 代表系统和统一比较字段",
    contributes: "候选模型 gate、baseline/primary/stretch 三层清单",
    bridge: "选型只有经过真实数据审计、适配和同协议 rollout 才能成立。",
  },
  "data-and-adaptation": {
    role: "教材主线",
    question: "怎样证明数据可学、适配可复现，而且评测没有泄漏？",
    receives: "ACT/VLA 候选、统一 action contract 和冻结任务定义",
    contributes: "dataset revision、ACT 对照、适配 checkpoint 与失败树",
    bridge: "有了冻结 baseline 和可审计数据，后训练才可能产生可归因的改进。",
  },
  "post-training": {
    role: "工程项目",
    question: "何时应继续 SFT、收纠错数据或承担 offline/online RL 风险？",
    receives: "冻结评测、base policy、失败分类和 intervention 日志",
    contributes: "方法选择 gate、reward card、回归集与回退方案",
    bridge: "后训练改进策略本身；下一章讨论是否还要显式预测未来并做规划。",
  },
  "world-models": {
    role: "专题索引",
    question: "VLA 提议动作后，世界模型怎样预测结果并避免被优化器利用？",
    receives: "可采样策略、候选动作块和冻结 cost 定义",
    contributes: "policy/dynamics/value 边界、候选重排和不确定性回退",
    bridge: "模型机制齐备后，剩余问题转向延迟、服务故障和独立安全。",
  },
  "frontier-and-deployment": {
    role: "工程项目",
    question: "怎样把模型输出变成可计时、可拒绝、可降级的策略服务？",
    receives: "统一策略接口、候选生成头和失败分类",
    contributes: "p99 延迟预算、服务 schema、故障注入与安全边界",
    bridge: "通用部署合同通过后，再把它具体化到 Thor 双臂移动机器人。",
  },
  "mobile-dual-arm-pi-deployment": {
    role: "工程项目",
    question: "怎样把 π₀.₅ 接到双臂、腰部和底盘，同时保持可审计与可回退？",
    receives: "通用策略服务、硬件清单和独立安全要求",
    contributes: "whole-body contract、Thor benchmark、灰度执行与数据闭环",
    bridge: "最后用毕业项目把数据、baseline、VLA、评测和复现材料统一交付。",
  },
  capstone: {
    role: "工程项目",
    question: "怎样证明另一位工程师能够复现你的完整 VLA 系统？",
    receives: "贯穿课程累计的合同、数据、模型、日志和安全门禁",
    contributes: "可复现工程包、同协议对照、失败复盘与最终报告",
    bridge: "课程在可复现交付处结束；新模型只能作为同协议替换项继续迭代。",
  },
};

export function getCourseContext(slug: string) {
  const index = courseSequence.indexOf(slug as CourseSlug);
  if (index < 0) return null;
  const currentSlug = courseSequence[index];
  return {
    item: courseSpine[currentSlug],
    previousSlug: courseSequence[index - 1],
    nextSlug: courseSequence[index + 1],
  };
}
