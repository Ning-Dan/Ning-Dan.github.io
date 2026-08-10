export type LessonConcept = {
  name: string;
  plain: string;
  why: string;
  example: string;
  boundary: string;
};

export const lessonConcepts: Record<string, LessonConcept[]> = {
  "control-to-vla": [
    {
      name: "闭环与反馈",
      plain: "闭环控制不是把一串动作发完，而是执行一点、重新测量、再根据误差修正。环境会受动作影响，下一次决策看到的状态也会随之改变。",
      why: "机器人存在摩擦、延迟、定位误差和外界扰动。只按初始计划开环运行，误差通常会逐步积累。",
      example: "抓红杯时，机械臂先靠近 5 cm，再用新图像检查杯子是否移动，然后决定继续靠近还是调整方向。",
      boundary: "VLA 重新查询属于高层闭环，但不能替代 1 kHz 关节伺服中的稳定反馈。两个闭环工作在不同时间尺度。",
    },
    {
      name: "状态、观测与 belief",
      plain: "状态 sₜ 是环境此刻真正的完整情况；观测 oₜ 是传感器实际给出的部分信息。belief 是根据过去动作和观测，对隐藏状态形成的概率判断。",
      why: "杯子被遮挡后仍有真实位置，但当前 RGB 看不全。控制器若把图像直接当完整状态，就会忽略遮挡、速度和接触等隐藏量。",
      example: "上一帧看到杯子向右滑，本帧被手遮住；历史图像和刚执行的推推动作仍能帮助估计杯子可能在哪里。",
      boundary: "只输入最近 K 帧是 observation-window 近似，不等于完整 POMDP belief；语言指令也不会自动补出物理状态。",
    },
    {
      name: "策略与控制器",
      plain: "策略回答‘根据当前条件想做什么’，控制器回答‘怎样让机器人稳定、受约束地做到’。VLA 通常位于策略层，输出动作候选或短轨迹。",
      why: "模型擅长从图像和语言选择动作，但神经网络输出不自带坐标系验证、碰撞保证或电机稳定性。",
      example: "VLA 给出 tool-frame 向前 2 cm；adapter 转到 base frame，IK 生成关节目标，伺服器持续跟踪。",
      boundary: "模型输出 torque 并不意味着低层控制消失，反而会提高实时性、动力学和安全验证要求。",
    },
    {
      name: "滚动时域与三种频率",
      plain: "动作块含 H 个参考，但系统可以只执行前 E 个就重新观测。动作采样频率、策略查询频率和伺服频率是三个不同概念。",
      why: "动作块提高短时连贯性，提前重规划又能缩短开环时间；分层频率让慢模型和快控制器协同。",
      example: "动作参考 20 Hz、H=16、E=4：chunk 覆盖 0.8 s，理想每 0.2 s 查询一次；1 kHz 伺服在每个 50 ms 参考之间运行 50 次。",
      boundary: "E=4 只能给出理想 5 Hz 请求节拍。推理迟到、队列不足或响应过期时，实际闭环频率不会自动保持 5 Hz。",
    },
  ],

  "math-foundations": [
    {
      name: "条件与预测目标",
      plain: "x 表示决策时已经知道的图像、状态和语言，A 表示模型需要生成的未来动作。条件概率 p(A|x) 描述同一条件下哪些动作更可能。",
      why: "先区分已知条件和教师答案，才能避免把未来动作泄漏进输入，也才能看懂后续 BC、CVAE 和生成式策略。",
      example: "x={4 帧 RGB、关节角、‘拿起红杯’}，A 是未来 3 步 [Δx,Δz]，shape 为 [H=3,dₐ=2]。",
      boundary: "连续动作使用的是概率密度；密度不是离散事件概率，数值可以大于 1。",
    },
    {
      name: "损失与建模假设",
      plain: "损失不是凭空规定的扣分公式。NLL 来自提高已观察数据的 likelihood；MSE 可由固定方差高斯 NLL 推出。",
      why: "理解来源后，才能判断一个 loss 是否适合多峰动作、不同单位和可变噪声，而不是只看训练曲线下降。",
      example: "真实动作 1.0、均值 0.6、σ=0.5 时，MSE=0.16，高斯 NLL≈0.5458；数值不同，但固定 σ 时最优均值相同。",
      boundary: "方差可学习、动作多峰或不同维尺度悬殊时，简单 MSE 不再等价于一个无条件正确的选择。",
    },
    {
      name: "回报、价值与 advantage",
      plain: "reward 看当前一步，return 汇总未来折扣 reward，V 预测策略平均结果，Q 预测指定当前动作后的结果，advantage=Q−V。",
      why: "策略更新需要知道某个动作比基线好多少，而不只是任务最后是否成功。",
      example: "rewards=[0,0,1]、γ=0.9 时 returns=[0.81,0.9,1.0]；若 V̂=[0.6,0.8,0.9]，则 Â=[0.21,0.1,0.1]。",
      boundary: "单轨迹的 Ĝ−V̂ 是 advantage 估计，不是 Aπ=Qπ−Vπ 的定义；正 advantage 也不等于任务已经成功。",
    },
    {
      name: "速度场与 ODE",
      plain: "ODE 描述一个量随连续生成时间怎样变化。Flow 模型学习当前位置应该往哪里移动，solver 再把许多小步积分成最终动作。",
      why: "如果不理解变化率和积分，就容易把 flow 当成普通动作回归，或在实现中把生成时间方向写反。",
      example: "x₀=0、速度 v=2、Δt=0.25，Euler 四步得到 0.5、1.0、1.5、2.0。",
      boundary: "Euler 是数值近似；步数更多不一定修复错误速度场。PPO clip 与物理动作 clip 也属于完全不同的层。",
    },
  ],

  history: [
    {
      name: "从单任务策略到多任务策略",
      plain: "早期机器人策略常针对一个固定任务训练；多任务策略把任务身份或语言也作为条件，让同一模型学习多种行为。",
      why: "每个任务单独采数据、训练和部署，成本会随任务数量增长，也难以共享视觉和动作经验。",
      example: "同一机械臂模型既能‘拿起红杯’，也能‘把蓝块放入盒子’，输入中的任务条件决定当前行为。",
      boundary: "多任务训练不自动带来新任务泛化。它首先证明模型能在给定训练任务集合中共享参数。",
    },
    {
      name: "VLA 的最低含义",
      plain: "VLA 通常指同时利用视觉、语言和机器人动作数据，直接生成动作或动作表示的模型。语言不只是日志标签，而要进入策略条件。",
      why: "这个边界可以区分视觉 BC、纯 VLM 问答和真正连接机器人控制输出的模型。",
      example: "模型输入相机图像与‘关上抽屉’，输出末端或关节动作；如果只输出文字描述，还不是低层动作策略。",
      boundary: "不同论文对 VLA 的口径并不完全统一。是否输出单步、chunk、token 或连续动作都可能不同。",
    },
    {
      name: "互联网语义知识进入控制",
      plain: "RT-2 一类工作把预训练视觉语言模型与机器人轨迹共同训练，使网页图文中学到的物体和语义知识有机会影响动作选择。",
      why: "机器人数据规模小、物体和语言覆盖有限，单靠演示很难学到开放世界语义。",
      example: "模型可能借助预训练知识理解‘把已经用完的包装扔掉’，再结合当前画面选择可操作对象。",
      boundary: "具备语义先验不等于掌握目标机器人的几何、动力学或安全约束，也不推出任意环境零样本成功。",
    },
    {
      name: "跨 embodiment",
      plain: "Embodiment 指机器人的身体与传感器配置。跨 embodiment 学习希望不同机械臂、夹爪和相机的数据能共同训练。",
      why: "单台机器人数据有限，混合多本体数据可能扩大任务覆盖，但前提是把动作和观测语义对齐。",
      example: "两台机器人都执行‘向前移动夹爪’，但一个记录 tool-frame delta，另一个记录关节速度，不能直接拼成同一列。",
      boundary: "padding 只统一数组长度，不会自动统一 frame、unit、控制类型、dt 或 gripper 语义。",
    },
  ],

  "behavior-cloning": [
    {
      name: "演示轨迹怎样变成监督样本",
      plain: "行为克隆把专家轨迹切成许多条件—动作对：模型看到当前观测和任务条件，学习预测专家当时执行的动作。",
      why: "只有明确每一行输入、标签和时间对齐，监督学习公式才对应真实机器人数据。",
      example: "在时刻 t，输入是 RGB、qₜ 和语言，标签是专家动作 aₜ；做 action chunk 时标签改为未来 H 步。",
      boundary: "未来动作是训练标签，不应混入部署时的输入；随机按帧切 train/test 还可能泄漏同一 episode。",
    },
    {
      name: "行为克隆损失",
      plain: "BC 让预测动作接近专家动作。连续动作常用 MSE/L1 或条件分布 NLL，离散动作常用交叉熵。",
      why: "不同损失对应不同噪声和分布假设，会影响多峰动作、异常值和各动作维度的权重。",
      example: "末端位移和旋转若未经归一化直接同权相加，数值尺度较大的维度可能主导 loss。",
      boundary: "开环 loss 小只说明数据分布上的预测接近，不证明闭环任务一定成功。",
    },
    {
      name: "Covariate shift",
      plain: "训练时策略看到专家访问的状态；部署时自己的小错误会改变下一状态，使它逐步进入训练集没覆盖的区域。",
      why: "这解释了为什么离线验证误差很小的策略，闭环运行几步后仍可能快速失控。",
      example: "专家始终从杯子中心靠近；策略第一步偏右 1 cm，下一帧看到的画面已不同，随后偏差继续放大。",
      boundary: "Covariate shift 是分布问题，不代表所有闭环失败都应归因于它；frame、延迟和执行器错误要先排除。",
    },
    {
      name: "DAgger",
      plain: "DAgger 让当前策略运行到它实际会访问的状态，再由专家为这些状态给正确动作，随后把新样本加入训练。",
      why: "它直接补充策略自身错误附近的数据，而不是只继续采集理想专家轨迹。",
      example: "策略偏离杯子中心后，专家标注‘先向左纠正再下降’，新一轮训练便能学习恢复。",
      boundary: "真实机器人收集 DAgger 数据可能有风险；人工接管动作、策略建议和实际执行动作必须分别记录。",
    },
  ],

  "act-cvae": [
    {
      name: "Action chunk",
      plain: "ACT 不只预测下一步，而是一次输出未来 H 步动作。模型因此可以学习短轨迹的整体形状。",
      why: "单步策略容易受每帧噪声影响产生抖动，大模型逐步查询还会增加延迟。",
      example: "抓杯时一次输出‘靠近、下降、合拢’对应的 16 步连续参考，但执行器可以只执行前 4 步后重新观测。",
      boundary: "预测 H 步不等于开环执行 H 步。实际执行前缀 E、TTL 和重规划由后续系统决定。",
    },
    {
      name: "CVAE 与潜变量",
      plain: "CVAE 在条件 x 之外加入潜变量 z，用来表示同一观测下不同但合理的动作方式。",
      why: "从杯子左侧或右侧接近都可能正确，单一均值回归容易把两种轨迹平均成无效动作。",
      example: "训练 encoder 看真实动作块并产生 z；decoder 根据图像、状态和 z 重建整段动作。",
      boundary: "部署时没有真实未来动作，不能继续调用训练 posterior encoder；必须使用 checkpoint 约定的 prior 或 z=0。",
    },
    {
      name: "Padding mask",
      plain: "Episode 末尾可能不足 H 步，数据加载器会补齐固定长度。Mask 告诉 loss 哪些位置是真实动作。",
      why: "若把 padding 当专家静止动作，模型会在任务结束附近学到虚假的停止模式，loss 也会被补充值污染。",
      example: "只剩 2 步而 H=4 时，valid mask=[1,1,0,0]；把后两项从 0 改成 10⁶ 后，masked loss 应不变。",
      boundary: "Mask 决定哪些元素参与，reduction 决定除以有效元素还是完整张量；这是两个独立选择。",
    },
    {
      name: "Temporal ensemble",
      plain: "连续几次模型查询会对同一未来执行时刻产生多个预测。Temporal ensemble 先按物理时刻对齐，再加权融合这些候选。",
      why: "它可以减少相邻查询之间的动作跳变，并利用不同观测时刻的重复预测。",
      example: "执行时刻 12 同时对应 query 10 的第 2 项、query 11 的第 1 项和 query 12 的第 0 项。",
      boundary: "它不是对一个数组做普通低通。候选顺序和权重方向必须明确，晚到 chunk 还要先跳过过期前缀。",
    },
  ],

  "action-chunking": [
    {
      name: "Horizon H 与执行前缀 E",
      plain: "H 是模型一次预测的动作数量，E 是重新观测前实际执行的数量。H 提供未来覆盖，E 决定理想反应速度。",
      why: "如果每次都执行完整 chunk，模型长时间看不到新变化；如果只预测一步，又缺少延迟储备和短时连贯性。",
      example: "H=16、E=4、dt=50 ms：chunk 覆盖 0.8 s，理想每 0.2 s 发起重规划。",
      boundary: "E 不是策略真实返回频率的保证。推理和网络延迟仍可能让队列下溢。",
    },
    {
      name: "观测时间与动作起始时间",
      plain: "observation_time 表示模型依据的信息有多旧；action_start_time 表示 chunk 第 0 项计划何时执行。两者回答不同问题。",
      why: "晚到响应若从索引 0 重放，会执行已经属于过去的动作；只用观测时间又无法表达未来排程。",
      example: "响应在 100 ms 到达，而第 0、1 项计划时刻是 0、50 ms，客户端应跳到第 2 项。",
      boundary: "跨机器时间戳必须说明 clock_id 和同步方案，否则时间差可能没有物理意义。",
    },
    {
      name: "延迟储备",
      plain: "异步系统在等待新 chunk 时继续消费旧队列，因此要把端到端尾延迟换算成至少需要保留多少个动作。",
      why: "平均延迟看不见偶发尖峰，按平均值设计的队列会在冷启动或网络抖动时突然耗尽。",
      example: "p99=220 ms、margin=30 ms、dt=50 ms，储备 R=ceil(250/50)=5。",
      boundary: "10 个样本的最大值只是教学中的 nearest-rank p99；生产环境必须用足量端到端样本重测。",
    },
    {
      name: "TTL 与 controlled stop",
      plain: "TTL 限制动作所依据的观测可以有多旧。超过期限后不再执行 chunk，而是进入预先定义的受控停止。",
      why: "动作即使数值有限，也可能因场景已经变化而失效。继续重放旧动作比暂时停机更危险。",
      example: "杯子已被人移走，但 300 ms 前的 chunk 仍要求夹爪下降；TTL 会拒绝这段旧计划。",
      boundary: "Toy 中的 hold 只是示例。移动底盘、重力机械臂和力控任务可能需要不同停止策略，也不能冒充 emergency stop。",
    },
  ],

  "multimodal-transformer": [
    {
      name: "Token 与 embedding",
      plain: "Token 是模型处理序列中的一个位置；embedding 是这个位置对应的向量。图像 patch、文字、状态和动作都可映射成 token。",
      why: "Transformer 只处理向量序列，必须先定义每种物理输入怎样编码、排列和保留身份。",
      example: "两路相机各产生 patch tokens，语言产生 L 个 tokens，关节状态经 MLP 变成 state token，动作区放 action tokens 或 noisy slots。",
      boundary: "投影到相同隐藏维不等于语义相同；camera identity、位置和时间仍需由协议或结构表达。",
    },
    {
      name: "Query、Key、Value",
      plain: "Query 表示当前位置想找什么，Key 表示其他位置可被怎样匹配，Value 是匹配后真正汇聚的内容。",
      why: "把 Q/K/V 的角色拆开，才能理解注意力权重为什么由匹配分数决定，而输出却是 value 的加权和。",
      example: "action_0 的 query 可能对红杯图像 token 的 key 得分较高，于是更多读取该 token 的 value。",
      boundary: "注意力权重显示信息汇聚关系，不自动证明因果解释，也不等于模型真的理解了物体。",
    },
    {
      name: "Attention mask",
      plain: "Mask 明确规定某个 query 可以读取哪些 key。禁止位置在 softmax 前被设成负无穷。",
      why: "训练时若较早动作读取未来 clean action label，loss 会虚假变好，部署时却没有这些答案。",
      example: "自回归 action_0 可读图像、语言、状态，但不能读 action_1 的真实标签；noisy action suffix 则可采用不同的双向规则。",
      boundary: "双向注意力不天然等于泄漏。关键是输入位置里装的是推理可得噪声/潜变量，还是未来干净标签。",
    },
    {
      name: "模态身份与物理时间",
      plain: "模型不仅要知道 token 内容，还要知道它来自哪个相机、哪个历史时刻和哪种传感器。",
      why: "交换 wrist/base 相机或错配状态时间戳，会让同一个序列位置代表不同物理含义。",
      example: "camera_names、timestamps、history_offsets 和 padding mask 与张量一起成为输入合同。",
      boundary: "序列 position id 不能替代真实 measurement_time；多源传感器仍需先同步或插值。",
    },
  ],

  "action-representations": [
    {
      name: "动作合同",
      plain: "动作向量只有配上 command type、顺序、frame、unit、dt、有效维和 gripper 语义，才知道机器人会怎样执行。",
      why: "同样的数值 0.01 可能表示 1 cm、0.01 rad、关节位置或速度，含义错误会造成系统性方向和尺度错误。",
      example: "7D 动作可定义为 base-frame [Δx,Δy,Δz,Δroll,Δpitch,Δyaw,gripper]，但必须明确旋转 convention。",
      boundary: "7D 只是课程示例，不是 VLA 的统一标准；不同机器人可能输出 joint position、twist、torque 或技能。",
    },
    {
      name: "归一化与反归一化",
      plain: "训练把不同动作维缩放到相近数值范围，部署再用同一统计逆变换回物理命令。",
      why: "米、弧度、夹爪和底盘速度数值尺度不同；不处理会让某些维度主导 loss，统计错配又会直接改变真机幅度。",
      example: "z-score 用 â=(a−μ)/σ，quantile 方法用 q01/q99 映射到 [−1,1]；输出必须按 normalization_revision 选择逆变换。",
      boundary: "反归一化不是简单乘一个常数，也不能从模型名猜。统计必须来自 train split，并和 checkpoint、动作合同绑定。",
    },
    {
      name: "离散化与动作 token",
      plain: "离散化把连续区间切成 bins，再用整数 token 表示落在哪个区间；解码时通常恢复为区间中心或代表值。",
      why: "这样可复用语言模型的分类和自回归输出，但会引入量化误差、序列长度与越界裁剪。",
      example: "把 [−0.1,0.1] m 分成 32 个 bin，0.012 m 编成一个整数，再解码到相邻中心值。",
      boundary: "Token 不是物理动作本身；bin metadata、固定维和 clipping 统计缺失时，整数数组无法可靠执行。",
    },
    {
      name: "FAST 与逐维 bins",
      plain: "FAST 面向整段动作序列做频域变换、量化和 token 压缩，目标是减少高频长 chunk 的 token 数。",
      why: "逐维逐时刻 tokenization 会让长动作块形成很长的自回归序列，增加解码成本。",
      example: "平滑轨迹的低频系数可用较少符号表达，再通过逆变换恢复时间序列。",
      boundary: "FAST 不是普通逐维 bins 的别名；压缩误差、tokenizer revision 和物理合同仍要单独验证。",
    },
  ],

  "diffusion-policy": [
    {
      name: "多峰动作分布",
      plain: "同一观测下可能存在多种合理动作。生成式策略学习整个条件分布，而不是只输出一个均值。",
      why: "两条相反但都可行的绕障轨迹如果被 MSE 平均，均值轨迹可能正好撞向障碍。",
      example: "Toy 专家动作一半靠近 −2、一半靠近 +2；常数 MSE 最优预测为 0，但 0 不属于任一主峰。",
      boundary: "只有数据在给定条件下确实多峰时，这个问题才成立；观测若能区分模式，普通条件回归也可能工作。",
    },
    {
      name: "前向加噪",
      plain: "训练把干净动作 x₀ 与高斯噪声按预定 schedule 混合，得到不同噪声程度的 xₜ。",
      why: "模型因此能在任意噪声阶段学习局部去噪，而不必在训练中完整运行所有反向步骤。",
      example: "xₜ=√ᾱₜx₀+√(1−ᾱₜ)ε；t 越大，动作信息通常越弱，噪声占比越高。",
      boundary: "扩散时间 t 不是机器人轨迹步 h。两个轴在 H×dₐ 动作块中必须分开命名。",
    },
    {
      name: "去噪目标",
      plain: "常见 DDPM 参数化让网络根据 noisy action、噪声步和条件预测本次加入的 ε，也可以采用 x₀ 或 v 等其他目标。",
      why: "训练目标、scheduler 和反向更新公式必须配套；只替换网络输出含义会让采样公式失效。",
      example: "若本次加噪使用 ε=−0.5，预测 −0.2 的单样本 noise MSE 是 0.09。",
      boundary: "预测噪声不是预测动作类别，也不是直接输出最终 clean action。不同论文的参数化不能只看符号名。",
    },
    {
      name: "反向采样与终端先验",
      plain: "部署从近似高斯噪声开始，按反向公式逐步减小噪声，最终得到动作样本。",
      why: "多次更新让模型可以沿分布形状逐步形成不同动作模式，而不是一次回归均值。",
      example: "课程 Toy 使用 50 步 schedule，并检查终端 ᾱₜ 足够小后，才把 N(0,1) 当作明确近似初值。",
      boundary: "有限步终端分布通常不与标准高斯严格相等；双峰 Toy PASS 也不证明图像条件或真机轨迹质量。",
    },
  ],

  "flow-matching": [
    {
      name: "噪声到数据的路径",
      plain: "Flow matching 先规定噪声 ε 怎样随生成时间 τ 连续移动到真实动作 A。最简单路径是线性插值 Xτ=(1−τ)ε+τA。",
      why: "有了路径，就能为路径上的任意中间点构造应该朝哪个方向移动的监督标签。",
      example: "ε=−0.7、A=1.3、τ=0.25 时，中间点 Xτ=−0.2。",
      boundary: "插值路径是建模选择，不是机器人真实运动轨迹；生成时间也不是控制器时间。",
    },
    {
      name: "速度场",
      plain: "速度场 vθ(Xτ,τ,x) 接收当前位置、生成时间和观测条件，预测此处应该怎样变化。",
      why: "模型无需一步猜出最终动作，而是学习在整条噪声—数据路径上的局部方向。",
      example: "线性路径的真实速度 dXτ/dτ=A−ε；课程平移 Toy 中它等于 2×condition。",
      boundary: "Toy 的常速度来自刻意构造。真实高维动作速度通常依赖位置、时间、图像和状态。",
    },
    {
      name: "ODE solver",
      plain: "推理时 solver 从噪声初值出发，多次查询速度场并积分到动作端点。Euler 是最简单的一阶方法。",
      why: "网络只给局部速度，solver 才把这些局部信息组成完整生成过程。步数影响误差和推理成本。",
      example: "每一步执行 X←X+Δτ·vθ；增加步数会减小数值积分误差，但也增加网络调用。",
      boundary: "Loss 很低但端点错误时，应先查 solver 时间、方向和输入统计，而不是只增加步数。",
    },
    {
      name: "时间 convention",
      plain: "论文可定义 τ=0 为噪声、1 为数据；实现也可反向定义，只要速度符号和积分方向一起改变。",
      why: "单看 A−ε 或 ε−A 无法判断对错，必须同时看起点、终点和 dt 符号。",
      example: "正时间使用 A−ε、Δτ>0；反时间可使用 ε−A、dt<0，两者仍到同一动作。",
      boundary: "只翻 velocity 不翻 dt 会沿错误方向积分。方向测试应使用已知解析终点，而不只检查结果 finite。",
    },
  ],

  pi05: [
    {
      name: "VLM prefix 与 action expert",
      plain: "π₀ 系列把视觉和语言交给预训练 VLM 表示，再用专门的连续 action expert 生成机器人动作块。",
      why: "VLM 提供物体和语言语义，action expert 负责高维连续控制；两部分的训练目标和实时要求不同。",
      example: "图像、任务指令和本体状态形成条件 prefix，带噪 action slots 经 flow 速度场生成 H×dₐ 动作。",
      boundary: "Action expert 仍需目标机器人的动作合同和归一化统计；VLM 语义不会自动变成毫米级控制。",
    },
    {
      name: "Semantic action",
      plain: "π₀.₅ 显式生成短文字子任务，再让低层动作以观测和该子任务为条件执行。",
      why: "长任务可以先在语义层分解，例如先找到枕头、再拿起、再放入目标区域。",
      example: "整体指令是‘整理卧室’，当前 semantic action 可以是‘拿起床上的枕头’，低层输出随后生成约一秒动作。",
      boundary: "文字子任务是层级策略输出，不是动作执行后的未来状态预测，因此不能自动称为 world model。",
    },
    {
      name: "Co-training 与 Knowledge Insulation",
      plain: "Co-training 同时利用视觉语言、机器人轨迹、FAST 动作 token 和连续 flow 目标；Knowledge Insulation 限制 action expert 梯度对 VLM 表示的干扰。",
      why: "机器人微调需要学控制，又不希望把互联网预训练获得的语义能力全部覆盖掉。",
      example: "离散语义/FAST 目标更新共享表示，连续 flow 训练 action expert；部分梯度路径被显式阻断。",
      boundary: "这是特定训练设计，不代表任何联合训练都能保留知识；效果需绑定论文设置和固定实现。",
    },
    {
      name: "论文能力、公开代码与本地复现",
      plain: "论文报告、开源仓库提供的功能、以及你实际跑通的功能是三种不同证据。",
      why: "公开 checkpoint 可能只覆盖论文系统的一部分，高层语义路径、训练数据或完整配方未必全部开放。",
      example: "命令加载 checkpoint 只证明 smoke test；完成多 seed LIBERO rollout 才能报告该配置的任务成功率。",
      boundary: "官方开放世界结果不推出任意新机器人零样本可用，也不能写成本站已经复现。",
    },
  ],

  "vla-families": [
    {
      name: "动作生成范式",
      plain: "VLA 可用离散自回归 token、连续并行 head、diffusion 或 flow expert 生成同一动作块。",
      why: "生成方式决定量化误差、串行长度、多峰表达、采样次数和部署延迟，是选型的核心差异。",
      example: "同一 H×7 输出可被编码为 token sequence，也可一次连续回归，或从 H×7 噪声逐步生成。",
      boundary: "模型公司或参数量不能代替范式分析；连续 head 也不自动等于某套完整 OFT recipe。",
    },
    {
      name: "硬门禁与软评分",
      plain: "硬门禁是不满足就不能用的条件；软评分只在可行候选之间比较偏好。",
      why: "一个没有兼容动作 adapter 或许可不明确的模型，不应靠论文分数高来补偿。",
      example: "可用权重、许可、输入/动作 adapter 和本地 inference smoke 都 PASS 后，才比较延迟、语言泛化和社区成熟度。",
      boundary: "UNKNOWN 对硬门禁应按未通过处理，而不是用印象补成 PASS。",
    },
    {
      name: "Adapter 成本",
      plain: "模型能否接入机器人，不只看输入输出维度，还要看相机预处理、state 顺序、action frame、normalization 和数据格式。",
      why: "适配工作可能比模型训练本身更耗时，而且共同 adapter bug 会让多个模型一起失败。",
      example: "公开模型输出 7D EEF delta，但目标机器人要求 joint velocity；需要明确变换或重新定义训练输出。",
      boundary: "Shape 相同不代表语义兼容。不能因两个模型都输出 7 个数就认为可以直接替换。",
    },
    {
      name: "证据等级",
      plain: "论文报告、官方 README、公开资产、本地 smoke、离线回放和闭环 rollout 支持的结论范围不同。",
      why: "选型表若混合这些证据，会把作者报告的成功率误写成自己的复现结果。",
      example: "‘官方报告 LIBERO 成功率’与‘本机能加载权重’应占两列，不能合成一个‘已验证’。",
      boundary: "动态事实必须绑定 release/commit 和检查日期；排行榜结论不会自动跨任务、硬件和协议成立。",
    },
  ],

  "data-and-adaptation": [
    {
      name: "Episode 与数据 schema",
      plain: "Episode 是从 reset 到终止的一段完整交互。Schema 规定每帧图像、状态、动作、语言和时间戳怎样命名和排列。",
      why: "训练错误常来自字段映射、时间错位和单位混乱，而不是网络结构本身。",
      example: "一条 episode 保存 front/wrist 图像、q、action、instruction、measurement_time、termination 和 intervention。",
      boundary: "把文件成功读入不等于语义正确；每个字段仍要映射到动作合同和相机标定 revision。",
    },
    {
      name: "Episode-level split 与泄漏",
      plain: "Train、validation 和 test 应按完整 episode、场景或物体划分，避免同一轨迹的相邻帧落入不同集合。",
      why: "相邻视频帧高度相似，随机按帧切分会让 test 看起来很好，却没有检验新轨迹泛化。",
      example: "同一次抓杯的 300 帧全部属于 train 或全部属于 test，不能前 240 帧训练、后 60 帧测试。",
      boundary: "Test 不仅不能训练模型，也不能参与 normalization、reward model 拟合或反复调参。",
    },
    {
      name: "Train-only normalization",
      plain: "动作和状态统计只从训练集计算，并与 dataset、checkpoint 和 action contract 一起版本化。",
      why: "使用 val/test 统计会泄漏评测分布；部署使用错误统计则会把正常模型输出缩放成错误物理动作。",
      example: "π₀.₅ 固定配置可能采用 q01/q99 quantile，另一模型可能采用 mean/std，正逆变换不能混用。",
      boundary: "公开机器人统计只有在关节顺序、单位、frame 和命令类型完全一致时才可能复用。",
    },
    {
      name: "离线指标与闭环 rollout",
      plain: "离线 loss 衡量数据集上的预测误差；闭环 rollout 衡量策略执行后产生的新状态和最终任务结果。",
      why: "策略动作会改变下一次输入，离线误差无法覆盖 covariate shift、延迟、控制和安全层交互。",
      example: "模型 val loss 下降，但真机一直在杯子右侧累积偏差；需要回放、仿真和分层 rollout 定位原因。",
      boundary: "成功率必须带样本数、seed、任务分层和 evaluator revision；单个漂亮视频不是评测。",
    },
  ],

  "post-training": [
    {
      name: "Correction SFT 与 DAgger",
      plain: "Correction SFT 学习失败状态上的专家恢复动作；DAgger 让当前策略产生它真正会访问的状态，再请专家标注。",
      why: "继续只采理想成功演示，可能仍覆盖不到策略闭环中的偏离状态。",
      example: "策略抓偏后，专家接管并先横移再下降；日志同时保存 policy_action、human_action 和 executed_action。",
      boundary: "两者仍可使用模仿损失，不等于 RL；真实采集必须有接管与安全审批。",
    },
    {
      name: "Offline RL 与 online RL",
      plain: "Offline RL 只使用固定日志，online RL 则让更新中的策略继续与环境交互。",
      why: "Offline 避免新探索风险但会遇到分布外动作估值，online 获得当前反馈却带来磨损和危险探索。",
      example: "先在冻结机器人日志中学习 reward-weighted policy，再只在仿真或受限 canary 中允许在线更新。",
      boundary: "RL 不能修复 frame、unit、时序或 evaluator bug；基础策略完全 0% 时稀疏奖励也可能不给方向。",
    },
    {
      name: "Reward model",
      plain: "Reward model 根据观测、动作或结果估计任务进展与偏好，它是一个会犯错的学习测量器。",
      why: "真实任务成功可能难以自动判断，因此需要从人工偏好、视觉结果或阶段进度构造信号。",
      example: "模型把‘杯子进入盒子’判为成功，但遮挡或背景标记可能让它在杯子仍在外面时给高分。",
      boundary: "Reward model 不是安全层。必须用独立标注集、反例和分层 precision/recall 审计。",
    },
    {
      name: "冻结回归与版本链",
      plain: "每轮后训练都要保留未参与训练的测试集、固定 evaluator、基础 checkpoint 和一键回退。",
      why: "否则所谓提升可能来自测试泄漏、成功判据变化或只挑选变好的任务。",
      example: "新模型在恢复任务提高，但旧抓取任务退化；冻结回归会阻止只凭总体平均放行。",
      boundary: "同一 test 反复用于算法选择也会形成隐性过拟合，需要保留最终未触碰评测。",
    },
  ],

  "world-models": [
    {
      name: "Policy 与 dynamics",
      plain: "Policy 根据观测选择动作；dynamics 根据当前状态和候选动作预测之后会发生什么。",
      why: "只有区分这两个函数，才能判断一个模型是在直接反应，还是能用预测未来比较候选。",
      example: "VLA 提出四个 action chunks，dynamics 分别预测执行后的 latent state，再由代价函数排序。",
      boundary: "输出文字子任务仍可能只是层级 policy；没有动作条件未来预测时，不能仅凭‘会规划’就叫 world model。",
    },
    {
      name: "Reward 与 value",
      plain: "Reward 衡量当前一步反馈；value 估计从当前状态按某策略继续行动的未来累计回报。",
      why: "规划需要知道评分来自当前预测状态、一步 reward 还是长期 value，否则优化目标会被混写。",
      example: "靠近目标产生小 progress reward，最终成功产生 terminal reward；value 还预测后续完成任务的可能回报。",
      boundary: "Value 必须注明对应 policy 和 horizon；高 value 不会告诉你具体未来轨迹。",
    },
    {
      name: "Imagined rollout 与 model bias",
      plain: "规划时 dynamics 反复把自己的预测当下一步输入。一步小误差可能沿 horizon 累积。",
      why: "Teacher-forced one-step MSE 小，并不能保证自由滚动的未来仍准确。",
      example: "每步固定多预测 0.02，H=25 的线性 Toy 终点误差变成 0.5。",
      boundary: "Hδ 只属于固定线性偏差例子，不是神经世界模型的一般误差上界。真实评测要画 error-vs-horizon。",
    },
    {
      name: "有限候选重排与模型利用",
      plain: "让 VLA 先提出有限候选，再由 world model 评估，通常比在学习模型中无约束搜索更接近数据支持区域。",
      why: "优化器会主动寻找模型误差大的 OOD 动作，出现模型预测完美、真实执行灾难的 exploitation。",
      example: "课程 Toy 的无约束搜索找到重复动作 1.81，模型终点预测为 1，真实终点却约 5.418。",
      boundary: "有限候选仍不提供安全证明；所有 ensemble 成员也可能因共享数据偏差而一致地错。",
    },
  ],

  "frontier-and-deployment": [
    {
      name: "Policy server 与 robot client",
      plain: "Server 运行大模型并提出动作；robot client 验证协议、时间、frame、unit、finite 和安全约束后，才允许动作进入控制层。",
      why: "GPU 服务可能超时、崩溃或输出异常，机器人不能依靠同一个不稳定进程完成自救。",
      example: "Server 返回 H×7 chunk；client 反归一化、跳过过期前缀、限幅并记录原始与实际执行动作。",
      boundary: "Server 是不受信任的 proposer，不是机器人驱动；client 软件门禁也不能替代硬件保护。",
    },
    {
      name: "Versioned schema",
      plain: "Schema 把 request/response 的字段、shape、frame、unit、时间和 model/norm/action-contract revision 固定下来。",
      why: "模型、adapter 和客户端独立升级时，静默猜字段比明确拒绝更危险。",
      example: "响应回传 request_id、based_on_observation_time、clock_id、action_start_time、action_dt、valid mask 和 revisions。",
      boundary: "Shape 对并不代表协议兼容；未知 revision、frame 或 rotation convention 默认应拒绝。",
    },
    {
      name: "端到端 p99 与队列可行性",
      plain: "延迟预算应从观测产生到动作可用的同一请求边界测量，再换算为旧队列需要覆盖的动作数 R。",
      why: "模型、网络和客户端的尾延迟会共同决定是否断流，平均值无法保护偶发尖峰。",
      example: "e2e p99=270 ms、margin=30 ms、dt=50 ms 得 R=6；H=16、E=4 时 H−E=12≥6。",
      boundary: "直接相加各组件 p99 可能高估也可能低估端到端 p99，不是统计恒等式。",
    },
    {
      name: "TTL、watchdog 与 emergency stop",
      plain: "TTL 检查单个 chunk 是否太旧；watchdog 检查系统是否太久没有有效消息；controlled stop 是软件定义的降级状态；emergency stop 是独立风险控制功能。",
      why: "四者处理的故障不同，混在一个 timeout 或 hold 名字下会让恢复和安全责任不清。",
      example: "旧观测 chunk 被 TTL 拒绝，服务断流触发 watchdog，client 进入受控停止；紧急危险由独立急停链处理。",
      boundary: "Toy hold 不构成功能安全认证。真实停止行为与目标风险等级必须由设备和风险分析确定。",
    },
  ],

  "mobile-dual-arm-pi-deployment": [
    {
      name: "异构全身系统",
      plain: "双臂、夹爪、腰部和移动底盘具有不同自由度、单位、控制类型、频率和停止行为，不能当成一条同质向量。",
      why: "直接把 openpi 示例动作维度加长，会掩盖各子系统的 frame、限幅、watchdog 和动力学差异。",
      example: "机械臂使用 joint delta，夹爪使用 position，腰部使用 joint delta，底盘使用 base_link velocity。",
      boundary: "数组 padding 只解决模型固定宽度，不会自动解决物理语义或同步执行。",
    },
    {
      name: "Whole-body state/action contract",
      plain: "每个 state 和 action slice 都要有名字、范围、frame、unit、dt、valid mask、normalization revision 和时间来源。",
      why: "全身模型最危险的错误往往是顺序或尺度错，但张量仍 finite、shape 仍正确。",
      example: "20 个有效动作维 pad 到 32 维；manipulate mode 只允许双臂、夹爪和腰部，base slice 被 mask。",
      boundary: "课程脚本中的 limits 与 q01/q99 是示例 metadata，必须替换为目标机器人的厂商和 train-split 数据。",
    },
    {
      name: "Mode gating",
      plain: "Mode 把 navigate、stabilize、manipulate 和 recover 分开，规定当前哪些执行器可以动作。",
      why: "第一版同时学习底盘、腰部和双臂会扩大数据组合和碰撞约束，难以定位失败。",
      example: "manipulate 时底盘锁定或严格限速；navigate 时手臂保持安全姿态；切换后记录 mode timestamp。",
      boundary: "Mode gating 是降低初期复杂度的工程策略，不证明同时 whole-body policy 永远不值得做。",
    },
    {
      name: "Thor 原生、加速与远端三路径",
      plain: "部署可比较 Thor 原生框架、TensorRT/低精度加速和工作站 server＋Thor client 三条路径。",
      why: "边缘设备兼容性、内存、延迟、温控和数值一致性都可能成为门禁，峰值算力不能直接回答可用性。",
      example: "对同一固定观测比较三路径 raw action、finite、最大/分位误差、p50/p95/p99、功耗与温度。",
      boundary: "最快路径若 parity 或稳定性失败就不能进入真机；社区性能数字也不是目标硬件事实。",
    },
    {
      name: "分级真机灰度",
      plain: "模型先经历离线回放、disabled actuator、shadow、架空/空载、自由空间和低速单物体，再逐级扩大动作范围。",
      why: "把学习性能验证和硬件安全验证拆开，可在风险较低的阶段暴露 adapter、时序和数值错误。",
      example: "shadow 只记录 policy_action，不执行；通过后先测试单子系统，再评估底盘停稳后的双臂操作。",
      boundary: "页面步骤不能替代厂商说明、现场风险负责人和安全审批。任何 near-miss 都应停止并冻结日志。",
    },
  ],

  capstone: [
    {
      name: "任务合同",
      plain: "毕业项目先固定初始状态、语言指令、成功/失败、超时、扰动、动作接口和安全边界。",
      why: "任务定义不断变化时，数据、模型和评测结果无法比较，也无法判断失败属于能力还是口径。",
      example: "固定‘按语言选择目标并放入指定区域’，限定一台机器人、1–3 个任务、已知 reset 和 seed。",
      boundary: "开放世界、跨本体和长时规划不应在第一个项目中同时展开；范围缩小不是降低评测严谨性。",
    },
    {
      name: "Baseline",
      plain: "Baseline 是使用同一数据、动作合同、安全层和评测协议的对照系统，用来定位新方法真正增加了什么。",
      why: "没有 zero/hold、expert replay 和 ACT 等对照时，VLA 失败无法区分模型、数据与执行器问题。",
      example: "ACT 与 π₀.₅ 都通过同一 PolicyRequest/Response 和 rollout evaluator，只替换 policy backend。",
      boundary: "Baseline 成功不证明 VLA 必然成功；它只给共同数据和执行链提供窄正证据。",
    },
    {
      name: "配对评测",
      plain: "两个模型在相同 seed、场景和扰动上运行时，结果是配对数据，应直接分析每一对成功/失败变化。",
      why: "只看两个独立成功率区间会丢掉同一场景上的相关性，不能准确回答哪个模型在哪些任务改善。",
      example: "记录每个 seed 上 ACT/VLA 的 (成功,成功)、(成功,失败)、(失败,成功)、(失败,失败)，再做 paired analysis。",
      boundary: "Wilson 区间适合报告单模型成功率；模型差异还需 paired bootstrap、McNemar 或相应差值区间。",
    },
    {
      name: "失败分类与可复现交付",
      plain: "项目结果不仅是成功率，还要把失败分成 perception、policy、adapter、latency、safety、controller 和 evaluator。",
      why: "只有保存 revision、原始响应、处理后动作、视频和时间日志，别人才可能复现并继续改进。",
      example: "VLA 0% 仍可形成合格结果，只要 expert replay、ACT、协议对照齐全且失败能定位。",
      boundary: "漂亮视频、单次成功或 loss 曲线不能替代预注册任务、样本数、失败记录和版本化产物。",
    },
  ],
};
