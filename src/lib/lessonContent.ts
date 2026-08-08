export type LessonDetail = {
  lead: string;
  objectives?: string[];
  timePlan?: {
    duration: string;
    title: string;
    activity: string;
    deliverable: string;
  }[];
  theory: string[];
  deepDive?: {
    title: string;
    paragraphs: string[];
    takeaways?: string[];
  }[];
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
    prerequisites?: string[];
    expected?: string[];
    debugging?: string[];
  };
  pitfalls: string[];
  review: string[];
  completion: string;
  sources: { title: string; url: string; role: string }[];
  visual?: "pipeline" | "history" | "action" | "pi05" | "world" | "latency";
};

export const lessonContent: Record<string, LessonDetail> = {
  "control-to-vla": {
    lead: "多数大模型 VLA 的策略查询频率通常低于高频伺服频率，但低频不是 VLA 的定义；动作采样、策略查询和伺服控制也可能各用不同频率。先把系统边界画对，再谈模型。",
    objectives: [
      "画出任务指令、VLA、动作适配/安全、轨迹/伺服和机器人本体的五层闭环。",
      "区分 POMDP 中隐藏状态、观测、历史/记忆和动作，解释为什么单张图像通常不是完整状态。",
      "说明 VLA 与 MPC 都可滚动执行，但训练方式、在线优化和约束责任不同。",
      "用 H、E、Δt、推理 p99 算出动作覆盖时间、重规划频率和最小队列余量。",
      "写出一个可版本化的策略服务接口，并通过脚本验证限幅、TTL、乱序拒绝与受控停止。",
    ],
    timePlan: [
      { duration: "0:00–0:30", title: "先画五层系统边界", activity: "从用户指令一路画到电机：VLA 只负责生成什么，下游必须检查和执行什么。", deliverable: "五层闭环图，逐层标出输入、输出和责任。" },
      { duration: "0:30–1:00", title: "从 MDP 到 POMDP", activity: "用遮挡抓取例子区分真实状态 sₜ、观测 oₜ、历史 hₜ 和动作 aₜ；判断需要多帧、状态估计还是记忆。", deliverable: "一张‘可观测/不可观测信息’清单。" },
      { duration: "1:00–1:30", title: "滚动闭环但不是 MPC", activity: "并排写 VLA 与 MPC 的输入、内部模型、训练/在线计算、约束和输出；标出二者可以怎样组合。", deliverable: "一张同字段 VLA–MPC 对比表。" },
      { duration: "1:30–2:00", title: "算三种频率与延迟", activity: "手算 20Hz 动作、H=16、E=4、140ms 推理 p99 与 1kHz 伺服案例；检查同步/异步队列是否下溢。", deliverable: "一页带单位的延迟预算。" },
      { duration: "2:00–2:30", title: "运行执行器并写接口", activity: "运行 chunked_controller；观察限幅、p99 余量、TTL、乱序和 NaN；随后补齐 request/response schema。", deliverable: "终端 PASS、一次故障记录和一份 action contract。" },
    ],
    theory: [
      "经典状态反馈可写成 uₜ=κ(xₜ)，假设控制器得到足够的状态。真实机器人更接近 POMDP：环境状态 sₜ 包含物体真实位姿、接触、摩擦等，摄像头和编码器只给观测 oₜ；遮挡或速度不可直接观测时，策略需要历史 hₜ=(oₜ₋K₊₁,…,oₜ)、状态估计或内部记忆。语言 ℓ 描述任务目标，但不会自动补齐几何和动力学状态。",
      "VLA 用图像、语言、本体状态等条件生成动作或动作块 Aₜ。它可以滚动执行：预测 H 步，只执行前 E≤H 步，再获取新观测。这样做减少开环时间，却不把 BC 型 VLA 变成 MPC：MPC 通常在在线阶段使用显式/学习动力学、代价和约束求解优化；BC 型 VLA 主要从演示分布离线学习条件策略。二者可以组合，例如 VLA 给子目标或候选轨迹，MPC/控制器负责可行化和跟踪。",
      "动作输出必须是完整契约，而不是一串浮点数。常见选择包括 EEF 位置/姿态增量、twist、关节位置/速度参考、gripper 命令或技能子目标。每一种都要声明 command_type、shape、frame、rotation convention、linear/angular unit、Δt、H、gripper 语义、valid mask、归一化 revision 与逆变换。把 base-frame delta 当成 tool-frame delta，即使数值很小也会系统性走错方向。",
      "必须分清三种频率：动作块内命令采样率 f_action=1/Δt_c；模型查询/重规划频率 f_policy 由 E、推理延迟和异步队列决定；IK/OSC/关节/力矩伺服频率 f_servo 通常最高。VLA 不应直接替代高频稳定化、限速、碰撞检测、工作空间约束和电机保护。一个 20Hz 动作参考可以由 1kHz 伺服在 50 个内部周期里跟踪。",
      "策略服务还需要时间协议。request 至少携带 schema_version、request_id、observation_time、camera_names、joint_order、instruction 和模型/统计 revision；response 携带生成依据的 observation_time、action_dt、frame/unit、动作块、created_time 与有效期。客户端必须拒绝 schema 不符、NaN/Inf、乱序和过期结果，跳过已经属于过去的动作前缀，并在没有新动作时进入定义明确的 controlled stop。",
    ],
    deepDive: [
      {
        title: "证据边界：哪些结论已经验证",
        paragraphs: [
          "【已确认】POMDP 对状态、观测与动作的区分，滚动时域只执行部分预测，以及动作采样/策略查询/伺服三频率的数学关系都可由定义核对。本地 chunked_controller 已实际运行，默认输出 p99=220ms、reserve=5，并通过限幅、TTL、乱序和 NaN 断言。",
          "【合理推测】真实 VLA 系统也会因 frame/unit、时间戳、队列下溢和过期动作失败，因为这些是接口与时序约束；但具体阈值不能由一维脚本推断。",
          "【个人观点】先画系统边界再学模型、用 2.5 小时完成本章，是面向工程实践的教学顺序，不是行业统一标准。",
          "【暂无法验证】脚本没有真实相机、动力学、IK、碰撞或网络进程，也没有证明受控保持在所有机器人上都安全。真实 stop 行为必须由机器人厂商接口、风险分析和受控测试决定。",
        ],
      },
      {
        title: "1. 五层闭环：每一层只承担自己的责任【必须掌握】",
        paragraphs: [
          "第一层是任务/语言：用户给目标和约束。第二层是 VLA：把多模态观测变成短时域动作候选。第三层是 action adapter＋safety：反归一化、frame 变换、限幅、工作空间/碰撞检查、TTL 与接管。第四层是轨迹与经典控制：IK、trajectory generation、OSC/MPC、关节/力矩伺服。第五层是机器人与传感器，产生下一轮观测。",
          "边界不是说 VLA 永远不能输出关节或 torque，而是越靠近执行器，数据契约、实时性、稳定性和安全验证越严格。若模型直接给 torque，下游仍必须有硬实时保护和独立急停；神经网络的置信度不是稳定性或功能安全证明。",
        ],
        takeaways: ["VLA 输出是候选命令，不是安全许可。", "反归一化与 frame 变换属于执行协议。", "安全层必须独立于模型成功率。"],
      },
      {
        title: "2. POMDP 与历史：为什么一张图通常不够【概念已确认】",
        paragraphs: [
          "MDP 假设状态 sₜ 足以决定未来；POMDP 中只能得到 oₜ∼O(o|sₜ)。例如单张 RGB 图可能看不到遮挡后的物体、接触力和速度方向；本体 qₜ 也未必包含夹爪实际接触。策略可用 K 帧历史、递归状态、显式滤波或外部世界状态近似 belief bₜ=P(sₜ|hₜ)。",
          "增加历史并非越多越好：K 增大会增加显存与延迟，且多相机/状态时间不齐会制造伪运动。先列出任务决策真正需要的隐藏变量，再决定用传感器、估计器还是模型记忆补足。",
        ],
        takeaways: ["观测不等于状态。", "历史长度对应物理时间 KΔt，不只是 token 数。", "缺少接触信息不能靠语言补齐。"],
      },
      {
        title: "3. VLA 与 MPC：相似的是执行外形，不是学习原理【必须掌握】",
        paragraphs: [
          "二者都可采用 receding horizon：在当前信息下预测/规划一段，只执行前缀，再重算。不同点在内部：典型 MPC 在线优化 min Σc(x,a)，显式使用动力学和约束；典型 BC-VLA 离线拟合 πθ(A|o,ℓ)，在线主要做前向生成。MPC 的可行性也依赖模型和求解器，VLA 的泛化也依赖数据，不能把任一方描述成天然安全。",
          "常见组合有三种：VLA 输出语义子目标，MPC 到达；VLA 采样多个 action chunks，由动力学/约束筛选；VLA 给参考轨迹，经典控制器跟踪。组合时必须统一 state/action frame、时间离散和约束语义。",
        ],
        takeaways: ["滚动执行不等于 MPC。", "是否在线显式优化动力学/代价是关键区分。", "组合前先统一接口和时间。"],
      },
      {
        title: "4. 数值例：20Hz 动作、5Hz 重规划、1kHz 伺服【必须手算】",
        paragraphs: [
          "设 Δt_c=50ms，则 f_action=20Hz。H=16 覆盖 0.8s；每次执行 E=4 步，理想重观测间隔 EΔt_c=0.2s，即 f_policy=5Hz。若伺服为 1kHz，每个动作参考之间有 50 个伺服 tick。这里的 5Hz 只在新 chunk 能按时返回时成立。",
          "若只掌握分组件统计，可把推理 p99=140ms、网络 p99=30ms、安全余量=30ms 相加成 200ms 的保守工程启发式，于是至少预留 ceil(200/50)=4 个动作；它不是端到端 p99 的统计恒等式。部署时应优先在同一请求边界实测 end-to-end p99，并更早发请求或缩短推理。",
        ],
        takeaways: ["所有延迟都先换成同一单位。", "用 p99 而非平均值决定队列。", "H 决定覆盖，E 决定理想反应间隔。"],
      },
      {
        title: "5. 策略接口的最小字段【工程建议】",
        paragraphs: [
          "请求示例字段：schema_version、request_id、observation_time、camera_names/每帧时间、joint_names 与 q、instruction、requested_horizon、checkpoint_id、normalization_revision。响应示例字段：对应 request_id/observation_time、command_type、frame、units、rotation convention、action_dt、actions:[H,dₐ]、valid mask、server_created_time。",
          "客户端验证顺序建议为：版本与 shape→finite→时间/乱序→frame/unit→反归一化→速度/加速度/工作空间/碰撞→执行。日志要保留原始请求、原始响应、裁剪后动作、拒绝原因和实际执行时间，才能区分模型错、协议错和控制错。",
        ],
        takeaways: ["协议字段要版本化。", "原始动作与安全处理后动作都要记录。", "任何拒绝都必须落到确定的 fallback。"],
      },
      {
        title: "6. 现有一维脚本验证什么【实验边界】",
        paragraphs: [
          "脚本用时间戳 action chunk、延迟网络和 SafeExecutor 模拟一维位置参考。默认延迟样本的最近秩 p99 为 220ms，加 30ms 余量、50ms/action 得 reserve=5；动作被 max_step=0.08 限幅，超过 180ms TTL 后保持当前位置，并拒绝旧 observation_time 与 NaN。",
          "它适合验证控制流和断言，不模拟连续动力学、速度/加速度、真实网络时钟漂移或安全停机。把 hold position 当 controlled stop 只是一维教学选择；重力臂、移动底盘和力控任务可能需要不同 stop policy。",
        ],
        takeaways: ["先让 toy 断言抓协议错误。", "受控停止行为依机器人而定。", "脚本 PASS 不等于真实系统安全。"],
      },
    ],
    formula: {
      latex: String.raw`\mathbf A_t=[\mathbf a_t,\ldots,\mathbf a_{t+H-1}]\sim\pi_\theta(\cdot\mid\mathbf I_{t-K+1:t},\mathbf q_t,\ell)`,
      symbols: [
        { symbol: "Aₜ", meaning: "从机器人时间 t 开始的动作块，shape 为 H×dₐ。" }, { symbol: "aₜ", meaning: "单步动作；必须声明类型、坐标系和单位。" },
        { symbol: "H", meaning: "预测动作数量；物理覆盖时间为 HΔt_c。" }, { symbol: "πθ", meaning: "参数为 θ 的条件策略或生成过程。" },
        { symbol: "Iₜ₋K₊₁:ₜ", meaning: "最近 K 步的一路或多路相机图像。" }, { symbol: "qₜ", meaning: "关节、夹爪等本体状态。" },
        { symbol: "ℓ", meaning: "自然语言任务指令。" }, { symbol: "Δt_c", meaning: "动作采样周期，不是网络推理时间。" },
      ],
      note: "这是条件策略的动作块采样式，不是 MPC 优化目标，也未表达下游 frame 变换、约束和伺服。实际接口必须额外携带 action contract 与时间戳。",
    },
    practice: {
      title: "时间戳动作队列与受控停止",
      summary: "一维 SafeExecutor 注入 10–220ms 延迟，计算 p99 reserve，并验证 max-step 限幅、TTL、乱序拒绝和 NaN 门禁。",
      steps: ["运行默认脚本并读懂 p99/reserve 计算", "核对前三次状态为何每次只增加 0.08", "确认 180ms TTL 后保持 0.24 而不重放旧动作", "追踪较新 chunk 接受、较旧响应拒绝的 observation_time", "故意把一个 target 改为 NaN 或缩短 TTL，让断言捕获故障", "恢复脚本并为真实机器人写出不同的 controlled-stop 策略"],
      acceptance: ["输出 ALL CHECKS PASSED", "p99=220ms 且 reserve=5 actions", "limited states 为 [0.08,0.16,0.24]", "过期时保持最后位置且旧响应被拒绝", "能解释该实验没有证明真实机器人安全"],
      status: "已验证",
      code: "python public/labs/chunked_controller.py",
      prerequisites: ["Python 3.10+ 标准库", "知道 H、E、Δt、observation_time 与 request_id 的含义"],
      expected: ["第一行打印 latency p99=220 ms 与 reserve=5", "随后打印限幅状态、controlled-stop hold 和 stale reject 计数", "最后两行显示时间/TTL/NaN PASS 与 ALL CHECKS PASSED"],
      debugging: ["若 reserve 不为 5，检查 percentile 是否用最近秩及延迟单位是否为秒", "若状态跳得过大，检查 target-position 的 delta 是否在执行前限幅", "若旧 chunk 被接受，检查 observation_time 是否严格大于 latest_observation_time", "若过期后仍执行，检查 TTL 是相对生成所依据的 observation_time，而不是到达时间"],
    },
    pitfalls: ["把低频 VLA 输出直接当 torque", "delta pose 未声明 base/tool frame", "预测 H 步就开环执行 H 步", "只看平均延迟", "把 observation_time、server time 和 action time 混用", "过期后沿用旧 chunk", "把 hold position 当所有机器人的安全停止"],
    review: ["POMDP 中 state、observation、history/belief 分别是什么？", "VLA 与 MPC 都用滚动时域，为什么不是同一种方法？", "20Hz、H=16、E=4 分别对应多长覆盖和理想重规划频率？", "模型输出 twist 时必须声明哪些 action contract 字段？", "为什么策略服务 PASS 仍不能替代独立安全层？"],
    completion: "画出 VLA、动作适配、安全/轨迹层、经典控制器与机器人五层闭环，并标出频率。",
    sources: [{ title: "Robot Learning: A Tutorial", url: "https://arxiv.org/abs/2510.12403", role: "课程结构" }, { title: "MIT Underactuated", url: "https://underactuated.csail.mit.edu/", role: "控制参照" }], visual: "pipeline",
  },

  history: {
    lead: "学习 VLA 历史不是背模型发布日期，而是追踪问题怎样变化：先学会复现示范动作，再扩展到多任务和跨机器人，随后把互联网视觉语言知识接入动作，最后挑战开放环境与长任务。本章建议 2 小时，产出一张‘问题—改进—证据—未解决瓶颈’地图。",
    objectives: ["解释 BC、ACT、Diffusion Policy 为 VLA 提供了哪些动作学习基础，同时不把它们回溯命名为 VLA。", "按‘待解决问题’串联 RT-1、RT-2、Open X-Embodiment、Octo/OpenVLA 与连续动作 VLA。", "对每个代表模型只记录输入、动作输出、数据、实验主张和仍未解决项。", "区分论文实验、项目页演示、公开代码能力与自己的推断。", "总结至今仍存在的数据、跨本体、精细控制、长时程、延迟、评测和安全瓶颈。"],
    timePlan: [
      { duration: "0:00–0:25", title: "问题一：怎样学动作", activity: "比较单步 BC、action chunking 与生成式连续策略解决的低层问题。", deliverable: "三行基础能力表。" },
      { duration: "0:25–0:55", title: "问题二：怎样扩展任务", activity: "阅读 RT-1/RT-2 官方模型图，找出多任务与 VLM 接入的差异。", deliverable: "RT-1→RT-2 问题演化图。" },
      { duration: "0:55–1:20", title: "问题三：怎样跨机器人", activity: "检查 Open X-Embodiment、Octo/OpenVLA 的数据与动作统一方式。", deliverable: "数据规模之外的 action-contract 风险清单。" },
      { duration: "1:20–1:40", title: "问题四：连续动作与开放环境", activity: "用官方来源核对 π 系列等路线解决什么、不解决什么。", deliverable: "连续动作/开放世界两列证据卡。" },
      { duration: "1:40–2:00", title: "证据审计与复述", activity: "给每条主张标证据级别，用十分钟口述主线。", deliverable: "一页时间线和七类未解瓶颈。" },
    ],
    theory: [
      "第一阶段解决‘怎样稳定学动作’。Behavior Cloning 把示范变成监督学习；ACT 用 action chunk 与 temporal ensembling 建模短时轨迹；Diffusion Policy 让连续动作分布可多峰。这些是后来 VLA 的动作学习基础，但仅有视觉条件动作、没有语言/视觉语言预训练接口时，不应为了叙事方便统称 VLA。",
      "第二阶段解决‘怎样扩展到很多任务并利用语义’。RT-1 展示多任务机器人 Transformer 路线；RT-2 把预训练 VLM 与动作共同表示，核心问题从识别任务 ID 转向让网页视觉语言知识参与机器人动作选择。官方实验支持论文设定中的能力主张，但不能据此推出任意场景、任意机器人都能泛化。",
      "第三阶段解决‘怎样共享跨机器人数据’。Open X-Embodiment 推动跨 embodiment 数据混合，Octo 等探索开放 generalist policy，OpenVLA 提供更可研究的开源 VLA 路线。真正难点不只是收集更多轨迹：不同机器人 action dimension、frame、unit、dt、gripper 和相机布局并不天然相同，padding 不能代替 canonicalization。",
      "第四阶段继续处理连续高频动作、轻量部署、开放环境和人形全身控制。不同工作分别改动作 token/continuous expert、训练数据、层级语义或工程栈，不应被压成一条‘模型越来越大所以越来越通用’的直线。模型报告的新能力必须和其数据、benchmark、hardware、release 边界一起阅读。",
      "七类瓶颈仍贯穿各代系统：真实机器人数据昂贵且偏斜；跨本体动作语义难统一；VLM 语义不自动变成毫米级控制；闭环误差随长任务累积；大模型延迟与算力限制控制频率；benchmark 容易受场景/语言泄漏和小样本影响；概率模型输出不提供功能安全保证。",
    ],
    deepDive: [
      { title: "证据边界", paragraphs: ["【官方可核对】RT-2、Open X-Embodiment、OpenVLA、π₀.₅ 的架构与实验主张可由本章原始论文/项目页检查。‘代表某一问题转折’是本教程对材料的组织方式，不是论文自带的唯一历史分期。", "【合理推测】跨本体数据越丰富通常能增加迁移机会，但是否提升某个新机器人取决于动作契约、数据覆盖和评测。", "【个人观点】2 小时、按问题而非年份学习，以及只保留代表模型，是避免历史章灌水的教学选择。", "【暂无法验证】本站未复现实验，不能把论文报告成功率、演示视频或公开 checkpoint 的存在写成本站已验证能力。"] },
      { title: "四次问题演化，而不是模型名单", paragraphs: ["①从单步监督到短时动作块/多峰生成，处理精细连续控制；②从单任务到多任务 Transformer；③从机器人数据内部学习到接入预训练 VLM 与网页语义；④从单 embodiment 到跨本体、开放环境与层级长任务。一个模型可能同时推进多条线，因此时间线应允许并行分支。", "评估‘转折’至少回答：旧 baseline 卡在哪里；新方法具体改输入/输出/数据/目标中的哪一项；哪项实验支持；失败案例或支持边界是什么。答不出四问就先不写夸张结论。"], takeaways: ["能力变化绑定机制和证据。", "不以后来的术语覆盖早期方法。", "负结果与支持边界也是历史。"] },
      { title: "代表模型证据卡怎么写", paragraphs: ["RT-1 卡片关注多任务机器人 token policy；RT-2 卡片关注 VLM co-fine-tuning 与动作表示；Open X-Embodiment 卡片关注跨机器人数据与统一协议；OpenVLA 卡片关注开放权重/代码与离散动作；π 系列卡片关注连续 action expert、训练阶段和开放环境主张。", "每张卡只写六格：研究问题、输入、动作输出、训练数据类型、主要实验、未解决项。参数量、机器人数量、显存等动态或易错数字只有在引用具体版本与来源时才填。"] },
      { title: "证据审计四级", paragraphs: ["A 级：论文表格/方法或官方代码可直接核对；B 级：官方项目页演示或作者说明；C 级：基于 A/B 的合理机制推断；D 级：本站或个人实际复现。A/B 不是 D，demo 也不等于受控 benchmark。", "写作模板：‘论文在其设定中报告 X（A）；这可能意味着 Y（C）；本站尚未在 Z 上复现（非D）’。这样既保留信息，也避免把推断伪装成事实。"] },
    ],
    formula: {
      latex: String.raw`\mathcal D_{\rm robot}=\bigcup_{e=1}^{E}\{\mathbf I,\mathbf q,\ell,\mathbf A;\,\mathcal C_e,\Delta t_e\}`,
      symbols: [
        { symbol: "Drobot", meaning: "跨机器人训练混合，不是简单拼文件。" }, { symbol: "e,E", meaning: "embodiment/数据源索引及总数。" },
        { symbol: "I,q,ℓ,A", meaning: "图像、本体状态、语言与动作块。" }, { symbol: "Cₑ", meaning: "动作契约：命令类型、frame、单位、维度、统计量与逆变换。" },
        { symbol: "Δtₑ", meaning: "该数据源控制周期；决定 delta 与 velocity 的物理含义。" },
      ], note: "工程定义式：跨 embodiment 数据必须携带动作契约和时间语义。",
    },
    practice: { title: "问题—改进—证据—瓶颈矩阵", summary: "不训练模型；只用原始论文、项目页和官方仓库，为五个代表节点建立可审计时间线。", prerequisites: ["已完成 BC 与动作表示章节的概念阅读。", "准备表格列：问题/输入/输出/数据/证据/未解决项/来源日期。"], steps: ["先写四个问题阶段，不看模型名。", "把 ACT/Diffusion 放在动作基础分支，并写‘不是自动等于 VLA’。", "为 RT-1、RT-2、Open X-Embodiment、OpenVLA、π₀.₅ 各填六格证据卡。", "每条结论标 A/B/C/D；删掉没有原始来源的精确动态数字。", "任选一段 demo，找对应 benchmark/论文表格；若找不到，标‘演示证据’而非成功率。", "最后用十分钟口述：四次问题演化、五个代表节点、七类未解瓶颈。"], expected: ["产出一张不超过一页的主时间线和五张短证据卡。", "每个模型至少有一个原始来源和一个未解决项。", "事实、推断与本站未复现清晰分开，不出现‘证明任意泛化’。"], acceptance: ["不把 ACT/Diffusion Policy 回溯称为完整 VLA。", "准确说出 RT-2 相对 RT-1 的问题变化。", "解释跨 embodiment 数据为何需要 action contract。", "十分钟内讲清主线而不是背发布日期。"], debugging: ["表格越来越长：每模型只留六格，重复机制改为链接到核心章。", "找不到精确数字：删掉或注明版本/日期，不引用二手排行榜。", "项目页与论文表述不同：分别记录发布日期和证据类型，不自行合并。", "把 demo 当评测：检查任务数、seed、baseline、失败案例和是否同协议。"], status: "配方核验" },
    pitfalls: ["把所有视觉策略回溯命名为 VLA", "模型更大等同能力更强", "demo 视频代替受控评测", "忽略数据泄漏"],
    review: ["ACT/Diffusion 为后续 VLA 提供什么，又缺少什么？", "RT-2 相对 RT-1 的问题变化是什么？", "Open X-Embodiment 为什么重要又为什么不够？", "更强 VLM 为什么不必然带来更精细动作？", "A/B/C/D 四类证据如何避免把官方报告写成个人复现？"],
    completion: "交付一页可审计地图，并在十分钟内讲清四次问题演化、代表证据和七类瓶颈；不靠堆模型名或动态数字。",
    sources: [{ title: "RT-2", url: "https://robotics-transformer2.github.io/", role: "VLM→VLA 转折" }, { title: "Open X-Embodiment", url: "https://robotics-transformer-x.github.io/", role: "跨本体数据" }, { title: "OpenVLA", url: "https://openvla.github.io/", role: "开源" }, { title: "π₀.₅", url: "https://www.pi.website/blog/pi05", role: "开放世界" }], visual: "history",
  },

  "behavior-cloning": {
    lead: "Behavior Cloning（BC）不是“把一个公式丢给网络”。这一章从一条演示轨迹如何变成监督样本开始，完成损失函数推导、数据张量检查、开环训练、闭环失败复现和一次 DAgger 数据闭环。4 小时是本教程给出的个人学习节奏建议，不是论文结论；掌握程度以验收项为准。",
    objectives: [
      "把 episode 轨迹切成不泄漏未来信息的 (观测、语言、动作块) 样本，并写出每个张量的 shape 与时间含义。",
      "从最大似然推导连续动作 MSE 与离散动作交叉熵，说明各自隐含的动作分布假设。",
      "区分训练/验证损失、开环动作误差和闭环任务成功率，解释为什么三者可能方向不同。",
      "亲手复现 covariate shift，并用一次 DAgger 聚合恢复状态数据改善闭环表现。",
      "识别 MSE 对多峰动作求平均的问题，知道何时换离散 token、混合密度、Diffusion 或 Flow Matching。",
    ],
    timePlan: [
      { duration: "0:00–0:35", title: "从轨迹到监督样本", activity: "画时间轴，确定图像、本体状态、语言与动作 aₜ 或动作块 Aₜ 的对齐关系；手算 3 个样本。", deliverable: "一张带 shape、单位、frame、Δt 和 episode_id 的数据契约。" },
      { duration: "0:35–1:20", title: "慢推损失函数", activity: "从条件最大似然推到高斯 NLL，再在固定各向同性方差假设下化成 MSE；对比离散动作交叉熵。", deliverable: "一页推导，以及“何时不能用 MSE”的判断表。" },
      { duration: "1:20–2:05", title: "开环最小实验", activity: "运行 Toy BC，先做小数据过拟合，再做语言置换、输入遮挡、零动作 baseline 和重载一致性测试。", deliverable: "终端输出与一段结论：策略是否真的使用了每个条件。" },
      { duration: "2:05–2:50", title: "闭环与分布偏移", activity: "在一维动力学中 rollout；比较 expert-state MSE、闭环终点误差和成功率，观察误差如何改变后续状态。", deliverable: "BC 闭环失败日志，以及失败属于感知、策略还是控制的判断。" },
      { duration: "2:50–3:30", title: "做一次 DAgger", activity: "让当前策略访问状态、由专家重新标注，合并新旧数据再训练；比较聚合前后的越界率和成功率。", deliverable: "至少一轮 dataset aggregation 的前后对照。" },
      { duration: "3:30–4:00", title: "多峰动作与验收", activity: "观察同一状态下左右绕障动作被 MSE 平均成直行；为任务选择离散、混合密度或生成式动作头。", deliverable: "完成章末 5 问，并通过脚本全部断言。" },
    ],
    theory: [
      "一条演示 episode 可写成 τ={(oₜ,ℓ,aₜ)}ₜ₌₀ᵀ⁻¹。单步策略用 xₜ=(oₜ,ℓ) 预测 aₜ；动作块策略则用当前及过去观测预测 Aₜ=[aₜ,…,aₜ₊H₋₁]。图像、状态和动作必须共享同一物理时间语义：相机若在 t 时刻曝光，标签却取到 t+1 的动作，模型会学到系统延迟，而不是正确控制关系。训练/验证/测试必须按 episode 或场景拆分，不能随机拆 frame，否则相邻画面会泄漏。",
      "BC 把专家动作当标签，最大化 πθ(a|o,ℓ) 的条件似然。若策略输出连续均值 μθ，且假设 a|o,ℓ 服从固定方差、单峰高斯，最小化 NLL 才等价于 MSE；预测关节增量时还要先处理量纲差异和 valid mask。若把每个动作维量化为类别，则训练是交叉熵，但会引入量化误差和类别不平衡。",
      "监督学习指标只回答“在专家访问过的状态上能否复现专家动作”。闭环时，模型的小误差会把机器人带到专家数据没有覆盖的状态；下一步又在分布外预测，误差可能随时间累积。这就是 covariate shift。因而 validation loss 降低不等于 rollout 成功率提高，开环动作 MSE 也不能代替闭环任务评测。",
      "DAgger 的核心不是普通数据增强，而是让当前策略参与采样：用当前或混合策略 rollout，专家在这些实际访问状态上给出正确动作，把新样本聚合回数据集后再训练。实际机器人上常用安全员接管、纠错片段和恢复示范近似这一过程；每轮都应限制工作空间、速度和动作 TTL。",
      "同一个观测可能对应多个都正确的动作：绕障可向左也可向右，抓取可从不同角度接近。单峰 MSE 会学习条件均值；当两个模式对称时，均值可能恰好指向障碍。离散动作 token、mixture density、Diffusion Policy 和 Flow Matching 能表达多峰分布，但只有在数据、条件和评测协议正确时才有意义。",
    ],
    deepDive: [
      {
        title: "证据边界：哪些是事实，哪些只是建议",
        paragraphs: [
          "【已确认】BC 最大似然目标、高斯 NLL 在固定方差下化为 MSE，以及 DAgger 聚合策略访问状态，均可由本章列出的论文与公式核对。本地 Toy 脚本也已实际运行：默认配置下监督权重恢复为 [0.7,0.9,0.15]，闭环成功从 0/6 变为 6/6；这些数值只证明该玩具环境和当前脚本。",
          "【合理推测】真实 VLA 训练也会受到时间错位、episode 泄漏、条件未被使用和 covariate shift 影响，因为它同样从演示监督中学习；但不同机器人、数据集与策略的影响大小不能由 Toy 脚本外推。",
          "【个人观点】本章的四小时时间分配、先过拟合小数据再做 rollout 的排错顺序，是为了降低初学者认知负担的工程教学建议，可以根据基础快慢调整。",
          "【暂无法验证】本章没有在你的真实机器人或目标数据集上复现 DAgger、成功率提升或安全性。因此真实系统的提升幅度、采样成本和接管风险必须另做受控实验，不能引用 Toy 的 0/6→6/6。",
        ],
      },
      {
        title: "1. 先把数据张量和时间轴写清楚【原理已确认，shape 为示例】",
        paragraphs: [
          "假设 batch 大小 B=32、历史图像长度 K=2、两路 RGB 相机分辨率 224×224、状态维 dₛ=8、动作块长度 H=16、动作维 dₐ=7。常见张量为 images:[32,2,2,3,224,224]、state:[32,8]、language_tokens:[32,L]、actions:[32,16,7]、action_valid:[32,16,7]。这里第二、第三维分别代表时间和相机，不能只看元素总数。",
          "制作第 t 个样本时，输入最多只能包含 t 时刻已经可用的信息。动作块越过 episode 结尾时应 padding，并用 valid mask 排除损失；不要把 padding 的零动作当成专家真的静止。归一化统计只从训练 episodes 计算，且保存到 checkpoint 旁供部署反归一化。",
        ],
        takeaways: ["按 episode 切分，不按 frame 切分。", "每个轴都写名称、单位、frame、采样周期。", "padding 必须和真实零动作可区分。"],
      },
      {
        title: "2. 从最大似然慢推到 MSE【已确认】",
        paragraphs: [
          "BC 的一般形式是最小化专家数据上的负对数似然。令连续策略 πθ(a|x)=N(μθ(x),σ²I)，展开高斯 NLL 后得到 ||a−μθ(x)||²/(2σ²)+常数。只有 σ 固定、各维同方差且分布单峰时，删去常数和比例系数才得到普通 MSE。若各动作维尺度不同，未经归一化的 MSE 会让数值范围大的维度支配梯度。",
          "离散动作把 a 量化为类别 b，优化 −log pθ(b|x)，即交叉熵。它能输出多峰类别概率，却需要明确 bin 边界、解码规则和越界裁剪。动作块损失通常还要对时间、维度和 valid mask 求加权平均；求和与求平均会改变梯度尺度，应在日志里固定定义。",
        ],
        takeaways: ["MSE 是带假设的 NLL 特例，不是 BC 的定义。", "损失必须尊重 mask、尺度和动作语义。", "先问动作分布，再选 head 与 loss。"],
      },
      {
        title: "3. 为什么低 validation loss 仍会 rollout 失败【理论已确认】",
        paragraphs: [
          "训练集中的状态来自专家分布 dπ*，部署中的状态来自学习策略分布 dπθ。哪怕单步错误概率很小，错误动作也会改变下一个观测，使模型越来越偏离 dπ*。静态验证集仍来自专家轨迹，所以看不到这种反馈。",
          "正确的诊断顺序是：先证明小数据能过拟合；再用 episode-held-out 验证集查泛化；然后在仿真或安全环境里做闭环 rollout；最后按失败阶段统计。若连小数据都不能过拟合，先查 shape、时间对齐、归一化和梯度；不要急着收更多数据。",
        ],
        takeaways: ["开环误差与闭环成功率必须同时报告。", "恢复状态数据比重复收集完美成功轨迹更能补分布空洞。", "DAgger 改变的是训练状态分布。"],
      },
      {
        title: "4. 多峰动作：均值为什么可能是错的【数学事实已确认】",
        paragraphs: [
          "考虑障碍正前方的状态，专家数据一半向左 a=−1、一半向右 a=+1。MSE 的最优预测是条件均值 0，但直行恰好撞上障碍。这不是网络没学会，而是单峰回归目标把两个正确模式平均掉了。",
          "如果模式少且可离散化，可用动作 token 或 mixture density；若需要连续、长时域且模式复杂，可用 diffusion/flow。另一条常被忽略的路径是增加条件信息，例如历史、目标实例或高层子任务，让原本看似相同的观测变得可区分。",
        ],
        takeaways: ["先判断多峰来自真实歧义还是缺失条件。", "生成式动作头解决分布表达，不会自动解决 covariate shift。"],
      },
    ],
    formula: {
      latex: String.raw`\mathcal L_{\rm BC}(\theta)=-\mathbb E_{(\mathbf o,\ell,\mathbf a)\sim\mathcal D_E}\log\pi_\theta(\mathbf a\mid\mathbf o,\ell)\;\xrightarrow[\Sigma=\sigma^2\mathbf I\ {\rm fixed}]{\pi_\theta=\mathcal N(\mu_\theta,\Sigma)}\;\frac{1}{2\sigma^2}\mathbb E\|\mathbf a-\mu_\theta(\mathbf o,\ell)\|_2^2+C`,
      symbols: [
        { symbol: "D_E", meaning: "由专家策略采集的 episode 数据；验证和测试 episode 不可混入。" },
        { symbol: "o", meaning: "在决策时刻真实可用的图像历史与本体状态。" },
        { symbol: "ℓ", meaning: "语言任务条件；应通过置换实验检查它是否真被模型使用。" },
        { symbol: "a", meaning: "与观测时间对齐的专家动作或动作块，包含明确 frame、unit 与 Δt。" },
        { symbol: "πθ", meaning: "学习策略给出的条件概率密度或离散概率质量。" },
        { symbol: "μθ", meaning: "单峰高斯策略预测的条件均值。" },
        { symbol: "σ²I", meaning: "固定各向同性方差；正是它使 NLL 与未加权 MSE 只差比例和常数。" },
        { symbol: "C", meaning: "与 θ 无关的常数；若学习方差，C 不再包含全部额外项。" },
      ],
      note: "动作块时应把范数替换为带 action_valid mask 的加权损失。离散动作则直接优化交叉熵 −log pθ(b|o,ℓ)，不能再解释为连续空间 MSE。",
    },
    practice: {
      title: "四段式 Toy BC：过拟合 → 条件检查 → 闭环失败 → DAgger 修复",
      summary: "无需第三方 ML 库；脚本用可解释的线性策略演示监督训练、多峰平均、covariate shift 和一次数据聚合。先读预期输出，再逐段运行和修改。",
      prerequisites: [
        "Python 3.10+；无需 PyTorch、GPU 或下载数据。",
        "能解释 list、for 循环和均方误差；不要求提前学过优化器。",
        "先在纸上写出 visual、language、action 三列各代表什么，并预测语言取反后的 loss 会怎样。",
      ],
      steps: [
        "在项目根目录运行 python public/labs/toy_behavior_cloning.py；确认四个实验都打印 PASS。",
        "打开脚本阅读 make_supervised_data、train_linear_policy 和 rollout，沿数据流标注 observation→prediction→next_state。",
        "把训练样本从 96 改为 8 再运行，记录权重、训练 MSE 与 held-out MSE；解释小数据过拟合检查能排除哪些实现错误。",
        "把语言条件置换或置零，确认 MSE 明显变差；再尝试删掉 visual 特征，判断策略依赖了哪个条件。",
        "运行闭环实验，比较只在专家状态训练的 BC 与聚合恢复状态后的 DAgger 策略；记录成功率与最大偏差。",
        "运行多峰实验，确认同一观测下 −1/+1 标签的 MSE 解接近 0；说明为什么训练 loss 正常但动作危险。",
        "恢复脚本默认值，保留终端输出，并回答章末问题；不要只截最后一行 PASS。",
      ],
      expected: [
        "监督实验学到的权重接近 [0.7, 0.9, 0.15]，训练 MSE 接近 0；语言取反后 MSE 大幅上升。",
        "【本地脚本已确认】默认 Toy 配置中，BC 闭环成功率为 0/6，聚合恢复状态后的策略为 6/6；最大初始动作从约 0.96 降至约 0.56。该结果不可直接外推到真实机器人。",
        "多峰实验的单峰 MSE 预测接近 0，同时脚本指出两种专家动作都远离 0。",
        "保存/重载后的参数和同一输入输出完全一致，所有 finite/shape 断言通过。",
      ],
      acceptance: [
        "能逐步推导固定方差高斯 NLL→MSE，而不是只背最终公式。",
        "能写出训练样本的时间轴、shape、单位、frame、Δt 和 episode split。",
        "脚本四个实验全部 PASS，并保留关键数值而不只保留截图。",
        "能用自己的话解释为什么 held-out expert-state MSE 不能替代闭环 rollout。",
        "能针对多峰动作给出至少两种方案，并说明各自代价。",
      ],
      debugging: [
        "训练 loss 不降：先检查 target 是否与输入同一时刻、梯度符号、学习率和是否含 bias；再把数据缩到 8 条做过拟合。",
        "训练 loss 为 NaN/Inf：打印每列 min/max，检查归一化分母、空数据和过大学习率；不要用 clip 掩盖根因。",
        "语言置换后不变差：模型可能没用语言，或数据中 visual 已能唯一决定动作；构造 visual 相同而语言不同的成对样本。",
        "开环误差小但 rollout 失败：打印每一步 state、action、是否越出训练范围；检查动作 frame、符号、dt 和延迟，再判断是否 covariate shift。",
        "DAgger 没改善：确认新样本来自当前策略访问的状态、标签来自专家而非旧模型，并给恢复状态足够采样权重。",
        "多峰预测仍不是 0：检查左右样本是否平衡；不平衡数据的 MSE 最优解是频率加权均值。",
      ],
      status: "已验证",
      code: "python public/labs/toy_behavior_cloning.py",
    },
    pitfalls: [
      "把训练 loss 下降当成闭环成功；训练集只覆盖专家状态。",
      "图像、状态和动作错一帧，或忽略采集与执行延迟。",
      "按 frame 随机拆分数据，导致相邻帧跨 train/val 泄漏。",
      "只和专家动作比较，不做 zero-action、last-action 和简单控制器 baseline。",
      "对不同单位的动作维直接取平均 MSE，或把 padding 零当成真实标签。",
      "用更多成功演示重复覆盖已见状态，却不收集失败、恢复与接管数据。",
      "看到多峰平均问题就换 diffusion，却没有先补全历史、语言或目标身份等条件。",
    ],
    review: [
      "固定方差单峰高斯的 NLL 为什么等价于加权 MSE？若 σ 由网络学习，目标会多出什么？",
      "images:[32,2,2,3,224,224] 中两个长度为 2 的轴分别可能是什么？交换它们为什么可能不报 shape 错却语义错误？",
      "validation loss 来自专家状态，rollout 来自策略状态；这句话如何解释 covariate shift？",
      "DAgger 每一轮采集谁访问的状态、谁提供动作标签、为什么必须聚合旧数据？",
      "同一观测同时存在左绕和右绕时，MSE 最优解是什么？你会先补条件信息还是换生成式动作头？依据是什么？",
    ],
    completion: "不看答案完成 NLL→MSE 推导，运行并解释四段实验；能从数据时间轴、条件消融、闭环日志和多峰分布四个角度判断一个 BC 策略为什么失败。",
    sources: [
      { title: "DAgger", url: "https://proceedings.mlr.press/v15/ross11a.html", role: "分布偏移与数据聚合原始论文" },
      { title: "MIT Underactuated · Imitation Learning", url: "https://underactuated.mit.edu/imitation.html", role: "BC、状态分布与模仿学习理论" },
      { title: "A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning", url: "https://arxiv.org/abs/1011.0686", role: "DAgger 理论推导" },
    ],
  },

  "multimodal-transformer": {
    lead: "VLA 的核心不是把数据拼起来，而是定义 token、位置、模态身份和允许的信息流。",
    objectives: [
      "把图像、语言、本体状态和动作写成带名称的张量契约，而不是只说‘拼成 token’。",
      "从 Q、K、V 和缩放点积推到注意力输出，并逐维检查 shape。",
      "能画出 causal、prefix-causal 与 bidirectional action suffix 三种 mask，解释各自为何不泄漏。",
      "亲手改变未来动作标签，验证错误 mask 会让较早位置偷看答案。",
      "拿到 OpenVLA 或 π₀ 架构图时，指出视觉入口、语言主干、动作接口、训练目标和部署输出。",
    ],
    timePlan: [
      { duration: "0:00–0:35", title: "先写输入契约", activity: "为两路相机、语言、8D 本体状态和 H×7 动作块写 batch shape、时间范围、相机顺序与 valid mask。", deliverable: "一张不含匿名维度的 tensor contract。" },
      { duration: "0:35–1:25", title: "从模态到 token", activity: "比较 image patch、language token、state token、离散 action token 与连续 action slot；补上 position、camera 和 modality identity。", deliverable: "一张 token 序列图，并标出每类 token 的来源。" },
      { duration: "1:25–2:15", title: "慢推一次 Attention", activity: "手算 3 个二维 token 的 QKᵀ、除以 √dₖ、逐行 softmax 和加权求和，再检查矩阵 shape。", deliverable: "一页数值计算，不只抄最终公式。" },
      { duration: "2:15–3:05", title: "画三种信息流", activity: "分别画 autoregressive、prefix-causal 和 action-suffix mask，逐格回答 query 能否读取 key。", deliverable: "三张 0/1 mask 和一条防泄漏规则。" },
      { duration: "3:05–4:10", title: "未来泄漏实验", activity: "运行标准库脚本；修改未来 clean action label，观察 causal 输出不变而 unmasked 输出改变；再解释 suffix mask 的合法前提。", deliverable: "终端输出、一次主动破坏和修复记录。" },
      { duration: "4:10–5:00", title: "读真实架构并验收", activity: "对照 OpenVLA 与 π₀：找出 token/slot、mask、head/expert 和 loss 的差异，完成章末问题。", deliverable: "一张同字段架构对比表。" },
    ],
    theory: [
      "先区分物理时间与 token 位置。以 B 个样本、K 帧历史、C 路相机为例，原始图像可写成 [B,K,C,3,Hᵢ,Wᵢ]；视觉编码器把每张图变成 P 个 patch token，得到 [B,K·C·P,d]。语言得到 [B,L,d]，本体状态经 MLP/projector 得到一个或多个 [B,S,d] token。它们必须投影到共同隐藏维 d 才能进入同一 Transformer，但共享宽度不等于共享语义。",
      "每个 token 至少需要内容、序列位置和模态身份；多相机系统还需要稳定的 camera identity。若把 wrist/base 相机顺序交换却不更新身份，模型看到的不是普通数据增强，而是接口协议变化。物理时间也不能只靠序列下标猜测：不同相机曝光延迟、状态采样和动作标签要在数据层先对齐。",
      "单头注意力先用可学习矩阵得到 Q=XWQ、K=XWK、V=XWV。QKᵀ 的 shape 为 [B,Nq,Nk]；除以 √dₖ 是为了在维度增大时控制点积尺度，避免 softmax 过早饱和。mask M 加在 softmax 之前：允许位置加 0，禁止位置加负无穷，因此禁止位置的概率应数值上接近 0。多头注意力只是并行使用多组投影，再拼接回隐藏维。",
      "Mask 是训练协议。自回归动作 token 的第 i 个位置只能读条件 prefix 与更早动作 token，不能读取未来 clean label；prefix 内部可双向通信。π₀ 一类连续 action suffix 可以在 action slots 之间双向通信，因为输入 suffix 是带噪动作/潜变量而不是未来干净标签，训练目标是联合去噪或速度预测。若把 clean future actions 直接放入双向 suffix，仍然是泄漏。",
      "VLM 为 VLA 提供视觉语义与语言先验，但不会自动得到毫米级控制。常见接口包括 projector＋离散动作词表、连续 action head，以及带独立宽度/参数的 action expert。冻结 backbone 能节约训练量并保护语义，部分或全量微调能增强动作域适配但更吃显存，也可能遗忘；哪种更好必须由同数据、同 rollout 协议验证。",
    ],
    deepDive: [
      {
        title: "证据边界：本章能证明到哪里",
        paragraphs: [
          "【已确认】缩放点积注意力、mask 在 softmax 前屏蔽 key，以及自回归训练不能读取未来标签，都可由公式和原始 Transformer 定义核对。本章标准库脚本已实际运行：改变 action_1 后，prefix-causal 的 action_0 输出差为 0，而 unmasked 与 bidirectional suffix 输出明显改变。",
          "【合理推测】真实 VLA 若相机身份、时间位置或 mask 写错，也会出现条件混淆、训练指标虚高或部署失败；但影响大小取决于数据、网络和任务，不能由五个 toy token 定量外推。",
          "【个人观点】五小时安排与‘先写契约、再手算、后运行实验’是教学节奏建议，不是模型训练的标准工时。",
          "【暂无法验证】该脚本没有训练视觉编码器、多头 Transformer 或真实动作策略，也没有证明某种 mask 在你的数据上性能更高；它只验证信息流和未来标签泄漏。",
        ],
      },
      {
        title: "1. 一个可检查的多模态张量例子【shape 为教学示例】",
        paragraphs: [
          "设 B=2、K=2、C=2，每幅图切成 P=196 个 patch，语言长度 L=12，本体状态压成 S=1 个 token。条件 prefix 的 token 数是 K·C·P+L+S=797。若动作表示为 H=16 个连续 slots，总序列 N=813，隐藏张量 X 的 shape 是 [2,813,d]。这个数字只用于练习；真实模型可能压缩图像、拼接多帧或采用交叉注意力。",
          "不要把 [B,K,C,...] 在 reshape 时直接展平而不保存顺序。至少记录 camera_names、timestamps、history_offsets、modality_ids 和 padding mask；部署客户端必须用同一顺序构造输入。",
        ],
        takeaways: ["所有 reshape 都能说出每个轴去了哪里。", "position id 不替代真实 timestamp。", "相机顺序属于模型协议。"],
      },
      {
        title: "2. 从一个 query 算到输出【必须慢推】",
        paragraphs: [
          "对一个 query q 和 N 个 keys，先算 sⱼ=q·kⱼ/√dₖ。减去本行最大有限分数再取 exp，可避免指数溢出；屏蔽位置的分子直接为 0。权重 wⱼ=exp(sⱼ)/Σᵣexp(sᵣ)，输出 y=Σⱼwⱼvⱼ，因此每一行权重和为 1。",
          "批量实现中 Q:[B,h,Nq,dₖ]、K:[B,h,Nk,dₖ]，QKᵀ:[B,h,Nq,Nk]。padding mask 常沿 key 维广播；causal mask同时依赖 query/key 位置。两者合并错误时，最常见现象是 padding 被关注或未来标签可见。",
        ],
        takeaways: ["softmax 沿 key 维归一化。", "mask 的 shape 必须能解释广播方向。", "先测注意力概率，再测最终 loss。"],
      },
      {
        title: "3. 三种 mask 不可混为一谈【机制已确认】",
        paragraphs: [
          "Autoregressive causal：第 i 个动作 token 读 prefix 和动作 0…i−1，用来预测第 i 个 clean token。Prefix-causal：图像/语言/状态 prefix 内可双向，动作区仍因果。Bidirectional action suffix：所有 action slots 相互可见，适用于输入为噪声或潜变量、输出为联合连续动作的生成式 head。",
          "判断泄漏不要只看三角形图，而要问：某位置的输入中有没有训练目标本身或其未来版本？若改变 future clean label 会改变 earlier prediction，模型就偷看了答案。脚本正是用干预而非肉眼检查验证这一点。",
        ],
        takeaways: ["双向不是天然泄漏，clean target 可见才是。", "训练和推理必须构造同一种可用信息。", "用标签干预做自动化泄漏测试。"],
      },
      {
        title: "4. 如何从模型图还原实现【方法建议】",
        paragraphs: [
          "依次追踪五件事：每种原始输入如何编码；token/slot 以什么顺序进入；谁能看谁；动作输出是词表 logits、连续回归、扩散噪声还是 flow velocity；部署时如何解码、反归一化并按频率执行。只看 backbone 名称不足以判断策略。",
          "对 OpenVLA，要识别自回归离散动作 token 及其解码；对 π₀，要识别 VLM prefix、连续 action expert、带噪 action suffix 与 flow 目标。这里的对比用于建立阅读框架，具体层数、参数和 mask 实现仍应以固定版本论文与代码为准。",
        ],
        takeaways: ["先读数据流，再读参数量。", "训练目标决定 action positions 中装的是什么。", "论文图、训练代码和推理代码要三方核对。"],
      },
    ],
    formula: { latex: String.raw`\mathbf Q=\mathbf X\mathbf W_Q,\ \mathbf K=\mathbf X\mathbf W_K,\ \mathbf V=\mathbf X\mathbf W_V,\qquad \operatorname{Attn}(\mathbf Q,\mathbf K,\mathbf V)=\operatorname{softmax}_{\rm key}\!\left(\frac{\mathbf Q\mathbf K^\top}{\sqrt{d_k}}+\mathbf M\right)\mathbf V`, symbols: [
      { symbol: "Q", meaning: "query，由 token 乘 WQ 得到。" }, { symbol: "K", meaning: "key，决定匹配。" }, { symbol: "V", meaning: "value，被权重汇聚。" },
      { symbol: "X", meaning: "统一隐藏宽度后的 token/slot 序列，常见 shape [B,N,d]。" }, { symbol: "WQ,WK,WV", meaning: "可学习投影；多头时每个 head 使用自己的子空间。" }, { symbol: "dₖ", meaning: "每个 head 的 key/query 宽度；缩放避免点积方差随维度增大。" },
      { symbol: "M", meaning: "允许处为 0、禁止处为 −∞ 的信息流 mask，可与 padding mask 合并。" }, { symbol: "softmaxkey", meaning: "沿 key 维归一化，每个 query 的权重和为 1。" },
    ], note: "公式只描述一次 attention 运算，不等于完整 VLA。视觉编码、位置/模态身份、残差、MLP、动作 head、训练标签与推理解码仍需单独定义。" },
    practice: {
      title: "未来动作标签泄漏单测",
      summary: "用五个 toy token 从零计算单头 attention；干预 future clean label，比较 prefix-causal、unmasked 与 bidirectional suffix。",
      steps: ["运行默认脚本并阅读三行 attention weights", "确认 causal mask 给 action_1 的权重为 0", "把 future action 改成极端值，比较 action_0 输出变化", "故意把 causal 换成 no_mask，让断言抓住泄漏", "恢复后解释为什么 noisy action suffix 可以双向而 clean labels 不可以"],
      acceptance: ["脚本输出 PASS", "causal future-label delta 为 0", "unmasked 与 suffix delta 明显非零", "能口头说明三种 mask 的输入语义", "没有把 toy attention 结果宣称为真实 VLA 性能"],
      status: "已验证",
      code: "python public/labs/attention_mask_leakage.py",
      prerequisites: ["Python 3.10+ 标准库，无需 PyTorch/GPU", "先能解释 token、query、key、value 的角色"],
      expected: ["打印 token 顺序和三种 mask 下 action_0 的权重", "prefix-causal 对未来 action_1 的权重为 0", "最后两行分别显示 PASS 与 suffix 使用边界"],
      debugging: ["若 softmax 报无可见 key，检查每个 query 至少允许一个 prefix key", "若 causal delta 非零，检查 mask 条件是否错误允许 key_index>query_index", "若 unmasked delta 太小，检查未来 token 是否真的被改动，以及输出是否使用了 V"],
    },
    pitfalls: ["把 token 序列位置当物理时间", "训练时泄露未来 clean action", "忽略相机身份和稳定顺序", "把连续 action slots 强套语言 causal mask", "认为 attention map 就能证明因果关系", "训练 prefix 与推理 prefix 不一致"],
    review: ["为什么点积除以 √dₖ，softmax 又必须沿 key 维？", "给定 [B,h,Nq,dₖ] 与 [B,h,Nk,dₖ]，attention logits 的 shape 是什么？", "自回归 action token 与带噪 action suffix 分别允许看到哪些位置？", "为什么改变 future clean label 是比只看 mask 图更强的泄漏测试？", "相机顺序、timestamp 和 position id 分别解决什么问题？"], completion: "独立写出 tensor contract、三种 mask 和一个未来标签干预测试，并从真实模型图还原输入、信息流、动作接口与训练目标。",
    sources: [{ title: "Transformer", url: "https://arxiv.org/abs/1706.03762", role: "注意力" }, { title: "OpenVLA", url: "https://arxiv.org/abs/2406.09246", role: "离散动作" }, { title: "π₀", url: "https://arxiv.org/abs/2410.24164", role: "连续 suffix" }],
  },

  "action-representations": {
    lead: "同一个数字 0.01 可以表示 1 cm 的 tool-frame 位移，也可以表示 0.01 rad 的关节增量。动作表示先定义机器人究竟收到什么，再决定模型如何编码它。本章的 5 小时是个人学习节奏建议；验收标准是交付一份可逆、带版本的 7D action contract。",
    objectives: ["区分 joint position/velocity、EEF absolute/delta pose、spatial/body frame 与 gripper 语义。", "为 7D 动作写出 name、unit、frame、dt、valid mask、fixed value 和逆变换。", "手算分位数量化的 encode/decode、边界裁剪与最大误差。", "解释离散 bin、FAST、连续回归、diffusion/flow 的表达能力与工程代价。", "运行脚本验证 metadata round-trip、常量维、NaN/Inf、越界计数和无数据泄漏。"],
    timePlan: [
      { duration: "0:00–0:45", title: "动作语义", activity: "用同一段末端轨迹分别写成 absolute pose、delta pose、velocity；标出 frame/unit/dt。", deliverable: "三种表示对照表。" },
      { duration: "0:45–1:35", title: "7D action contract", activity: "定义 dx…dyaw+gripper，明确旋转、夹爪、常量维与 valid mask。", deliverable: "可审查的 contract JSON 草稿。" },
      { duration: "1:35–2:25", title: "慢推量化", activity: "用 B=4 手算 bin 边界、索引、中心解码、裁剪和误差界。", deliverable: "一个包含上下边界和 outlier 的数值例。" },
      { duration: "2:25–3:10", title: "编码路线比较", activity: "比较独立分箱、FAST 与连续生成头，判断时间相关性和多峰性如何保留。", deliverable: "三路线选型表。" },
      { duration: "3:10–4:20", title: "7D 实操", activity: "运行 tokenizer，逐项破坏 frame、常量维、NaN 和 metadata，观察断言。", deliverable: "完整终端输出与两次故障记录。" },
      { duration: "4:20–5:00", title: "跨本体审计", activity: "为第二种机器人做语义映射；列出不能靠 padding 解决的差异。", deliverable: "版本化 contract 与迁移清单。" },
    ],
    theory: ["动作空间包含命令类型、参考系和时间：EEF delta 若在 tool frame 表示，平移轴会随工具姿态旋转；同一数值在 base frame 中含义不同。velocity 乘 Δt 才近似 delta，改采样率却复用旧动作会改变物理轨迹。欧拉角还依赖旋转顺序；工程上必须把 convention 放进协议而非注释。", "逐维分箱先用训练集统计 lⱼ/uⱼ，再把连续值裁剪并映射到整数。中心解码对未裁剪值的误差不超过半个 bin；outlier 被裁剪后不再有此保证。测试集不得参与分位数统计。constant/inactive 维不应除以极小范围，而应由 valid mask 和 fixed value 单独处理。", "离散 bin 可用交叉熵训练；若采用逐维独立并行分类 head，会因因子化假设忽略跨维依赖，而自回归动作 token 可以建模跨维和跨时间依赖，但会付出串行解码代价。FAST 沿高频 action chunk 时间轴做 DCT、量化与 BPE 压缩，不等于简单低通；连续回归速度快但单峰；diffusion/flow 保留连续多峰性但采样和部署更复杂。", "跨 embodiment 的相同向量宽度不等于相同语义。关节顺序、可动维、夹爪方向、旋转参数化、控制周期和归一化统计都可能不同。canonicalization 需要显式可逆适配器；padding 只解决 shape。"],
    deepDive: [
      { title: "证据边界", paragraphs: ["【已确认】量化公式与误差界可直接推导；OpenVLA/FAST 的编码机制可由所列论文核对。本地脚本已运行：7D token=(20,7,28,19,7,28,-1)，最大 active round-trip 误差约 0.006102，NaN 与 metadata 检查通过；数值只属于 Toy 数据。", "【合理推测】真实 VLA 同样会受 frame/unit/dt 和统计泄漏影响，但严重程度取决于机器人接口与数据。", "【个人观点】5 小时分配及先 contract 后 tokenizer 的顺序是教学建议。", "【暂无法验证】本章未在你的机器人上验证坐标变换、夹爪极性和真实控制器兼容性。"] },
      { title: "数值例：B=4 的中心解码", paragraphs: ["令 active 维训练范围 l=-1、u=1，B=4，则 bin 宽 Δ=0.5，边界为 [-1,-0.5,0,0.5,1]。a=0.2 落入索引 2，中心解码为 0.25，误差 0.05≤Δ/2。a=2 被裁剪到 1 并编码为 3，中心解码 0.75；相对原值误差 1.25，因此 outlier 不享受半 bin 误差界。", "恰好 a=u 时 floor 会得到 B，外层 clip 必须把它压到 B−1。B 个区间需要 B+1 个边界。"], takeaways: ["统计只来自 train split。", "记录裁剪率，而不只检查 token 范围。", "常量维走 fixed value，不走量化公式。"] },
      { title: "从物理动作到 token 的完整链", paragraphs: ["推荐链路是 raw robot command → canonical adapter → train normalization/quantization → model token；部署按相反方向严格逆变换。每层保存 schema version。任何不可逆步骤都要记录，例如 clipping。", "7D 不天然表示 EEF：它可能是 6D twist+gripper、7 joints 或 position+quaternion。字段名和 frame 才决定语义。"] },
    ],
    formula: { latex: String.raw`b_j=\operatorname{clip}\!\left(\left\lfloor\frac{\operatorname{clip}(a_j,l_j,u_j)-l_j}{(u_j-l_j)/B}\right\rfloor,0,B-1\right)`, symbols: [
      { symbol: "aⱼ", meaning: "第 j 维连续动作。" }, { symbol: "lⱼ,uⱼ", meaning: "仅从训练集计算的分位数范围。" }, { symbol: "B", meaning: "bin 数；需 B+1 个边界。" },
      { symbol: "bⱼ", meaning: "0…B−1 的离散索引。" }, { symbol: "clip", meaning: "裁剪 outlier；此时误差不受半 bin 宽限制。" }, { symbol: "⌊·⌋", meaning: "向下取整，定义区间语义。" },
    ], note: "量化公式只适用于 uⱼ−lⱼ 大于阈值的 active 维；常量维应由 action contract 单独记录 fixed value 与 valid mask。" },
    practice: { title: "7D contract + 量化 round-trip", summary: "标准库脚本实现 6 个 active EEF delta 维和 1 个 inactive/fixed gripper 维，保存 metadata 并拒绝 NaN。", prerequisites: ["Python 3.10+，无需第三方库。", "先手算 B=4 数值例，并写出 tool frame 与 base frame 的区别。"], steps: ["运行 python public/labs/action_tokenizer.py，保存全部输出。", "阅读 ActionContract.validate，解释 valid_mask=False 时为何必须有 fixed_value。", "把 probe 某一维设为边界内值，核对误差≤半 bin；再设为 9，观察 clip-high 计数。", "把一维设为 NaN，确认被拒绝；把 active 训练列改为常量，确认 fit 失败。", "检查 metadata JSON 包含 version/type/frame/units/dt/gripper；说明部署如何逆变换。", "创建第二份 base-frame contract，列出哪些字段变化而不是只改名称。"], expected: ["【本地已确认】默认输出 7 个 token，最后 inactive 维为 -1；最大 active round-trip 误差约 0.006102。", "六个 active 维各记录一次 high clipping，inactive 维为 0。", "metadata 往返、NaN rejection 和所有断言 PASS。"], acceptance: ["未裁剪值误差≤半 bin，并能说明 outlier 例外。", "active token 在 [0,B−1]，inactive token 与 fixed value 可区分。", "统计只由训练集拟合；metadata 完整、版本化、可逆。", "能指出 padding 与 canonicalization 的本质差异。"], debugging: ["误差超过半 bin：先确认输入未被裁剪，并检查中心解码是否用了 token+0.5。", "索引出现 B：上边界 floor 后必须 clip 到 B−1。", "NaN 静默变成 token：在 clip/floor 前统一 finite 检查。", "常量维除零：不要加 ε 掩盖；改为 inactive+fixed value。", "部署动作方向相反：检查 frame、gripper polarity、rotation convention 和逆变换顺序。"], status: "已验证", code: "python public/labs/action_tokenizer.py" },
    pitfalls: ["mm/m 混用", "spatial/body delta 混用", "velocity↔delta 忘记 dt", "padding 与真实零不可分", "常量维 q01=q99 导致除零"],
    review: ["为什么 B 个 bin 需要 B+1 边界？", "FAST 为何适合高频 chunk？", "归一化为何不等于 canonicalization？"], completion: "定义可逆、带 frame/unit/mask/版本的 action contract。",
    sources: [{ title: "OpenVLA", url: "https://arxiv.org/abs/2406.09246", role: "动作量化" }, { title: "FAST", url: "https://www.pi.website/research/fast", role: "动作压缩" }, { title: "RT-X", url: "https://robotics-transformer-x.github.io/", role: "跨本体" }], visual: "action",
  },

  "action-chunking": {
    lead: "Action chunking 不是“模型一次吐出很多动作”这么简单：你还必须回答 chunk 属于哪次观测、何时过期、执行到哪一项、下一段迟到怎么办。本章用 4 小时从 H/E 数值例做到带时间戳、TTL、p99 和 controlled stop 的队列。时长是个人建议。",
    objectives: ["区分 prediction horizon H、execution horizon E、action dt 与 policy refresh。", "手算同步/异步延迟预算和最小 reserve 数。", "实现 chunk 的 observation_time、request_id、TTL、限幅与乱序拒绝。", "理解 temporal ensemble、receding horizon 与 RTC 的区别及多峰平均风险。", "用延迟注入证明过期动作不会重放，队列耗尽进入 controlled stop。"],
    timePlan: [
      { duration: "0:00–0:40", title: "H、E、dt 时间轴", activity: "画 H=8,E=2,20Hz 的预测/执行/重观测时间轴。", deliverable: "标注开闭区间和每项动作绝对执行时刻。" },
      { duration: "0:40–1:20", title: "同步与异步", activity: "加入推理和网络延迟，比较阻塞执行与后台补队列。", deliverable: "两种架构时序图。" },
      { duration: "1:20–2:00", title: "p99 预算", activity: "用给定延迟样本手算 p99 和 reserve，讨论平均值为何不够。", deliverable: "延迟预算表。" },
      { duration: "2:00–3:10", title: "安全队列实操", activity: "运行时间戳/TTL/乱序/限幅/NaN 实验并逐项破坏。", deliverable: "完整输出和故障日志。" },
      { duration: "3:10–3:40", title: "chunk 拼接", activity: "比较直接替换、重叠平均、前缀条件化；处理二值 gripper。", deliverable: "选型理由。" },
      { duration: "3:40–4:00", title: "验收", activity: "从日志判断迟到、队列欠载和安全停止。", deliverable: "通过章末问题。" },
    ],
    theory: ["模型在 observation_time=t_obs 基于观测生成 H 个、间隔 Δt_c 的动作。若每次执行前 E 个再重观测，理想 refresh 为 EΔt_c；同步推理会额外造成停顿，异步服务则必须在旧队列耗尽前送达新 chunk。H 描述预测覆盖，不代表应该开环执行 H 步。", "每个 chunk 至少携带 request_id、observation_time、dt、动作类型与 shape。接收端用绝对时间判断 age；迟到、过 TTL 或比当前 chunk 更旧的结果必须拒绝。新 chunk 不能盲目从索引 0 重放过去时刻的动作；本 Toy 采用整段拒绝，真实系统也可跳过过期前缀，但需严格时钟同步。", "reserve 下界由推理 p99、网络 p99 和 margin 除以动作周期后向上取整。平均延迟无法覆盖尾部抖动。队列不足时安全行为应由独立执行层定义，例如保持、减速、受控停车；模型置信度不能代替 TTL/watchdog。", "重叠 chunk 平均可平滑同一模态的连续目标，却可能把左绕和右绕平均成撞障，也不能直接平均二值 gripper。RTC 用已执行前缀条件化生成剩余 chunk，与事后数值平均不是同一机制。"],
    deepDive: [
      { title: "证据边界", paragraphs: ["【已确认】H/E/dt 关系和 reserve 公式可直接计算；ACT 与 RTC 机制可由所列来源核对。本地脚本已运行：注入样本 p99=220ms、dt=50ms、margin=30ms，reserve=5；过期 hold、乱序拒绝和 NaN 检查通过。", "【合理推测】真实服务也需要尾延迟、时钟和过期保护，但 TTL 与 margin 必须按真实机器人风险确定。", "【个人观点】4 小时分配与默认 controlled stop=hold 是教学选择。", "【暂无法验证】Toy 未验证真实网络、时钟漂移、伺服器、碰撞或急停；不能称为真机安全认证。"] },
      { title: "数值例：H=8、E=2、20Hz", paragraphs: ["Δt_c=0.05s，chunk 覆盖 HΔt=0.4s，理想每 EΔt=0.1s 重观测。若推理120ms且同步阻塞，每100ms请求却要停120ms，无法维持20Hz；异步需要旧队列覆盖推理+网络+margin。", "若 p99 总延迟220ms、margin30ms，则 ceil(250/50)=5，发起新请求时至少应剩5项动作。这是下界，不包含时钟误差和执行器特殊约束。"], takeaways: ["使用绝对时间而非 sleep 次数。", "p99 与样本数一起报告。", "过期动作宁可停也不重放。"] },
      { title: "为什么不能直接平均所有重叠 chunk", paragraphs: ["若两个 chunk 都来自同一局部轨迹，位置目标平均可能减小跳变；但不同策略模式平均会产生从未在数据中出现的动作。position 连续也不保证 velocity/acceleration 连续。", "gripper 是离散状态时应使用明确的迟滞、投票或状态机，而不是 0.5 命令。任何拼接方法都要在反归一化和安全限幅之后/之前明确顺序。"] },
    ],
    formula: { latex: String.raw`1\le E\le H,\quad T_{\rm refresh}^{\rm ideal}=E\Delta t_c,\quad T_{\rm chunk}=H\Delta t_c`, symbols: [
      { symbol: "E", meaning: "实际执行动作数。" }, { symbol: "H", meaning: "预测动作数。" }, { symbol: "Trefresh", meaning: "新 chunk 能按时到达、无推理阻塞时的理想观测刷新间隔。" }, { symbol: "Tchunk", meaning: "chunk 覆盖的物理时间。" }, { symbol: "Δt_c", meaning: "动作采样周期。" },
    ], note: "同步执行还要计入模型推理停顿；异步执行必须保证剩余队列覆盖推理、网络与安全余量的 p99 延迟。" },
    practice: { title: "时间戳 + 延迟队列 + controlled stop", summary: "标准库脚本模拟网络到达堆、绝对 observation_time、TTL、乱序结果、动作限幅与 p99 reserve。", prerequisites: ["Python 3.10+，无需第三方库。", "先手算 H=8,E=2,dt=0.05s 的覆盖与刷新时间。"], steps: ["运行 python public/labs/chunked_controller.py，核对 p99=220ms、reserve=5。", "沿 ActionChunk→DelayedNetwork→SafeExecutor 标出 request、arrival、execute 三种时间。", "把 latency=.04 改为 .20，观察 chunk 因 TTL 被拒或执行层 hold。", "交换新旧 observation_time，确认迟到旧结果不能覆盖新 chunk。", "把 target 改为大跳变和 NaN，分别观察 max_step 限幅与 finite 拒绝。", "分别设 E=1/2/8 画出请求频率；说明脚本为何只验证队列机制而非策略质量。"], expected: ["【本地已确认】p99=220ms，50ms/action 和 30ms margin 下 reserve=5。", "动作经 0.08 限幅得到 [0.08,0.16,0.24]；TTL 后保持 0.24。", "乱序/过期计数为1，controlled stop 为1，NaN 检查 PASS。"], acceptance: ["所有 chunk 带 request_id、observation_time、dt，且有限值/shape 可验证。", "过期或乱序结果绝不重放；队列欠载进入明确 controlled stop。", "能从延迟样本手算 p99 reserve，并说明平均延迟不足。", "能解释 E、H 与闭环性的关系以及重叠平均风险。"], debugging: ["状态偶尔倒退：打印 chunk/request_id/index/absolute time，查是否旧 chunk 覆盖新 chunk。", "队列总欠载：对比 p99 总延迟与剩余覆盖时间，不要只看 mean。", "TTL 全部触发：检查客户端/服务端时钟基准与单位 s/ms。", "动作跳变：检查新 chunk 起点是否对应当前状态、command type 是否 absolute/delta。", "停止后仍运动：hold 不是所有控制器的安全停止；真机需独立 watchdog/制动接口。"], status: "已验证", code: "python public/labs/chunked_controller.py" },
    pitfalls: ["aₜ:ₜ₊H 闭区间歧义", "改 fps 不改 dt", "二值 gripper 直接平均", "新 chunk 从 0 执行"],
    review: ["H=50,E=5,20Hz 的反应间隔？", "多峰策略为何不宜平均？", "异步时间语义差在哪？"], completion: "实现带时间戳、过期检测、限幅和受控停止的 action queue。",
    sources: [{ title: "ACT", url: "https://arxiv.org/abs/2304.13705", role: "chunking" }, { title: "RTC", url: "https://www.pi.website/research/real_time_chunking", role: "异步连续性" }], visual: "latency",
  },

  "diffusion-policy": {
    lead: "Diffusion Policy 本身是视觉条件动作策略，并不等同于带语言接口的 VLA；它把动作块当条件生成对象，从噪声逐步去噪。Diffusion 与 flow 等生成式建模后来被部分 VLA action expert 采用，但二者的训练目标和求解过程不能混称。",
    objectives: [
      "解释为什么单峰 MSE 会把两个正确动作平均成一个错误动作。",
      "从逐步加噪 q(Aᵏ|Aᵏ⁻¹) 推到可直接采样任意 k 的闭式表达。",
      "逐项解释 ε-prediction loss 的 shape、随机变量和条件，并区分机器人时间 t 与扩散步 k。",
      "写出与训练 scheduler 配套的反向 DDPM 更新，说明错配为何会破坏采样。",
      "训练一个真正的最小 denoiser，从噪声采出一维双峰动作，并明确它不能证明真实机器人成功。",
    ],
    timePlan: [
      { duration: "0:00–0:35", title: "先看多峰失败", activity: "手算专家动作一半为 −2、一半为 +2 时的 MSE 最优解，并判断均值 0 在绕障语义下为何可能失败。", deliverable: "一张‘数据分布—损失—预测行为’因果链。" },
      { duration: "0:35–1:35", title: "慢推前向加噪", activity: "从 βₖ、αₖ=1−βₖ、ᾱₖ=∏ₛ₌₁ᵏαₛ 推到 Aᵏ=√ᾱₖA⁰+√(1−ᾱₖ)ε，并检查两个系数的平方和。", deliverable: "一页推导和 k=0/中间/末端的信噪比解释。" },
      { duration: "1:35–2:30", title: "理解训练目标", activity: "随机抽 clean action、k 和 ε，构造 noisy action；解释网络为何预测 ε，以及 conditioning、padding mask 和归一化在哪里进入。", deliverable: "一张训练 batch 数据流与所有 tensor shape。" },
      { duration: "2:30–3:25", title: "成套理解反向采样", activity: "把预测 ε 代回 DDPM posterior mean；区分 β、posterior variance 与 DDIM 确定性路径，检查训练/推理 scheduler 是否成套。", deliverable: "一段不会混用 k/t、β/ᾱ 的伪代码。" },
      { duration: "3:25–5:20", title: "训练并破坏双峰实验", activity: "运行纯 Python denoiser；比较 MSE 均值和 400 个 diffusion 样本，随后改训练步数、去掉 time feature 或翻转反向更新符号。", deliverable: "loss、分位数、三段样本计数和一次失败复盘。" },
      { duration: "5:20–6:00", title: "接回动作块与闭环", activity: "把标量替换成 [H,dₐ]，补 valid mask、视觉语言条件、execution horizon 和延迟预算；完成章末问题。", deliverable: "一张从 denoiser 到安全执行器的边界图。" },
    ],
    theory: [
      "当同一条件下存在左绕和右绕两种正确轨迹，单峰回归的条件均值可能落在两种模式之间。Diffusion 不直接回归一个动作，而是学习如何把简单噪声分布逐步变成条件动作分布；多次从不同噪声出发可以得到不同但合理的样本。它提供表达多峰的能力，不保证数据中稀有模式一定被学到。",
      "前向过程不需要神经网络。定义 βₖ∈(0,1)、αₖ=1−βₖ、ᾱₖ=∏ₛ₌₁ᵏαₛ，每一步向 clean action A⁰ 添加少量高斯噪声。高斯的可组合性给出闭式采样 Aᵏ=√ᾱₖA⁰+√(1−ᾱₖ)ε，因此训练时无需真的循环 k 次；随机抽一个 k 就能构造监督对。",
      "ε-prediction 网络接收 noisy action Aᵏ、扩散步 embedding 和观测条件 o，预测当次加入的 ε。最小化 ||ε−εθ(Aᵏ,k,o)||² 等价于一种去噪 score 学习参数化，但它只是训练目标的一部分；视觉编码、时间网络、动作 mask、归一化和条件融合仍需定义。",
      "推理从高斯噪声 Aᴷ 开始，按 K…1 逐步调用同一网络。DDPM 更新的均值、方差必须与训练使用的 β schedule 和预测参数化匹配；把 ε-pred 网络当作 clean-action 网络、漏掉 1/√αₖ 或混用另一 scheduler，都会让样本发散。DDIM 可以减少或确定化采样步数，但不是随意跳步。",
      "真实 Diffusion Policy 通常一次生成 [H,dₐ] 动作块，以图像和本体历史为条件，再只执行前 E≤H 步后重新观测。采样步数增加推理延迟；部署还需处理 action normalization、padding、时间戳、过期 chunk、限幅和安全控制。Diffusion 是动作生成器，不替代闭环执行器。",
    ],
    deepDive: [
      {
        title: "证据边界：双峰脚本与真实 Diffusion Policy 的距离",
        paragraphs: [
          "【已确认】DDPM 前向闭式加噪、ε-prediction 目标和与 schedule 配套的反向更新可由公式核对。本章新脚本已实际训练 32-hidden-unit denoiser：固定 seed 下，单峰 MSE baseline 接近 0，而 400 个 diffusion 样本同时覆盖负、正两个模式，并通过断言。",
          "【合理推测】真实机器人动作存在多种可行路径时，条件生成模型可能比单峰 MSE 更适合表达数据；但实际收益还取决于条件是否充分、模型容量、数据平衡、采样器和闭环评测。",
          "【个人观点】六小时安排把前向推导、反向采样和故障实验分开，是为了避免只背一个 loss；有生成模型基础者可以压缩阅读时间。",
          "【暂无法验证】标准库脚本只有一维动作，没有图像、语言、动作块、真实时序网络或机器人 rollout，不能证明 Diffusion Policy 在你的任务上优于 ACT/BC，也不能给出真实延迟。",
        ],
      },
      {
        title: "1. 为什么均值可能落在障碍上【数学事实已确认】",
        paragraphs: [
          "令同一观测下专家动作 a 以相同概率取 −2 或 +2。常数预测 μ 的 MSE 是 E[(a−μ)²]，对 μ 求导得到 2(μ−E[a])，最优解 μ=E[a]=0。若 −2/+2 表示左右绕障，0 可能恰好直行碰撞。",
          "Diffusion 不是靠输出方差修饰均值，而是学习完整生成过程；不同初始噪声可落到不同模式。若语言、历史或目标实例能消除歧义，应优先加入条件，让模型知道当前该选哪一侧，而不是永远随机采样。",
        ],
        takeaways: ["先确认多峰是真实多解还是缺失条件。", "生成能力不等于模式覆盖保证。", "闭环仍要评估样本是否安全。"],
      },
      {
        title: "2. 前向过程逐步与闭式为何一致【必须慢推】",
        paragraphs: [
          "逐步定义 q(Aᵏ|Aᵏ⁻¹)=N(√αₖAᵏ⁻¹,(1−αₖ)I)。把 Aᵏ⁻¹ 继续展开，会得到 clean action 的系数 √(α₁…αₖ)=√ᾱₖ；独立高斯噪声的方差累积为 1−ᾱₖ，因此可一次采样任意 k。",
          "当 ᾱₖ 接近 1，Aᵏ 仍保留大部分动作信号；当 ᾱₖ 接近 0，分布接近标准高斯。有限 K 下末端未必精确等于 N(0,I)，schedule 设计是在信号破坏程度、训练难度与采样步数之间取舍。",
        ],
        takeaways: ["ᾱ 是乘积，不是平均。", "√ᾱ 与 √(1−ᾱ) 作用在信号和噪声幅度。", "机器人时间 t 与扩散步 k 必须使用不同变量名。"],
      },
      {
        title: "3. 一次训练 batch 到底发生什么【实现已确认】",
        paragraphs: [
          "先从数据取 A⁰:[B,H,dₐ] 与条件 o；再为每个样本抽 k:[B] 和 ε:[B,H,dₐ]，按闭式得到 Aᵏ。网络输入 Aᵏ、k embedding 与视觉/语言/状态条件，输出同 shape 的 ε̂。loss 对 H、dₐ 求平均时必须乘 valid mask，避免 episode 尾部 padding 被当成真实零动作。",
          "动作通常先用训练集统计归一化，使不同维度处于相近尺度；训练与推理必须使用同一统计。若网络连 32 个样本都过拟合不了，先查 shape、mask、normalization、k embedding 和条件广播，不要先增加采样步数。",
        ],
        takeaways: ["预测目标与输出 shape 必须一致。", "每个 batch 样本可使用不同 k。", "padding 与真实静止动作必须可区分。"],
      },
      {
        title: "4. 反向更新必须与训练参数化成套【必须掌握】",
        paragraphs: [
          "对 ε-prediction，DDPM 的常用均值可写为 μθ=(Aᵏ−βₖεθ(Aᵏ,k,o)/√(1−ᾱₖ))/√αₖ；k>1 时再加 posterior variance 对应的高斯噪声，最后一步不加。这里的 βₖ、αₖ、ᾱₖ都来自训练 schedule。",
          "有些实现预测 clean action x₀、velocity v 或 score；公式会随参数化改变。阅读代码先确定 prediction_type，再看 scheduler.step，不能只复制模型 forward。数值上应检查每一步 finite、样本尺度和反归一化范围。",
        ],
        takeaways: ["prediction type 与 sampler 不能错配。", "训练 loss 下降不证明反向公式正确。", "固定 seed 保存中间 Aᵏ 最容易定位发散步。"],
      },
      {
        title: "5. 从一维 denoiser 升到机器人动作块【工程推演】",
        paragraphs: [
          "脚本把 clean data 设为靠近 −2/+2 的一维双峰，用 MLP 接收 noisy action 和 time features，手写 Adam 训练 ε；采样从 N(0,1) 反向走 24 步。它验证了真正的训练与采样闭环，而不只是画预设双峰。",
          "升级到动作块时，把标量换成 [H,dₐ]，denoiser 换成能处理时间结构的网络，并注入视觉/语言/本体条件。随后还要选择 E、测 p99 采样延迟、丢弃过期 chunk，并与相同数据和执行协议的 MSE/ACT baseline 比较成功率。",
        ],
        takeaways: ["先在最小维度验证 schedule 与采样，再扩模型。", "报告模式计数不能代替任务成功率。", "生成模型与安全执行层是两个系统。"],
      },
    ],
    formula: { latex: String.raw`\mathbf A^k=\sqrt{\bar\alpha_k}\mathbf A^0+\sqrt{1-\bar\alpha_k}\boldsymbol\epsilon,\quad \boldsymbol\epsilon\sim\mathcal N(\mathbf0,\mathbf I),\qquad \mathcal L_{\rm diff}=\mathbb E\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta(\mathbf A^k,k,\mathbf o)\right\|_2^2`, symbols: [
      { symbol: "A⁰", meaning: "归一化专家动作块 H×dₐ。" }, { symbol: "k", meaning: "扩散步，不是机器人时间。" }, { symbol: "ᾱₖ", meaning: "累计信号保留比例。" },
      { symbol: "Aᵏ", meaning: "第 k 个扩散步的 noisy action，shape 与 A⁰ 相同。" }, { symbol: "ε", meaning: "与动作块同 shape 的独立标准高斯噪声。" }, { symbol: "εθ", meaning: "以 noisy action、扩散步和多模态观测为条件的噪声预测网络。" }, { symbol: "o", meaning: "视觉、语言与本体状态条件；不是扩散变量。" },
    ], note: "该式是 ε-prediction 训练目标。若实现预测 x₀、v 或 score，反向采样公式必须相应改变；也不能省略动作 valid mask 与归一化。" },
    practice: {
      title: "真正训练并采样的一维双峰 DDPM",
      summary: "纯 Python 手写 MLP、Adam、前向加噪与 24 步反向采样；比较 MSE 条件均值和 400 个生成样本。",
      steps: ["运行默认脚本，记录四个训练 loss checkpoint", "确认单峰 MSE baseline 接近两个专家模式的均值 0", "读取 q10/q50/q90 与 negative/central/positive 计数", "把 iterations 降到 100 或删除 time features，观察模式质量下降", "故意翻转反向均值中的符号，让 finite/模式断言捕获错误", "恢复脚本并写清 toy 结果不能外推到真实机器人"],
      acceptance: ["脚本输出 PASS", "负、正模式各占至少 20%", "中心 |a|<0.6 的样本少于 30%", "全部采样 finite 且固定 seed 可复现", "能说明这不是图像条件动作块或机器人 rollout"],
      status: "已验证",
      code: "python public/labs/diffusion_multimodal_1d.py",
      prerequisites: ["Python 3.10+ 标准库；无需 NumPy、PyTorch 或 GPU", "已完成 BC 多峰均值例子", "能区分 clean action、noisy action、target noise 和 diffusion step"],
      expected: ["训练 loss 从初始高值下降，但最后一个 batch 不要求单调最低", "MSE baseline 约为 0，位于两个专家模式之间", "生成样本同时出现在负、正两侧，中心计数较少", "最后显示 PASS 和明确的 BOUNDARY"],
      debugging: ["若两侧样本不平衡，先确认 seed 未改、训练 iterations 足够，再看 expert mode 采样是否 50/50", "若样本发散，核对 ε-prediction、β/α/ᾱ 与 posterior variance 是否来自同一 schedule", "若 loss 降但样本集中中心，保存每个反向步并检查 time feature、符号和噪声方差", "若脚本变慢，先减少采样 count，不要减少到无法观察模式"],
    },
    pitfalls: ["机器人时间 t 与扩散步 k 混用", "训练 prediction type 与推理 sampler 错配", "padding 未 mask 或统计量跨 split 泄漏", "把所有 H 步开环执行", "认为能表达多峰就必然学好所有模式", "只报 denoising loss 不做 rollout", "把一维 toy 结果当真实机器人证据"],
    review: ["为什么 ᾱₖ 是 α 的连乘，两个闭式系数又分别开平方？", "ε-prediction 的输入、输出和监督目标各是什么 shape？", "为什么训练可以随机一个 k，而推理必须沿反向步骤采样？", "若模型预测 x₀ 而 sampler 按 ε 解释，会发生什么？", "Diffusion 能表达多峰，为什么仍需 receding horizon、延迟预算和安全层？"], completion: "独立推导前向闭式、实现或审查 ε-prediction 与配套反向采样，在最小双峰实验中制造并定位一次失败，再画出动作块策略的闭环部署边界。",
    sources: [{ title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239", role: "DDPM 原理" }, { title: "Diffusion Policy", url: "https://diffusion-policy.cs.columbia.edu/", role: "机器人动作策略" }],
  },

  "flow-matching": {
    lead: "Flow Matching 训练的不是“最终动作回归器”，而是条件速度场：给定中间点、生成时间和观测条件，预测此刻应该往哪里走，再由 ODE solver 从噪声积分到动作。本章用 5 小时完成路径推导、真正的速度训练和正反时间 convention 单测；时长是个人建议。",
    objectives: ["从插值路径 Xτ=(1−τ)ε+τA 推出监督目标 dXτ/dτ=A−ε。", "区分机器人时间 t、action chunk 索引和生成时间 τ。", "训练一个使用 condition 的 1D velocity model，而非硬编码终点。", "实现 Euler ODE solver，解释步数、方向、误差和求解成本。", "把论文正时间约定与 openpi 反时间约定逐项对齐。"],
    timePlan: [
      { duration: "0:00–0:50", title: "路径与速度慢推", activity: "对线性路径求导；手算 ε=−1,A=2,τ=.3 的 Xτ 与目标速度。", deliverable: "完整推导与 shape 标注。" },
      { duration: "0:50–1:35", title: "条件速度", activity: "说明 vθ 为什么输入 Xτ、τ、o；比较无条件与语言条件速度。", deliverable: "条件流计算图。" },
      { duration: "1:35–2:20", title: "从 loss 到 ODE", activity: "写出采样伪代码，手算 10 步 Euler；区分训练采样与推理解算。", deliverable: "训练/推理双栏伪代码。" },
      { duration: "2:20–3:35", title: "最小训练实验", activity: "运行 1D 条件 transport，查看 held-out velocity MSE、条件权重和 endpoint。", deliverable: "完整终端输出与代码注释。" },
      { duration: "3:35–4:20", title: "convention 对齐", activity: "同时实现 τ:0→1 与 openpi-style t:1→0，故意只翻速度不翻 dt。", deliverable: "符号对照表和失败单测。" },
      { duration: "4:20–5:00", title: "扩展到 action chunk", activity: "把标量替换为 H×dₐ，加入 mask、归一化与多步求解预算。", deliverable: "π₀ action expert 接口草图。" },
    ],
    theory: ["训练时先从专家数据取动作块 A 和条件 o，再采样同 shape 高斯噪声 ε 与 τ∼Uniform(0,1)，构造 Xτ=(1−τ)ε+τA。线性路径的解析导数是 A−ε，所以每个随机中间点都能生成监督标签；模型学习 vθ(Xτ,τ,o)。", "推理时没有专家 A：从新噪声 X⁰=ε 出发，数值积分 dX/dτ=vθ(X,τ,o) 到 τ=1。Euler 更新 X←X+Δτvθ；solver 步数越多通常离散误差越小但推理更慢。训练 velocity MSE 低只说明局部场拟合，仍要检查积分终点、动作统计和 rollout。", "本站与 π₀ 论文采用 τ=0 噪声→τ=1 动作。openpi 实现可采用 t=1 噪声→t=0 动作、目标 ε−A 和负 dt。两者是变量替换：速度符号与积分方向必须一起翻转。只翻一个会远离数据。", "标量 Toy 可让人看清符号，实际 action expert 的 X、ε、A 都是 B×H×dₐ；视觉/语言/本体条件通过网络提供，padding 需要 mask，训练和部署必须使用同一归一化统计。"],
    deepDive: [
      { title: "证据边界", paragraphs: ["【已确认】线性路径导数、FM 目标与 ODE 更新可由公式和 Flow Matching 论文核对。本地脚本已实际训练：held-out velocity MSE 从4降到约0，学到 condition 权重2，正/反 convention endpoint 最大误差约0；这些是特制平移 Toy 的结果。", "【合理推测】真实 action chunk 也可使用相同路径与条件速度接口，但网络容量、积分误差和 rollout 成功取决于数据和实现。", "【个人观点】5 小时节奏及先用线性 Toy 查符号再上 π₀ 的顺序是教学建议。", "【暂无法验证】本章没有训练 π₀、视觉 backbone 或真机动作，不能用 Toy 证明复杂多峰策略性能。"] },
      { title: "数值例：ε=−1，A=2", paragraphs: ["τ=.3 时 Xτ=.7×(−1)+.3×2=−.1，解析速度 A−ε=3。10步 Euler、Δτ=.1 时每步加.3，从−1到2。因为该 Toy 速度常量，Euler 无离散误差；真实神经速度随 X/τ 变化时不成立。", "反时间写 t=1→0，速度取 ε−A=−3，同时 dt=−.1，每步仍增加.3。若速度改成−3而 dt 仍为+.1，终点会走到−4。"], takeaways: ["速度、时间端点、dt 三者成套记录。", "τ 不是机器人时间。", "endpoint 单测比只看 velocity loss 更直接。"] },
      { title: "Toy 为何算真正的条件训练", paragraphs: ["脚本随机采样 condition c∈{−1,+1}、ε∼N(0,1)，令数据 A=ε+2c，再随机采样 τ 构造训练对 (Xτ,τ,c)→A−ε。线性模型通过梯度下降从512个样本学习速度，而不是读取预设终点。", "这个数据族只是条件平移，所以真速度恰好为2c，不能代表真实机器人分布；它的价值是隔离 condition、训练、ODE 与符号错误。"] },
    ],
    formula: { latex: String.raw`\mathbf X^\tau=(1-\tau)\boldsymbol\epsilon+\tau\mathbf A,\quad\mathcal L_{\rm FM}=\mathbb E\|\mathbf v_\theta(\mathbf X^\tau,\tau,\mathbf o)-(\mathbf A-\boldsymbol\epsilon)\|_2^2`, symbols: [
      { symbol: "τ", meaning: "生成时间，0 噪声→1 数据。" }, { symbol: "Xτ", meaning: "中间动作块。" }, { symbol: "ε", meaning: "高斯噪声。" }, { symbol: "A", meaning: "专家动作块。" },
      { symbol: "vθ", meaning: "条件速度场。" }, { symbol: "A−ε", meaning: "路径解析导数。" }, { symbol: "o", meaning: "多模态条件。" },
    ], note: "q(Xτ|A)=N(τA,(1−τ)²I)，协方差有平方。" },
    practice: { title: "训练条件 velocity + ODE solver", summary: "标准库脚本采样条件 transport 数据、梯度下降训练 vθ(x,τ,c)，并用正/反时间 Euler solver 从噪声生成数据。", prerequisites: ["Python 3.10+；无需 PyTorch。", "先完成 ε=−1,A=2 的手算，不要先读输出。"], steps: ["运行 python public/labs/flow_matching_1d.py，保存权重、held-out MSE 与 endpoint。", "阅读 make_rows，指出训练输入、目标和 condition；证明 target=2c。", "把 condition 特征删除，观察 held-out loss；解释无条件场为何无法同时向左右平移。", "把 solver steps 改为1/5/20；再把 Toy 改成非恒定速度，观察 Euler 误差随步数变化。", "只翻 velocity 符号不翻 dt，确认 wrong-sign endpoint 远离1.3。", "在纸上把 x 扩成 [B,H,dₐ]，写出 mask、normalization 和 observation 条件的位置。"], expected: ["【本地已确认】权重约[0,0,2,0]，held-out velocity MSE 4→约0。", "正时间与反时间 solver 最大 endpoint 误差约0；错误符号从−0.7走到−2.7，而目标为1.3。", "脚本最终打印 ALL CHECKS PASSED。"], acceptance: ["能不看答案推出 A−ε，并写出训练/推理算法。", "condition 消融后能解释 loss 变化。", "正反时间 convention 都到同一终点，错误组合被单测捕获。", "能说明 Toy 已验证什么、没有验证什么。"], debugging: ["velocity loss 不降：打印 (Xτ,τ,c,target)，查 target 符号、特征和梯度。", "loss 低但 endpoint 错：查 solver 输入统计、dt 符号、时间端点和是否漏 condition。", "步数增加仍发散：这通常不是 Euler 精度，而是方向或速度场错误。", "真实 chunk 出 NaN：先查归一化、mask、τ broadcasting 和 solver 中间值，不要只 clip 最终动作。"], status: "已验证", code: "python public/labs/flow_matching_1d.py" },
    pitfalls: ["改速度不改积分方向", "协方差漏平方", "action slots 称语言 token", "部署统计不一致"],
    review: ["为何导数 A−ε？", "openpi 的 ε−A 为何仍正确？", "flow 与 diffusion 采样差异？"], completion: "用数值测试证明 flow 方向，解释论文/代码 convention。",
    sources: [{ title: "Flow Matching", url: "https://arxiv.org/abs/2210.02747", role: "速度场" }, { title: "π₀", url: "https://arxiv.org/abs/2410.24164", role: "action expert" }, { title: "openpi pi0.py", url: "https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py", role: "实现" }],
  },

  pi05: {
    lead: "π₀.₅ 这一章明确分成两条轨道：2.5 小时核心只要求读懂架构、训练阶段、证据与边界；3.5 小时云端选做才涉及 openpi 环境、checkpoint、server/client 和 LIBERO。没有 GPU 也能完成核心，未运行云端部分时不得写“已复现 π₀.₅”。",
    objectives: ["核心：解释 π₀、π₀-FAST、π₀.₅ 在动作生成与训练数据上的关系。", "核心：区分高层 semantic action、低层 flow action 与世界模型。", "核心：从官方论文/项目页区分报告结果、公开代码能力和个人推断。", "选做：按固定 revision 完成 random-observation inference、norm stats、policy server 与 LIBERO client。", "选做：记录 GPU/显存/版本/seed/样本数，并把成功率与“命令运行”分开。"],
    timePlan: [
      { duration: "核心 0:00–0:40", title: "π₀ 回顾", activity: "画 VLM prefix、proprio、action expert 和 flow suffix。", deliverable: "一张数据流图。" },
      { duration: "核心 0:40–1:25", title: "π₀.₅ 改进", activity: "阅读官方摘要，整理开放世界数据、semantic action 与连续动作路径。", deliverable: "π₀→π₀.₅ 变化表。" },
      { duration: "核心 1:25–2:05", title: "训练与 Knowledge Insulation", activity: "区分论文原始训练、FAST 目标、flow 目标和梯度隔离。", deliverable: "训练阶段图及证据链接。" },
      { duration: "核心 2:05–2:30", title: "能力边界验收", activity: "给10条表述标记已确认/推测/未验证。", deliverable: "完成章末问题；至此核心完成。" },
      { duration: "选做 0:00–0:50", title: "隔离环境", activity: "Ubuntu22.04/Docker、锁 openpi revision、核 GPU 与存储。", deliverable: "环境卡。" },
      { duration: "选做 0:50–1:35", title: "随机输入推理", activity: "加载 checkpoint，核 observation/action shape、finite 和 norm。", deliverable: "smoke log。" },
      { duration: "选做 1:35–2:25", title: "数据与 norm stats", activity: "转换数据、计算统计、检查 action contract。", deliverable: "数据卡与统计文件。" },
      { duration: "选做 2:25–3:30", title: "server/client + LIBERO", activity: "启动 policy server，多 seed rollout；算力允许再微调。", deliverable: "成功率、样本数、失败分类；至此选做完成。" },
    ],
    theory: ["π₀ 用 VLM prefix + flow action expert 生成连续动作。π₀.₅ 的显式层级推理先输出文字子任务，如‘拿起枕头’，再据此生成 50 步、约 1 秒低层动作；离散语义路径和连续动作路径共享模型。", "训练机制同样关键：原始 π₀.₅ 先利用 FAST 动作 token、跨本体机器人数据、视觉语言与高层语义任务建立表示，再在任务相关移动操作数据上用 flow matching 学连续动作并学习 semantic action。后续 Knowledge Insulation 进一步联合 FAST 离散目标与连续 flow 目标，并阻断 action expert 梯度对 VLM backbone 的干扰。", "这种 co-training 尽量保留互联网语义知识，但开放世界实验强调新环境泛化，不等于任意新机器人零样本可用。当前 openpi 公开实现只支持 π₀.₅ 的 flow-matching head，不能声称完整复现论文的高层语义路径与完整训练配方。"],
    formula: { latex: String.raw`p_\theta(\mathbf A_t,\hat\ell_t\mid\mathbf o_t,\ell)=p_\theta(\hat\ell_t\mid\mathbf o_t,\ell)\;p_\theta(\mathbf A_t\mid\mathbf o_t,\ell,\hat\ell_t)`, symbols: [
      { symbol: "ℓ", meaning: "用户整体任务，如‘整理卧室’。" }, { symbol: "ℓ̂ₜ", meaning: "模型在时刻 t 生成的文字子任务，如‘拿起枕头’。" }, { symbol: "oₜ", meaning: "当前多相机观测与本体状态。" },
      { symbol: "Aₜ", meaning: "低层连续动作块；π₀.₅ 论文所述移动操作系统采用 50 步/约 1 秒，公开配置可能不同。" }, { symbol: "pθ(ℓ̂ₜ|·)", meaning: "离散自回归高层语义策略。" }, { symbol: "pθ(Aₜ|·)", meaning: "同时以原任务和当前子任务为条件的 flow action policy。" }, { symbol: "θ", meaning: "共享模型参数；高低层不是 GPT 外接另一个 policy。" },
    ], note: "这是一般链式分解，不是完整训练目标。若某个具体实现只用子任务替换原 prompt，还需额外声明 A 与原任务在给定观测和子任务后的条件独立假设。π₀.₅ 仍不是世界模型：它没有必须预测执行候选动作后的未来状态。" },
    deepDive: [
      { title: "证据边界", paragraphs: ["【官方可核对】π₀.₅ 项目页/论文报告开放世界任务、层级 semantic action 与连续动作；openpi 仓库公开 checkpoint、配置和 policy server 能力。具体版本以固定 revision README 为准。", "【合理推测】层级文字可能帮助长任务调试与语义泛化，但不能仅凭可读文字证明低层动作因果上依赖该子任务。", "【个人观点】2.5h核心+3.5h选做的分轨是教学设计；先读证据边界再租 GPU 更划算。", "【暂无法验证】本站当前没有替你运行 openpi checkpoint、LIBERO rollout 或微调，因此成功率、显存、速度和你的硬件兼容性均未复现；官方报告不等于本站本地验证。"] },
      { title: "π₀、π₀-FAST 与 π₀.₅ 不要混成一个名字", paragraphs: ["π₀ 的核心是预训练 VLM prefix 配合 flow-matching action expert 生成连续 action chunk。FAST 是动作 tokenization/压缩路线，可用于把机器人动作纳入离散自回归训练。π₀.₅ 利用更广的数据与高层 semantic action，目标是开放世界泛化。", "公开 openpi 的可运行配置不一定覆盖论文完整训练配方与所有高层语义路径。复现报告必须写清 checkpoint/config/revision，而不能只写“跑了 π₀.₅”。"], takeaways: ["模型名、论文能力、公开 checkpoint 能力分三列。", "环境泛化不等于新 embodiment 零样本。"] },
      { title: "核心阅读验收：判断四种说法", paragraphs: ["“论文报告在未见家庭环境执行长任务”属于官方报告；“任意新机器人可零样本使用”没有得到该结论支持；“openpi 命令启动成功”只证明软件链路；“我的任务成功率提高”必须有同协议 rollout 与样本数。", "显式语言子任务是层级策略输出，不等于预测动作后未来状态，因此不能自动称为 world model。"] },
    ],
    practice: { title: "双轨验收：核心阅读必做 / openpi 云端选做", summary: "先完成不依赖 GPU 的证据卡与架构图；有合适环境再做 random inference、norm stats、server/client 和 LIBERO，微调放在 smoke/eval 之后。", prerequisites: ["核心：完成 Flow Matching 章；能区分 action token 与连续 action slot。", "选做：官方支持环境或容器、足够 GPU/磁盘、固定 openpi revision；先读该 revision README。"], steps: ["【核心】从项目页、论文、openpi 各摘录一项可核对事实，分别写‘论文报告/代码公开/尚未复现’。", "【核心】画出 observation→VLM prefix→semantic action/flow action expert→chunk，不把 semantic action 画成未来状态。", "【核心】完成 π₀/FAST/π₀.₅ 对照表和5个 review 问题；完成即满足2.5h核心。", "【选做】隔离环境并记录 OS、revision、Python/JAX/CUDA、GPU；先运行官方 random-observation inference。", "【选做】转换目标数据、计算 norm stats，核对 H×dₐ、frame/unit/gripper 与 finite。", "【选做】启动 policy server 与 Dockerized LIBERO client，执行多个固定 seed；再决定是否微调。", "【选做】报告成功率/样本数/失败类型/延迟；命令启动、checkpoint加载、rollout成功分开记录。"], expected: ["核心产物不需要 GPU：架构图、训练阶段表、证据卡和边界说明。", "【未在本站复现】选做部分预期 checkpoint 能加载、随机输入产生 finite H×dₐ、server/client 协议匹配；必须由实际日志确认。", "只有完成多次 rollout 后才报告任务成功率；只完成 smoke test 时明确写 smoke-only。"], acceptance: ["核心：准确说明 π₀→π₀.₅ 改进，且不把官方报告写成个人复现。", "核心：区分 semantic action、continuous action 与 world prediction。", "选做：版本/环境/norm/action contract 完整，超时不复用旧 chunk。", "选做：成功率附样本数与 seed，至少有失败分类。"], debugging: ["checkpoint 不加载：先核 revision/config 名与权重类型，不要混不同 release。", "JAX OOM：核官方显存边界、XLA 预分配、batch 和可训练参数；命令能启动不代表配置可训练。", "shape 对但动作异常：检查 norm stats、action dimension、frame/unit/gripper 和数据 adapter。", "server/client 超时：记录 p99，使用 TTL；不要重放旧 chunk。", "LIBERO 0%：先做 random inference/数据回放，查观测键、相机顺序、统计和 action contract，再讨论模型能力。"], status: "云端必做", code: "# 以下仅为 openpi 风格流程提示；运行前以锁定 revision 的 README 为准\nuv run scripts/compute_norm_stats.py --config-name pi05_libero\nXLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run scripts/train.py pi05_libero --exp-name=course_run --overwrite" },
    pitfalls: ["宣称新机器人零样本万能", "把 openpi 动态资源估算写成永恒事实：截至 2026-08-08、main commit 15a9616，README 的单卡估算为推理>8GB、LoRA>22.5GB、全量>70GB；精度、batch、后续 revision 都可能改变", "把 Windows/WSL2 当官方已验证平台", "混装 JAX/Isaac 环境", "只看高层文字不看动作成功"],
    review: ["π₀.₅ 两条输出路径如何配合？", "co-training 与 Knowledge Insulation 分别解决什么问题？", "环境泛化与 embodiment 泛化区别？", "为什么公开代码跑通不等于复现论文全部能力？", "哪些产物属于2.5h核心，哪些必须等云端日志？"], completion: "核心完成：准确说明 π₀→π₀.₅ 的改进、证据和限制；选做完成：用固定 revision 接通官方 server/client 并提交可审计 rollout，而不是只贴启动截图。",
    sources: [{ title: "π₀.₅ project", url: "https://www.pi.website/blog/pi05", role: "官方说明" }, { title: "openpi · main@15a9616", url: "https://github.com/Physical-Intelligence/openpi/tree/15a9616a00943ada6c20a0f158e3adb39df2ccac", role: "2026-08-08 公开实现" }, { title: "Knowledge Insulation", url: "https://www.pi.website/research/knowledge_insulation", role: "后续官方训练方法" }, { title: "π₀.₅ paper", url: "https://arxiv.org/abs/2504.16054", role: "论文" }], visual: "pi05",
  },

  "data-and-adaptation": {
    lead: "这一章把 VLA 适配拆成可审计的数据契约、episode 级切分、train-only 归一化、可视化 replay、ACT 基线、LoRA/OFT 微调和闭环 rollout。8 小时是个人学习预算，不是训练耗时承诺；是否掌握只看验收物。",
    objectives: [
      "为一条机器人 episode 写出图像、状态、语言、动作、时间戳和动作契约的完整 schema。",
      "按 episode、场景与任务划分 train/val/test，证明相邻帧和归一化统计没有泄漏。",
      "完成数据 replay、train-only normalization round-trip 和一小批过拟合门禁。",
      "训练 ACT baseline，并在同一观测、动作、安全过滤和 rollout 协议下比较 VLA。",
      "解释 LoRA 与 OFT 分别改变什么、没有改变什么，以及何时需要适配 action head。",
      "用 rollout 失败树区分数据、感知、语言、动作契约、策略、执行器与安全层问题。",
    ],
    timePlan: [
      { duration: "0:00–0:45", title: "冻结数据与动作契约", activity: "逐字段写出 episode/frame schema，为相机、状态和动作标注 shape、dtype、unit、frame、Δt、valid mask 与版本。", deliverable: "一份可机器检查的数据字典和 action contract。" },
      { duration: "0:45–1:45", title: "数据审计", activity: "运行审计脚本，检查 episode 连续性、时间戳、有限值、维度、split 交叉和缺失字段；抽看异常 episode。", deliverable: "审计报告、被拒绝样本列表和修复记录。" },
      { duration: "1:45–2:30", title: "切分与归一化", activity: "按 episode/场景/任务切分；只用 train 计算统计量，保存 norm metadata，并验证 normalize→denormalize。", deliverable: "split manifest、train-only 统计和 round-trip 误差。" },
      { duration: "2:30–3:15", title: "可视化 replay", activity: "同步播放多相机、状态、语言和动作；叠加 frame_id、timestamp、episode 边界。本站以人工抽查 20 条 episode 作为教学起点，不是充分性保证。", deliverable: "replay 视频/截图与异常标注表。" },
      { duration: "3:15–4:45", title: "ACT baseline 门禁", activity: "先用 1 batch、再以 2–5 个 episode 作为教学起点做过拟合；数据复杂时应扩大样本。确认保存/重载、action mask、temporal ensemble 与 rollout 接口。", deliverable: "ACT checkpoint、过拟合曲线和最小 rollout 日志。" },
      { duration: "4:45–6:15", title: "LoRA / OFT 适配", activity: "冻结版本与 base checkpoint；记录可训练参数、峰值显存、action head、输入预处理与 norm；完成 smoke 和小数据过拟合。", deliverable: "VLA 配置、adapter/head checkpoint 和资源记录。" },
      { duration: "6:15–7:15", title: "同协议 rollout", activity: "ACT、VLA 和 zero/mean-action baseline 使用同一 seed、初始状态、相机、控制频率、限幅、TTL 和成功判据。", deliverable: "逐任务成功率、Wilson 区间、延迟和失败类别表。" },
      { duration: "7:15–8:00", title: "失败树与实验卡", activity: "从数据 replay 到安全执行逐层定位至少三次失败；写清已确认、合理推测和暂无法验证。", deliverable: "失败树、实验卡和下一轮最小改动。" },
    ],
    theory: [
      "数据样本不是一组图片目录。episode 元数据应包含 episode_id、task_id、语言、机器人/相机/标定版本、成功标签与终止原因；每帧至少包含 frame_index、timestamp、多相机引用、本体状态、动作、动作有效位和必要的传感器状态。动作契约必须声明 position/velocity/delta、joint/EEF、absolute/relative、base/tool frame、单位、采样周期与 gripper 语义。",
      "切分必须以 episode 为最小单位，并根据目标选择是否进一步隔离场景、物体实例或语言模板。随机拆 frame 会让相邻近重复图像出现在训练和验证中。归一化统计、动作分位数、词表适配和图像增广参数都只能从 train split 拟合，再原样用于 val/test 与部署。",
      "数据进入训练前先 replay：多相机是否同一决策时刻、动作是否延迟一帧、语言是否在 episode 中途变化、padding 是否被 mask、夹爪开合是否反号，都应从同步回放中看出来。然后做 1 batch 与少量 episode 过拟合；若做不到，先修 pipeline，而不是扩大数据或换大模型。",
      "ACT 是数据与控制接口的强基线，不是 VLA。它用 CVAE 风格训练、action chunking 和 temporal ensemble 建模窄任务策略，参数和依赖通常比通用 VLA 更容易检查。ACT 成功而 VLA 失败，优先查 VLA 预处理、语言条件、action head、归一化和推理服务；ACT 也失败则先回到数据、动作契约和环境。",
      "LoRA 在选定线性层旁学习低秩更新，减少可训练参数和优化器状态，但不会自动减少冻结 backbone 的激活显存，也不会自动解决 action dimension、坐标系或控制频率变化。OFT 是 OpenVLA 的一套连续动作、action chunking、并行解码和训练/部署改造；论文报告的提升属于其公开实验设置，不能直接视为你的任务预期。",
      "最终比较必须依靠闭环 rollout。validation loss 只衡量专家分布上的拟合；成功率还受场景初始化、时延、相机、控制器、安全过滤和恢复策略影响。ACT、VLA 与 ablation 必须共享协议，并逐次保存 request_id、observation_time、action chunk、反归一化结果、过滤结果和终止原因。",
    ],
    deepDive: [
      {
        title: "证据边界：先把结论分级",
        paragraphs: [
          "【已确认】episode 级切分可避免同一轨迹帧跨 split，train-only 统计可避免验证/测试信息进入训练变换；LoRA 的低秩参数化和 ACT/OFT 的公开结构可由本章官方仓库与论文核对。",
          "【合理推测】时间错位、错误归一化、动作契约不一致和 split 泄漏会造成 VLA 训练或 rollout 异常，因为这些错误直接改变监督标签与部署解码；在你的数据上影响多大仍需审计和消融。",
          "【工程建议 / 个人观点】先 ACT、再 VLA；先 replay/过拟合、再大训练，是为了缩短排错路径的建议，不是所有项目唯一正确的研究顺序。",
          "【暂无法验证】本教程没有访问你的数据、硬件、checkpoint 或 rollout，因此不声称 LoRA/OFT 会提高成功率，也不声称 8 小时内能完成真实训练；训练墙钟时间取决于模型、数据与算力。",
        ],
      },
      {
        title: "1. Schema：一条样本到底承诺了什么",
        paragraphs: [
          "本站审计 manifest 建议把不随帧变化的信息放 episode 表：episode_id、task_id、language、robot_config_revision、camera_calibration_revision、action_contract_revision、split、success 与 termination_reason；帧表存 episode_id、frame_index、timestamp_s、images、state、action、action_valid。它不是 LeRobotDataset v3 的原生存储 schema，而是课程用于导出和审计的映射层；接入 LeRobot 时必须显式记录字段对应关系。",
          "状态和动作不是匿名向量。metadata 应按维度记录 name、unit、frame、type、min/max 或分位数、fixed/invalid 规则。动作块跨 episode 末尾时 padding 必须配 valid mask；缺失相机不得悄悄复制上一帧，除非 schema 明确记录 stale age 并且训练/部署一致。",
        ],
        takeaways: ["每个数值轴都有物理名字和单位。", "标定、机器人配置、动作契约都有 revision。", "真实零动作、padding 和缺失观测必须可区分。"],
      },
      {
        title: "2. Split、Normalization 与 Replay 三道门",
        paragraphs: [
          "第一道门是 split：同一 episode 不能跨集合；若评估新场景或新物体，scene_id/object_id 也必须成组隔离。第二道门是 normalization：仅从 train 计算 mean/std 或 quantile，常量维单独处理，metadata 与 checkpoint 一起保存。第三道门是 replay：按 timestamp 同步显示图像、状态与动作，人工检查动作方向、夹爪边沿和 episode 结束。",
          "normalization round-trip 应满足 denorm(norm(a))≈a；越界部署值要计数而不是静默裁剪。replay 不只看成功 episode，还要覆盖失败、接管、恢复、缺帧和最长 episode。若语言条件在 episode 中变化，应把有效区间写入帧记录，而不是只存一条最终指令。",
        ],
        takeaways: ["先定义要测的泛化，再决定分组切分。", "验证/测试绝不参与统计量拟合。", "20 条同步 replay 是本站教学起点，不是足够覆盖数据问题的通用结论。"],
      },
      {
        title: "3. ACT baseline：用简单系统证明数据可学",
        paragraphs: [
          "ACT 的教学门禁依次为：随机 batch shape/finite；1 batch 过拟合；从 2–5 episode 起步的小集过拟合；checkpoint 保存重载一致；开环预测反归一化后语义正确；仿真或安全环境 rollout。2–5 只是便于快速诊断的起点，不是所有数据集都应达到的充分样本数。",
          "baseline 必须使用与 VLA 相同的图像裁剪、状态、动作表示、chunk horizon 和低层执行器；只有模型结构与明确消融项不同。若 ACT 使用更干净输入或不同安全限幅，比较无法回答模型差异。",
        ],
        takeaways: ["ACT 是接口和数据的对照组。", "先过拟合是 pipeline 门禁，不是泛化证据。", "保存重载必须在 rollout 前验证。"],
      },
      {
        title: "4. LoRA 与 OFT：适配的是参数，不是物理语义",
        paragraphs: [
          "LoRA 可施加于 attention 或 MLP 投影；rank、target_modules、学习率、精度、冻结策略和 action head 是否训练都要记录。若新机器人 action dimension 不同，通常仍需新建或适配 head；加载 adapter 时要核对 base checkpoint revision，不能只靠同名文件。",
          "OFT 的公开方法针对 OpenVLA 改进连续动作和高频控制。能否迁移到目标任务取决于数据、观测与动作契约。正确比较应同时记录可训练参数、峰值显存、吞吐、p50/p99 推理延迟、训练预算和 rollout，而不是只比较离线 loss。",
        ],
        takeaways: ["LoRA 降低可训练参数，不等于不会 OOM。", "OFT 是一套具体改造，不是所有连续 head 的统称。", "任何提升只在明确的评测协议内成立。"],
      },
      {
        title: "5. Rollout 失败树：loss 正常、成功率为零时",
        paragraphs: [
          "先查数据与输入：replay 是否对齐，部署预处理是否与训练一致，语言/相机顺序是否正确；再查解码：norm revision、action dimension、absolute/delta、frame、unit、gripper、Δt；再查策略：输出 finite、是否塌缩、chunk 是否越界；最后查执行与评测：TTL、限幅、控制频率、初始化、成功判据和 reset。",
          "最小定位实验包括：用训练 episode 做离线 replay；固定同一观测比较 ACT/VLA 原始与反归一化输出；把模型动作替换为记录的专家动作验证执行器；把执行器替换为离线环境验证策略。一次只切断一层，避免在全链同时改参数。",
        ],
        takeaways: ["专家动作也失败：环境/执行器/评测优先。", "ACT 成功、VLA 失败：VLA 预处理/head/norm 优先。", "开环正确、闭环漂移：延迟、分布偏移和恢复数据优先。"],
      },
    ],
    formula: { latex: String.raw`\mathbf y=\mathbf W_0\mathbf x+\frac\alpha r\mathbf B\mathbf A\mathbf x,\quad\#\rm trainable=r(d_{\rm in}+d_{\rm out})`, symbols: [
      { symbol: "W₀", meaning: "冻结预训练权重。" }, { symbol: "A,B", meaning: "LoRA 降/升维矩阵。" }, { symbol: "r", meaning: "低秩 rank。" }, { symbol: "α", meaning: "更新尺度。" }, { symbol: "x,y", meaning: "层输入/输出。" }, { symbol: "#trainable", meaning: "不含激活显存。" },
    ], note: "#trainable 只计算这一层两个低秩矩阵；完整模型还可能训练 action head、projector 或其他模块。冻结权重的前向激活仍可能占大量显存。" },
    practice: {
      title: "数据审计 → ACT → LoRA/OFT → 同协议 rollout",
      summary: "先用无第三方依赖脚本验证 manifest，再把相同数据契约用于 ACT 与 VLA。训练和效果需在你的环境实际执行；本教程只提供验收配方。",
      prerequisites: [
        "Python 3.10+；先运行内置 --demo，无需 GPU 或外部数据。",
        "真实实验需固定数据 revision、代码 commit、base checkpoint、相机/机器人配置和安全边界。",
        "准备按 episode 导出的 JSONL manifest；字段示例由审计脚本 --write-demo 生成。",
      ],
      code: "python public/labs/audit_robot_dataset.py --demo\npython public/labs/audit_robot_dataset.py --write-demo demo_robot_manifest.jsonl\npython public/labs/audit_robot_dataset.py --input demo_robot_manifest.jsonl",
      steps: [
        "运行 --demo；阅读报告中的 split episodes、动作维度、train-only mean/std 和 norm round-trip。",
        "用 --write-demo 导出 JSONL，查看每帧的 episode_id、frame_index、timestamp_s、split、state、action 与 action_valid；按同样 schema 导出自己的 manifest。",
        "审计真实 manifest；任何 episode 跨 split、timestamp 不递增、维度漂移、NaN/Inf、常量维未声明都先修复。",
        "同步 replay 从 20 条 episode 的教学样本起步，覆盖成功、失败、接管和缺帧；真实项目按规模与风险扩大抽检，并记录语言、图像、状态、动作是否同一决策时刻。",
        "ACT 依次完成 1 batch、少量 episode、保存/重载和安全 rollout；保存反归一化动作与执行日志。",
        "锁定 OpenVLA/OFT 或其他 VLA 的官方 revision，先做 forward/smoke，再小数据过拟合；核对 adapter、action head 和 norm revision。",
        "ACT、VLA、zero/mean baseline 按同一 seed/初始状态/安全协议 rollout；逐次标注失败树节点。",
      ],
      acceptance: [
        "审计脚本正常数据 PASS，注入 split 泄漏或 NaN 后明确 FAIL。",
        "train/val/test episode 无交叉，所有统计量来源仅为 train。",
        "normalize→denormalize 最大误差低于 1e-9；常量维和越界值有显式策略。",
        "ACT 能过拟合小样本且 checkpoint 重载输出一致；这不被表述为泛化成功。",
        "ACT/VLA 使用相同输入、动作、执行和评测协议，并报告 N、成功率、不确定性、延迟和失败分类。",
        "实验卡注明哪些结论已复现、哪些只是官方报告、哪些暂无法验证。",
      ],
      expected: [
        "--demo 输出 AUDIT PASS、train/val/test episode 数、动作统计和极小 round-trip error。",
        "ACT 小样本 loss 应显著下降；真实 rollout 成功率未知，必须以记录为准。",
        "LoRA 可训练参数应少于全量微调，但峰值显存不保证按同一比例下降。",
        "失败树最终应把每次失败落到一个可复现实验，而不是笼统写‘模型不行’。",
      ],
      debugging: [
        "审计 FAIL：先按第一条 error 定位 episode/frame；不要用 try/except 跳过坏样本。",
        "ACT 不能过拟合 1 batch：查 action mask、归一化、时间偏移、学习率和 head shape。",
        "保存重载不一致：核对 eval 模式、随机增广、norm metadata 和 checkpoint 完整性。",
        "VLA loss finite 但动作不动：查看反归一化前后数值、常量维、gripper 与 action head 是否训练。",
        "专家动作 replay 也失败：优先查控制接口、frame/unit/dt、安全过滤和环境 reset。",
      ],
      status: "配方核验",
    },
    pitfalls: ["按 frame 随机拆分造成近重复泄漏", "用 val/test 计算归一化或动作分位数", "ACT 与 VLA 使用不同输入或限幅却比较成功率", "LoRA adapter 正常加载但 action head 维度/语义错误", "只看 val loss 或最好视频，不保存逐次 rollout", "把 OFT 论文结果当成目标机器人承诺"],
    review: ["为什么 split 和 normalization 都必须以 train episode 为边界？", "ACT 成功而 VLA 失败时，前四个检查项是什么？", "LoRA 为什么仍可能 OOM，又为何不能自动适配新 action space？", "如何用专家动作 replay 把策略问题和执行器问题分开？", "一个公平 rollout 协议至少要冻结哪些变量？"],
    completion: "交付可机器审计的 schema/split/norm、从 20 条教学样本起步并按风险扩大的同步 replay、ACT baseline、VLA adapter/head、同协议 rollout 表、失败树，以及包含 revision/seed/显存/延迟/证据边界的实验卡。",
    sources: [{ title: "LeRobotDataset v3", url: "https://huggingface.co/docs/lerobot/lerobot-dataset-v3", role: "数据格式" }, { title: "ACT", url: "https://github.com/tonyzhaozh/act", role: "基线实现" }, { title: "OpenVLA-OFT", url: "https://openvla-oft.github.io/", role: "连续动作适配" }, { title: "LoRA", url: "https://openreview.net/forum?id=nZeVKeeFYf9", role: "低秩适配" }, { title: "LeRobot", url: "https://github.com/huggingface/lerobot", role: "训练与评测底座" }],
  },

  "vla-families": {
    lead: "VLA 选型不是模型排行榜，而是约束求解：动作生成范式能否表达任务，输入/输出是否匹配机器人，数据 adapter 是否存在，代码与权重是否真的开放，硬件能否训练/推理，最后才比较论文指标。本章用 3 小时完成一张可追溯决策表和两个约束案例。",
    objectives: ["先按离散自回归、连续回归/chunk、diffusion/flow action expert 分类，而非按公司或参数量。", "逐项审计输入相机/语言/状态、动作输出、数据格式、开源层级、硬件和部署边界。", "区分 narrow-task baseline、首个可跑 VLA 与研究型 stretch model。", "用硬约束先淘汰不可行模型，再对剩余候选做加权评分与 smoke test。", "为低算力桌面操作和高算力跨本体项目各给出 baseline/primary/stretch 方案。"],
    timePlan: [
      { duration: "0:00–0:35", title: "按动作范式分类", activity: "把 ACT、OpenVLA、OFT、SmolVLA、π/openpi 等放入离散/连续/生成式路线。", deliverable: "范式树。" },
      { duration: "0:35–1:15", title: "七维审计", activity: "检查 input/output/data/open-source/hardware/latency/适用边界。", deliverable: "候选证据矩阵。" },
      { duration: "1:15–1:45", title: "硬约束与评分", activity: "先做 must-have gate，再给可行候选设项目权重。", deliverable: "带来源日期的打分表。" },
      { duration: "1:45–2:20", title: "案例 A：单卡桌面操作", activity: "有限显存、LeRobot 数据、单机器人窄任务，选择 baseline/primary/stretch。", deliverable: "三层选型和否决理由。" },
      { duration: "2:20–2:50", title: "案例 B：云端跨本体", activity: "多机器人、多相机、连续动作、服务化部署，重做同一流程。", deliverable: "三层选型和验证预算。" },
      { duration: "2:50–3:00", title: "反方审查", activity: "为首选模型写三个可能让决策翻转的新事实。", deliverable: "更新触发器。" },
    ],
    theory: ["动作生成先决定训练与部署形态。离散自回归把动作量化/tokenize，可复用语言模型解码但有量化和序列延迟；连续 deterministic/chunk head 并行输出，简单快速但单峰；diffusion/flow action expert 可表达连续多峰 chunk，代价是额外采样/积分与更复杂服务。FAST 是时间压缩 tokenization，不能仅用‘离散’二字等同普通逐维 bin。", "输入必须逐字段匹配：相机数量/身份、图像尺寸、语言 tokenizer、本体状态维度和历史长度。输出审计 command type、H×dₐ、frame、unit、dt、rotation/gripper、normalization。模型能加载但 adapter 语义不匹配，比显式 shape error 更危险。", "数据审计包括 dataset schema、episode split、语言覆盖、目标 embodiment 与动作统计。开源不是二值：可分别开放论文、推理代码、训练代码、权重、数据、商业许可和可复现配置。硬件也不能只写显存数字：记录精度、batch、冻结/LoRA/全量、训练还是推理、具体 revision 和测量日期。", "同任务应保留窄策略 baseline（如 ACT/Diffusion）来判断 VLA 是否真的带来语言或迁移收益。Primary 选择应首先可跑通数据—训练—rollout闭环；stretch 可以追求开放世界或跨本体能力，但不能阻塞基线交付。"],
    deepDive: [
      { title: "证据边界", paragraphs: ["【官方可核对】各模型的输入、动作头、公开资产和支持配置应从对应论文/官方仓库固定 revision 核对。本章只提供审计方法，不把会变化的版本、显存或 release 状态固化为永恒事实。", "【合理推测】轻量、与现有数据工具链紧密的模型通常更适合首个端到端 VLA，但最终取决于你的数据和硬件。", "【个人观点】3 小时、baseline/primary/stretch 三层与‘先 gate 后评分’是项目选型建议。", "【暂无法验证】本站未在你的 GPU、机器人和数据上 benchmark 所有候选，任何硬件可行性与成功率都要用固定版本 smoke/rollout 验证。"] },
      { title: "七维模型证据矩阵", paragraphs: ["①动作范式；②输入协议；③输出 action contract；④训练数据/adapter；⑤开放资产与许可；⑥训练/推理硬件和延迟；⑦适用边界与评测。每格都写 source+revision/date，未知就写 unknown，不用营销描述补空。", "常见候选角色：ACT/Diffusion 是窄任务 baseline；OpenVLA/OFT 代表开放离散VLA及其连续优化路线；SmolVLA/LeRobot 路线适合检验紧凑工具链；Octo/X-VLA/π/openpi/GR00T 等分别面向不同通用、跨本体、连续动作或人形研究问题。具体能力必须回到当前官方资产核对。"] },
      { title: "案例 A：有限显存的单机器人桌面任务", paragraphs: ["约束示例：单路+wrist 相机、LeRobot episodes、7D EEF delta、窄任务但有语言改写、单张消费级 GPU、两周交付。硬 gate 是本地可跑、数据 adapter 清楚、动作输出可适配。Baseline 选 ACT；primary 可先评估与 LeRobot 工具链紧密的轻量 VLA；较大 openpi/OpenVLA 路线只在实测资源和 adapter 通过后作为 stretch。", "这不是固定型号推荐。若语言泛化不是指标，ACT 可能就是最终方案；若 primary 无法在小数据过拟合或 rollout 胜过 baseline，应回到数据/协议，而不是立刻换更大模型。"], takeaways: ["先交付 baseline。", "消费级 GPU 的可行性必须用具体 revision 实测。", "语言收益要用 paraphrase/novel-object split 验证。"] },
      { title: "案例 B：云端跨本体连续控制", paragraphs: ["约束示例：多机器人、多相机、动作维和frame异质、云端加速器、需要 policy server 与异步 chunk。Gate 先检查跨本体 canonical adapter、连续动作频率、训练代码/权重/许可和 server/client。Baseline 仍按每个 embodiment 单独训练窄策略；primary 从公开跨本体/continuous-expert 候选中做两个 smoke；人形专用栈仅在目标确为人形且支持硬件匹配时进入。", "云端资源充足不等于模型可部署：还要测 p99、队列 reserve、norm/action contract 与受控停止。论文跨本体结果不能替代你的机器人适配实验。"], takeaways: ["按 embodiment 分报结果。", "hardware budget 与 integration budget 分开。", "选择两个候选实测，不凭表格精确到小数决定。"] },
      { title: "先 Gate，再评分，再实测", paragraphs: ["Gate 示例：许可允许、输入/输出可适配、最小硬件可用、训练或权重可得、目标机器人受支持。任何一项失败就标 blocked，不应靠其他高分抵消。", "对通过 Gate 的候选再用公式评分；权重公开并做敏感性分析。最后用同一数据和 rollout 协议 smoke，两张表都不能替代实验。"] },
    ],
    formula: { latex: String.raw`S(m)=w_dD_m+w_aA_m+w_rR_m+w_cC_m+w_oO_m,\quad\sum_iw_i=1`, symbols: [
      { symbol: "S(m)", meaning: "项目适配评分，不是论文指标。" }, { symbol: "Dₘ", meaning: "数据/embodiment 兼容。" }, { symbol: "Aₘ", meaning: "动作精度/频率适配。" }, { symbol: "Rₘ", meaning: "算力可行性。" }, { symbol: "Cₘ", meaning: "工程成熟度。" }, { symbol: "Oₘ", meaning: "开放程度。" }, { symbol: "wᵢ", meaning: "项目权重，总和 1。" },
    ] },
    practice: { title: "双案例约束选型", summary: "不训练全部模型；先从官方来源建矩阵，对两个案例完成 Gate→评分→smoke 计划，并保留 unknown。", prerequisites: ["已完成动作表示、chunking 和数据适配章节。", "明确自己的机器人 action contract 和硬件/时间预算。"], steps: ["为每个候选填写七维矩阵；所有动态事实附 revision/date，未知写 unknown。", "列5个不可妥协 Gate，先淘汰 license/adapter/hardware/release 不可行项。", "对案例A选 baseline/primary/stretch，并为每个被淘汰项写一条证据化理由。", "对案例B重新设权重，不复用案例A结论；加入跨本体与p99部署成本。", "让评分权重上下变化20%，观察首选是否稳定；若不稳定，指出需要补哪项实测。", "为最终两个候选设计同协议 smoke：小数据过拟合、random inference、延迟、checkpoint reload 和至少一组 rollout。"], expected: ["产出两张包含 source/revision/date/unknown 的矩阵。", "案例A和B的首选可以不同，且各有 baseline/primary/stretch。", "不会用论文参数量或单一成功率直接替代接口、硬件与数据可行性。"], acceptance: ["能解释离散AR、连续chunk与diffusion/flow 的工程差异。", "输入/输出/data/open-source/hardware/边界七项无空白伪造。", "硬 Gate 不被加权高分覆盖。", "最终建议包含可执行 smoke 和改变决策的触发条件。"], debugging: ["所有模型得分接近：权重或尺度没有体现项目硬约束，先做 Gate。", "显存信息冲突：记录 precision/batch/mode/revision/date，分别写官方值与实测值。", "README 说支持但 adapter 报错：以固定 revision 的代码/schema 为准，记录 issue，不自行推断。", "首选随权重轻微变化就翻转：不要给假精度，优先补 latency/rollout 实测。", "大模型表面最强：检查是否与 baseline 使用相同数据、相机、安全层和 rollout 协议。"], status: "配方核验" },
    pitfalls: ["把开源当成论文/代码/权重/数据/许可全部开放", "混用不同 release 的能力和显存数字", "评分前不做硬 Gate", "忽略输入相机与 action contract", "用平均推理延迟设计队列", "没有窄任务 baseline"],
    review: ["三种动作生成范式的训练与部署差异？", "开源层级至少拆成哪六项？", "案例A为什么不应默认最大模型？", "案例B为什么云端算力充足仍可能部署失败？", "什么事实会让你的 primary 与 stretch 互换？"], completion: "为两个约束案例交付可追溯矩阵、baseline/primary/stretch、同协议 smoke 计划和决策更新触发器。",
    sources: [{ title: "SmolVLA", url: "https://huggingface.co/docs/lerobot/smolvla", role: "轻量" }, { title: "OFT", url: "https://openvla-oft.github.io/", role: "连续动作" }, { title: "X-VLA", url: "https://huggingface.co/docs/lerobot/xvla", role: "跨本体" }, { title: "GR00T", url: "https://github.com/NVIDIA/Isaac-GR00T", role: "人形" }, { title: "Octo", url: "https://octo-models.github.io/", role: "通用策略" }],
  },

  "world-models": {
    lead: "VLA policy 回答“现在做哪个动作”，dynamics 回答“执行后状态如何变化”，reward 判断“一步有多好”，value 估计“从这里往后有多好”。把四者混叫 world model 会让训练目标和评测都失焦。本章用 5 小时建立边界，并实现只在 VLA 有限候选集内重排的最小闭环；时长是个人建议。",
    objectives: ["区分 policy、dynamics/world model、reward、value 的输入、输出和监督信号。", "解释 one-step loss 为何不能保证长 imagined rollout，定位 model bias 累积。", "用 ensemble disagreement 表达 epistemic uncertainty，并说明它不是安全证明。", "画出 VLA 与世界模型的五种组合方式及各自接口。", "在有限 VLA 候选集内做模型重排，复现不受约束优化如何利用 OOD 模型漏洞。"],
    timePlan: [
      { duration: "0:00–0:45", title: "四类函数边界", activity: "为 policy/dynamics/reward/value 分别写输入、输出、标签和用途。", deliverable: "四列表格。" },
      { duration: "0:45–1:35", title: "世界模型训练", activity: "比较像素、latent、state 与 reward prediction；区分 teacher-forced one-step 和 free rollout。", deliverable: "训练/推理计算图。" },
      { duration: "1:35–2:20", title: "model bias 与不确定性", activity: "手算每步固定偏差如何随 horizon 累积；比较 ensemble、dropout 与数据密度。", deliverable: "误差—horizon 表和回退规则。" },
      { duration: "2:20–3:10", title: "五种组合方式", activity: "从辅助训练到 proposer/evaluator、MPC、层级规划与联合模型逐一画接口。", deliverable: "五图对照。" },
      { duration: "3:10–4:20", title: "候选重排 Toy", activity: "运行有限候选重排，再开放任意动作搜索，观察 OOD optimizer exploitation。", deliverable: "完整输出与失败解释。" },
      { duration: "4:20–5:00", title: "项目设计验收", activity: "为自己的任务定义 candidate source、cost、uncertainty、fallback 和真实 rollout 评测。", deliverable: "一页实验协议。" },
    ],
    theory: ["策略 πθ(A|o,ℓ) 输出动作分布；dynamics/world model pφ(zₜ₊₁|zₜ,aₜ) 预测动作条件的未来；reward r(z,a,ℓ) 是一步标量反馈；value V(z,ℓ) 是在某策略或最优假设下的未来累计回报估计。reward/value 可以和 dynamics 共用 backbone，但语义不相同。π₀.₅ 的文字子任务若不预测动作条件的未来，也不能单凭层级输出叫 world model。", "训练 one-step dynamics 时输入真实 zₜ，预测 zₜ₊₁；规划时模型反复吃自己的预测，输入分布逐步偏离训练数据。微小偏差会随 horizon 传播，这就是 model bias。必须同时报告 one-step 与 multi-step/free-rollout error，并按 horizon、场景和动作幅度分层。", "不确定性可用多个独立/bootstrapped 模型的预测分歧近似；分歧高常提示数据稀疏或模型不一致，但所有模型也可能一致地错。可用 uncertainty penalty、拒绝、缩短 horizon 或回到 VLA/安全控制器；不能把低方差当安全认证。", "本教程建议先评估一种较保守的组合：让 VLA 生成有限、接近数据分布的候选 chunks，再由 world model 预测并按目标 cost 重排。它仍不提供安全保证。若直接对模型输入做无约束梯度/网格优化，优化器可能寻找模型误差较大的 OOD 区域，从而得到“预测完美、真实灾难”的动作。", "五种组合从松到紧是：① world prediction 作为辅助训练/表示学习，部署仍只用 policy；② VLA proposer + world evaluator 在有限候选内重排；③ 受约束 MPC 在模型中优化低层动作；④ world model/规划器选高层子目标，VLA 执行技能；⑤ 共享 backbone 或统一序列模型联合预测未来、reward/value 与动作。越紧耦合，训练和接口审计越复杂。"],
    deepDive: [
      { title: "证据边界", paragraphs: ["【已确认】policy/dynamics/reward/value 的数学定义、model-based planning 和 imagined rollout 可由控制/RL 文献核对。有限候选公式明确限制搜索域。本地 Toy 已运行：候选(.2,.3,.5)的模型/真实终点均为1；无约束搜索找到约1.81的重复动作，模型预测1、真实终点5.418，ensemble variance约0.520。", "【合理推测】在真实 VLA 系统中，候选集限制通常比任意动作优化更不易离开策略数据分布，但候选本身仍可能 OOD。", "【个人观点】5 小时节奏、先做 evaluator 再尝试 MPC，以及默认用不确定性触发回退，是教学/工程建议。", "【暂无法验证】Toy 的 world model 是手工构造而非训练；本站未在你的数据上验证世界模型精度、重排增益或安全性，不能外推数值。"] },
      { title: "四类对象的最小契约", paragraphs: ["Policy: (o,ℓ)→distribution over A，标签通常来自动作演示或回报优化。Dynamics: (z,A)→future z/observation distribution，标签来自时间相邻数据。Reward: (z,a,ℓ)→scalar immediate preference，来源可能是人工定义、环境或学习。Value: (z,ℓ)→expected discounted return，依赖策略和 horizon。", "“视频看起来合理”只检查 observation prediction，不等于 reward 正确；“value 高”也不告诉你未来具体发生什么。规划时必须写清 cost 到底由预测状态、reward model 还是 value head提供。"], takeaways: ["先写函数签名，再说模型名。", "value 必须注明对应策略/horizon。", "reward/value error 与 dynamics error 分开评测。"] },
      { title: "model bias 如何积累", paragraphs: ["若一维真 dynamics 为 xₜ₊₁=xₜ+aₜ，模型每步额外偏差 δ，在固定动作下 H 步均值偏差可达 Hδ；非线性系统还会放大状态偏差，使后续模型输入更 OOD。one-step MSE 很小不能推出 long-horizon planning 正确。", "实务上画 error-vs-horizon，比较 teacher-forced 与 free rollout；用 ensemble disagreement、数据距离和约束监控 OOD。缩短 horizon 会减少偏差积累，却可能牺牲长任务规划。"] },
      { title: "五种组合方式与适用顺序", paragraphs: ["①辅助预测适合先验证表征是否获益；②有限候选重排不改 VLA 动作接口，容易做 A/B；③MPC 直接优化动作更灵活也最容易钻模型漏洞；④层级子目标让世界模型处理较慢规划、VLA处理低层控制；⑤联合模型最统一但最难判断增益来源。", "推荐先保证 policy baseline 和真实 rollout 协议，再加②并报告候选 oracle 上限；只有模型多步误差与约束足够可信时再尝试③。这里的推荐属于个人工程观点。"] },
      { title: "数值例：为何只在候选集内 argmin", paragraphs: ["Toy 的四个候选 chunks 每维都在训练支持范围 |a|≤0.6，手工 ensemble 在该区间精确，重排选出和为1的(.2,.3,.5)。开放搜索后，模型的三次项外推在 a≈1.81 处伪造终点1，而真实三步到5.418。", "这就是 optimizer exploitation：优化器不是在寻找真实最优，而是在寻找 learned model 的低 cost。有限候选不能证明安全，但把搜索限制在 VLA proposal 分布附近，并可结合 uncertainty penalty 与动作约束。"] },
    ],
    formula: { latex: String.raw`\hat{\mathbf A}=\arg\min_{\mathbf A\in\mathcal C_\theta(\mathbf o_t,\ell)}\;\mathbb E_{p_\phi(\mathbf z_{t+1:t+H}\mid\mathbf z_t,\mathbf A)}\left[\sum_{h=1}^{H}c(\mathbf z_{t+h},\ell)\right]`, symbols: [
      { symbol: "Â", meaning: "世界模型评估后选出的动作块。" }, { symbol: "Cθ", meaning: "由 VLA 在当前观测与语言下采样得到的有限候选集，避免任意优化钻世界模型 OOD 漏洞。" }, { symbol: "A", meaning: "候选动作块。" }, { symbol: "pφ", meaning: "未来潜状态分布。" }, { symbol: "zₜ", meaning: "当前潜状态。" }, { symbol: "H", meaning: "imagined horizon。" }, { symbol: "c(z,ℓ)", meaning: "语言目标代价。" }, { symbol: "E", meaning: "对随机未来取期望。" },
    ] },
    practice: { title: "有限 VLA 候选重排 + OOD exploitation", summary: "零依赖脚本用手工 world-model ensemble 评估四个 VLA 候选，并对照不受约束搜索如何找到模型漏洞；同时显式打印 reward 与 value。", prerequisites: ["Python 3.10+，无需第三方库。", "先写出 policy/dynamics/reward/value 四个函数签名，并手算四个候选真实终点。"], steps: ["运行 python public/labs/world_model_reranking.py，保存候选排序与 exploit 输出。", "阅读 true_rollout、ensemble_rollout、task_cost，分别标注 dynamics、uncertainty 和 reward/cost；指出脚本没有训练 policy。", "把 uncertainty_weight 从2改为0，再加入一个 |a|>.6 的候选，观察排名和方差。", "把 horizon 从3增加到10并给 learned_step 加每步偏差，画 predicted-vs-true error。", "把有限候选限制删掉，解释 a≈1.81 为什么在模型中好、真实中坏；不要把它称为 adversarial attack。", "为真实项目设计 candidate oracle：在同一候选集中用真实仿真/环境事后选最佳，估计重排器的可提升上限。"], expected: ["【本地已确认】有限候选选(.2,.3,.5)，预测/真实终点均为1，uncertainty=0。", "无约束 exploit 重复动作约1.81，模型/真实终点约1/5.418，ensemble variance约0.520。", "脚本打印逐步 reward、terminal reward、value estimate 与 ALL CHECKS PASSED。"], acceptance: ["能准确区分四类函数及训练标签。", "报告 one-step 与 multi-step error，不用前者替代后者。", "argmin 明确限制在 VLA 候选集 Cθ(o,ℓ)，并有 uncertainty/OOD fallback。", "能解释 Toy 是手工模型演示，未证明真实重排收益。"], debugging: ["重排总选静止：检查 action penalty 与 goal cost 尺度，先打印每个分项。", "模型预测好但真实差：按 action magnitude/horizon 查 OOD 和 model bias，比较 ensemble 分歧。", "ensemble 方差低仍失败：模型可能共享数据偏差而一致地错；低方差不是正确性证明。", "候选都很差：evaluator 无法创造新动作，先测 proposer 的 candidate oracle 上限。", "优化器给出极端动作：限制候选/action prior/物理边界，并用真实 rollout 审计；不要只加 clip 后宣布解决。"], status: "已验证", code: "python public/labs/world_model_reranking.py" },
    pitfalls: ["视频生成器都叫控制 world model", "π₀.₅ 文字子任务=未来预测", "只看像素质量", "模型自生成数据自证"],
    review: ["policy、dynamics、reward、value 的函数签名和标签分别是什么？", "one-step MSE 为什么不能保证 imagined rollout？", "五种 VLA+world model 组合方式分别是什么？", "为什么 ensemble 低方差仍可能全错？", "为何候选集内重排比任意动作优化更不易出现 OOD exploitation？"], completion: "不看答案画出五种组合，运行候选重排与 OOD 对照；为项目提交含 candidate oracle、multi-step error、uncertainty 与真实 fallback 的实验协议。",
    sources: [{ title: "World Models", url: "https://arxiv.org/abs/1803.10122", role: "概念" }, { title: "DreamerV3", url: "https://arxiv.org/abs/2301.04104", role: "imagined rollout" }, { title: "π₀.₅", url: "https://www.pi.website/blog/pi05", role: "层级对照" }], visual: "world",
  },

  "frontier-and-deployment": {
    lead: "前沿不是模型名清单：每项都要回答旧系统卡在哪里、改了什么、证据是什么、代价和缺陷是什么。",
    objectives: [
      "完成部署必修：把 VLA 拆成策略服务、版本化协议、客户端安全层和低层控制闭环。",
      "用足量延迟样本估计 p99，并把推理、网络和余量换算成动作队列 reserve。",
      "区分消息 TTL、watchdog、旧响应拒绝、controlled stop 与硬件急停。",
      "运行故障注入：schema 错配、乱序、过期前缀、极端动作、TTL 和心跳中断。",
      "完成前沿选修：按‘旧问题—改动—证据—代价/缺陷’评估 OFT、FAST、RTC、3D/触觉、人类视频/仿真与规划。",
    ],
    timePlan: [
      { duration: "0:00–0:40 · 必修", title: "策略服务不是机器人驱动", activity: "画 server/client/safety/servo 四段边界；说明每段故障时由谁拒绝、回退和记录。", deliverable: "一张带进程边界与信任边界的部署图。" },
      { duration: "0:40–1:30 · 必修", title: "冻结 versioned schema", activity: "定义 request/response 字段、shape、frame、unit、时间戳、revision 和拒绝码；写三个不兼容升级案例。", deliverable: "可评审的 v1 schema 与兼容策略。" },
      { duration: "1:30–2:20 · 必修", title: "从测量到 p99 reserve", activity: "区分模型计算、序列化、网络、排队和客户端处理；用冷/热机、不同 batch 的样本算分位数与队列下溢。", deliverable: "延迟直方表、p50/p95/p99 与 reserve 计算。" },
      { duration: "2:20–3:10 · 必修", title: "TTL、watchdog 与停止", activity: "为每个响应绑定 observation_time；比较过期、乱序、失联和越界四类故障的处理状态机。", deliverable: "ACTIVE/DEGRADED/CONTROLLED_STOP/E-STOP 状态图。" },
      { duration: "3:10–4:20 · 必修", title: "运行策略服务故障注入", activity: "运行标准库脚本，逐项触发 schema mismatch、stale response、expired prefix、clip、TTL 与 watchdog。", deliverable: "事件日志、全部 PASS 和一次新增故障测试。" },
      { duration: "4:20–5:00 · 必修", title: "安全 sandwich 与复盘", activity: "补齐前置门禁、轨迹/控制、运行时监控和人工接管；为日志设计 request_id 串联。", deliverable: "故障树和可重放日志字段。" },
      { duration: "5:00–5:30 · 选修", title: "OFT 与 FAST", activity: "分别回答连续动作 head 和动作 token 压缩解决什么瓶颈，核对官方证据与限制。", deliverable: "两行问题—改进—证据—缺陷卡。" },
      { duration: "5:30–6:00 · 选修", title: "RTC 与异步连续性", activity: "比较简单新旧 chunk 平均、temporal ensemble 与固定已执行前缀的实时重生成。", deliverable: "一张三方法时间轴。" },
      { duration: "6:00–6:40 · 选修", title: "可观测性、数据与规划", activity: "索引 3D/触觉、人类视频/仿真、世界模型/推理时规划，明确每项缺少什么受控证据。", deliverable: "三张研究问题卡。" },
      { duration: "6:40–7:00 · 选修", title: "建立前沿阅读门禁", activity: "挑一篇新工作，用同一评审模板写结论，并把 demo、消融和真实 rollout 分开。", deliverable: "一页可更新前沿索引，而不是模型名清单。" },
    ],
    theory: [
      "本章分成两条轨道：前 5 小时部署必修，后 2 小时前沿索引选修。部署的目标是让一个不稳定、非实时的 GPU 策略服务安全地接入确定性机器人控制栈；前沿部分只建立问题地图，不要求复现所有大模型。两者放在一章是因为任何论文增益最终都要经过同一接口、延迟和安全门禁。",
      "策略服务应被视为不受信任的动作 proposer，而不是机器人驱动。Server 负责固定模型/统计 revision、输入预处理和生成 action chunk；Client 负责协议验证、时间语义、跳过过期前缀、反归一化、frame 变换、限幅、轨迹与 fallback；高频 servo 和硬件保护独立运行。Server 崩溃或输出 NaN 时，机器人不能依靠同一 server 自救。",
      "Schema 必须版本化并可拒绝。请求要携带 request_id、observation_time、camera/joint 顺序、指令、期望 horizon、checkpoint/norm revision；响应要回传对应请求、command_type、frame/unit、rotation、action_dt、actions、valid mask 和生成时间。客户端先验证 schema/shape/finite/time，再做几何与安全检查；未知字段可否忽略、必填字段如何升级要在 v1 就定义。",
      "实时性用分布而不是均值描述。分别测模型推理、server queue、序列化、网络往返和 client processing，在代表性冷/热机、batch 与负载下报告 p50/p95/p99。异步 action queue 的剩余动作必须覆盖 p99 总延迟与余量；响应到达后按 observation_time/action_dt 跳过已经属于过去的前缀，不能从 index 0 重放。",
      "TTL 和 watchdog 解决不同问题：TTL 判断某个 chunk 是否太旧，watchdog 判断系统是否太久没有有效消息。协议拒绝、队列耗尽、碰撞预测、关节/工作空间越界、通信中断应进入明确状态机。Controlled stop 不是硬件 E-stop，更不是安全认证；具体保持、减速、制动或卸力策略取决于机器人和风险分析。",
    ],
    deepDive: [
      {
        title: "证据边界：本地 PASS 不等于机器人安全",
        paragraphs: [
          "【已确认】p99 reserve 公式、最近秩分位数、TTL/乱序/finite/schema 检查都可由本章定义核对。新脚本已实际运行：默认得到 inference p99=190ms、network p99=55ms、reserve=6，并触发 schema mismatch、stale request、skip=2、±0.05 clip、watchdog 与 TTL stop。",
          "【合理推测】真实远程 VLA 服务会遇到相同类别的版本、抖动、丢包和过期问题；但延迟分布、阈值与 fallback 必须在目标硬件和网络上重新测量。",
          "【个人观点】把部署设为 5 小时必修、前沿设为 2 小时选修，是为了先建立可运行系统，再追论文；这不是统一课程标准。",
          "【暂无法验证】脚本没有真实网络、时钟同步、机器人动力学、IK、碰撞或安全 PLC，也没有任何安全等级认证。它只能验证客户端控制流，不能证明设备可安全上电。",
        ],
      },
      {
        title: "部署必修 1. 四段边界与信任模型【必须掌握】",
        paragraphs: [
          "Policy server 接收观测并产生候选 chunk；transport 负责传输但可能延迟、重复、乱序或断开；robot client 是最后的软件门禁；trajectory/servo/hardware 执行并监控。每段都要定义 timeout、重试是否幂等、日志键和降级行为。最危险的设计是 server 与 client 都假定对方已经检查过。",
          "request_id 用于关联和拒绝旧响应，observation_time 表示模型依据的物理信息时刻，server_created_time 只反映生成时钟。跨机器比较绝对时间需要同步或换用相对/单调时钟协议；不能用 response arrival time 冒充观测新鲜度。",
        ],
        takeaways: ["Robot client 保留最终拒绝权。", "时间戳要说明来自哪台机器和什么时钟。", "重试必须防止旧动作重复执行。"],
      },
      {
        title: "部署必修 2. 一个最小 response contract【工程建议】",
        paragraphs: [
          "建议字段包括 schema_version、request_id、observation_time、model_revision、normalization_revision、command_type、frame、linear/angular unit、rotation convention、action_dt、actions:[H,dₐ]、valid:[H,dₐ] 和 server_created_time。二值 gripper、连续位姿与模式切换不应在无语义标记时混成同一浮点向量。",
          "验证顺序可固定为：版本→字段/shape→finite→request_id/时间→model/norm revision→frame/unit→反归一化→逐步 delta/速度/加速度→工作空间/自碰/环境碰撞。拒绝原因要机器可读，且任何失败都映射到状态机，不允许默默沿用未知旧命令。",
        ],
        takeaways: ["schema 变更需要兼容策略和测试。", "frame/unit 错比小数误差更危险。", "未知 revision 默认拒绝而不是猜。"],
      },
      {
        title: "部署必修 3. p99 数值例与队列语义【必须手算】",
        paragraphs: [
          "脚本的 10 个推理样本最近秩 p99 是 190ms，10 个网络样本 p99 是 55ms，加 30ms margin、动作周期 50ms，reserve=ceil((190+55+30)/50)=6。若队列剩余少于 6 个动作才发请求，已经来不及；应在达到阈值时触发，并考虑 server 排队、序列化和 client 处理是否已计入。",
          "10 个样本不足以可靠估计真实 p99，这组数字只验证计算机制。生产测量要覆盖 warmup、温控降频、并发、不同图像大小、网络抖动与长时间运行；同时报告样本数和测量边界。平均 40ms 不能否定偶发 300ms 下溢。",
        ],
        takeaways: ["reserve 向上取整。", "p99 的可信度依赖样本量和场景覆盖。", "到达后的旧前缀必须跳过。"],
      },
      {
        title: "部署必修 4. TTL、watchdog 与安全 sandwich【必须掌握】",
        paragraphs: [
          "TTL 是消息级：now−observation_time 超阈值时整个 chunk 失效；即使未超过 TTL，也要按 action_dt 跳过过期前缀。Watchdog 是连接/系统级：距离最近一次有效消息太久即进入 fallback。乱序 request_id、未来时间戳和时钟跳变要分别记录，不能统称 timeout。",
          "所谓安全 sandwich 是工程结构而非认证术语。模型前：schema、finite、frame/unit、归一化 revision；模型后执行前：限幅、速度/加速度、workspace、IK/轨迹和碰撞；运行中：关节/力/碰撞监控、heartbeat、人工接管和硬件急停。任何一层都不能因模型置信度高而绕过。",
        ],
        takeaways: ["TTL 与 watchdog 不能互相替代。", "controlled stop 与 E-stop 要分名。", "软件门禁不替代硬件保护。"],
      },
      {
        title: "部署必修 5. 故障注入与可重放日志【必须动手】",
        paragraphs: [
          "最小故障矩阵应含：schema 版本错、字段缺失、NaN/Inf、frame/unit 错、极端 delta、response 重复/乱序、网络延迟/丢包、TTL 过期、watchdog 失联、队列下溢和 client 重启。每项都要有期望状态、实际动作和恢复条件。",
          "日志用 request_id 串起 observation metadata、server revision、原始 response、跳过 prefix 数、裁剪后动作、拒绝原因、实际执行时间与 stop 事件。只存最终机器人轨迹无法判断是模型生成错、传输错、client 裁剪还是 controller 跟踪错。",
        ],
        takeaways: ["先写期望故障行为再注入。", "原始与执行后动作都保存。", "日志必须能重放决策而非只看视频。"],
      },
      {
        title: "前沿选修 1. OFT、FAST 与 RTC 分别改了哪里【索引而非复现】",
        paragraphs: [
          "OFT 是并行解码、action chunking、连续表示和 L1 目标等组成的整套 fine-tuning recipe，针对离散自回归动作的精度与串行速度瓶颈；一般连续 action head 只解决其中部分问题。FAST 针对高频长 action chunks 的 token 序列长度；RTC 则针对新 chunk 到达时与已执行轨迹的连续性。",
          "评审时分别记录：改动发生在 action representation、training objective、decoder 还是 runtime；证据来自离线 loss、仿真还是真机 rollout；代价是训练复杂度、采样/解码延迟、压缩误差还是实现成熟度。具体数值随版本和任务变化，应回到固定 release。",
        ],
        takeaways: ["FAST 改表示压缩，RTC 改实时连续性。", "OFT 的增益必须在同协议 rollout 下看。", "不要用项目 demo 代替消融。"],
      },
      {
        title: "前沿选修 2. 可观测性、数据与长时域【了解即可】",
        paragraphs: [
          "3D 表示与多视角几何尝试补空间可观测性，触觉/力觉补接触状态；人类视频、仿真和生成数据尝试降低机器人演示成本；世界模型和推理时规划尝试在长任务中评估未来或分解目标。这些方向解决的问题不同，不应只按 backbone 大小排列。",
          "每项都问四个问题：旧系统在什么受控任务失败；新方法具体增加了什么输入/目标/计算；证据是否跨场景、跨 embodiment 且有样本数；新增传感器、标注、算力、延迟和失效模式是什么。本站只给阅读索引，未本地复现这些前沿主张。",
        ],
        takeaways: ["前沿结论必须绑定任务和证据。", "更多模态也带来同步与标定故障。", "把未复现主张标成待验证。"],
      },
    ],
    formula: { latex: String.raw`N_{\rm reserve}\ge\left\lceil\frac{L_{\rm infer,p99}+L_{\rm net,p99}+L_{\rm client,p99}+L_{\rm margin}}{\Delta t_c}\right\rceil`, symbols: [
      { symbol: "Nreserve", meaning: "请求下一 chunk 时最少剩余动作。" }, { symbol: "Linfer,p99", meaning: "推理延迟 99 分位。" }, { symbol: "Lnet,p99", meaning: "网络延迟 99 分位。" }, { symbol: "Lmargin", meaning: "抖动/安全余量。" }, { symbol: "Δt_c", meaning: "动作周期。" }, { symbol: "⌈·⌉", meaning: "向上取整。" },
      { symbol: "Lclient,p99", meaning: "客户端反序列化、验证、反归一化和安全处理的 99 分位延迟。" },
    ], note: "分组件 p99 直接相加只是保守工程启发式，不是端到端 p99 的统计恒等式，也不提供联合尾部保证。应优先在同一请求边界实测 end-to-end latency p99；小样本估计仅适合机制演示。" },
    practice: {
      title: "策略服务客户端故障注入",
      summary: "纯 Python 模拟 versioned action chunk；计算 p99 reserve，跳过过期前缀，并触发 schema、乱序、clip、TTL 与 watchdog。",
      steps: ["运行默认脚本并核对 reserve=6 的数值过程", "阅读 ACCEPT:7:skip=2，解释为何不能从 action 0 重放", "确认 ±0.20 被客户端限为 ±0.05", "确认 v2 schema 与旧 request_id 被拒绝但不会覆盖最近有效消息", "确认 121ms 无有效消息触发 watchdog，300ms 年龄触发 TTL", "新增 NaN 或 wrong-frame case，并为其写预期 REJECT 断言"],
      acceptance: ["脚本输出 PASS", "p99 数值和 reserve 计算正确", "schema/乱序响应均被拒绝", "过期前缀不重放且极端动作被限幅", "watchdog 与 TTL 都进入 CONTROLLED_STOP", "能说明该脚本不是认证安全控制器"],
      status: "已验证",
      code: "python public/labs/policy_service_fault_injection.py",
      prerequisites: ["Python 3.10+ 标准库，无需网络/GPU", "已理解 request_id、observation_time、action_dt、TTL 与 p99"],
      expected: ["首行打印 inference=190ms、network=55ms、reserve=6", "事件日志依次含 ACCEPT skip=2、schema REJECT、stale REJECT、watchdog STOP、TTL STOP", "最后两行显示 PASS 与 BOUNDARY"],
      debugging: ["若 skip 不是 2，检查 ceil((now−observation_time)/action_dt)", "若 stale response 被接受，检查 request_id 必须严格递增", "若 watchdog 未触发，确认比较的是最近有效消息而非任意到达包", "若 TTL 包仍执行，检查年龄基于 observation_time 而不是到达时间", "若 reserve 偏小，检查是否漏算 client 或 margin 并向上取整"],
    },
    pitfalls: ["用平均延迟决定队列", "response 到达时间冒充 observation_time", "smoothing 当成安全证明", "CBF 名称等同认证安全", "越界后沿用旧 chunk", "schema 不匹配仍猜测字段", "watchdog 与 TTL 混为一谈", "软件 controlled stop 冒充硬件急停"],
    review: ["策略 server、robot client、safety/trajectory 与 servo 各自承担什么？", "190+55+30ms、50ms/action 为什么 reserve=6，而不是 5？", "TTL、watchdog、乱序拒绝和 E-stop 分别处理什么？", "RTC、temporal ensemble 和简单 chunk 平均的信息约束有何不同？", "FAST、OFT 与 RTC 分别修改表示、动作 head 还是 runtime？", "为什么本地故障脚本 PASS 仍不能声称机器人安全？"], completion: "完成 5 小时部署必修：实现 versioned schema、p99 reserve、过期前缀、TTL/watchdog、独立安全回退与可重放日志；再用 2 小时选修索引按证据边界阅读前沿。",
    sources: [{ title: "OFT", url: "https://openvla-oft.github.io/", role: "完整 fine-tuning recipe" }, { title: "FAST", url: "https://www.pi.website/research/fast", role: "压缩" }, { title: "RTC", url: "https://www.pi.website/research/real_time_chunking", role: "实时" }, { title: "GR00T N1.7 Early Access · main@b995540", url: "https://github.com/NVIDIA/Isaac-GR00T/tree/b9955401d50c92a29258732e3ad6ccd579f1bdc0", role: "2026-08-08 动态研究索引" }], visual: "latency",
  },

  capstone: {
    lead: "毕业项目不是‘微调一次’，而是交付任务契约、版本化数据、ACT baseline、一个 VLA、固定 rollout、失败复盘和可复现接口。核心仿真版预算 25 小时；真机安全扩展再增加最多 15 小时。预算是个人学习节奏建议，不承诺训练时长或成功率。",
    objectives: [
      "完成一个语言指定目标的操作任务，并把成功、失败、终止和安全边界写成机器可判定的协议。",
      "交付经过审计的数据、ACT baseline 和一个 VLA，在相同输入/动作/执行/评测协议下比较。",
      "运行足量、可复现的分层 rollout，报告样本数、成功率、不确定性、延迟和失败类别。",
      "完成语言、相机或 action representation/execution horizon 中至少三项受控消融。",
      "区分 25 小时最小仿真版与 10–15 小时真机扩展；真机版包含接管、限速、碰撞和事件复盘。",
      "让另一位工程师能从空环境恢复 checkpoint、执行 smoke/eval，并从日志定位一次失败。",
    ],
    timePlan: [
      { duration: "核心 0–2h", title: "M0：任务、安全与证据契约", activity: "冻结任务、场景、语言、观测、动作、控制频率、成功判据、终止原因和不可接受事件。", deliverable: "task_spec.yaml、safety_spec.md、固定 seed/初始状态表。" },
      { duration: "核心 2–6h", title: "M1：数据与 replay 门禁", activity: "采集/转换数据，运行 schema/split/norm 审计，replay 成功/失败/恢复 episode，修复时序与动作语义。", deliverable: "dataset card、audit report、20 条 replay 记录。" },
      { duration: "核心 6–10h", title: "M2：ACT baseline", activity: "完成小数据过拟合、保存重载、离线 held-out 和固定 seed rollout；冻结执行接口。", deliverable: "ACT checkpoint、配置、曲线、rollout 表。" },
      { duration: "核心 10–15h", title: "M3：VLA 适配", activity: "选择 SmolVLA/OpenVLA-OFT 等一个可行模型，锁 revision，完成 smoke、小数据过拟合和同接口 rollout。", deliverable: "adapter/head checkpoint、模型卡、资源与延迟日志。" },
      { duration: "核心 15–19h", title: "M4：固定协议评测", activity: "ACT、VLA、zero/mean baseline 在相同种子与扰动下 rollout；保存每次决策与终止原因。", deliverable: "分层成功率、Wilson 区间、p50/p99 延迟和逐次记录。" },
      { duration: "核心 19–22h", title: "M5：消融与失败树", activity: "执行至少三项一次只改一个变量的消融；复现感知、语言、策略、执行和恢复失败。", deliverable: "消融表、失败树、三个最小复现。" },
      { duration: "核心 22–25h", title: "M6：可复现交付", activity: "从干净环境执行 smoke/eval，恢复 checkpoint，生成报告与代表性成功/失败视频。", deliverable: "README、lockfile、配置、测试、数据/模型卡和最终报告。" },
      { duration: "真机 +0–3h", title: "R0：风险评审与接口隔离", activity: "确认急停、接管、速度/力/工作空间限制、TTL、watchdog 和策略服务断连行为。", deliverable: "签字检查表与 dry-run 日志。" },
      { duration: "真机 +3–7h", title: "R1：标定与低速空载", activity: "验证相机/手眼/动作 frame、单位、夹爪和低层控制；先不接触物体。", deliverable: "标定版本、空载轨迹和误差检查。" },
      { duration: "真机 +7–12h", title: "R2：灰度 rollout", activity: "从单物体低速小工作空间开始，安全员在环；记录接管、近失和所有未完成 episode。", deliverable: "真机逐次 rollout 与事件日志。" },
      { duration: "真机 +12–15h", title: "R3：复盘与发布决定", activity: "按风险和失败类别复盘，决定继续、回退数据还是停止；不以精选视频代替评测。", deliverable: "incident/near-miss 报告和 go/no-go 结论。" },
    ],
    theory: [
      "最小仿真版建议选择语言指定目标并放入容器、抽屉或区域的任务；使用 LIBERO、Isaac Lab 或另一可重置环境均可。关键不是平台名字，而是能固定初始状态、seed、扰动、成功判据和动作接口。范围应控制在一台机器人、1–3 个任务和有限语言改写，避免同时研究跨本体、未知物体和长时规划。",
      "任务协议先于模型：明确观测相机、状态、语言有效区间、action dimension/type/frame/unit/Δt、chunk 与 execution horizon、控制器、安全过滤、最大步数和 reset。成功必须由环境状态或传感器规则判定，不由观看视频主观决定；超时、越界、碰撞、错误目标和人工接管都作为独立终止原因。",
      "项目至少包含 ACT 与一个 VLA。ACT 用于建立一个可审计的窄策略基线，并帮助定位两类模型共有的数据与执行接口问题；单次 ACT 成功不能证明一般意义上的可学习性。VLA 用于研究语言/视觉预训练与迁移。二者必须共享相同观测、动作、归一化、执行器与评测。",
      "rollout 是主要证据。每次记录 seed、场景、语言、checkpoint、observation/action 时间、p50/p99 推理延迟、安全过滤、成功与终止原因。总体成功率必须附 N，并按任务、场景和扰动分层；小样本使用 Wilson 区间，跨组比较避免把所有非独立轨迹混成一个精确数字。",
      "真机版不是仿真版的自动结论。sim-to-real 差异、标定、时延、材料接触、相机曝光和安全层都需要单独验证。默认低速、小工作空间、安全员在环；任何异常先停止执行并离线重放。没有实际真机日志时，只能报告‘未验证’，不能声称安全或有效。",
    ],
    deepDive: [
      {
        title: "证据边界：毕业项目不能预写结果",
        paragraphs: [
          "【已确认】ACT、LIBERO、LeRobot 和 openpi 的公开结构与接口可由官方资料核对；成功率计算、Wilson 区间和 episode 级切分有明确统计与数据依据。",
          "【合理推测】ACT baseline 可帮助区分 VLA 特有问题与共同数据/执行问题，但它不保证在每个任务更易训练，也不保证 VLA 一定优于或弱于 ACT。",
          "【工程建议 / 个人观点】25 小时核心 + 最多 15 小时真机扩展、先 ACT 再 VLA、1–3 个任务的范围，是可执行的教学节奏建议；训练作业本身可能在云端运行更久。",
          "【暂无法验证】在项目完成实际 rollout 前，模型成功率、语言泛化、真机性能、安全性和任何消融收益全部未知。最终报告必须保留负结果和未完成项。",
        ],
      },
      {
        title: "1. 最小仿真版：25 小时的完成定义",
        paragraphs: [
          "M0–M1 建立任务与数据可信度；M2 证明 ACT 能沿同一接口训练和执行；M3 接入一个 VLA；M4 固定评测；M5 通过消融与失败树回答为什么；M6 让他人复现。任何里程碑没过，就在该层修复，不用更大模型绕过。",
          "最低交付不是‘两个模型都成功’，而是两个模型都按同协议被诚实评测。VLA 0% 也可以是合格研究结果，前提是 ACT/专家动作/执行器对照完整、失败可定位、版本和日志足以复现。",
        ],
        takeaways: ["里程碑以产出和门禁定义，不以看完页面定义。", "负结果可以合格，缺失对照和日志不合格。", "25 小时不包含不可控的云端排队与长训练墙钟时间。"],
      },
      {
        title: "2. ACT baseline 与 VLA 的公平接口",
        paragraphs: [
          "定义唯一 PolicyRequest：images、state、language、observation_time、request_id；唯一 PolicyResponse：action_chunk、action_dt、action_contract_revision、model_revision。ACT 与 VLA 通过相同 adapter 输出同一物理语义，安全层只读这一接口。",
          "模型特有预处理在 adapter 内记录：图像 resize/crop、tokenizer、history、norm、action decode。评测器只看到统一物理动作。这样 ACT 成功/VLA 失败时，可以比较 adapter 前后的同一观测与动作，而不把下游控制差异混进模型比较。",
        ],
        takeaways: ["比较发生在统一物理动作接口。", "模型专用预处理必须版本化。", "安全过滤对所有模型完全相同。"],
      },
      {
        title: "3. Rollout、消融与失败树",
        paragraphs: [
          "推荐最少记录 zero/mean-action baseline、ACT、VLA；每种策略使用预先公布的相同 seed 和语言改写。消融可选：语言置换/移除、wrist camera 移除、不同 action representation、不同 execution horizon，但一次只改一项，并保持训练预算和评测协议可比。",
          "失败树从可观察事件开始：目标未识别→检查相机/语言/attention 输入；动作方向错误→检查 norm/frame/unit/head；动作合理但执行错误→检查 TTL/控制器/限幅；开始正确后漂移→检查 covariate shift/延迟/恢复数据；成功判定异常→检查 evaluator/reset。每个叶节点绑定一条最小复现。",
        ],
        takeaways: ["先定义消融问题，再运行实验。", "每次 rollout 都要保留，不挑最好视频。", "失败标签必须能指导下一次最小改动。"],
      },
      {
        title: "4. 真机扩展：安全门禁而不是加一个视频",
        paragraphs: [
          "真机前必须证明：急停和人工接管独立于模型；动作过期/乱序被拒；工作空间、速度、加速度、夹爪力和碰撞门限在模型之外；策略服务断开进入 controlled stop；原始观测与最终执行动作可重放。",
          "灰度顺序为无负载空载→远离障碍的自由空间→单物体低速→有限扰动。每阶段设置 go/no-go 门禁。接管和 near-miss 不是应删除的失败 episode，而是数据与风险证据；是否将其用于训练需单独标注，不能混入测试集。",
        ],
        takeaways: ["真机安全来自独立系统，不来自模型置信度。", "接管数据和测试数据必须隔离。", "无实际日志就保持‘暂无法验证’。"],
      },
    ],
    formula: { latex: String.raw`\hat p=\frac1N\sum_{i=1}^{N}s_i,\qquad\operatorname{SE}(\hat p)=\sqrt{\frac{\hat p(1-\hat p)}N}`, symbols: [
      { symbol: "sᵢ", meaning: "第 i 次 rollout 成功为 1，否则 0。" }, { symbol: "N", meaning: "跨 seed/场景的独立 rollout 数。" }, { symbol: "p̂", meaning: "经验成功率。" }, { symbol: "SE", meaning: "二项近似标准误；N 小时用 Wilson 区间。" },
    ], note: "二项标准误要求 rollout 可近似独立同分布；跨场景、任务和 seed 时还应分层报告，并用 Wilson 区间或分层 bootstrap 表达不确定性。不要只报告 5/5。" },
    practice: {
      title: "核心仿真交付 + 可选真机灰度",
      summary: "按 M0–M6 完成 25 小时核心版；只有全部安全门禁通过后才进入 R0–R3。下面是执行清单，不是已经验证的实验结果。",
      prerequisites: [
        "已完成数据工程章的 schema/split/norm/replay、ACT 门禁和 rollout 失败树。",
        "仿真环境可固定 seed/reset，并能返回机器可判定的 success/termination_reason。",
        "已选择一个实际可运行的 VLA revision；算力不足时缩小模型/数据，不伪造已运行结果。",
        "真机扩展需要独立急停、安全员、低层限幅/碰撞保护和审批；缺一项就停在仿真版。",
      ],
      steps: [
        "M0：提交 task_spec、安全边界、成功/失败判据、固定 seed 和统一 PolicyRequest/Response。",
        "M1：运行数据审计与 20 条 replay，冻结 split/norm/action contract revision。",
        "M2：ACT 完成小样本过拟合、保存重载、held-out 与固定 rollout；保存每次原始/过滤后动作。",
        "M3：一个 VLA 完成官方 revision 锁定、smoke、小样本过拟合、保存重载和同接口 rollout。",
        "M4：zero/mean、ACT、VLA 用相同 seed/扰动运行；报告总体与分层 N、成功率、Wilson 区间、延迟。",
        "M5：完成语言、相机、动作表示或 execution horizon 中至少三项消融；每项一次只改一个变量。",
        "M6：从干净环境恢复并执行 smoke/eval；生成数据卡、模型卡、失败树、成功/失败视频和最终报告。",
        "可选 R0–R3：完成风险评审、空载验证、单物体低速灰度和事件复盘；任一门禁失败立即 controlled stop。",
      ],
      acceptance: [
        "核心版全部 M0–M6 产出存在，配置和 checkpoint revision 可追溯。",
        "ACT/VLA/ablation 共享物理动作接口、安全过滤、seed、初始化、最大步数与成功判据。",
        "每个报告数字都附 N 与数据来源；未运行项、失败项和暂无法验证项明确保留。",
        "至少三个失败可由日志重放，并各自落到失败树叶节点与一个最小复现。",
        "另一位工程师能在干净环境完成 smoke、恢复 checkpoint 并生成同格式 eval 报告。",
        "真机版若执行：急停、接管、TTL/watchdog、限速/空间/碰撞门禁有独立测试证据，near-miss 全部记录。",
      ],
      expected: [
        "最小仿真版应产出完整比较流程；ACT 或 VLA 的成功率高低在运行前未知。",
        "小数据过拟合应能排除大部分 pipeline 错误，但不证明 held-out 或闭环泛化。",
        "消融可能没有提升或统计不确定；如实报告比解释性故事更重要。",
        "真机版可能在安全门禁处停止，这也是合格的 go/no-go 结论。",
      ],
      debugging: [
        "M1 未过：停止训练，修 schema/split/norm/replay。",
        "ACT 1 batch 不过拟合：查 mask、时间对齐、action scale/head 和优化配置。",
        "ACT 成功、VLA 失败：固定一个观测比较预处理、语言、raw head、反归一化和 adapter。",
        "两者都离线正确但 rollout 失败：用记录专家动作替换策略，定位执行器、TTL、frame/unit/dt 与 reset。",
        "结果随 seed 巨变：增加 rollout、按场景分层并给区间，不挑最好 seed。",
        "真机出现越界、乱序、近失或接管：立即停止，冻结日志，先完成事件复盘再决定是否继续。",
      ],
      status: "云端必做",
    },
    pitfalls: ["把 25–40h 学习预算当 GPU 训练墙钟承诺", "挑最好视频或最好 seed", "同一场景/episode 泄漏到 train 和 test", "ACT 与 VLA 使用不同安全限幅或成功判据", "消融一次改变多个变量", "真机没有接管和独立安全层", "未运行却引用官方结果声称目标任务有效"],
    review: ["最小仿真版 M0–M6 各自阻止什么风险？", "为什么 ACT/VLA 必须统一到物理动作接口后比较？", "成功率为什么同时报告 N、分层结果和不确定性？", "如何用专家动作 replay 区分策略与执行器失败？", "哪些条件不满足时真机扩展必须停止？"],
    completion: "核心版由另一位工程师复现 M0–M6，并从日志定位失败；真机版只有在独立安全门禁和实际灰度日志存在时才报告结果，未执行部分明确标为暂无法验证。",
    sources: [{ title: "LIBERO", url: "https://libero-project.github.io/main.html", role: "仿真 benchmark" }, { title: "ACT", url: "https://github.com/tonyzhaozh/act", role: "局部策略 baseline" }, { title: "LeRobot", url: "https://github.com/huggingface/lerobot", role: "数据与策略工程" }, { title: "SmolVLA", url: "https://huggingface.co/docs/lerobot/smolvla", role: "轻量 VLA 路线" }, { title: "openpi", url: "https://github.com/Physical-Intelligence/openpi", role: "π₀ 系列可选扩展" }],
  },
};
