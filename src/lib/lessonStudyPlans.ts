export type LessonStudyPlan = {
  objectives: string[];
  timePlan: { duration: string; title: string; activity: string; deliverable: string }[];
};

export const lessonStudyPlans: Record<string, LessonStudyPlan> = {
  "control-to-vla": {
    objectives: ["画出 VLA 到机器人电机之间的完整闭环", "区分动作、策略查询和伺服三种频率", "判断哪些功能必须由确定性控制与安全层承担"],
    timePlan: [
      { duration: "35 min", title: "建立系统边界", activity: "读正文并重画观测、策略、动作适配、安全层和伺服控制器。", deliverable: "一张五层闭环图" },
      { duration: "35 min", title: "核对时间语义", activity: "为 action、policy、servo 三条链标出频率、延迟和单位。", deliverable: "带频率的接口表" },
      { duration: "50 min", title: "运行并破坏执行器", activity: "运行 chunked controller，再制造 horizon、过期动作和限幅错误。", deliverable: "三条失败日志" },
      { duration: "30 min", title: "合页复述", activity: "不看页面回答自测并说明 VLA 为什么不是 MPC。", deliverable: "三分钟口述或一页笔记" },
    ],
  },
  history: {
    objectives: ["说清 RT-1、RT-2、Open X-Embodiment 到现代 VLA 的关键转折", "按数据、动作表示和泛化证据比较模型", "区分论文事实、演示效果和个人推断"],
    timePlan: [
      { duration: "30 min", title: "建立问题时间线", activity: "沿任务规模、语义迁移和跨本体三个轴阅读发展史。", deliverable: "一条问题—方法时间线" },
      { duration: "45 min", title: "比较四类代表模型", activity: "只读取站内摘要与模型图，填写输入、输出、数据和局限。", deliverable: "四行比较表" },
      { duration: "25 min", title: "做证据审计", activity: "为每个能力声明标注论文实验、公开视频或推断。", deliverable: "证据等级标注" },
      { duration: "20 min", title: "合页复述", activity: "合上页面，按问题而不是模型名复述。", deliverable: "一次录音或讲稿" },
    ],
  },
  "behavior-cloning": {
    objectives: ["从最大似然推到常见 MSE 损失并说明成立条件", "解释 covariate shift 为什么只在闭环暴露", "亲手训练、干预并诊断一个语言条件 BC 策略"],
    timePlan: [
      { duration: "45 min", title: "读懂数据与目标", activity: "逐项检查 observation、language、action 的 shape、时间戳和 episode 切分。", deliverable: "一张训练样本解剖图" },
      { duration: "55 min", title: "慢推损失函数", activity: "从条件似然推到高斯 NLL 和 MSE，并分析多峰平均。", deliverable: "完整手推一遍" },
      { duration: "80 min", title: "完成最小实验", activity: "运行训练，观察 loss，再置换语言、遮挡视觉并保存重载。", deliverable: "实验输出与四项检查" },
      { duration: "40 min", title: "制造闭环失败", activity: "注入初始偏差，比较纯 BC、恢复数据和 DAgger 思路。", deliverable: "失败轨迹与原因" },
    ],
  },
  "multimodal-transformer": {
    objectives: ["把图像、语言、本体和动作画成 token 序列", "手算一次 scaled dot-product attention", "设计不会泄漏未来动作的 attention mask"],
    timePlan: [
      { duration: "60 min", title: "拆解多模态输入", activity: "跟踪每种模态从原始值到 embedding 的 shape。", deliverable: "token/shape 表" },
      { duration: "75 min", title: "手推注意力", activity: "用小矩阵计算 QKᵀ、缩放、mask、softmax 和输出。", deliverable: "一页数值计算" },
      { duration: "90 min", title: "实现两种 mask", activity: "比较 causal token 与双向 action suffix，并画 attention map。", deliverable: "两张 mask 与热力图" },
      { duration: "75 min", title: "读模型图并验收", activity: "从 OpenVLA/π₀ 结构图反推序列协议和训练目标。", deliverable: "一份结构还原表" },
    ],
  },
  "action-representations": {
    objectives: ["为机器人写出完整 action contract", "解释离散 token、FAST 和连续 head 的取舍", "发现坐标系、单位、dt 与常量维错误"],
    timePlan: [
      { duration: "60 min", title: "定义动作语义", activity: "选择 joint/EEF、absolute/delta、frame、rotation、unit 和 dt。", deliverable: "action contract v1" },
      { duration: "75 min", title: "手推量化", activity: "计算分位数、bin 边界、编码误差和常量维处理。", deliverable: "一个可逆编码例子" },
      { duration: "90 min", title: "运行 tokenizer", activity: "执行编码—解码、越界、常量维和保存统计量测试。", deliverable: "round-trip 报告" },
      { duration: "75 min", title: "做表示选型", activity: "按频率、精度、序列长度和算力比较三类表示。", deliverable: "选型决策表" },
    ],
  },
  "action-chunking": {
    objectives: ["区分预测 horizon 与执行 horizon", "计算同步/异步策略的延迟预算", "实现过期丢弃、限幅和安全停止"],
    timePlan: [
      { duration: "50 min", title: "理解 chunk 与闭环", activity: "画出预测、排队、执行、重观测的时间线。", deliverable: "带时间戳的执行图" },
      { duration: "50 min", title: "计算延迟预算", activity: "把推理、网络和控制 p99 放进剩余动作覆盖时间。", deliverable: "一张预算表" },
      { duration: "80 min", title: "实现动作队列", activity: "加入 TTL、watchdog、限幅和新旧 chunk 切换。", deliverable: "可运行队列" },
      { duration: "60 min", title: "注入故障", activity: "分别注入 0–300ms 延迟、丢包和过期 chunk。", deliverable: "三类故障结果" },
    ],
  },
  "diffusion-policy": {
    objectives: ["区分机器人时间与 diffusion step", "推导加噪和噪声预测目标", "观察单峰 MSE 与多峰生成策略的行为差异"],
    timePlan: [
      { duration: "75 min", title: "补概率基础", activity: "复习高斯噪声、条件分布和多峰动作的含义。", deliverable: "概念卡片" },
      { duration: "90 min", title: "慢推训练目标", activity: "从 A⁰ 到 Aᵏ，逐项核对 schedule、shape 和条件。", deliverable: "完整推导" },
      { duration: "120 min", title: "二维多峰实验", activity: "训练 MSE 与 diffusion，采样并画 100 条轨迹。", deliverable: "对比图和 seed" },
      { duration: "75 min", title: "采样与部署分析", activity: "改变步数、horizon 和 receding horizon，比较质量和延迟。", deliverable: "质量—延迟表" },
    ],
  },
  "flow-matching": {
    objectives: ["写出从噪声到动作的路径与速度场", "识别正时间和反时间两套等价 convention", "实现一个符号方向有单元测试的一维 flow"],
    timePlan: [
      { duration: "60 min", title: "理解 ODE 视角", activity: "从插值路径求解析速度并解释条件速度场。", deliverable: "一页路径推导" },
      { duration: "60 min", title: "核对两套 convention", activity: "比较论文与 openpi 的时间方向、目标速度和积分步长。", deliverable: "符号对照表" },
      { duration: "120 min", title: "训练一维条件 flow", activity: "运行脚本、画轨迹并故意翻转速度符号。", deliverable: "正确/错误轨迹" },
      { duration: "60 min", title: "比较 diffusion", activity: "从目标、solver、采样步数和部署延迟做对比。", deliverable: "四轴比较表" },
    ],
  },
  pi05: {
    objectives: ["解释 π₀.₅ 相对 π₀ 的数据与训练机制变化", "区分高层语言推理和连续动作生成", "理解 openpi 可复现范围与硬件边界"],
    timePlan: [
      { duration: "90 min 核心", title: "拆解两阶段训练", activity: "沿 web/VLM、FAST 动作预训练和 flow 动作后训练阅读。", deliverable: "训练流程图" },
      { duration: "60 min 核心", title: "理解知识隔离", activity: "分析语义知识保留与机器人适配之间的冲突。", deliverable: "机制说明" },
      { duration: "60 min 选做", title: "核对 openpi 配置", activity: "检查数据转换、norm stats、policy config 和内存要求。", deliverable: "运行前检查表" },
      { duration: "150 min 选做", title: "云端推理或微调", activity: "完成 random-observation inference；有资源时跑 LIBERO rollout。", deliverable: "日志、版本和 rollout 结果" },
    ],
  },
  "data-and-adaptation": {
    objectives: ["把采集数据转换成无泄漏的 episode 数据集", "选择全量微调、LoRA、OFT 或 HIL 数据闭环", "建立能解释真实失败的 rollout 评测"],
    timePlan: [
      { duration: "120 min", title: "数据审计", activity: "检查时间戳、episode、相机、action contract、split 和统计量。", deliverable: "数据卡" },
      { duration: "120 min", title: "训练适配", activity: "跑 smoke test、过拟合小集、正式训练和 checkpoint 恢复。", deliverable: "训练实验卡" },
      { duration: "120 min", title: "rollout 评测", activity: "定义成功、分层 split、样本数、置信区间和失败标签。", deliverable: "评测协议" },
      { duration: "120 min", title: "闭环修复", activity: "根据失败层选择补数据、改接口、调模型或 HIL/RL。", deliverable: "一次修复前后对比" },
    ],
  },
  "vla-families": {
    objectives: ["按动作生成范式而不是模型名建立谱系", "根据真实约束筛掉不合适模型", "从官方资料区分已发布能力与宣传"],
    timePlan: [
      { duration: "45 min", title: "建立架构谱系", activity: "按自回归 token、diffusion/flow expert 和轻量策略分类。", deliverable: "一张谱系图" },
      { duration: "50 min", title: "填写模型卡", activity: "记录输入、动作、数据、参数、代码、许可证与硬件。", deliverable: "五张模型卡" },
      { duration: "55 min", title: "约束驱动选型", activity: "给定数据、显存、频率、精度和部署平台逐项淘汰。", deliverable: "候选 shortlist" },
      { duration: "30 min", title: "做反方论证", activity: "解释为什么最热门或最大模型可能不是最佳基线。", deliverable: "一页选型建议" },
    ],
  },
  "world-models": {
    objectives: ["区分 policy、dynamics model、reward/value model", "解释世界模型与 VLA 的五种组合方式", "发现模型预测 OOD 与规划器钻漏洞问题"],
    timePlan: [
      { duration: "75 min", title: "补动力学建模", activity: "从 p(oₜ₊₁|oₜ,aₜ) 理解预测对象和不确定性。", deliverable: "变量关系图" },
      { duration: "75 min", title: "比较五种组合", activity: "逐项分析预测、筛选、规划、训练信号和联合模型。", deliverable: "组合矩阵" },
      { duration: "90 min", title: "候选动作筛选实验", activity: "仅在 VLA 候选集内用 learned score 选择动作，并制造 OOD 候选。", deliverable: "安全/失效对比" },
      { duration: "60 min", title: "设计长任务系统", activity: "为一个多阶段操作选择反应、预测和重规划接口。", deliverable: "系统设计图" },
    ],
  },
  "frontier-and-deployment": {
    objectives: ["用问题—改进—证据—缺陷框架读前沿工作", "构造可降级的实时策略服务", "把安全约束放在模型之外独立验证"],
    timePlan: [
      { duration: "100 min", title: "前沿矩阵", activity: "比较 RTC、推理时计算、3D/触觉和人类视频。", deliverable: "证据矩阵" },
      { duration: "100 min", title: "实时接口设计", activity: "定义 schema、时间戳、p99、TTL、watchdog 和 fallback。", deliverable: "接口协议" },
      { duration: "120 min", title: "策略服务实验", activity: "部署 mock server/client，注入延迟、断连和错误 shape。", deliverable: "故障注入日志" },
      { duration: "100 min", title: "安全灰度方案", activity: "设计离线回放、shadow、限速、人工接管和回滚。", deliverable: "上线检查表" },
    ],
  },
  capstone: {
    objectives: ["从任务定义到部署交付一个可复现系统", "用 ACT baseline 判断 VLA 是否真的带来收益", "用分层 rollout 和失败归因支持结论"],
    timePlan: [
      { duration: "6 h", title: "任务与数据", activity: "冻结任务、动作契约、采集/转换、split、安全边界和数据卡。", deliverable: "数据与任务规范" },
      { duration: "8 h", title: "基线与 VLA", activity: "训练 ACT baseline、首个 VLA 和至少三项消融。", deliverable: "可恢复 checkpoint" },
      { duration: "6 h", title: "评测与修复", activity: "跨场景、语言和扰动 rollout，做失败分类并修复一次。", deliverable: "前后对比报告" },
      { duration: "5 h+", title: "部署与交付", activity: "加入安全 sandwich、日志、视频、一键 smoke/eval 和复现说明。", deliverable: "完整交付包" },
    ],
  },
};
