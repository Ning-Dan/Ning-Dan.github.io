export type LessonDetail = {
  lead: string;
  theory: string[];
  formula: {
    latex: string;
    symbols: { symbol: string; meaning: string }[];
    note?: string;
  };
  practice: {
    title: string;
    summary: string;
    steps: string[];
    acceptance: string[];
    status: "已验证" | "配方核验" | "云端必做";
    code?: string;
  };
  pitfalls: string[];
  review: string[];
  completion: string;
  sources: { title: string; url: string; role: string }[];
  visual?: "pipeline" | "history" | "action" | "pi05" | "world" | "latency";
};

export const lessonContent: Record<string, LessonDetail> = {
  "control-to-vla": {
    lead: "VLA 是低频、语义条件化的动作策略，不是高频伺服控制器。先把系统边界画对，再谈模型。",
    theory: [
      "经典状态反馈写成 uₜ=κ(xₜ)。VLA 则由图像、语言和本体状态条件化，一次生成未来 H 步动作。它可以像 MPC 一样滚动执行：预测一段、只执行前 E 步、重新观测；但本教程前半部分讨论的端到端 BC 型 VLA 通常没有显式动力学与在线代价优化，而是从示范分布中学习。",
      "工程上让 VLA 输出末端增量、关节位置参考、gripper 命令或技能子目标。必须分清三种频率：动作块内命令采样率 f_action=1/Δt_c，模型查询/重规划频率 f_policy 受推理延迟与执行 horizon 约束，IK/OSC/关节或力矩伺服频率 f_servo 通常最高。反归一化、坐标系变换、碰撞、限速与高频跟踪属于下游确定性系统。",
    ],
    formula: {
      latex: String.raw`\mathbf A_t=[\mathbf a_t,\ldots,\mathbf a_{t+H-1}]\sim\pi_\theta(\cdot\mid\mathbf I_{t-K+1:t},\mathbf q_t,\ell)`,
      symbols: [
        { symbol: "Aₜ", meaning: "从机器人时间 t 开始的动作块，shape 为 H×dₐ。" }, { symbol: "aₜ", meaning: "单步动作；必须声明类型、坐标系和单位。" },
        { symbol: "H", meaning: "预测动作数量；物理覆盖时间为 HΔt_c。" }, { symbol: "πθ", meaning: "参数为 θ 的条件策略或生成过程。" },
        { symbol: "Iₜ₋K₊₁:ₜ", meaning: "最近 K 步的一路或多路相机图像。" }, { symbol: "qₜ", meaning: "关节、夹爪等本体状态。" },
        { symbol: "ℓ", meaning: "自然语言任务指令。" }, { symbol: "Δt_c", meaning: "动作采样周期，不是网络推理时间。" },
      ],
    },
    practice: { title: "滚动动作块执行器", summary: "用一维机器人验证 horizon、execution horizon、限幅与重规划。", steps: ["运行纯 Python 样例", "制造非法 horizon", "记录每次重规划状态"], acceptance: ["状态单调接近目标", "非法参数被拒绝", "无 NaN/Inf"], status: "已验证", code: "python3 public/labs/chunked_controller.py" },
    pitfalls: ["把低频 VLA 输出直接当 torque", "delta pose 未声明 base/tool frame", "预测 H 步就开环执行 H 步", "只看平均延迟"],
    review: ["VLA 与 MPC 都用滚动时域，为什么不是同一种方法？", "VLA 到电机之间至少需要哪三层？", "模型输出 twist 时必须声明哪些信息？"],
    completion: "画出 VLA、动作适配、安全/轨迹层、经典控制器与机器人五层闭环，并标出频率。",
    sources: [{ title: "Robot Learning: A Tutorial", url: "https://arxiv.org/abs/2510.12403", role: "课程结构" }, { title: "MIT Underactuated", url: "https://underactuated.csail.mit.edu/", role: "控制参照" }], visual: "pipeline",
  },

  history: {
    lead: "VLA 的诞生不是因为传统控制失效，而是机器人需要在开放视觉场景里理解‘做什么’，并把互联网语义接到‘怎么动’。",
    theory: [
      "早期行为克隆和 ACT/Diffusion Policy 多为单机器人、窄任务。RT-1 证明大规模多任务 Transformer 可复用机器人技能；RT-2 的关键转折是把预训练 VLM 与动作共同表示，让网页语义知识影响动作选择。Open X-Embodiment 又把 100 万级、跨 22 种机器人的轨迹混合，推动 generalist policy。",
      "Octo、OpenVLA、π₀/π₀.₅、SmolVLA、GR00T 分别推进开放通用策略、开源、连续高频动作、开放世界泛化、轻量化和人形机器人。但瓶颈仍是：真实数据贵、跨本体语义不统一、语义到毫米级动作有鸿沟、长任务误差累积、大模型慢、评测薄弱、安全无保证。",
    ],
    formula: {
      latex: String.raw`\mathcal D_{\rm robot}=\bigcup_{e=1}^{E}\{\mathbf I,\mathbf q,\ell,\mathbf A;\,\mathcal C_e,\Delta t_e\}`,
      symbols: [
        { symbol: "Drobot", meaning: "跨机器人训练混合，不是简单拼文件。" }, { symbol: "e,E", meaning: "embodiment/数据源索引及总数。" },
        { symbol: "I,q,ℓ,A", meaning: "图像、本体状态、语言与动作块。" }, { symbol: "Cₑ", meaning: "动作契约：命令类型、frame、单位、维度、统计量与逆变换。" },
        { symbol: "Δtₑ", meaning: "该数据源控制周期；决定 delta 与 velocity 的物理含义。" },
      ], note: "工程定义式：跨 embodiment 数据必须携带动作契约和时间语义。",
    },
    practice: { title: "问题—改进时间线", summary: "为 RT-2、OpenVLA、π₀.₅ 建立输入、动作表示、数据、证据与缺陷矩阵。", steps: ["读官方摘要和模型图", "写清基线问题", "区分实验事实与推断", "附原始来源"], acceptance: ["不把 ACT 称为 VLA", "不说所有 VLA 都用动作 token", "每项有证据"], status: "配方核验" },
    pitfalls: ["把所有视觉策略回溯命名为 VLA", "模型更大等同能力更强", "demo 视频代替受控评测", "忽略数据泄漏"],
    review: ["RT-2 相对 RT-1 的范式变化是什么？", "Open X-Embodiment 为什么重要？", "更强 VLM 为什么不必然更精细？"],
    completion: "十分钟讲清诞生背景、关键转折和七类瓶颈，而不是背模型名。",
    sources: [{ title: "RT-2", url: "https://robotics-transformer2.github.io/", role: "VLM→VLA 转折" }, { title: "Open X-Embodiment", url: "https://robotics-transformer-x.github.io/", role: "跨本体数据" }, { title: "OpenVLA", url: "https://openvla.github.io/", role: "开源" }, { title: "π₀.₅", url: "https://www.pi.website/blog/pi05", role: "开放世界" }], visual: "history",
  },

  "behavior-cloning": {
    lead: "Behavior Cloning 是大多数 VLA 的训练底座：把演示当监督数据，但部署必须面对训练分布外的自身状态。",
    theory: ["BC 最大化专家动作的条件似然。固定方差单峰高斯下，NLL 才退化为 MSE；同一观测有左右两条正确路径时，MSE 可能平均出碰撞轨迹。", "训练只见专家状态。闭环时一次小误差改变未来观测，形成 covariate shift 与 compounding error；数据重采集、DAgger/HIL 和恢复数据用于缓解。"],
    formula: { latex: String.raw`\mathcal L_{\rm BC}(\theta)=-\frac1{|\mathcal D|}\sum_{(\mathbf o,\ell,\mathbf a)\in\mathcal D}\log\pi_\theta(\mathbf a\mid\mathbf o,\ell)`, symbols: [
      { symbol: "LBC", meaning: "行为克隆负对数似然。" }, { symbol: "θ", meaning: "策略参数。" }, { symbol: "D", meaning: "专家训练集；测试轨迹不可混入。" },
      { symbol: "o", meaning: "图像历史和本体状态。" }, { symbol: "ℓ", meaning: "语言条件。" }, { symbol: "a", meaning: "严格时间对齐的专家动作/动作块。" }, { symbol: "πθ", meaning: "策略条件概率密度/质量。" },
    ] },
    practice: { title: "Toy-VLA 三重验收", summary: "两色目标数据：图像+语言+8D state→H×7 动作块。", steps: ["32 样本过拟合", "打乱语言", "遮挡图像", "保存/重载"], acceptance: ["loss 下降>80%", "打乱条件后明显变差", "shape/finite 正确", "重载输出一致"], status: "配方核验" },
    pitfalls: ["loss 下降当闭环成功", "图像动作错一帧", "按 frame 拆分数据", "没有 zero-action baseline"],
    review: ["何种假设下 NLL 等价 MSE？", "covariate shift 为何在闭环显现？", "语言置换验证什么？"], completion: "推导 NLL→MSE，并区分‘代码运行’与‘条件真的被使用’。",
    sources: [{ title: "DAgger", url: "https://proceedings.mlr.press/v15/ross11a.html", role: "分布偏移" }, { title: "MIT Imitation Learning", url: "https://underactuated.mit.edu/imitation.html", role: "理论" }],
  },

  "multimodal-transformer": {
    lead: "VLA 的核心不是把数据拼起来，而是定义 token、位置、模态身份和允许的信息流。",
    theory: ["图像经视觉编码器成为 patch，语言经 tokenizer，本体状态经投影，动作既可为离散词表 token，也可为连续 action slots。它们投影到共同隐藏维后交互。", "VLM 为 VLA 提供视觉语义和语言先验，但不会自动获得毫米级控制能力。常见做法是保留预训练视觉编码器与语言模型，通过 projector、action head 或 action expert 把语义特征接到机器人数据；冻结、部分微调或全量微调决定保留语义与适配动作之间的取舍。", "Mask 决定 causal、prefix-LM 或 action suffix 内双向通信。OpenVLA 是自回归离散动作；π₀ 连续 action suffix 使用双向注意力，不能画成同一结构。"],
    formula: { latex: String.raw`\operatorname{Attn}(\mathbf Q,\mathbf K,\mathbf V)=\operatorname{softmax}\!\left(\frac{\mathbf Q\mathbf K^\top}{\sqrt{d_k}}+\mathbf M\right)\mathbf V`, symbols: [
      { symbol: "Q", meaning: "query，由 token 乘 WQ 得到。" }, { symbol: "K", meaning: "key，决定匹配。" }, { symbol: "V", meaning: "value，被权重汇聚。" },
      { symbol: "dₖ", meaning: "key/query 特征维；缩放避免点积过大。" }, { symbol: "M", meaning: "允许处 0、禁止处 −∞ 的 mask。" }, { symbol: "softmax", meaning: "沿 key 维归一化。" },
    ] },
    practice: { title: "从零实现 Attention", summary: "手写投影、scaled dot product、mask 和 softmax。", steps: ["构造四模态 token", "实现两种 mask", "画 attention map", "检查无未来泄漏"], acceptance: ["shape 对齐", "mask 概率<1e-6", "梯度 finite"], status: "配方核验" },
    pitfalls: ["token 序列位置当物理时间", "泄露未来动作", "忽略相机身份", "action slots 强套语言 causal mask"],
    review: ["为何除以√dₖ？", "连续 action slot 与动作 token 区别？", "为何相机顺序是模型协议？"], completion: "从模型图还原 token 排列和 mask，并找出标签泄露。",
    sources: [{ title: "Transformer", url: "https://arxiv.org/abs/1706.03762", role: "注意力" }, { title: "OpenVLA", url: "https://arxiv.org/abs/2406.09246", role: "离散动作" }, { title: "π₀", url: "https://arxiv.org/abs/2410.24164", role: "连续 suffix" }],
  },

  "action-representations": {
    lead: "动作表示决定模型学到的是几何、速度还是数据集习惯；frame/unit 错误比网络结构更容易让机器人失败。",
    theory: ["离散 bin 训练简单但有量化误差；FAST 对高采样率、长 action chunk 沿时间做 DCT，再量化并用 BPE 得到紧凑 token 序列，不等于低通滤掉高频动作；diffusion/flow 则直接生成连续动作。", "跨 embodiment 时 padding 到同维数不等于语义统一。每个机器人必须定义 command type、frame、rotation、unit、dt、gripper、valid mask、统计量与逆变换。训练分位数跨度过小的维度必须显式标为 constant/inactive 并保存固定解码值，不能让量化公式除零或用 ε 静默放大噪声。"],
    formula: { latex: String.raw`b_j=\operatorname{clip}\!\left(\left\lfloor\frac{\operatorname{clip}(a_j,l_j,u_j)-l_j}{(u_j-l_j)/B}\right\rfloor,0,B-1\right)`, symbols: [
      { symbol: "aⱼ", meaning: "第 j 维连续动作。" }, { symbol: "lⱼ,uⱼ", meaning: "仅从训练集计算的分位数范围。" }, { symbol: "B", meaning: "bin 数；需 B+1 个边界。" },
      { symbol: "bⱼ", meaning: "0…B−1 的离散索引。" }, { symbol: "clip", meaning: "裁剪 outlier；此时误差不受半 bin 宽限制。" }, { symbol: "⌊·⌋", meaning: "向下取整，定义区间语义。" },
    ], note: "量化公式只适用于 uⱼ−lⱼ 大于阈值的 active 维；常量维应由 action contract 单独记录 fixed value 与 valid mask。" },
    practice: { title: "量化 round-trip", summary: "实现 7D 逐维 q01/q99 量化、中心解码和越界统计。", steps: ["训练 split 算统计", "encode/decode", "测试边界与 NaN", "记录 frame/unit"], acceptance: ["未裁剪误差≤半 bin", "索引不越界", "测试集无泄漏", "metadata 完整"], status: "配方核验" },
    pitfalls: ["mm/m 混用", "spatial/body delta 混用", "velocity↔delta 忘记 dt", "padding 与真实零不可分", "常量维 q01=q99 导致除零"],
    review: ["为什么 B 个 bin 需要 B+1 边界？", "FAST 为何适合高频 chunk？", "归一化为何不等于 canonicalization？"], completion: "定义可逆、带 frame/unit/mask/版本的 action contract。",
    sources: [{ title: "OpenVLA", url: "https://arxiv.org/abs/2406.09246", role: "动作量化" }, { title: "FAST", url: "https://www.pi.website/research/fast", role: "动作压缩" }, { title: "RT-X", url: "https://robotics-transformer-x.github.io/", role: "跨本体" }], visual: "action",
  },

  "action-chunking": {
    lead: "Action chunking 把单步反应器变成短时域轨迹生成器；是否闭环取决于执行多少步后重观测。",
    theory: ["预测 H 步减少有效决策长度并利用时间相关性。执行 E≤H 步后重规划；E 小反应快但推理频繁，E 大吞吐高但更开环。", "异步部署时 chunk 必须绑定 observation_time 和 dt。新旧 chunk 简单平均可能在不同策略模式之间产生无效动作；位置连续也不等于速度/加速度连续。"],
    formula: { latex: String.raw`1\le E\le H,\quad T_{\rm refresh}^{\rm ideal}=E\Delta t_c,\quad T_{\rm chunk}=H\Delta t_c`, symbols: [
      { symbol: "E", meaning: "实际执行动作数。" }, { symbol: "H", meaning: "预测动作数。" }, { symbol: "Trefresh", meaning: "新 chunk 能按时到达、无推理阻塞时的理想观测刷新间隔。" }, { symbol: "Tchunk", meaning: "chunk 覆盖的物理时间。" }, { symbol: "Δt_c", meaning: "动作采样周期。" },
    ], note: "同步执行还要计入模型推理停顿；异步执行必须保证剩余队列覆盖推理、网络与安全余量的 p99 延迟。" },
    practice: { title: "延迟注入队列", summary: "注入 0–300ms 延迟，比较 E=1/2/8。", steps: ["记录绝对时间", "跳过过期前缀", "过期 chunk 丢弃", "统计 p99"], acceptance: ["无动作重放", "过期时 controlled stop", "经过限幅"], status: "已验证" },
    pitfalls: ["aₜ:ₜ₊H 闭区间歧义", "改 fps 不改 dt", "二值 gripper 直接平均", "新 chunk 从 0 执行"],
    review: ["H=50,E=5,20Hz 的反应间隔？", "多峰策略为何不宜平均？", "异步时间语义差在哪？"], completion: "实现带时间戳、过期检测、限幅和受控停止的 action queue。",
    sources: [{ title: "ACT", url: "https://arxiv.org/abs/2304.13705", role: "chunking" }, { title: "RTC", url: "https://www.pi.website/research/real_time_chunking", role: "异步连续性" }], visual: "latency",
  },

  "diffusion-policy": {
    lead: "Diffusion Policy 本身是视觉条件动作策略，并不等同于带语言接口的 VLA；它把动作块当条件生成对象，从噪声逐步去噪，表达同一观测下多个合理动作模式，也因此成为不少 VLA 连续动作头的重要基础。",
    theory: ["训练随机选择扩散步 k，把专家动作 A⁰ 加噪为 Aᵏ，让网络预测噪声。推理从高斯噪声开始按兼容 scheduler 还原；机器人时间 t 与扩散步 k 必须分开。", "相比单峰 MSE，它能保留多峰，但多步采样增加延迟。真正方法还包括视觉条件、时序网络和 receding-horizon control。"],
    formula: { latex: String.raw`\mathcal L_{\rm diff}=\mathbb E\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta(\sqrt{\bar\alpha_k}\mathbf A^0+\sqrt{1-\bar\alpha_k}\boldsymbol\epsilon,k,\mathbf o)\right\|_2^2`, symbols: [
      { symbol: "A⁰", meaning: "归一化专家动作块 H×dₐ。" }, { symbol: "k", meaning: "扩散步，不是机器人时间。" }, { symbol: "ᾱₖ", meaning: "累计信号保留比例。" },
      { symbol: "ε", meaning: "同 shape 高斯噪声。" }, { symbol: "εθ", meaning: "条件噪声预测网络。" }, { symbol: "o", meaning: "视觉、语言与状态条件。" },
    ] },
    practice: { title: "二维多峰动作", summary: "比较绕障碍的 MSE 平均轨迹和 diffusion 样本。", steps: ["生成左右数据", "训练 MLP", "训练 diffusion", "画 100 条轨迹"], acceptance: ["复现 MSE 碰撞", "出现双模式", "seed 可复现", "采样无 NaN"], status: "配方核验" },
    pitfalls: ["t/k 混用", "padding 未 mask", "全 horizon 开环执行", "能表达多峰=必然学好多峰"],
    review: ["ᾱₖ 表示什么？", "为何仍需 receding horizon？", "采样延迟由什么决定？"], completion: "写出加噪、loss 和成套反向采样。",
    sources: [{ title: "Diffusion Policy", url: "https://diffusion-policy.cs.columbia.edu/", role: "原论文与代码" }],
  },

  "flow-matching": {
    lead: "Flow matching 学习连续速度场，把噪声输运到动作；路径、目标速度和积分方向必须成套核对。",
    theory: ["本站与原始 π₀ 论文都采用 τ=0 噪声、τ=1 动作。线性路径 Xτ=(1−τ)ε+τA 的速度是 A−ε；推理从 ε 用正步长到 A。", "openpi 代码采用相反约定：t=1 噪声、t=0 动作，目标 ε−A 并用负 dt。两种 convention 等价，但速度符号和积分步长必须成对翻转；论文的高斯记号可能让人混淆第二参数是标准差还是协方差，显式采样式则无歧义。"],
    formula: { latex: String.raw`\mathbf X^\tau=(1-\tau)\boldsymbol\epsilon+\tau\mathbf A,\quad\mathcal L_{\rm FM}=\mathbb E\|\mathbf v_\theta(\mathbf X^\tau,\tau,\mathbf o)-(\mathbf A-\boldsymbol\epsilon)\|_2^2`, symbols: [
      { symbol: "τ", meaning: "生成时间，0 噪声→1 数据。" }, { symbol: "Xτ", meaning: "中间动作块。" }, { symbol: "ε", meaning: "高斯噪声。" }, { symbol: "A", meaning: "专家动作块。" },
      { symbol: "vθ", meaning: "条件速度场。" }, { symbol: "A−ε", meaning: "路径解析导数。" }, { symbol: "o", meaning: "多模态条件。" },
    ], note: "q(Xτ|A)=N(τA,(1−τ)²I)，协方差有平方。" },
    practice: { title: "Flow sign 单测", summary: "ε=−1,A=2；正确速度 3，10 个 Euler 步到 2。", steps: ["正时间约定", "openpi 反时间约定", "比较终点", "故意翻符号"], acceptance: ["终点误差<1e-6", "错误符号被抓", "τ 与机器人 t 分名"], status: "已验证" },
    pitfalls: ["改速度不改积分方向", "协方差漏平方", "action slots 称语言 token", "部署统计不一致"],
    review: ["为何导数 A−ε？", "openpi 的 ε−A 为何仍正确？", "flow 与 diffusion 采样差异？"], completion: "用数值测试证明 flow 方向，解释论文/代码 convention。",
    sources: [{ title: "Flow Matching", url: "https://arxiv.org/abs/2210.02747", role: "速度场" }, { title: "π₀", url: "https://arxiv.org/abs/2410.24164", role: "action expert" }, { title: "openpi pi0.py", url: "https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py", role: "实现" }],
  },

  pi05: {
    lead: "π₀.₅ 不是简单换 backbone：它把高层语言子任务与低层连续动作放进同一模型，面向未见家庭环境的开放世界泛化。",
    theory: ["π₀ 用 VLM prefix + flow action expert 生成连续动作。π₀.₅ 的显式层级推理先输出文字子任务，如‘拿起枕头’，再据此生成 50 步、约 1 秒低层动作；离散语义路径和连续动作路径共享模型。", "训练机制同样关键：原始 π₀.₅ 先利用 FAST 动作 token、跨本体机器人数据、视觉语言与高层语义任务建立表示，再在任务相关移动操作数据上用 flow matching 学连续动作并学习 semantic action。后续 Knowledge Insulation 进一步联合 FAST 离散目标与连续 flow 目标，并阻断 action expert 梯度对 VLM backbone 的干扰。", "这种 co-training 尽量保留互联网语义知识，但开放世界实验强调新环境泛化，不等于任意新机器人零样本可用。当前 openpi 公开实现只支持 π₀.₅ 的 flow-matching head，不能声称完整复现论文的高层语义路径与完整训练配方。"],
    formula: { latex: String.raw`p_\theta(\mathbf A_t,\hat\ell_t\mid\mathbf o_t,\ell)=p_\theta(\hat\ell_t\mid\mathbf o_t,\ell)\;p_\theta(\mathbf A_t\mid\mathbf o_t,\hat\ell_t)`, symbols: [
      { symbol: "ℓ", meaning: "用户整体任务，如‘整理卧室’。" }, { symbol: "ℓ̂ₜ", meaning: "模型在时刻 t 生成的文字子任务，如‘拿起枕头’。" }, { symbol: "oₜ", meaning: "当前多相机观测与本体状态。" },
      { symbol: "Aₜ", meaning: "低层连续动作块；π 系列通常 H=50。" }, { symbol: "pθ(ℓ̂ₜ|·)", meaning: "离散自回归高层语义策略。" }, { symbol: "pθ(Aₜ|·)", meaning: "以子任务为条件的 flow action policy。" }, { symbol: "θ", meaning: "共享模型参数；高低层不是 GPT 外接另一个 policy。" },
    ], note: "这是显式层级推理分解，不是完整训练目标。π₀.₅ 仍不是世界模型：它没有必须预测执行候选动作后的未来状态。" },
    practice: { title: "openpi π₀.₅ / LIBERO", summary: "数据转换→norm stats→pi05_libero→policy server→Dockerized LIBERO eval。", steps: ["使用官方支持的 Ubuntu 22.04 云机或 Docker", "random-observation inference", "核对 norm/action shape", "云端微调", "policy server + 多次 rollout"], acceptance: ["H×dₐ finite", "训练推理同统计", "超时不重放旧 chunk", "记录版本/seed/GPU", "报告成功率与样本数"], status: "云端必做", code: "uv run scripts/compute_norm_stats.py --config-name pi05_libero\nXLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run scripts/train.py pi05_libero --exp-name=course_run --overwrite" },
    pitfalls: ["宣称新机器人零样本万能", "忽略官方边界：推理>8GB、LoRA>22.5GB、全量>70GB", "把 Windows/WSL2 当官方已验证平台", "混装 JAX/Isaac 环境", "只看高层文字不看动作成功"],
    review: ["π₀.₅ 两条输出路径如何配合？", "co-training 为何保持语义？", "环境泛化与 embodiment 泛化区别？"], completion: "准确说明 π₀→π₀.₅ 的改进、证据和限制，并接通官方 server/client。",
    sources: [{ title: "π₀.₅ project", url: "https://www.pi.website/blog/pi05", role: "官方说明" }, { title: "openpi", url: "https://github.com/Physical-Intelligence/openpi", role: "公开实现" }, { title: "π₀.₅ paper", url: "https://arxiv.org/abs/2504.16054", role: "论文" }], visual: "pi05",
  },

  "data-and-adaptation": {
    lead: "VLA 最常见失败不是公式，而是帧对齐、动作语义、归一化和评测泄漏。",
    theory: ["数据必须含 episode、时间戳、多相机、本体、语言、动作与动作契约。按 episode/场景切分；统计只用训练集。先 replay 和一批过拟合，再大训练。", "LoRA 只减少可训练权重，不消除激活显存，也不自动适配新 action dimension。OFT 以连续 action、chunk、并行解码和 L1 提升 OpenVLA 的速度与性能，但仍需目标域数据和 rollout。", "后训练不只等于监督微调：还可以加入人类接管与纠错数据、偏好/奖励模型、在线或离线强化学习来修复特定失败。无论采用哪种方法，都必须与纯 BC baseline 使用相同观测、动作、安全过滤和 rollout 协议，才能判断提升来自算法还是数据与系统差异。"],
    formula: { latex: String.raw`\mathbf y=\mathbf W_0\mathbf x+\frac\alpha r\mathbf B\mathbf A\mathbf x,\quad\#\rm trainable=r(d_{\rm in}+d_{\rm out})`, symbols: [
      { symbol: "W₀", meaning: "冻结预训练权重。" }, { symbol: "A,B", meaning: "LoRA 降/升维矩阵。" }, { symbol: "r", meaning: "低秩 rank。" }, { symbol: "α", meaning: "更新尺度。" }, { symbol: "x,y", meaning: "层输入/输出。" }, { symbol: "#trainable", meaning: "不含激活显存。" },
    ] },
    practice: { title: "数据门禁 + ACT", summary: "隔离环境核 schema，先训练 ACT baseline。", steps: ["锁版本/revision", "看 20 episodes", "norm round-trip", "ACT 200 steps", "reload/rollout"], acceptance: ["时序对齐", "round-trip 通过", "loss finite", "同协议比较 VLA"], status: "配方核验" },
    pitfalls: ["教程追 main", "按 frame 拆分", "LoRA 后 head shape 错", "用 val loss 替代 rollout"],
    review: ["LoRA 为何仍 OOM？", "为何先 ACT？", "loss 正常、rollout 0% 先查什么？"], completion: "交付含版本、数据 revision、seed、显存和协议的实验卡。",
    sources: [{ title: "LeRobot", url: "https://github.com/huggingface/lerobot", role: "数据/策略" }, { title: "OpenVLA-OFT", url: "https://openvla-oft.github.io/", role: "优化微调" }, { title: "LoRA", url: "https://openreview.net/forum?id=nZeVKeeFYf9", role: "低秩适配" }],
  },

  "vla-families": {
    lead: "选 VLA 不是追参数量，而是在动作精度、数据、显存、频率、开放度和部署成熟度间取舍。",
    theory: ["不要按模型名背谱系，而要先按动作生成方式分类：OpenVLA/π₀-FAST 属于离散自回归路线，OFT、π₀/π₀.₅、SmolVLA、GR00T 属于连续 action head/expert 路线；再比较 VLM 接法、相机数量、跨本体机制、数据格式与异步部署。", "SmolVLA 与 LeRobot 紧密，适合首个可跑 VLA；Octo 强调开放通用策略；X-VLA 用 domain/soft prompt 处理机器人与相机异质性；π₀.₅ 强调开放世界泛化；GR00T N1.7 面向人形与部署全栈，但仍是 Early Access，稳定性与支持边界必须单列。", "同任务先做 ACT/Diffusion baseline。窄任务上小策略可能更快更稳；VLA 优势主要是语义与迁移，不应预设一定赢。"],
    formula: { latex: String.raw`S(m)=w_dD_m+w_aA_m+w_rR_m+w_cC_m+w_oO_m,\quad\sum_iw_i=1`, symbols: [
      { symbol: "S(m)", meaning: "项目适配评分，不是论文指标。" }, { symbol: "Dₘ", meaning: "数据/embodiment 兼容。" }, { symbol: "Aₘ", meaning: "动作精度/频率适配。" }, { symbol: "Rₘ", meaning: "算力可行性。" }, { symbol: "Cₘ", meaning: "工程成熟度。" }, { symbol: "Oₘ", meaning: "开放程度。" }, { symbol: "wᵢ", meaning: "项目权重，总和 1。" },
    ] },
    practice: { title: "模型决策表", summary: "ACT、SmolVLA、OFT、π₀.₅、GR00T 约束选型。", steps: ["定义频率/精度", "列数据/显存", "核 release", "baseline+stretch"], acceptance: ["baseline 本地可跑", "云端有预算", "无不稳定 4bit 承诺", "环境隔离"], status: "配方核验" },
    pitfalls: ["8GB 跑 OpenVLA BF16", "混 N1.5/N1.7", "MiniVLA 当稳定部署", "忽略网络抖动"],
    review: ["为何 SmolVLA 适合第一款？", "离散自回归与连续 action expert 的主要工程差异？", "X-VLA 的 domain prompt 在解决什么异质性？", "ACT 何时更合适？"], completion: "用约束和证据选模型。",
    sources: [{ title: "SmolVLA", url: "https://huggingface.co/docs/lerobot/smolvla", role: "轻量" }, { title: "OFT", url: "https://openvla-oft.github.io/", role: "连续动作" }, { title: "X-VLA", url: "https://huggingface.co/docs/lerobot/xvla", role: "跨本体" }, { title: "GR00T", url: "https://github.com/NVIDIA/Isaac-GR00T", role: "人形" }, { title: "Octo", url: "https://octo-models.github.io/", role: "通用策略" }],
  },

  "world-models": {
    lead: "VLA 回答‘现在做什么’，世界模型回答‘做了以后会怎样’；二者可组合，也可联合学习。",
    theory: ["VLA 学 π(A|o,ℓ)，主要输出动作；世界模型学 p(zₜ₊₁|zₜ,aₜ)，预测未来状态/观测/奖励。可用于 imagined rollout、候选评估、规划、数据生成和异常检测。", "组合从松到紧：VLA proposer+world evaluator；world model/MPC 规划子目标、VLA 执行；共享 backbone 双头；联合预测未来与动作。π₀.₅ 的语言子任务是层级推理，不等于世界模型，因为不必预测动作后的未来状态。"],
    formula: { latex: String.raw`\hat{\mathbf A}=\arg\min_{\mathbf A\in\mathcal C_\theta(\mathbf o_t,\ell)}\;\mathbb E_{p_\phi(\mathbf z_{t+1:t+H}\mid\mathbf z_t,\mathbf A)}\left[\sum_{h=1}^{H}c(\mathbf z_{t+h},\ell)\right]`, symbols: [
      { symbol: "Â", meaning: "世界模型评估后选出的动作块。" }, { symbol: "Cθ", meaning: "由 VLA 在当前观测与语言下采样得到的有限候选集，避免任意优化钻世界模型 OOD 漏洞。" }, { symbol: "A", meaning: "候选动作块。" }, { symbol: "pφ", meaning: "未来潜状态分布。" }, { symbol: "zₜ", meaning: "当前潜状态。" }, { symbol: "H", meaning: "imagined horizon。" }, { symbol: "c(z,ℓ)", meaning: "语言目标代价。" }, { symbol: "E", meaning: "对随机未来取期望。" },
    ] },
    practice: { title: "VLA 候选 + 世界模型", summary: "二维导航采样 64 个 chunks，dynamics rollout 后重排。", steps: ["训练 one-step model", "测多步误差", "采样候选", "打分滚动执行"], acceptance: ["单/多步误差分报", "与不筛选对比", "ensemble 不确定性", "OOD 回退"], status: "配方核验" },
    pitfalls: ["视频生成器都叫控制 world model", "π₀.₅ 文字子任务=未来预测", "只看像素质量", "模型自生成数据自证"],
    review: ["两类模型输出什么？", "四种组合方式？", "model bias 为何随 horizon 累积？"], completion: "画出 proposer+evaluator+MPC 闭环并设计不确定性回退。",
    sources: [{ title: "World Models", url: "https://arxiv.org/abs/1803.10122", role: "概念" }, { title: "DreamerV3", url: "https://arxiv.org/abs/2301.04104", role: "imagined rollout" }, { title: "π₀.₅", url: "https://www.pi.website/blog/pi05", role: "层级对照" }], visual: "world",
  },

  "frontier-and-deployment": {
    lead: "前沿不是模型名清单：每项都要回答旧系统卡在哪里、改了什么、证据是什么、代价和缺陷是什么。",
    theory: ["OFT/连续 head 改善动作精度与并行解码；RTC 固定已执行前缀并 inpaint 新 chunk；FAST 用 DCT+BPE 压缩动作；3D/触觉增加几何/接触可观测性；人类视频与仿真缓解机器人数据稀缺；世界模型/推理时规划面向长任务。", "部署时这些增益必须经过延迟、抖动、过期动作、frame、限幅、碰撞、watchdog 和接管。模型置信度不能替代功能安全。"],
    formula: { latex: String.raw`N_{\rm reserve}\ge\left\lceil\frac{L_{\rm infer,p99}+L_{\rm net,p99}+L_{\rm margin}}{\Delta t_c}\right\rceil`, symbols: [
      { symbol: "Nreserve", meaning: "请求下一 chunk 时最少剩余动作。" }, { symbol: "Linfer,p99", meaning: "推理延迟 99 分位。" }, { symbol: "Lnet,p99", meaning: "网络延迟 99 分位。" }, { symbol: "Lmargin", meaning: "抖动/安全余量。" }, { symbol: "Δt_c", meaning: "动作周期。" }, { symbol: "⌈·⌉", meaning: "向上取整。" },
    ] },
    practice: { title: "策略服务 + 安全 sandwich", summary: "独立 GPU 生成 EEF delta，客户端过期处理、限幅、IK/OSC/MPC。", steps: ["versioned schema", "测 p99", "TTL/watchdog", "注入抖动", "接管"], acceptance: ["协议不符拒绝", "p99 不下溢", "过期不执行", "安全层独立", "日志可重放"], status: "配方核验" },
    pitfalls: ["平均延迟定队列", "smoothing 当安全证明", "CBF=认证安全", "越界后沿用旧 chunk"],
    review: ["RTC 与 temporal ensemble 差异？", "FAST 与 OFT 各改哪里？", "为何置信度不替代急停？"], completion: "用问题—改进—证据—缺陷读论文，并实现 TTL/watchdog/回退。",
    sources: [{ title: "OFT", url: "https://openvla-oft.github.io/", role: "连续动作" }, { title: "FAST", url: "https://www.pi.website/research/fast", role: "压缩" }, { title: "RTC", url: "https://www.pi.website/research/real_time_chunking", role: "实时" }, { title: "GR00T N1.7", url: "https://github.com/NVIDIA/Isaac-GR00T", role: "部署" }], visual: "latency",
  },

  capstone: {
    lead: "毕业项目不是微调一次，而是交付任务、数据、baseline、VLA、评测与控制接口的可复现系统。",
    theory: ["推荐语言指定目标物并放入容器：LIBERO/Isaac Lab 3 场景、2 种语言改写和扰动；ACT 本地 baseline，SmolVLA 首个 VLA，π₀.₅/OFT 云端 stretch。", "必须报告感知、语言、抓取、越界、延迟与恢复失败；至少消融无语言、无 wrist camera、不同 action representation/execution horizon。"],
    formula: { latex: String.raw`\hat p=\frac1N\sum_{i=1}^{N}s_i,\qquad\operatorname{SE}(\hat p)=\sqrt{\frac{\hat p(1-\hat p)}N}`, symbols: [
      { symbol: "sᵢ", meaning: "第 i 次 rollout 成功为 1，否则 0。" }, { symbol: "N", meaning: "跨 seed/场景的独立 rollout 数。" }, { symbol: "p̂", meaning: "经验成功率。" }, { symbol: "SE", meaning: "二项近似标准误；N 小时用 Wilson 区间。" },
    ], note: "二项标准误要求 rollout 可近似独立同分布；跨场景、任务和 seed 时还应分层报告，并用 Wilson 区间或分层 bootstrap 表达不确定性。不要只报告 5/5。" },
    practice: { title: "最终交付包", summary: "数据卡、模型卡、配置、测试、视频、失败分类和部署接口。", steps: ["安全边界", "数据审计", "ACT", "VLA", "三项消融", "扰动评测", "真机灰度"], acceptance: ["一键 smoke/eval", "checkpoint 可恢复", "公布固定 seed 列表", "无越界碰撞", "失败可追溯"], status: "云端必做" },
    pitfalls: ["挑最好视频", "场景泄漏", "模型安全限幅不同", "无 baseline", "真机无接管"],
    review: ["为何成功率附样本数？", "三项消融回答什么？", "何时回到数据修复？"], completion: "另一位工程师能复现，并从日志定位失败层。",
    sources: [{ title: "LIBERO", url: "https://libero-project.github.io/main.html", role: "benchmark" }, { title: "LeRobot", url: "https://github.com/huggingface/lerobot", role: "工程底座" }, { title: "openpi", url: "https://github.com/Physical-Intelligence/openpi", role: "π₀.₅ stretch" }],
  },
};
