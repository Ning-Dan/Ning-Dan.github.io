import type { OpenCourse } from "@/lib/openCourseTypes";

const courseRoot = "https://rail.eecs.berkeley.edu/deeprlcourse-fa19";
const repoRoot = "https://github.com/berkeleydeeprlcourse/homework_fall2019";

const slide = (number: number, title: string) => ({
  title: `Lecture ${number} slides：${title}`,
  url: `${courseRoot}/static/slides/lec-${number}.pdf`,
  kind: "slides" as const,
  note: "Fall 2019 官方讲义。本站保留原讲次、符号与核心例子，用中文重新讲解。",
});

const slidePage = (number: number, page: number, title: string, caption: string) => ({
  title,
  src: `${courseRoot}/static/slides/lec-${number}.pdf`,
  href: `${courseRoot}/static/slides/lec-${number}.pdf#page=${page}`,
  caption,
  credit: `UC Berkeley CS 285 Fall 2019 · Lecture ${number} · PDF 第 ${page} 页；本站远程嵌入原文件，并提供中文解读。`,
  kind: "pdf-page" as const,
  page,
});

const videoIds = [
  "SinprXg2hUA",
  "TUBBIgtQL_k",
  "6PYJFUu3eLQ",
  "w_IIP-swuVo",
  "Ds1trXd6pos",
  "EKqxumCuAAY",
  "doR5bMe-Wic",
  "7Lwf-BoIu3M",
  "uR1Ubd2hAlE",
  "pE0GUFs-EHI",
  "6JDfrPRhexQ",
  "9AbBfIgTzoo",
  "Pei6G8_3r8I",
  "DP0SJrNgV60",
  "eeww07Jxncw",
  "oUnsDUtNsOQ",
  "QAUDfIgXnjw",
  "SA4FgI3_nmg",
  "4qH_h5_V3O4",
  "tzieElmtAjs",
  "7KAeOt0AXO4",
] as const;

const video = (number: number, title: string) => ({
  title: `Lecture ${number} video：${title}`,
  url: `https://www.youtube.com/watch?v=${videoIds[number - 1]}`,
  kind: "video" as const,
  note: "Fall 2019 官方课堂录像；视频只作个人信息与学习用途，本站不转载录像或长段字幕。",
});

const recording = (number: number, title: string, note: string) => ({
  title: `Lecture ${number} · ${title}`,
  youtubeId: videoIds[number - 1],
  note: `录像入口与主题已核对；受字幕访问限制，尚未逐句核验全部口头内容。建议结合 slides 阅读。${note}`,
});

const homework = (number: number, title: string) => ({
  title: `Homework ${number}：${title}`,
  url: `${courseRoot}/static/homeworks/hw${number}.pdf`,
  kind: "assignment" as const,
  note: "Fall 2019 官方作业说明；本站只提炼实验问题与评估方法，不提供原作业答案。",
});

const starterCode = (number: number) => ({
  title: `Homework ${number} starter code`,
  url: `${repoRoot}/tree/master/hw${number}`,
  kind: "code" as const,
  note: "官方归档 starter code。仓库未标注许可证，本站实验为独立小实现，不复制 TODO 解答。",
});

export const cs285Course = {
  slug: "cs285",
  title: "CS 285 Fall 2019：深度强化学习",
  shortTitle: "CS285 深度强化学习",
  provider: "UC Berkeley · Sergey Levine（L17 Richard Liaw；L20 Kate Rakelly）",
  sourceUrl: `${courseRoot}/`,
  description:
    "按 Berkeley CS 285 Fall 2019 的 13 周、21 讲与 5 份作业重组的中文学习课程。从模仿学习出发，依次学习策略梯度、Actor-Critic、Q-learning、模型式强化学习、控制即推断、迁移、探索与 Meta-RL。每章先解释问题，再推公式，最后用小型可运行实验检验。",
  provenance:
    "章节顺序以 Fall 2019 官方首页为准；概念、符号和例子逐份核对官方 slides、homework handout、TensorFlow notebook 与 starter-code 结构后重新讲解。课堂录像共 23 条，本课程映射 syllabus 对应的前 21 讲；目前只确认了录像入口、标题与讲次，受字幕访问限制，不能声称已完整吸收每一段口头补充，其后 2 场 guest lecture 也不混作 syllabus 正课。",
  licenseNote:
    "课程页明确说明录像仅供个人信息与娱乐用途；slides、homework PDF 和 Fall 2019 starter-code 仓库未发现明确开放许可证。本站因此只链接原件，提供原创中文讲解、短小数值例和独立实验，不镜像整套课件、不逐句翻译字幕、不复制图片，也不发布作业解答。",
  prerequisites: [
    "概率论：条件概率、期望、方差、KL 散度",
    "微积分与线性代数：梯度、链式法则、矩阵乘法",
    "机器学习：监督学习、神经网络与自动微分",
    "Python；运行实验需 NumPy，不要求 MuJoCo 或 GPU",
  ],
  outcomes: [
    "能用统一的 MDP 符号推导策略梯度、Actor-Critic 与 Q-learning",
    "能解释 on-policy、off-policy、分布偏移、估计偏差和方差之间的关系",
    "能区分规划、模型式策略学习、Dyna 与模型预测控制",
    "能把最大熵 RL、控制即推断、逆强化学习和探索放到同一概率视角",
    "能读懂 Fall 2019 五份作业要验证的科学问题，并用独立小实验复现其思想",
  ],
  coverage: [
    { source: "Official course / syllabus / calendar", mappedTo: "01–13 全部章节", note: "课程顺序以 Fall 2019 首页周次和 syllabus 为准。" },
    { source: "Official Fall 2019 YouTube playlist", mappedTo: "01–13 全部章节", note: "21 条 syllabus 正课录像的入口与标题已映射；口头内容尚未做逐段字幕核验。播放列表后 2 条 guest lecture 未混入正课。" },
    { source: "Official resources page", mappedTo: "01 课程导论：从感知到行动" },
    { source: "Lecture 3 TensorFlow notebook", mappedTo: "03 神经网络复习与强化学习问题", note: "保留 static-graph/automatic-differentiation 思路，并显式提示 API 已过时。" },
    { source: "Fall 2019 starter-code repository", mappedTo: "02、04、05、07、11 章实验", note: "分别链接 hw1–hw5 子目录；仓库已归档且未检测到 LICENSE。" },
    { source: "Week 1 · Lecture 1", mappedTo: "01 · Sections 1–3", note: "sensorimotor loop、监督来源与课程问题设定。" },
    { source: "Week 2 · Lecture 2", mappedTo: "02 · Sections 1–5", note: "BC、多模态、covariate shift、DAgger/no-regret 与 goal-conditioned imitation；关键图见 slide p.13。" },
    { source: "Week 3 · Lecture 3", mappedTo: "03 · Section 3–4", note: "计算图、张量形状、自动微分与官方 TF1 notebook。" },
    { source: "Week 3 · Lecture 4", mappedTo: "03 · Sections 1–3", note: "MDP、轨迹分布、V/Q/A 与 RL 三环。" },
    { source: "Week 4 · Lecture 5", mappedTo: "04 · Sections 1–4", note: "REINFORCE、Gaussian policy、importance sampling、causality；关键图见 slide p.21。" },
    { source: "Week 4 · Lecture 6", mappedTo: "04 · Sections 5–6", note: "TD、GAE、critic 架构与 control variate；关键图见 slide p.24。" },
    { source: "Week 5 · Lecture 7", mappedTo: "05 · Sections 1–2", note: "policy evaluation、MC/TD 与 fitted Q。" },
    { source: "Week 5 · Lecture 8", mappedTo: "05 · Sections 3–5", note: "DQN、Double Q、n-step、连续动作与 Actor-Critic；Double-Q 图见 slide p.22。" },
    { source: "Week 6 · Lecture 9", mappedTo: "06 · Sections 1–2", note: "performance-difference、KL trust region 与 natural gradient；关键图见 slide p.23。" },
    { source: "Week 6 · Lecture 10", mappedTo: "06 · Sections 3–6", note: "random shooting/CEM/MCTS、LQR/iLQR 与 Riccati；CEM 图见 slide p.15。" },
    { source: "Week 7 · Lecture 11", mappedTo: "07 · Sections 1–4", note: "MPC、model exploitation、ensemble、visual foresight 与 HW4 data loop；视觉规划见 slide p.36。" },
    { source: "Week 8 · Lecture 12", mappedTo: "08 · Sections 1–3", note: "BPTT、GPS、Dyna/MVE/MBPO；GPS 图见 slide p.27。" },
    { source: "Week 8 · Lecture 13", mappedTo: "08 · Sections 4–5", note: "Jensen、ELBO、amortized inference 与 reparameterization；推导图见 slide p.13。" },
    { source: "Week 8 · Lecture 14", mappedTo: "08 · Sections 6–8", note: "optimality graph、backward message、soft Bellman 与 optimism problem；图见 slide p.29。" },
    { source: "Week 9 · Lecture 15", mappedTo: "09 · Sections 1–4", note: "feature matching、MaxEnt IRL、guided cost learning 与 GAIL；算法页见 slide p.16。" },
    { source: "Week 9 · Lecture 16", mappedTo: "09 · Sections 5–6", note: "finetune、domain randomization、distillation、context 与 modular policy；distillation 见 slide p.40。" },
    { source: "Week 10 · Lecture 17", mappedTo: "10 · Sections 1–4", note: "A3C/IMPALA/Ape-X、policy lag、V-trace 与 RLlib；importance correction 见 slide p.11。" },
    { source: "Week 11 · Lecture 18", mappedTo: "11 · Sections 1–3", note: "bandit、pseudo-count、KDE、EX2 与 RND；EX2 见 slide p.32。" },
    { source: "Week 11 · Lecture 19", mappedTo: "11 · Sections 4–6", note: "VIME information gain、demonstration + RL 与 batch-Q support；VIME 见 slide p.9。" },
    { source: "Week 12 · Lecture 20", mappedTo: "12 · Sections 1–6", note: "RL²/MAML、meta-imitation、model-based adaptation、PEARL task belief；optimization 例见 slide p.20。" },
    { source: "Week 13 · Lecture 21", mappedTo: "13 · Sections 1–5", note: "Skew-Fit、DIAYN、unsupervised meta-RL 与结课问题；Skew-Fit 见 slides pp.13–20。" },
    { source: "Homework 1 PDF + hw1 starter", mappedTo: "02 · Sections 3–5 + DAgger lab", note: "讲实验问题与评估，不提供 TODO 解答。" },
    { source: "Homework 2 PDF + hw2 starter", mappedTo: "04 · Sections 1–6 + trajectory/bandit labs", note: "落点为 reward-to-go、baseline、Gaussian policy 与多 seed 评估。" },
    { source: "Homework 3 PDF + hw3 starter", mappedTo: "04 · Section 6；05 · Sections 3–5 + Q/AC labs", note: "DQN 与 Actor-Critic 两半均有明确落点。" },
    { source: "Homework 4 PDF + hw4 starter", mappedTo: "07 · Section 4 + model_based_mpc.py", note: "random shooting、ensemble、on-policy aggregation 与消融。" },
    { source: "Homework 5 PDF + hw5 starter", mappedTo: "11 · Sections 2–4 + count/KDE/EX2 labs", note: "count reward、KDE 与 exemplar novelty；不复制作业答案。" },
  ],
  chapters: [
    {
      slug: "introduction",
      index: 1,
      title: "课程导论：从感知到行动",
      subtitle: "对应 Week 1 / Lecture 1：先看清深度强化学习究竟在解决哪一类问题",
      duration: "4–5 小时",
      summary:
        "这一讲不急着背算法名。先把机器人、游戏和推荐系统都还原成同一个反馈回路，再比较奖励、示范、预测和跨任务经验能提供什么监督。",
      objectives: [
        "画出 agent—environment 反馈回路并标出 observation、action、reward",
        "说明 end-to-end 决策和传统模块化流水线的差别",
        "区分奖励学习、模仿、预测、迁移与 Meta-learning 的监督来源",
      ],
      prerequisites: ["监督学习基本概念", "条件概率与期望"],
      concepts: [
        {
          name: "序列决策",
          explanation: "动作会改变下一步看到的世界，所以一个时刻的预测误差会沿时间传下去。问题的样本不是彼此独立的图片，而是由策略自己生成的轨迹。",
          why: "这解释了为什么分类准确率很高的策略仍可能滚出训练数据之外，也解释了强化学习为何必须讨论长期后果。",
          example: "自动驾驶车向左微偏后，下一帧车道线的位置也变了；后续控制必须处理这个由自己制造的新观测。",
          boundary: "有时间索引不等于序列决策。若当前输出不会影响未来输入，它仍可按普通监督学习处理。",
        },
        {
          name: "策略 policy",
          explanation: "策略 π(a|o) 或 π(a|s) 给出在当前信息下选择动作的规则，可以是确定函数，也可以是动作分布。",
          why: "策略把感知结果变成可执行决策，是整门课最终要学习或间接得到的对象。",
          example: "视觉抓取策略输入相机图像，输出各个抓取动作的概率或连续机械臂命令。",
          boundary: "策略不是环境动力学。前者回答‘我做什么’，后者回答‘做完以后世界怎样变化’。",
        },
        {
          name: "奖励 reward",
          explanation: "奖励 r(s,a) 是对局部结果的数值反馈；RL 最大化的是一条轨迹上奖励的期望总和，而不只是下一步奖励。",
          why: "同一个动作短期可能付出代价、长期却打开更高回报的路径，目标必须覆盖时间。",
          example: "机器人绕开障碍会暂时远离目标，但能避免碰撞并最终到达。",
          boundary: "奖励不是事实标签，也不自动等于人真正想要的目标；错误奖励会诱导策略钻空子。",
        },
        {
          name: "深度强化学习",
          explanation: "用深度网络表示策略、价值函数或动力学模型，使学习器直接处理图像等非结构化观测。",
          why: "Lecture 1 用传统视觉和控制流水线作对比：深度模型减少手工特征接口，但训练信号仍来自序列决策。",
          example: "把 RGB 图像直接映射为电机命令，中间特征由任务损失共同学习。",
          boundary: "end-to-end 不代表系统不需要安全约束、状态估计或低层控制，也不保证更省数据。",
        },
      ],
      sections: [
        {
          title: "1. 一个反馈回路，而不是一张静态图片",
          intuition: "先沿时间走一遍：观察、动作、后果、再观察。",
          paragraphs: [
            "在时刻 t，环境有状态 s_t，智能体只拿到观测 o_t，依据策略选择 a_t；环境随后转移到 s_{t+1} 并给出 r_t。课程讲义把动物、机器人与库存决策并列，是为了说明物理载体不同，但闭环结构相同。",
            "Lecture 1 的 sensorimotor loop 区分了两件事：深度网络处理复杂输入输出表示，RL 处理行为及其后果。两者结合后，网络的训练数据又由当前策略产生，因而不能把问题当作固定数据集分类。",
          ],
          formula: {
            latex: String.raw`o_t \rightarrow a_t \sim \pi_\theta(\cdot\mid o_t),\quad (s_{t+1},r_t)\sim p(\cdot\mid s_t,a_t)`,
            explanation: "策略决定动作，环境决定动作的后果；这两个条件分布不能混为一谈。",
            symbols: [
              { symbol: "o_t", meaning: "第 t 步可见的观测" },
              { symbol: "a_t", meaning: "第 t 步动作" },
              { symbol: "π_θ", meaning: "参数为 θ 的策略" },
              { symbol: "p", meaning: "环境转移规律" },
            ],
          },
          example: {
            title: "20 步任务为什么会放大单步错误",
            steps: [
              "假设每一步独立做对的概率都是 0.9。",
              "整条 20 步轨迹全部正确的概率为 0.9^20。",
              "逐次相乘得到约 0.122，也就是只有约 12.2%。",
            ],
            result: "单步 90% 不能理解成整项任务 90%；序列长度会放大局部误差。",
          },
          checks: ["能否说清策略和环境模型分别控制哪条箭头？"],
        },
        {
          title: "2. 监督信号不只来自奖励",
          intuition: "奖励告诉系统结果好不好，示范告诉系统别人怎么做，预测数据告诉系统世界怎样变化。",
          paragraphs: [
            "Lecture 1 在课程后半列出四条路线：直接模仿专家动作；从示范反推意图或奖励；通过观察学习预测；从其他任务迁移或学会快速学习。后面的 13 周就是在比较这些信号的代价与假设。",
            "这张地图很重要：若真人示范便宜、奖励难写，先考虑 imitation 或 inverse RL；若环境交互昂贵但历史数据多，考虑 off-policy 或 model-based；若任务反复变化，才轮到 transfer 和 meta-RL。",
          ],
          example: {
            title: "给仓库机器人选择监督",
            steps: [
              "有 500 条熟练工轨迹：可先做行为克隆。",
              "只有成功/失败记录：可把它当稀疏奖励，但要解决探索。",
              "有大量无标签相机与关节日志：可先学习动力学或表征。",
            ],
            result: "算法选择应从可获得的监督开始，而不是从最流行的算法名开始。",
          },
        },
        {
          title: "3. 为什么课程从模仿学习开始",
          intuition: "模仿把决策暂时改写成监督学习，让我们看见序列数据最先出现的陷阱。",
          paragraphs: [
            "给定专家数据 (o_i,a_i^*)，可以像回归或分类一样训练 π_θ。它是最直接的 end-to-end 控制方案，也是后续理解策略梯度的桥：两者都在调动作的对数概率，只是权重来源不同。",
            "但学习策略一旦自己行动，访问的观测分布会改变。这一问题在 Lecture 2 展开，也会在模型式 RL、off-policy RL 和部署中反复出现。",
          ],
          formula: {
            latex: String.raw`\theta^*=\arg\min_\theta\;\mathbb E_{(o,a^*)\sim D_E}[-\log \pi_\theta(a^*\mid o)]`,
            explanation: "让专家动作在策略下具有更高概率；连续高斯策略时常退化为均方误差。",
            symbols: [
              { symbol: "D_E", meaning: "专家示范数据集" },
              { symbol: "a*", meaning: "专家动作" },
              { symbol: "−log π", meaning: "负对数似然损失" },
            ],
          },
        },
      ],
      recordings: [
        recording(1, "Introduction and Course Overview", "配合 slides 核对 sensorimotor loop、端到端控制与多种监督来源。"),
      ],
      pitfalls: [
        "把深度强化学习理解成‘神经网络加一个 reward 输出’；真正困难在数据分布由策略改变。",
        "默认状态 s_t 总能被传感器直接看到；后面处理部分可观测时必须改用历史或 belief。",
        "用单步准确率替代整条轨迹的成功率。",
      ],
      exercises: [
        {
          question: "动作不会影响下一次输入的推荐排序，是否一定要建模成 RL？",
          answer: "不一定。若反馈没有长期效应，可先用 contextual bandit 或监督排序；只有动作改变未来状态与数据分布时，序列建模才不可回避。",
        },
        {
          question: "策略和控制器是不是同义词？",
          answer: "在课内符号里都可表示决策规则，但工程上策略常输出较高层目标或分布，低层控制器再保证动力学跟踪与约束。",
        },
      ],
      sources: [
        { title: "CS285 Fall 2019 官方课程首页", url: `${courseRoot}/`, kind: "course" },
        { title: "CS285 Fall 2019 syllabus 与材料说明", url: `${courseRoot}/syllabus/`, kind: "course", note: "包含 prerequisites、5 份 homework、slides 与录像用途说明。" },
        { title: "CS285 Fall 2019 resources", url: `${courseRoot}/resources/`, kind: "course", note: "官方列出的历年课程、教材与辅助资源。" },
        { title: "CS285 Fall 2019 官方 YouTube playlist", url: "https://www.youtube.com/playlist?list=PLkFD6_40KJIwhWJpGazJ9VSj9CFMkb79A", kind: "video", note: "播放列表有 23 条；本课程正文按 syllabus 映射前 21 条正课录像。" },
        slide(1, "Introduction and Course Overview"),
        video(1, "Introduction and Course Overview"),
      ],
    },
    {
      slug: "imitation-learning",
      index: 2,
      title: "模仿学习：BC、分布偏移与 DAgger",
      subtitle: "对应 Week 2 / Lecture 2 / Homework 1",
      duration: "6–8 小时",
      summary:
        "从行为克隆的监督损失出发，追踪小误差怎样把策略推到专家数据之外，再用 DAgger 的在线数据聚合修复。最后处理历史依赖、多模态动作和因果混淆。",
      objectives: [
        "推导离散与连续行为克隆损失",
        "用占用分布解释 covariate shift",
        "逐轮写出 DAgger 的采样、专家标注与数据聚合",
        "识别非 Markov、多模态和 causal confusion 三种不同失败原因",
      ],
      prerequisites: ["第 1 章", "最大似然估计", "分类与回归"],
      concepts: [
        {
          name: "行为克隆（BC）",
          explanation: "把专家的 observation—action 对当作监督数据，直接拟合条件策略。",
          why: "无需奖励和在线试错，算法稳定，是示范学习最自然的基线。",
          example: "用专家在 HalfCheetah 上的关节状态和力矩训练一个 MLP。",
          boundary: "BC 只保证专家分布上的平均拟合，不保证策略自己访问到的状态。",
        },
        {
          name: "占用分布",
          explanation: "d_π(s) 表示执行策略 π 时各状态被访问的频率；策略变化会让训练输入分布一起变化。",
          why: "用它才能精确说清 BC 的训练分布 d_E 与测试分布 d_π 不同。",
          example: "专家总在车道中心，BC 轻微偏移后会看到训练集中没有的靠边图像。",
          boundary: "分布偏移不是网络过拟合的同义词；即使专家分布上零训练误差，闭环也可能偏移。",
        },
        {
          name: "DAgger",
          explanation: "让当前策略访问状态，请专家在这些状态上给动作标签，再把新样本并入训练集。",
          why: "把训练分布逐步改造成接近学习策略真正会访问的分布。",
          example: "车辆偏到右侧时仍询问专家应该如何回正，而不是只收集居中驾驶。",
          boundary: "DAgger 需要能在学习策略访问的状态查询专家；机器人危险状态下可能代价很高。",
        },
        {
          name: "多模态行为",
          explanation: "同一观测下可能有多个都合理的动作模式，单个高斯或 MSE 会把它们平均。",
          why: "平均动作在控制中可能恰好是最差动作，例如从障碍左绕和右绕的平均是撞上障碍。",
          example: "专家在岔路既可左转也可右转；均值策略却直行。",
          boundary: "多模态与部分可观测可能同时出现；加历史能解决信息缺失，却不自动解决真正的一对多。",
        },
      ],
      sections: [
        {
          title: "1. 从最大似然得到行为克隆",
          intuition: "专家做了什么，就提高那个动作的概率。",
          paragraphs: [
            "离散动作使用交叉熵；若连续策略设为固定方差高斯，最大化专家动作似然等价于最小化预测均值与专家动作的平方误差。Lecture 2 用端到端驾驶说明 BC 有时确实有效，因此不能简单断言‘BC 一定失败’。",
            "是否有效取决于闭环稳定性、专家数据覆盖、模型拟合精度和任务时长。讲义中的左右相机等数据增强，本质是在人工补充偏离轨迹后的恢复样本。",
          ],
          formula: {
            latex: String.raw`\mathcal L_{BC}=-\frac1N\sum_{i=1}^{N}\log\pi_\theta(a_i^*\mid o_i)`,
            explanation: "这只是专家数据上的条件最大似然；它没有出现环境转移，也没有直接优化长期回报。",
            symbols: [
              { symbol: "N", meaning: "示范样本数" },
              { symbol: "o_i", meaning: "专家访问到的观测" },
              { symbol: "a_i*", meaning: "专家动作标签" },
            ],
          },
          example: {
            title: "两个都正确的动作为什么不能直接求均值",
            steps: [
              "同一观测下专家动作是一半 −1、一半 +1。",
              "MSE 最优的单点预测是样本均值 0。",
              "若 −1 表示左绕、+1 表示右绕，0 表示直撞障碍。",
            ],
            result: "损失最小不等于动作有效；模型族必须能表达多模态。",
          },
        },
        {
          title: "2. 分布偏移为什么沿时间累积",
          intuition: "专家数据教的是‘从专家状态继续’，部署时需要的是‘从我的错误状态恢复’。",
          paragraphs: [
            "BC 在 d_{π_E} 下训练，却在 d_{π_θ} 下执行。一个动作误差改变下一状态，新的状态又更容易出错，于是误差不再独立。Lecture 2 把这称为 distributional drift，并通过稳定轨迹与 DAgger 对照说明何时影响较小。",
            "历史输入可处理非 Markov 的示范，但也会放大 causal confusion：网络可能把与动作相关却非因果的历史线索当作捷径。DAgger 有时能缓解，因为主动干预会打破这种伪相关。",
          ],
          formula: {
            latex: String.raw`\mathbb E_{s\sim d_{\pi_\theta}}[\ell(\pi_\theta(s),\pi_E(s))]\neq \mathbb E_{s\sim d_{\pi_E}}[\ell(\pi_\theta(s),\pi_E(s))]`,
            explanation: "同一个逐状态损失，在专家和学习策略的访问分布下会有不同期望。",
            symbols: [
              { symbol: "d_π", meaning: "策略 π 诱导的状态占用分布" },
              { symbol: "ℓ", meaning: "逐状态模仿损失" },
              { symbol: "π_E", meaning: "专家策略" },
            ],
          },
          example: {
            title: "每步 1% 失误的长度效应",
            steps: [
              "10 步都不失误的概率是 0.99^10≈0.904。",
              "100 步都不失误的概率是 0.99^100≈0.366。",
              "真实闭环中错误还会把后续状态推离训练集，所以通常比独立假设更糟。",
            ],
            result: "任务越长，越不能只报告逐步验证误差。",
          },
        },
        {
          title: "3. DAgger：把自己会遇到的问题加入教材",
          intuition: "不是让专家多走几遍，而是让学习策略暴露自己的盲点。",
          paragraphs: [
            "第 k 轮执行混合策略或当前策略，收集它访问到的状态；专家只需为这些状态提供标签。将样本加入 D_{k+1}=D_k∪D_{new} 后重新训练。随着轮次增加，训练分布更接近部署分布。",
            "Homework 1 要求在两个连续控制任务比较 BC，并在一个任务画 DAgger 轮数—回报曲线，同时报告多条 rollout 的均值与标准差。科学问题不是‘跑通代码’，而是检验数据覆盖能否解释表现差异。",
          ],
          formula: {
            latex: String.raw`D_{k+1}=D_k\cup\{(s,\pi_E(s)):s\sim d_{\pi_k}\}`,
            explanation: "新标签来自当前策略访问的状态，正面修补 covariate shift。",
            symbols: [
              { symbol: "D_k", meaning: "第 k 轮累计数据集" },
              { symbol: "d_{π_k}", meaning: "第 k 轮策略的访问分布" },
            ],
          },
          figures: [slidePage(2, 13, "DAgger 数据聚合循环", "这页的关键箭头是：学习策略访问状态，专家只为这些状态补标签，再把新数据并回累计数据集。它不是多收几条专家正常轨迹。")],
          checks: ["能否解释为什么‘再收集一批专家正常轨迹’不等于 DAgger？"],
        },
        {
          title: "4. DAgger 的在线学习视角与 T² 风险",
          intuition: "BC 的一步小错误会改变后续输入；DAgger 通过让训练分布跟着 learner 走，把序列问题还原成逐轮监督学习。",
          paragraphs: [
            "在最坏情况下，BC 在专家分布上的逐步错误率 ε 会造成 O(T²ε) 的序列代价：第 t 步首次犯错后，余下 O(T−t) 步都可能进入未知状态。这个界是风险说明，不是每个任务都会精确达到；稳定动力学或恢复数据会更好。",
            "DAgger 把第 k 轮 learner 访问分布上的监督损失交给一个 no-regret 在线学习器。若平均在线 regret 随轮数下降，混合策略的序列代价可改善到 O(Tε) 量级。保证依赖可查询专家、损失能代表控制代价等条件，不能只凭用了数据聚合就自动成立。",
          ],
          formula: {
            latex: String.raw`J(\pi_{BC})\lesssim J(\pi_E)+O(T^2\epsilon),\qquad J(\pi_{DAgger})\lesssim J(\pi_E)+O(T\epsilon)+O(T\,\mathrm{regret}_K)`,
            explanation: "量级比较表达 compounding-error 的来源；常数和精确条件取决于逐步损失、混合策略与专家假设。",
            symbols: [{ symbol: "T", meaning: "决策时域" }, { symbol: "ε", meaning: "逐状态模仿误差" }, { symbol: "regret_K", meaning: "K 轮在线监督学习的平均遗憾" }],
          },
        },
        {
          title: "5. Goal-conditioned BC 与 causal confusion",
          intuition: "把目标告诉策略能区分任务，却不能自动证明策略使用了真正因果线索。",
          paragraphs: [
            "多任务示范可训练 π(a|o,g)，其中 g 是目标、任务 ID 或语言描述。训练数据必须让同一或相近观测搭配不同目标，否则网络可以完全忽略 g，仍在训练集取得低损失。",
            "历史输入能缓解部分可观测，却也可能带来 causal confusion。例如果专家刹车前总先点亮刹车灯，策略可能学到‘灯亮→刹车’，部署时灯由自己的动作产生，形成错误反馈。DAgger 的主动干预有机会打破相关性，但真正稳妥还需反事实数据或明确因果实验。",
          ],
          formula: {
            latex: String.raw`\mathcal L=-\mathbb E_{(o,g,a^*)\sim D_E}\log\pi_\theta(a^*\mid o,g)`,
            explanation: "条件中加入 g 只是提供信息；是否真正使用 g，要靠交叉目标测试而非训练损失判断。",
            symbols: [{ symbol: "g", meaning: "目标或任务条件" }, { symbol: "D_E", meaning: "带目标标注的专家数据" }],
          },
          checks: ["怎样构造测试来判断网络是否忽略 goal？", "为什么加入四帧历史既可能帮助，也可能增加伪相关？"],
        },
      ],
      recordings: [
        recording(2, "Supervised Learning of Behaviors", "观看重点：端到端驾驶何时成功、DAgger 的数据聚合图、历史依赖与多模态行为；这些课堂例子对应本章三个失效层次。"),
      ],
      lab: {
        title: "闭环分布偏移与 DAgger",
        goal: "在一维控制任务中比较只看专家轨迹的 BC 与逐轮聚合恢复状态的 DAgger。",
        file: "/labs/cs285/dagger_distribution_shift.py",
        steps: [
          "运行脚本，观察 BC 与 DAgger 在不同初始扰动下的终点误差。",
          "把训练样本打印出来，确认 DAgger 增加的是当前策略访问到的状态。",
          "修改专家反馈增益或 rollout 长度，观察误差累计。",
        ],
        expected: ["DAgger 的闭环误差低于只在专家窄分布上训练的 BC。", "脚本末尾打印 PASS。"],
        sourceNote: "呼应 Homework 1 的 BC/DAgger 比较，但环境、实现和答案均为本站独立设计。",
      },
      pitfalls: [
        "只比较训练损失，不做闭环 rollout。",
        "把多模态均值错误归因于数据量不足；模型族错误时加数据也不会修好。",
        "在危险状态直接让未成熟策略接管，却没有专家接管或混合策略。",
      ],
      exercises: [
        { question: "DAgger 为什么通常比继续收集专家轨迹更有针对性？", answer: "它在学习策略的占用分布上查询标签，直接覆盖策略自己会进入的恢复状态。" },
        { question: "给策略增加 8 帧历史是否必然改善模仿？", answer: "不必然。历史可恢复隐藏状态，也可能引入与动作伪相关的线索并加重 causal confusion，需要干预式数据验证。" },
      ],
      sources: [slide(2, "Supervised Learning of Behaviors"), video(2, "Supervised Learning of Behaviors"), homework(1, "Imitation Learning"), starterCode(1)],
    },
    {
      slug: "mdp-and-neural-networks",
      index: 3,
      title: "神经网络复习与强化学习问题",
      subtitle: "对应 Week 3 / Lectures 3–4：从自动微分到 MDP 与算法三步循环",
      duration: "6–7 小时",
      summary:
        "把神经网络训练所需的张量、损失和自动微分接到 MDP 上；随后用轨迹分布、回报、价值函数和 Q 函数统一描述后续算法。",
      objectives: ["写出有限时域 MDP 和轨迹概率", "计算折扣回报、V 与 Q", "解释采样、估值、策略改进三步", "读懂自动微分训练循环中的数据形状"],
      prerequisites: ["第 1–2 章", "神经网络前向传播", "条件概率"],
      concepts: [
        { name: "MDP", explanation: "马尔可夫决策过程由状态、动作、转移、奖励和初始分布组成；给定当前状态与动作，未来不再依赖更早历史。", why: "它是课程推导策略梯度、Bellman 方程和规划的共同语言。", example: "网格世界状态是格子位置，动作是上下左右，转移可能带打滑。", boundary: "真实传感器观测若不含完整状态，就不是严格的 fully observed MDP。" },
        { name: "轨迹", explanation: "τ=(s_0,a_0,…,s_T) 是一次完整交互；其概率同时含策略和环境转移。", why: "RL 目标是对轨迹分布求期望，而不是对固定 i.i.d. 数据求平均。", example: "机器人从起点出发直到抓取成功或超时的一整段日志。", boundary: "把 replay buffer 中的单步 transition 当作独立轨迹会丢掉时序回报信息。" },
        { name: "价值函数 V 与 Q", explanation: "V^π(s) 是从状态 s 按 π 行动的期望未来回报；Q^π(s,a) 固定第一步动作后再按 π 行动。", why: "它们把漫长未来压缩成当前状态或状态—动作对的标量。", example: "Q(s,左) 与 Q(s,右) 比较当前岔路两种选择的长期后果。", boundary: "Q 是在特定策略或最优性假设下的期望，不是一次 rollout 的实测回报。" },
        { name: "自动微分", explanation: "先用张量运算定义标量损失，框架沿计算图反向应用链式法则得到参数梯度。", why: "后续策略和价值网络都靠它优化，但我们仍必须指定正确的目标和停止梯度位置。", example: "DQN 的 target 应视作常数，梯度只更新当前 Q 网络。", boundary: "自动微分保证导数按代码计算，不保证数学目标正确或训练稳定。" },
      ],
      sections: [
        {
          title: "1. 用 MDP 写清问题，而不是先选算法",
          intuition: "先明确什么是状态、动作、奖励和终止，再讨论如何学习。",
          paragraphs: [
            "Lecture 4 从 Markov chain 过渡到 MDP。有限时域目标对初始状态、策略动作和环境转移共同形成的轨迹分布求期望；无限时域还会涉及折扣或平稳分布。",
            "状态必须包含预测未来所需的信息。若相机看不到杯子被遮挡后的位姿，观测不是状态；可用历史、RNN 或 belief 近似。",
          ],
          formula: {
            latex: String.raw`p_\theta(\tau)=p(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)p(s_{t+1}\mid s_t,a_t),\quad J(\theta)=\mathbb E_{\tau\sim p_\theta}[\sum_t\gamma^t r_t]`,
            explanation: "策略参数只出现在动作概率里；环境转移通常未知但可采样。",
            symbols: [{ symbol: "τ", meaning: "完整轨迹" }, { symbol: "T", meaning: "时域长度" }, { symbol: "γ", meaning: "折扣因子" }, { symbol: "J", meaning: "期望回报目标" }],
          },
          example: {
            title: "三步折扣回报",
            steps: ["奖励依次为 1、0、4，γ=0.5。", "G_0=1+0.5×0+0.5²×4。", "0.5²×4=1，因此 G_0=2。"],
            result: "折扣不仅控制远期权重，也影响估值方差和有效时域。",
          },
        },
        {
          title: "2. V、Q 与 advantage 各回答什么",
          intuition: "V 是来到这里有多好，Q 是在这里这样做有多好，两者之差衡量动作相对平均水平。",
          paragraphs: [
            "Lecture 4 用 V 和 Q 消掉未来轨迹的显式枚举。Q^π(s,a) 先执行 a，再遵循 π；V^π(s) 则对第一步动作也按 π 求平均。A^π(s,a)=Q^π(s,a)-V^π(s) 因而是相对基线。",
            "这三个量不是三套互不相关的网络。Actor-Critic 用 critic 估计它们，policy gradient 用 advantage 给动作对数概率加权，Q-learning 则直接寻找 Q*。",
          ],
          formula: {
            latex: String.raw`V^\pi(s)=\mathbb E_{a\sim\pi}[Q^\pi(s,a)],\qquad A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s)`,
            explanation: "对策略平均后的 Q 就是 V；advantage 为正表示该动作优于策略在此状态的平均动作。",
            symbols: [{ symbol: "V^π", meaning: "状态价值" }, { symbol: "Q^π", meaning: "状态—动作价值" }, { symbol: "A^π", meaning: "优势函数" }],
          },
          example: {
            title: "两动作状态的 V 与 advantage",
            steps: ["Q(s,L)=2，Q(s,R)=6；策略各选一半。", "V(s)=0.5×2+0.5×6=4。", "A(s,L)=−2，A(s,R)=+2。"],
            result: "策略更新应降低 L 的概率并提高 R 的概率。",
          },
        },
        {
          title: "3. 所有 RL 算法都在改哪三个环节",
          intuition: "采样、估计回报、改进策略；算法差别在每一步用什么近似。",
          paragraphs: [
            "Lecture 4 的核心图把算法拆成三环：执行策略生成数据；拟合模型或估计 return；改进策略。Policy gradient 直接对策略求导，value-based 学最优 Q，actor-critic 学当前策略价值后更新 actor，model-based 先学转移再规划或训练策略。",
            "Lecture 3 的 TensorFlow 复习服务于同一循环：placeholder/张量承载批数据，网络给出预测，标量 loss 触发反向传播。配套 notebook 从 constant、placeholder、variable 走到简单回归网络；它使用 TensorFlow 1 的 session/static graph API，今天不应照抄接口，但计算图、变量初始化、loss 和 optimizer 的依赖关系仍值得手算。要特别核对 batch×time×feature 的形状，以及哪些 target 应 stop-gradient。",
          ],
          checks: ["看到一个新 RL 算法时，能否指出它怎样采样、怎样估值、怎样改策略？", "能否区分环境模型 p(s'|s,a) 和价值模型 Q(s,a)？"],
        },
        {
          title: "4. 把 Lecture 3 的 TF1 notebook 翻成现代训练循环",
          intuition: "API 已过时，但 placeholder—prediction—loss—gradient—update 的依赖关系没有过时。",
          paragraphs: [
            "官方 notebook 共 62 个 cell，从 constant、placeholder、Variable 和 Session 开始，最后训练简单回归。TF1 先搭静态 graph，再在 sess.run 中用 feed_dict 注入 batch；现代 PyTorch/eager TensorFlow 则在每个 batch 直接执行 forward，但张量形状和链式法则完全相同。",
            "把输入写成 X:[B,d_in]、权重 W:[d_in,d_out]、预测 Y_hat=XW+b:[B,d_out]。标量 loss 对 batch 求平均，反向传播得到与 W、b 同 shape 的梯度。迁移到 RL 时，batch 还可能多 time 维 [B,T,d]；把 B 与 T 展平前要确认 mask、terminal 和 advantage 是否保持对应。",
            "一个现代最小循环是：optimizer.zero_grad()；prediction=model(x)；loss=criterion(prediction,target)；loss.backward()；optimizer.step()。DQN/Actor-Critic 额外要求对 bootstrap target 和 advantage 权重 stop-gradient，否则图结构和数学更新不一致。",
          ],
          formula: {
            latex: String.raw`X\in\mathbb R^{B\times d_{in}},\quad W\in\mathbb R^{d_{in}\times d_{out}},\quad \hat Y=XW+b\in\mathbb R^{B\times d_{out}},\quad L=\frac1B\|\hat Y-Y\|_F^2`,
            explanation: "先核对 forward shape，再核对 loss 是否是标量，最后检查每个参数梯度 shape 与参数一致；框架版本不会替你发现语义错位。",
            symbols: [{ symbol: "B", meaning: "batch size" }, { symbol: "d_in,d_out", meaning: "输入/输出特征维数" }, { symbol: "||·||_F", meaning: "Frobenius norm" }],
          },
          checks: ["若 observation batch 是 [32,17]、action head 有 6 个 logits，输出 shape 应是什么？", "为什么 target network 输出要 detach？"],
        },
      ],
      recordings: [
        recording(3, "TensorFlow and Neural Nets Review", "观看重点是计算图、张量形状、训练循环与调试；框架版本已过时，但自动微分思路仍有效。"),
        recording(4, "Introduction to Reinforcement Learning", "观看重点是 MDP 定义、有限/无限时域目标，以及‘采样—估值—改进’三环图。"),
      ],
      pitfalls: ["把 observation 无条件写成 state。", "把一条轨迹的 return 当作价值函数本身。", "认为框架自动求导会自动处理 target network 的停止梯度。"],
      exercises: [
        { question: "若 Q(s,a_1)=3、Q(s,a_2)=7，π 分别为 0.25、0.75，V(s) 是多少？", answer: "V=0.25×3+0.75×7=6。" },
        { question: "为什么 RL 训练数据通常不满足固定 i.i.d. 假设？", answer: "连续状态相关，而且策略更新会改变后续访问分布。" },
      ],
      sources: [
        slide(3, "TensorFlow and Neural Nets Review"),
        video(3, "TensorFlow and Neural Nets Review"),
        { title: "Lecture 3 TensorFlow tutorial notebook", url: `${courseRoot}/static/misc/TF_lecture.ipynb`, kind: "code", note: "官方配套 notebook，使用 TensorFlow 1 static-graph API；用于理解计算图，不建议原样作为现代工程模板。" },
        slide(4, "Introduction to Reinforcement Learning"),
        video(4, "Introduction to Reinforcement Learning"),
      ],
    },
    {
      slug: "policy-gradient-actor-critic",
      index: 4,
      title: "策略梯度与 Actor-Critic",
      subtitle: "对应 Week 4 / Lectures 5–6 / Homework 2",
      duration: "8–10 小时",
      summary: "从 log-derivative trick 推出 REINFORCE，逐步加入 reward-to-go、baseline、critic、TD 和 GAE。重点不是背公式，而是知道每个改动在偏差—方差轴上做了什么。",
      objectives: ["从轨迹目标推导策略梯度", "解释 reward-to-go 和 baseline 为何降方差", "写出 TD error 与 Actor-Critic 更新", "区分 Monte Carlo、TD 与 GAE"],
      prerequisites: ["第 3 章", "对数求导", "期望与方差"],
      concepts: [
        { name: "log-derivative trick", explanation: "利用 ∇p=p∇log p，把对分布的导数变成可采样的期望。", why: "环境转移不可导时仍能估计策略参数梯度。", example: "提高高回报轨迹中已执行动作的 log probability。", boundary: "估计无偏不代表方差小；长时域下原始 REINFORCE 很噪。" },
        { name: "reward-to-go", explanation: "第 t 步动作只乘从 t 开始的未来奖励，不乘已发生的过去奖励。", why: "过去奖励不可能被当前动作改变，去掉它们不会改期望却能降方差。", example: "第三步动作不应为第一步已经得到的奖励背书。", boundary: "它仍是 Monte Carlo 回报，长时域方差依然可能很大。" },
        { name: "baseline", explanation: "从 Q 的样本估计中减去只依赖状态的 b(s)，常用 V(s)。", why: "动作概率梯度对动作求期望为零，所以该减法不引入偏差，却能消掉状态难度差异。", example: "得分 8 在平均 2 的状态很好，在平均 10 的状态反而差。", boundary: "baseline 若依赖当前动作，通常不再保证无偏。" },
        { name: "Actor-Critic", explanation: "actor 是策略，critic 学 V 或 Q 并为 actor 提供低方差 advantage。", why: "bootstrap 允许用短 rollout 做在线更新，并降低完整 Monte Carlo 回报的方差；它本身并不等于复用旧数据。", example: "A2C 用并行 worker 收集短 rollout，再用 GAE 更新策略。", boundary: "普通 Actor-Critic 仍是 on-policy；若从 replay 复用旧数据，还要处理 off-policy 分布修正。critic 不准也会给 actor 引入偏差。" },
      ],
      sections: [
        {
          title: "1. REINFORCE：把试错写成梯度",
          intuition: "回报高的已执行动作变得更可能，回报低的变得更不可能。",
          paragraphs: [
            "轨迹概率中环境转移不依赖 θ，因此 ∇log p_θ(τ) 只剩各时刻 ∇logπ_θ(a_t|s_t)。用采样轨迹替代期望，就得到 likelihood-ratio estimator。Lecture 5 把它和最大似然并排：形式都是负对数似然，RL 只是给每项乘上由结果决定的权重。",
            "课堂强调 policy gradient 是 on-policy：梯度期望针对当前 π_θ。旧数据若直接使用会产生分布错误，需要 importance sampling 或只做小幅更新。",
          ],
          formula: {
            latex: String.raw`\nabla_\theta J=\mathbb E\!\left[\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,\bar G_t\right],\quad \bar G_t=\sum_{t'=t}^{T-1}\gamma^{t'}r_{t'}`,
            explanation: "这里沿用第 3 章从轨迹起点折扣的目标 J=E[Σγ^t r_t]，所以权重使用绝对折扣的回报 bar G_t。若把相对 reward-to-go G_t=Σγ^(t'−t)r_t' 代入，则梯度外还要乘 γ^t。许多实现省略这个外因子，相当于采用每个时刻重新起算的常用训练约定；两者不能悄悄混写。",
            symbols: [{ symbol: "J", meaning: "从轨迹起点折扣的期望回报" }, { symbol: "bar G_t", meaning: "带绝对折扣 γ^t' 的因果回报" }, { symbol: "∇logπ", meaning: "score function" }],
          },
          example: {
            title: "两动作 bandit 的一次更新",
            steps: ["策略选 A/B 的概率为 0.5/0.5，这次选到 A，奖励为 4。", "损失写作 −4 log π(A)，梯度下降会提高 π(A)。", "若改为奖励 −1，损失为 +log π(A)，会降低 π(A)。"],
            result: "策略梯度把‘试过以后好不好’直接转成动作概率的方向。",
          },
          figures: [slidePage(5, 21, "Causality：过去奖励不归因给当前动作", "这一页把整条轨迹回报改成从当前动作之后开始的奖励。阅读时应逐项问：哪一项会随 a_t 改变，哪一项已经发生、对当前 score 的期望贡献为零。")],
        },
        {
          title: "2. 离散 softmax 与连续 Gaussian policy",
          intuition: "策略网络不是直接吐出‘正确动作’，而是给出一个可采样、可计算 log probability 的分布。",
          paragraphs: [
            "离散动作常用 logits z_θ(s) 经 softmax 得到 π_θ(a|s)。连续控制常让网络输出均值 μ_θ(s)，并学习或固定对数标准差 log σ；采样 a=μ+σε 后，logπ 是高斯对数密度。均值梯度与 (a−μ)/σ² 成正比，因此回报为正时会把均值拉向采到的动作。",
            "σ 既控制探索也进入梯度尺度。σ 太小会让少量偏差产生巨大 score，σ 太大则动作噪声淹没控制信号。实现时应让网络输出 log σ，再通过裁剪或 softplus 保证数值范围；动作边界通常用 tanh squashing，并补上变量变换的 log-Jacobian。",
          ],
          formula: {
            latex: String.raw`\log\pi_\theta(a\mid s)=-\frac12\sum_j\left[\frac{(a_j-\mu_{\theta,j}(s))^2}{\sigma_j^2}+2\log\sigma_j+\log(2\pi)\right],\quad \nabla_{\mu_j}\log\pi=\frac{a_j-\mu_j}{\sigma_j^2}`,
            explanation: "高回报样本把均值推向该动作，低回报样本把均值推开；标准差决定探索范围与 score 的尺度。",
            symbols: [{ symbol: "μ_θ(s)", meaning: "策略网络输出的动作均值" }, { symbol: "σ", meaning: "动作标准差" }, { symbol: "j", meaning: "动作维度" }],
          },
          example: {
            title: "一维 Gaussian 的 score",
            steps: ["μ=0、σ=0.5，采到 a=0.25。", "均值方向 score=(0.25−0)/0.5²=1。", "若 advantage=2，该样本给均值参数的权重为 2；若 advantage=−2，方向反转。"],
            result: "同一个动作究竟被鼓励还是压低，由相对回报而非动作本身决定。",
          },
        },
        {
          title: "3. 旧策略样本为何需要 importance ratio",
          intuition: "数据若来自 q，却要计算 π 下的期望，就必须补上两种分布的概率比。",
          paragraphs: [
            "若轨迹由旧策略 π_old 采集，直接拿来估计新策略 π_θ 的期望会有偏。单步 surrogate 使用 r_t(θ)=π_θ(a_t|s_t)/π_old(a_t|s_t) 修正动作分布；完整轨迹比率是所有时刻比率的乘积，时域一长方差会爆炸。",
            "这也是后续 TRPO/PPO 限制更新幅度的动机：不是把旧数据无限复用，而是在行为分布尚接近时做有限次更新。自动微分只对 logπ 与 ratio 求导；采样得到的 reward-to-go 和 advantage 在 actor loss 中应视为常数。",
          ],
          formula: {
            latex: String.raw`\mathbb E_{a\sim\pi_\theta}[f(a)]=\mathbb E_{a\sim\pi_{old}}\!\left[\frac{\pi_\theta(a\mid s)}{\pi_{old}(a\mid s)}f(a)\right]`,
            explanation: "分母是生成样本的行为策略，分子是希望评估的新策略；支持集不重合时该修正失效。",
            symbols: [{ symbol: "π_old", meaning: "采样时的行为策略" }, { symbol: "π_θ", meaning: "正在优化的目标策略" }, { symbol: "f", meaning: "回报或 advantage 加权项" }],
          },
          checks: ["若 π_old(a|s)=0 而 π_θ(a|s)>0，为什么 ratio 无法补救？", "actor loss 中哪些量需要 stop-gradient？"],
        },
        {
          title: "4. reward-to-go 与 baseline：只去掉无用噪声",
          intuition: "不能归因给当前动作的过去奖励，以及状态本身的平均难度，都不该进入动作比较。",
          paragraphs: [
            "Causality 允许第 t 项只保留 t 以后的奖励。再减 b(s_t) 后，权重成为 advantage 估计。Lecture 5 说明平均回报可作简单 baseline，但状态价值通常更好。",
            "Homework 2 系统比较 batch size、reward-to-go、advantage normalization 和神经网络 baseline。它要求多 seed/多 rollout 曲线，因为策略梯度噪声不能靠一条最好曲线判断。",
          ],
          formula: {
            latex: String.raw`G_t^{rel}=\sum_{t'=t}^{T-1}\gamma^{t'-t}r_{t'},\quad \hat A_t=G_t^{rel}-V_\phi(s_t),\quad \nabla J=\mathbb E[\sum_t\gamma^t\nabla\log\pi_t\hat A_t]`,
            explanation: "第一项是从当前时刻重新计时的 Monte Carlo reward-to-go，第二项是状态基线。最后的 γ^t 让它与本课程此前定义的起点折扣目标一致；若实现不乘 γ^t，必须明确采用另一种时间加权目标。",
            symbols: [{ symbol: "γ", meaning: "折扣因子" }, { symbol: "V_φ", meaning: "critic 的状态价值预测" }, { symbol: "Â_t", meaning: "优势估计" }],
          },
          example: {
            title: "手算 reward-to-go 与 advantage",
            steps: ["奖励 [1,2,4]，γ=0.5。", "G_1=2+0.5×4=4。", "若 V(s_1)=3.2，则 Â_1=4−3.2=0.8。"],
            result: "第二步动作比该状态下的平均表现好 0.8，应提高其概率。",
          },
        },
        {
          title: "5. Critic、TD 与 GAE",
          intuition: "完整回报真实但噪，bootstrap 平滑但会继承估值误差。",
          paragraphs: [
            "一步 TD 用 r_t+γV(s_{t+1}) 作为 V(s_t) 的目标，TD error δ_t 同时是一步 advantage 估计。Actor 用 δ_t 加权 logπ，critic 回归 bootstrap target。",
            "Lecture 6 从 Monte Carlo 到 TD，再到 n-step 和 GAE 展示偏差—方差连续谱。λ 越接近 1 越像长回报，偏差低而方差高；λ 越接近 0 越依赖 critic。",
          ],
          formula: {
            latex: String.raw`\delta_t=r_t+\gamma V_\phi(s_{t+1})-V_\phi(s_t),\qquad \hat A_t^{GAE}=\sum_{l\ge0}(\gamma\lambda)^l\delta_{t+l}`,
            explanation: "TD error 测量一步结果比 critic 预期好多少；GAE 对多步 TD error 指数加权。",
            symbols: [{ symbol: "δ_t", meaning: "一步 TD error" }, { symbol: "λ", meaning: "GAE 的偏差—方差旋钮" }],
          },
          figures: [slidePage(6, 24, "GAE：多步 TD error 的指数加权", "这一页对应 λ 从 0 到 1 的偏差—方差连续谱。不要只记公式：先展开前两项，再核对每个 reward 被哪些 TD residual 使用。")],
          checks: ["为什么减去 V(s) 不改变策略梯度期望？", "λ=0 与 λ≈1 分别更像什么？"],
        },
        {
          title: "6. Critic 架构与 action-dependent control variate",
          intuition: "baseline 可以与 actor 共享表示，但它必须在对动作取期望后不改变梯度。",
          paragraphs: [
            "最常见实现让 actor 与 V critic 使用独立网络，或共享一个 trunk 后分成 policy/value 两个 head。共享参数能省计算，却会让两个损失争夺表示；因此要分别记录 policy loss、value loss、entropy 与 explained variance，而不是只看总损失。",
            "状态基线 V(s) 与当前动作无关，安全地满足 E_a[∇logπ(a|s)V(s)]=0。若使用 action-dependent control variate，则必须把其对动作的期望或解析修正项加回来；随手减去 Q(s,a) 会把真正的 policy signal 一并消掉。",
          ],
          formula: {
            latex: String.raw`\mathbb E_{a\sim\pi}[\nabla_\theta\log\pi_\theta(a\mid s)b(s)]=b(s)\nabla_\theta\sum_a\pi_\theta(a\mid s)=0`,
            explanation: "无偏性的关键不是 baseline 准不准，而是它不能依赖本次采样动作；action-dependent 版本需要额外校正。",
            symbols: [{ symbol: "b(s)", meaning: "只依赖状态的控制变量" }, { symbol: "Σ_aπ(a|s)", meaning: "归一化后恒为 1" }],
          },
        },
      ],
      recordings: [
        recording(5, "Policy Gradients", "观看重点：最大似然对照、trial-and-error 解释、causality、baseline 与 on-policy 限制。"),
        recording(6, "Actor-Critic Algorithms", "观看重点：critic 作为状态相关 baseline、discount 的两种用法，以及 Monte Carlo/TD/GAE 的偏差—方差折中。"),
      ],
      lab: {
        title: "Trajectory REINFORCE：折扣、reward-to-go 与 Gaussian policy",
        goal: "在多步连续动作环境核对绝对折扣与相对 reward-to-go 的关系，并比较完整回报和因果估计器方差。",
        file: "/labs/cs285/trajectory_policy_gradient.py",
        steps: ["手算每个时刻的绝对折扣 reward-to-go。", "用 Gaussian score-function 估计完整回报与 causal estimator。", "训练策略均值，并与 bandit baseline 小实验交叉验证。"],
        expected: ["两种无偏估计的均值接近。", "causality 去掉过去奖励后方差更低。", "策略均值靠近逐步目标并打印 PASS。"],
        sourceNote: "呼应 Homework 2 的 trajectory policy gradient、reward-to-go 与连续策略；另保留 policy_gradient_bandit.py 隔离演示 baseline。两者均为独立小环境。",
      },
      pitfalls: ["把采样 loss 当作普通监督损失而忘记 stop-gradient 回报权重。", "用动作相关 baseline 却仍宣称无偏。", "只看单 seed 曲线判断算法优劣。"],
      exercises: [
        { question: "奖励 [3,0,2]、γ=1 时，第 1 步（从 0 编号）的 reward-to-go 是多少？", answer: "0+2=2；已经在第 0 步得到的 3 不再归因给第 1 步动作。" },
        { question: "critic 估高 V(s_t) 会怎样影响 actor？", answer: "advantage/TD error 会偏低，actor 可能压低本应提高的动作概率；这是 Actor-Critic 的偏差来源。" },
      ],
      sources: [slide(5, "Policy Gradients（含 Gaussian policy、causality 与 importance sampling）"), video(5, "Policy Gradients"), slide(6, "Actor-Critic Algorithms（含 TD、GAE 与 critic 架构）"), video(6, "Actor-Critic Algorithms"), homework(2, "Policy Gradients"), starterCode(2), homework(3, "DQN and Actor-Critic"), starterCode(3), { title: "独立实验：Bandit baseline 方差", url: "/labs/cs285/policy_gradient_bandit.py", kind: "code", note: "先隔离检查 baseline 不改期望梯度、只降方差。" }, { title: "独立实验：Trajectory Gaussian Policy Gradient", url: "/labs/cs285/trajectory_policy_gradient.py", kind: "code", note: "对应 HW2 的 reward-to-go 与连续策略思想。" }, { title: "独立实验：TD Actor-Critic", url: "/labs/cs285/actor_critic_td.py", kind: "code", note: "对应 HW3 的 Actor-Critic 部分，不复制官方 TODO 或答案。" }],
    },
    {
      slug: "value-functions-q-learning",
      index: 5,
      title: "价值函数与深度 Q-learning",
      subtitle: "对应 Week 5 / Lectures 7–8 / Homework 3",
      duration: "8–10 小时",
      summary: "从 Bellman 备份、动态规划和 fitted Q-iteration 走到 DQN；解释 replay buffer、target network、Double Q、n-step 与连续动作方法各自修哪一个问题。",
      objectives: ["推导 Bellman expectation 与 optimality 方程", "实现 fitted Q / DQN 的 target", "解释 replay 和 target network 的稳定作用", "辨认过估计、分布外动作与连续 max 的困难"],
      prerequisites: ["第 3–4 章", "回归", "bootstrap 估计"],
      concepts: [
        { name: "Bellman 备份", explanation: "把当前价值写成即时奖励加下一状态价值，递归压缩未来。", why: "无需枚举整条未来轨迹即可传播奖励。", example: "终点奖励从终点前一格逐轮传回起点。", boundary: "函数逼近、off-policy 和 bootstrap 同时出现时不再自动保证收敛。" },
        { name: "Fitted Q-Iteration", explanation: "固定一批 transition 和旧 Q，构造回归 target，拟合新 Q 后再重复。", why: "把动态规划备份转成标准监督回归，适配神经网络。", example: "每轮冻结 y=r+γmax Q_old，再对 (s,a,y) 做多步 SGD。", boundary: "target 含模型自己的预测，数据支持之外仍可能严重外推。" },
        { name: "Replay buffer", explanation: "保存历史 transition，随机抽 batch 训练。", why: "打散连续样本相关性并复用昂贵交互数据。", example: "DQN 从最近一百万步中均匀或按优先级采样。", boundary: "buffer 越大并非总越好；旧策略数据会增大分布陈旧度。" },
        { name: "Target network", explanation: "用延迟更新的参数 θ̄ 构造 TD target。", why: "避免正在拟合的网络同时快速移动标签。", example: "每 K 步复制 online Q，或用 Polyak 平滑。", boundary: "它缓解 moving target，不消除函数逼近外推或过估计。" },
      ],
      sections: [
        {
          title: "1. Policy evaluation：先固定策略再估值",
          intuition: "Bellman expectation backup 评估‘照现在这样做会怎样’，Bellman max 才是在改进策略。",
          paragraphs: [
            "Lecture 7 先从固定 π 的 policy evaluation 开始：给定 V_k，用一步奖励加下一状态 V_k 的期望得到 V_{k+1}。有限 tabular MDP 中反复 backup 收敛到 V^π；再令 π(s)=argmax_a Q^π(s,a)，就是 policy iteration。",
            "Monte Carlo 等 episode 结束后用真实 return 回归，偏差低但方差高；TD(0) 一步后就用当前 V bootstrap，方差低但目标有偏且随参数移动。n-step return 在两者之间。理解这条轴，才能看懂 Actor-Critic 和 Q-learning 为什么同样使用 TD，却优化不同对象。",
          ],
          formula: {
            latex: String.raw`V_{k+1}^{\pi}(s)=\sum_a\pi(a\mid s)\sum_{s'}p(s'\mid s,a)\left[r(s,a)+\gamma V_k^{\pi}(s')\right]`,
            explanation: "这里动作仍按固定 π 平均，没有 max；把期望换成采样 transition 就得到 TD target。",
            symbols: [{ symbol: "k", meaning: "动态规划迭代次数" }, { symbol: "π(a|s)", meaning: "被评估的固定策略" }, { symbol: "p(s'|s,a)", meaning: "环境转移" }],
          },
          example: {
            title: "一次 policy-evaluation backup",
            steps: ["状态 s 下策略各以 0.5 选 L/R。", "L 的一步 target 为 1+0.9×2=2.8，R 为 0+0.9×4=3.6。", "V_new(s)=0.5×2.8+0.5×3.6=3.2。"],
            result: "只有在 policy improvement 阶段才会直接选 3.6 对应的动作。",
          },
        },
        {
          title: "2. 从 Bellman 方程到 fitted Q",
          intuition: "一步看得见，余下未来交给同一个价值函数。",
          paragraphs: [
            "对固定策略，Q^π 的下一动作仍按 π 平均；对最优 Q*，下一步选最大动作。Lecture 7 从 tabular value iteration 过渡到函数逼近，再指出 fitted Q-iteration 实际是在反复回归 bootstrap target。",
            "target 计算时旧参数必须被视为常数。若让梯度同时穿过 target，优化的就不再是课上定义的半梯度 TD 更新。",
          ],
          formula: {
            latex: String.raw`y_i=r_i+\gamma(1-d_i)\max_{a'}Q_{\bar\theta}(s'_i,a'),\qquad \mathcal L_Q=\frac1B\sum_i(Q_\theta(s_i,a_i)-y_i)^2`,
            explanation: "终止 transition 用 d_i 截断 bootstrap；θ̄ 固定生成 target。",
            symbols: [{ symbol: "d_i", meaning: "终止标志" }, { symbol: "θ̄", meaning: "target network 参数" }, { symbol: "B", meaning: "batch size" }],
          },
          example: {
            title: "一条 transition 的 DQN target",
            steps: ["r=2、γ=0.9、未终止。", "target network 对下一状态两动作给 4 与 5。", "y=2+0.9×5=6.5。"],
            result: "若当前 Q(s,a)=4，平方 TD error 为 (4−6.5)^2=6.25。",
          },
        },
        {
          title: "3. DQN 为什么需要 replay 与 target network",
          intuition: "把一边跑一边追逐自己的目标，改造成相对静态的批回归。",
          paragraphs: [
            "连续采样使相邻 state 强相关；同一个 online network 既预测又造标签，使目标每次更新都移动。Replay buffer 打散时间相关并允许 off-policy 复用，target network 则降低标签变化速度。",
            "Lecture 8 把 online Q、DQN 与 fitted Q 放进同一三进程图：收数据、更新 target、做 SGD 只是相对速度不同。Homework 3 的 Atari DQN 部分正是让学生落实 replay、target update 与训练/评估分离。",
          ],
          example: {
            title: "相关样本为何会骗过 batch",
            steps: ["连续 32 帧都来自同一条直道，表面 batch size 是 32。", "这些帧几乎提供同一个方向的梯度，有效独立样本远少于 32。", "从 replay 随机抽不同 episode 和时刻，可增加梯度多样性。"],
            result: "replay 的核心不只是省数据，也是改变训练 batch 的统计结构。",
          },
          figures: [slidePage(8, 22, "Double Q：把动作选择与估值拆开", "这一组 slides 展示 max 如何偏爱正估计噪声。先由 online Q 选 argmax，再由另一组估计给该动作打分，才能削弱同源噪声。")],
        },
        {
          title: "4. Double Q、n-step 与连续动作",
          intuition: "max 会挑中估计噪声最大的动作；多步回报更快但更依赖行为策略；连续动作还不能枚举。",
          paragraphs: [
            "Double Q 用 online network 选动作、target network 估该动作，减少选择与评估共享噪声造成的过估计。n-step target 在早期 Q 不准时传播奖励更快，但 off-policy 时需截断或校正。",
            "连续动作的 max_a Q(s,a) 是内层优化。Lecture 8 给出三条路：CEM 等随机优化；限制成易优化的 NAF；训练近似 argmax 的 deterministic actor，得到 DDPG 式方法。",
          ],
          formula: {
            latex: String.raw`y^{Double}=r+\gamma Q_{\bar\theta}(s',\arg\max_{a'}Q_\theta(s',a'))`,
            explanation: "动作选择和动作评估由不同参数承担，以削弱最大化偏差。",
            symbols: [{ symbol: "θ", meaning: "online network 参数，用于选动作" }, { symbol: "θ̄", meaning: "target network 参数，用于估值" }],
          },
          checks: ["target network 与 Double Q 解决的是同一个问题吗？", "为什么 DQN 不能直接用于无限连续动作枚举？"],
        },
        {
          title: "5. Homework 3 的另一半：TD Actor-Critic",
          intuition: "DQN 学 argmax Q；Actor-Critic 保留显式策略，并让 TD error 指挥它。",
          paragraphs: [
            "Homework 3 不只有 Atari DQN。Actor-Critic 部分按若干 environment steps 更新 critic，再按 advantage 更新 actor；关键超参数包括 critic 更新次数、target 更新方式和 GAE/TD estimator。若 critic 只更新一次就立刻驱动 actor，早期噪声会被策略放大。",
            "离散或连续策略都可使用同一 TD error：critic 最小化 (V(s_t)−stopgrad[r_t+γV(s_{t+1})])²，actor 最小化 −stopgrad(δ_t)logπ(a_t|s_t)。两项可共享 rollout，但优化目标和停止梯度边界不同。",
          ],
          formula: {
            latex: String.raw`L_V=(V_\phi(s_t)-\operatorname{sg}[r_t+\gamma(1-d_t)V_\phi(s_{t+1})])^2,\quad L_\pi=-\operatorname{sg}[\delta_t]\log\pi_\theta(a_t\mid s_t)`,
            explanation: "sg 表示 stop-gradient。critic 拟合 bootstrap target；actor 只把 TD error 当权重，不反向修改 reward 或 critic target。",
            symbols: [{ symbol: "d_t", meaning: "终止标志" }, { symbol: "sg", meaning: "停止梯度" }, { symbol: "δ_t", meaning: "一步 TD advantage" }],
          },
          checks: ["为何增加 critic gradient steps 可能先帮助、再导致对当前小 batch 过拟合？"],
        },
      ],
      recordings: [recording(7, "Value Function Methods", "观看重点：policy evaluation、dynamic programming、fitted value/Q 与 Actor-Critic 的连接。"), recording(8, "Deep RL with Q-functions", "观看重点：DQN 稳定技巧、Double Q、n-step，以及连续动作 max 的三类处理。")],
      lab: {
        title: "Replay、target network 与 Double Q",
        goal: "在微型链式 MDP 上实现 replay Q-learning 与真正的 Double-Q 双表更新，并观察 bootstrap target 的传播。",
        file: "/labs/cs285/q_learning_replay_target.py",
        steps: ["运行脚本查看奖励从终点向前传播。", "检查 Double-Q 更新是否随机选择一张表更新、用另一张表评估 argmax。", "比较普通与 Double-Q 的贪心策略。"],
        expected: ["两种方法都学会向右。", "Double-Q 训练路径实际执行双表选择—评估分离，而非只展示硬编码数组。", "脚本打印 PASS。"],
        sourceNote: "对应 Homework 3 的 DQN 稳定机制，但使用独立 tabular 环境，不复制 Atari 作业 TODO。",
      },
      pitfalls: ["终止状态仍 bootstrap。", "对 target 分支反向传播。", "把 target network 当成解决所有 Q-learning 不稳定性的充分条件。"],
      exercises: [
        { question: "若 transition 已终止，r=3、γ=0.99，target 是多少？", answer: "3；终止后没有下一状态回报，不能再加 bootstrap 项。" },
        { question: "为什么 Double Q 能降低过估计？", answer: "选出最大动作的噪声与该动作的评估噪声不完全共享，减少 max 对正噪声的系统偏好。" },
      ],
      sources: [slide(7, "Value Function Methods"), video(7, "Value Function Methods"), slide(8, "Deep RL with Q-functions"), video(8, "Deep RL with Q-functions"), homework(3, "DQN and Actor-Critic"), starterCode(3)],
    },
    {
      slug: "advanced-pg-and-planning",
      index: 6,
      title: "高级策略梯度与规划",
      subtitle: "对应 Week 6 / Lectures 9–10：从 trust region 到 CEM、MCTS 与 iLQR",
      duration: "8–10 小时",
      summary: "一半回答策略为什么不能一步改太远，另一半回答已知动力学时怎样直接选动作。把自然梯度的几何约束与规划中的 open-loop/closed-loop 区别放在同一章。",
      objectives: ["解释 surrogate objective 与分布错配", "从 KL 约束理解 natural gradient/TRPO/PPO", "比较 random shooting、CEM、MCTS、LQR/iLQR", "解释 MPC 如何把开环规划闭环执行"],
      prerequisites: ["第 4–5 章", "KL 散度", "二阶泰勒展开"],
      concepts: [
        { name: "Trust region", explanation: "在提高代理目标的同时限制新旧策略 KL，避免状态分布骤变使旧数据失效。", why: "策略梯度的一阶局部方向不告诉我们一步能走多远。", example: "TRPO 解 KL 约束优化，PPO 用 clipped ratio 近似约束。", boundary: "小 KL 提高稳定性但不保证每次真实回报都上升，尤其 advantage 估计有误时。" },
        { name: "Natural gradient", explanation: "用策略分布的 Fisher 信息度量步长，而不是直接用参数欧氏距离。", why: "不同参数化可表示同一分布变化，普通梯度对坐标尺度敏感。", example: "同样的参数变化在饱和 sigmoid 和线性区会导致完全不同策略变化。", boundary: "它仍依赖局部二阶近似，计算 Fisher-vector product 也有代价。" },
        { name: "Open-loop 与 closed-loop", explanation: "开环一次决定完整动作序列；闭环策略会依据中途状态修正。", why: "随机动力学下，事先固定的动作序列无法针对实际扰动恢复。", example: "CEM 先规划 20 步但 MPC 只执行第 1 步，再重新观测规划。", boundary: "滚动重规划形成反馈，不代表单次规划器本身输出的是反馈控制律。" },
        { name: "Trajectory optimization", explanation: "在已知动力学下直接优化动作序列或状态—动作轨迹。", why: "不必先学全局策略，常能在连续控制中高效利用模型。", example: "iLQR 在当前轨迹附近线性化动力学、二次化代价后动态规划。", boundary: "局部方法依赖初值并可能陷入局部最优；模型误差会被规划器利用。" },
      ],
      sections: [
        {
          title: "1. 为什么策略更新必须约束分布变化",
          intuition: "旧策略采的数据只对附近的新策略可信。",
          paragraphs: [
            "Lecture 9 把 policy gradient 解释成近似 policy iteration：用旧策略的状态分布估计新策略 advantage。若新策略离旧策略太远，这个替换会失真。于是优化 importance-ratio 加权的 surrogate，并约束平均 KL。",
            "对目标做一阶、KL 做二阶展开，得到方向 F^{-1}g，即 natural gradient。TRPO 用共轭梯度和 line search；PPO 则直接裁剪 probability ratio，是更便宜但不同的近似。",
          ],
          formula: {
            latex: String.raw`\max_\theta\;\mathbb E_{(s,a)\sim\pi_{old}}\left[\frac{\pi_\theta(a|s)}{\pi_{old}(a|s)}\hat A(s,a)\right]\quad\text{s.t.}\quad \mathbb E_s[D_{KL}(\pi_{old}\|\pi_\theta)]\le\epsilon`,
            explanation: "ratio 修正动作概率，KL 限制整体策略分布偏移。",
            symbols: [{ symbol: "π_old", meaning: "采样数据的行为策略" }, { symbol: "ε", meaning: "trust-region 半径" }, { symbol: "Â", meaning: "旧策略下的优势估计" }],
          },
          example: {
            title: "ratio clipping 的手算",
            steps: ["旧动作概率 0.4，新概率 0.52，ratio=1.3。", "若 PPO ε=0.2，正 advantage 项使用的 ratio 至多 1.2。", "这阻止一次 batch 把动作概率推得过远。"],
            result: "clip 约束的是代理目标贡献，不等价于精确 KL 约束。",
          },
          figures: [slidePage(9, 23, "Natural gradient：用 Fisher 度量策略距离", "普通梯度受参数坐标尺度影响；这一页把 KL 的局部二阶项写成 Fisher 矩阵。中文推导应核对一阶目标 g 与二阶约束 F 分别来自哪里。")],
        },
        {
          title: "2. 从 performance difference 到 natural-gradient step",
          intuition: "新策略变好多少，等于它在自己访问的状态上取得多少旧策略 advantage；困难正是‘自己的状态分布’未知。",
          paragraphs: [
            "Performance-difference lemma 把 J(π')−J(π) 写成 π' 占用分布下的旧策略 advantage。代理目标把 d_{π'} 换成可采样的 d_π；当策略变化小时这近似可信，变化大时误差由两种状态占用分布的差异控制。",
            "在 θ_old 附近，一阶展开 surrogate 得 g^TΔθ，二阶展开平均 KL 得 1/2 Δθ^TFΔθ。带约束的二次问题解方向为 F^{-1}g，再缩放到 KL 半径。TRPO 用 Fisher-vector product 和共轭梯度避免显式求逆，并用 line search 检查实际 KL 与 surrogate。",
          ],
          formula: {
            latex: String.raw`J(\pi')-J(\pi)=\frac{1}{1-\gamma}\,\mathbb E_{s\sim d_{\pi'},a\sim\pi'}[A^\pi(s,a)],\quad \Delta\theta^*=\sqrt{\frac{2\epsilon}{g^\top F^{-1}g}}F^{-1}g`,
            explanation: "第一式说明真正改进依赖新状态分布；第二式是局部线性目标、二次 KL 约束下的 natural-gradient 步长。",
            symbols: [{ symbol: "d_π'", meaning: "新策略折扣状态占用" }, { symbol: "g", meaning: "surrogate 对参数的一阶梯度" }, { symbol: "F", meaning: "策略 Fisher 信息矩阵" }, { symbol: "ε", meaning: "局部 KL 预算" }],
          },
          checks: ["为什么只让 surrogate 上升，仍不能保证真实 J 上升？", "Fisher 矩阵奇异时为什么不能直接求逆？"],
        },
        {
          title: "3. 无导数规划：random shooting、CEM 与 MCTS",
          intuition: "有模型以后可以在想象中试动作；区别是怎样搜索候选。",
          paragraphs: [
            "连续动作可随机采样整段序列并按模型回报排序。CEM 保留 elite，重新拟合高斯并迭代收缩；它简单且易并行，但维数随 horizon×action_dim 增长。",
            "离散动作可用 MCTS 逐步扩展树，在 exploitation 与 exploration 之间选择节点。Lecture 10 还用‘MCTS 太慢，训练策略模仿搜索结果’解释规划与学习并非对立。",
          ],
          example: {
            title: "一轮 CEM",
            steps: ["采样 100 条动作序列，模型回报排序。", "保留前 10 条 elite。", "若 elite 第一维动作均值 0.7、标准差 0.1，下一轮就在 N(0.7,0.1²) 附近采样。"],
            result: "CEM 用精英样本逐轮集中搜索，不需要模型对动作可导。",
          },
          figures: [slidePage(10, 15, "CEM：用 elite 重新拟合采样分布", "图中不是保留一条最好轨迹，而是用一批 elite 更新均值和协方差。若方差收缩过快，CEM 也会过早锁进局部模式。")],
        },
        {
          title: "4. MCTS 的 selection—expansion—backup",
          intuition: "树搜索把计算集中到看起来有希望、但还没试够的分支。",
          paragraphs: [
            "MCTS 每轮沿树选择子节点，扩展一个未充分搜索的动作，用 rollout/value 估叶节点，再把回报向祖先 backup。UCT 常以平均价值加探索项选择：访问少的动作有更大 bonus，访问多后逐渐依赖均值。",
            "它与 CEM 的搜索对象不同：MCTS 显式共享动作前缀并维护离散树，适合组合动作；random shooting/CEM 直接在整段连续动作向量上采样。AlphaGo 式系统再用策略网络提供 prior、价值网络代替长 rollout，最后可把搜索分布蒸馏回策略。",
          ],
          formula: {
            latex: String.raw`a^*=\arg\max_a\left[\bar Q(s,a)+c\sqrt{\frac{\log N(s)}{N(s,a)+1}}\right]`,
            explanation: "第一项利用已有高价值分支，第二项优先补充访问少的动作；c 控制计算预算怎样分配。",
            symbols: [{ symbol: "N(s)", meaning: "父节点访问次数" }, { symbol: "N(s,a)", meaning: "动作边访问次数" }, { symbol: "c", meaning: "树搜索探索系数" }],
          },
        },
        {
          title: "5. 有导数规划：LQR、iLQR 与 MPC",
          intuition: "在线性—二次局部模型中，动态规划给出带反馈的控制律。",
          paragraphs: [
            "LQR 假设线性动力学和二次代价，可反向递推得到 a_t=K_ts_t+k_t。iLQR/DDP 沿当前轨迹线性化非线性动力学、二次化代价，反复前后向更新。",
            "实际部署常把任一开环规划器放进 MPC：每次只执行前几步，再用真实观测重规划。课堂强调重规划越频繁，单个计划可更短，也不必完美。",
          ],
          formula: {
            latex: String.raw`s_{t+1}=A_ts_t+B_ta_t,\qquad c_t=s_t^\top Q_ts_t+a_t^\top R_ta_t`,
            explanation: "LQR 在这一线性动力学、二次代价结构下可解析做动态规划；iLQR 使用局部近似。",
            symbols: [{ symbol: "A_t,B_t", meaning: "局部动力学矩阵" }, { symbol: "Q_t,R_t", meaning: "状态与动作代价矩阵" }],
          },
          checks: ["CEM 规划 20 步但每次只执行 1 步，整体是开环还是闭环？", "TRPO 的 KL 约束为何比参数 L2 更贴近策略变化？"],
        },
        {
          title: "6. Riccati backward pass：反馈增益从哪里来",
          intuition: "终点代价先告诉倒数第一步怎么做，再一层层传回起点。",
          paragraphs: [
            "设下一时刻 value 是二次函数 V_{t+1}(s)=1/2 s^TP_{t+1}s。把线性动力学代入即时二次代价，得到关于 (s_t,a_t) 的局部 Q 二次型。对 a_t 求极小，可得到反馈增益 K_t；再把最优动作代回，得到新的 P_t。",
            "iLQR 在名义轨迹附近重复同一过程：backward pass 算局部 k_t、K_t，forward pass 用 a_t+αk_t+K_t(s_t−s̄_t) rollout，并用 line search 选 α。它不是对整条轨迹一次普通梯度下降。",
          ],
          formula: {
            latex: String.raw`K_t=-(R_t+B_t^\top P_{t+1}B_t)^{-1}B_t^\top P_{t+1}A_t,\quad P_t=Q_t+A_t^\top P_{t+1}(A_t+B_tK_t)`,
            explanation: "R+BᵀPB 衡量动作的即时和未来曲率；K 把当前状态偏差反馈到动作。",
            symbols: [{ symbol: "P_t", meaning: "时刻 t 的 value 二次项" }, { symbol: "K_t", meaning: "线性反馈增益" }, { symbol: "A_t,B_t", meaning: "局部线性动力学" }],
          },
        },
      ],
      recordings: [recording(9, "Advanced Policy Gradients", "观看重点：policy iteration 视角、分布变化界、KL 与 natural gradient 的几何解释。"), recording(10, "Optimal Control and Planning", "观看重点：open/closed loop、CEM、MCTS，以及 shooting/collocation、LQR/iLQR 的关系。")],
      pitfalls: ["把 PPO clip 当成严格保证 KL 不超限。", "把单次 open-loop planner 和 MPC 混为一谈。", "认为有精确模型后规划就没有搜索与局部最优问题。"],
      exercises: [
        { question: "旧概率 0.2、新概率 0.1，importance ratio 是多少？", answer: "0.5；新策略使该已采样动作的概率减半。" },
        { question: "为什么 CEM horizon 变长会迅速变难？", answer: "搜索维数是 horizon×动作维数，固定样本数覆盖率会指数式恶化。" },
      ],
      sources: [slide(9, "Advanced Policy Gradients"), video(9, "Advanced Policy Gradients"), slide(10, "Optimal Control and Planning"), video(10, "Optimal Control and Planning")],
    },
    {
      slug: "model-based-rl",
      index: 7,
      title: "学习动力学与模型式 RL",
      subtitle: "对应 Week 7 / Lecture 11 / Homework 4",
      duration: "7–9 小时",
      summary: "学习下一状态模型，再用 MPC 选择动作。重点讨论为什么训练误差低仍会规划失败，以及重规划、ensemble 不确定性和 latent dynamics 如何控制模型被策略利用。",
      objectives: ["训练 delta-state dynamics model", "实现 random shooting MPC", "解释 compounding error 与 model exploitation", "区分 aleatoric 和 epistemic uncertainty"],
      prerequisites: ["第 6 章规划", "监督回归", "概率分布"],
      concepts: [
        { name: "动力学模型", explanation: "模型 f_θ(s,a) 预测下一状态或状态增量，可为确定或概率模型。", why: "有模型后能在真实执行前评估候选动作序列。", example: "输入机械臂关节角和力矩，预测下一时刻关节角增量。", boundary: "一步监督误差小不保证多步 rollout 正确。" },
        { name: "Model Predictive Control", explanation: "每次用模型规划一段动作，只执行前几步，再从真实状态重新规划。", why: "真实观测定期截断模型误差累积。", example: "每 100ms 规划未来 1s，但只执行第一个 100ms 动作。", boundary: "重规划无法修复模型在当前区域完全错误或安全约束缺失。" },
        { name: "Epistemic uncertainty", explanation: "由于训练数据有限，对模型本身不知道；增加相关数据后应下降。", why: "规划器会主动寻找模型错误的动作，必须识别数据之外的不确定预测。", example: "ensemble 在训练区域预测一致，离开区域后分歧变大。", boundary: "输出噪声方差主要表示 aleatoric uncertainty，不能单独代表模型无知。" },
        { name: "Latent dynamics", explanation: "把高维观测编码到低维动态状态，在 latent space 预测转移和奖励。", why: "图像含大量静态冗余，直接预测像素既难又未必与控制相关。", example: "编码相机图像后预测隐变量，再规划指定像素到目标位置。", boundary: "重建好看不等于保留控制所需信息；latent 目标必须和动力学/奖励联合验证。" },
      ],
      sections: [
        {
          title: "1. 从监督模型到 MPC 闭环",
          intuition: "先学‘做完会怎样’，再在模型里试动作，但每次都让现实纠偏。",
          paragraphs: [
            "收集 transition (s_t,a_t,s_{t+1})，常预测 Δs=s_{t+1}-s_t 并归一化输入输出。规划时从当前真实状态 rollout 多条候选序列，累计预测奖励，执行最优序列的第一个动作。",
            "Homework 4 要实现 dynamics loss、random-shooting MPC、on-policy 数据聚合，并比较 ensemble size、候选数和 planning horizon。它是在实验模型容量、搜索质量与误差累积之间的关系。",
          ],
          formula: {
            latex: String.raw`\mathcal L_{dyn}=\frac1N\sum_i\|f_\theta(s_i,a_i)-(s'_i-s_i)\|_2^2,\quad a_{t:t+H-1}^*=\arg\max\sum_{h=0}^{H-1}\hat r(\hat s_{t+h},a_{t+h})`,
            explanation: "第一式拟合状态增量，第二式在学得模型中寻找 H 步动作序列。",
            symbols: [{ symbol: "f_θ", meaning: "学得的动力学增量模型" }, { symbol: "H", meaning: "规划时域" }, { symbol: "ŝ", meaning: "模型预测状态" }],
          },
          example: {
            title: "MPC 的候选选择",
            steps: ["三条 3 步序列预测奖励分别为 [1,1,1]、[0,0,5]、[2,0,0]。", "累计回报分别为 3、5、2。", "选择第二条，但只执行它的第一个动作，然后重新观测。"],
            result: "选择依据是整段预测回报，执行方式仍是滚动闭环。",
          },
        },
        {
          title: "2. 为什么模型会被规划器利用",
          intuition: "优化器不会体谅模型，它会专找预测最乐观的漏洞。",
          paragraphs: [
            "训练模型只在数据分布上准确，规划却会提出新动作并把状态带到分布外。长 rollout 中每一步预测又成为下一步输入，误差复合。Lecture 11 将这一分布偏移与模仿学习并列，但这里偏移发生在模型 rollout。",
            "缩短 horizon、频繁重规划、收集当前 MPC 的 on-policy 数据都能缓解。它们不能神奇消除误差，只是缩小每次必须相信模型的范围。",
          ],
          example: {
            title: "只用于直觉的 5% 乘法玩具模型",
            steps: ["额外假设误差尺度每步恰好乘 1.05；这不是一般模型误差定律。", "在该人为假设下，20 步倍率为 1.05^20≈2.65。", "若每 5 步用真实状态重置，同一玩具模型给单段倍率 1.05^5≈1.28。"],
            result: "它只说明 horizon 会放大风险；真实误差可能相消、线性增长或因闭环动力学爆炸，必须用 rollout 实测。",
          },
        },
        {
          title: "3. Ensemble 与高维观测",
          intuition: "多个模型的分歧是‘我们不知道’的近似信号。",
          paragraphs: [
            "Bootstrap ensemble 用不同初始化和数据顺序训练多个模型。规划时可对模型索引采样并传播粒子，成员分歧提供 epistemic uncertainty 的近似信号。但对成员回报简单取均值只是风险中性期望，仍可能被共同盲区或少数极端高值利用；安全场景应明确使用低分位数、worst-case 或 variance penalty 等悲观准则。",
            "对于图像，Lecture 11 给出 latent state-space model 与直接视频预测两条路线。前者需要 encoder、dynamics、observation/reward model；后者可用指定像素目标直接规划，但计算更重。",
          ],
          formula: {
            latex: String.raw`\bar f(s,a)=\frac1M\sum_{m=1}^{M}f_m(s,a),\qquad U(s,a)=\frac1M\sum_m\|f_m(s,a)-\bar f(s,a)\|^2`,
            explanation: "ensemble 均值给中心预测，成员分歧 U 近似 epistemic uncertainty。",
            symbols: [{ symbol: "M", meaning: "ensemble 成员数" }, { symbol: "U", meaning: "模型分歧指标" }],
          },
          figures: [slidePage(11, 36, "Visual foresight：从像素运动规划到目标", "原课用 designated pixel distribution 表达‘把这个像素移到那里’。关键不是预测一张漂亮图，而是传播像素位置的不确定分布并据此评价动作序列。")],
          checks: ["为何单个高斯模型的输出方差不等于 epistemic uncertainty？", "为什么 horizon 不是越长越好？"],
        },
        {
          title: "4. Homework 4：随机射击、数据聚合与消融",
          intuition: "模型式 RL 不是只拟合一次模型；策略改变访问分布，数据循环本身就是算法的一部分。",
          paragraphs: [
            "Homework 4 先用离线随机数据训练 delta-state ensemble，再用 random shooting 采样 N 条长度 H 的动作序列。每条序列在模型中 rollout，按累计 reward 排序，只执行最佳序列的第一个动作。这里 random shooting 是随机抽候选，不是枚举动作笛卡尔积。",
            "随后执行当前 MPC 收集 on-policy transitions，加入数据集并重训。实验分别改变 ensemble size、candidate count、horizon：更多模型改善不确定性近似，更多候选改善搜索，过长 horizon 却可能放大模型偏差。三个量不能只一起调到最大，否则无法知道性能来自哪里。",
          ],
          formula: {
            latex: String.raw`a_{t:t+H-1}^{(n)}\sim q(a),\quad \hat R^{(n,m)}=\sum_{h=0}^{H-1}r(\hat s_{t+h}^{(n,m)},a_{t+h}^{(n)}),\quad a_t=\operatorname{first}\!\left(\arg\max_n\frac1M\sum_m\hat R^{(n,m)}\right)`,
            explanation: "n 枚举随机动作候选，m 枚举 ensemble 模型；执行后立即回到真实状态再规划。风险敏感部署可把成员均值替换为低分位数。",
            symbols: [{ symbol: "N", meaning: "random-shooting 候选数" }, { symbol: "H", meaning: "规划时域" }, { symbol: "M", meaning: "ensemble 成员数" }],
          },
          checks: ["为什么训练集 one-step MSE 最低的 horizon 不一定最好？", "on-policy aggregation 与只增加随机离线数据有什么区别？"],
        },
      ],
      recordings: [recording(11, "Model-Based Reinforcement Learning", "观看重点：朴素 model-based 为何失败、MPC 重规划、ensemble 不确定性，以及图像 latent model/visual foresight。")],
      lab: {
        title: "Random shooting、ensemble 与 on-policy aggregation",
        goal: "拟合一维 ensemble 动力学，用真正的随机动作序列规划，并让部署 transition 修补初始模型偏差。",
        file: "/labs/cs285/model_based_mpc.py",
        steps: ["从带偏的初始数据拟合 bootstrap ensemble。", "用 random shooting 搜索连续动作序列，每次只执行首动作。", "聚合真实部署 transition 后重训，并比较终点误差与成员分歧。"],
        expected: ["规划器确实采样候选而非穷举。", "on-policy aggregation 修正初始偏差。", "聚合后的 MPC 误差更低并打印 PASS。"],
        sourceNote: "对应 Homework 4 的 dynamics、random-shooting MPC、ensemble 与 data aggregation 科学问题；环境和代码均为独立实现。",
      },
      pitfalls: ["用训练集一步 MSE 代替闭环控制评估。", "把输出噪声当作完整 epistemic uncertainty。", "规划 horizon 加长却不检查模型误差与候选覆盖。"],
      exercises: [
        { question: "模型一步很准，为何 50 步计划仍可能失败？", answer: "预测输入来自前一步预测，误差会复合；规划还可能主动选择训练分布外、模型过度乐观的动作。" },
        { question: "ensemble 全部因相同数据偏差而一致时，分歧能发现错误吗？", answer: "不能。ensemble 分歧只是近似，成员共享盲区时会共同自信地错。" },
      ],
      sources: [slide(11, "Model-Based Reinforcement Learning"), video(11, "Model-Based Reinforcement Learning"), homework(4, "Model-Based Reinforcement Learning"), starterCode(4)],
    },
    {
      slug: "model-policy-inference",
      index: 8,
      title: "模型式策略学习、变分推断与控制即推断",
      subtitle: "对应 Week 8 / Lectures 12–14：从 Dyna 与 GPS 到 ELBO 和最大熵控制",
      duration: "10–12 小时",
      summary: "先说明模型怎样帮助训练全局策略，再补齐 latent variable 与 ELBO，最后把‘高奖励’表示为最优性概率事件，推导 soft value、entropy-regularized policy 与控制即推断。",
      objectives: ["比较直接穿过模型反传、Dyna 与 local policy", "推导 ELBO 与 reparameterization", "解释 guided policy search 和 distillation", "从 optimality variable 得到最大熵目标"],
      prerequisites: ["第 4、6、7 章", "KL 散度与高斯分布", "动态规划"],
      concepts: [
        { name: "Dyna", explanation: "用真实数据学模型，再用模型生成短模拟 transition 训练 model-free learner。", why: "兼顾模型的样本效率与 model-free 目标的稳健优化。", example: "每次真实交互后，从 replay 状态启动模型做 1–5 步 rollout 更新 Q。", boundary: "模拟数据仍有偏；rollout 太长会让模型误差主导。" },
        { name: "Guided Policy Search", explanation: "用局部轨迹优化器解决若干条件，再监督学习一个能从感知输入运行的全局策略。", why: "局部控制器易优化，神经策略擅长跨状态泛化。", example: "不同物体位置各训练 iLQR controller，再蒸馏到视觉策略。", boundary: "局部控制器与全局策略必须保持分布接近，否则监督标签也会失效。" },
        { name: "ELBO", explanation: "用可计算的近似后验 q(z|x) 给不可直接积分的 log p(x) 构造下界。", why: "使 latent dynamics、多模态策略和 VAE 能用采样与反向传播训练。", example: "encoder 给 z 的高斯参数，decoder 重建 x，同时 KL 约束 q 接近先验。", boundary: "最大化 ELBO 不等于精确最大化似然；后验族太弱会有 approximation gap。" },
        { name: "控制即推断", explanation: "引入 optimality 变量 O_t，并令 p(O_t=1|s_t,a_t)∝exp(r/α)，把求高回报策略写成条件推断。", why: "统一 soft dynamic programming、最大熵 RL 与人类次优行为建模。", example: "两个同样好动作在 soft policy 下都会保留非零概率。", boundary: "朴素推断会对随机转移产生‘乐观’偏差，需要 variational 处理。" },
      ],
      sections: [
        {
          title: "1. 模型怎样帮助学习全局策略",
          intuition: "可以穿过模型反传，也可以让模型只负责造数据或训练局部老师。",
          paragraphs: [
            "直接 BPTT 穿过长时域模型会连乘 Jacobian，出现梯度爆炸/消失，且同一策略参数耦合所有时刻。Lecture 12 因此给出两条替代：Dyna/MBPO 式短模型 rollout；或用 LQR-FLM 等局部策略，再蒸馏为全局网络。",
            "Guided policy search 把 trajectory-centric RL 与 supervised learning 交替：局部控制器在动力学上优化，全局策略模仿局部动作，同时约束两者访问分布。课堂用 ensemble distillation 类比 soft targets 中包含的额外信息。",
          ],
          formula: {
            latex: String.raw`D_{real}\xrightarrow{\text{fit}}\hat p_\theta(s'|s,a),\qquad D_{model}\sim\hat p_\theta,\qquad \phi\leftarrow\arg\min_\phi\mathcal L_{RL}(D_{real}\cup D_{model})`,
            explanation: "Dyna 风格中模型负责扩充 transition，最终仍由 model-free loss 更新策略或价值函数。",
            symbols: [{ symbol: "D_real", meaning: "真实 transition" }, { symbol: "D_model", meaning: "模型生成 transition" }, { symbol: "φ", meaning: "策略/价值参数" }],
          },
          example: {
            title: "为什么短 rollout 更可信",
            steps: ["模型每步有 0.1 的系统偏差。", "粗略线性累积下 1 步偏差 0.1，5 步约 0.5，20 步约 2.0。", "从真实 replay 状态频繁启动 1–5 步 rollout，可限制连续误差。"],
            result: "模型数据量和模型数据可信度存在直接权衡。",
          },
          figures: [slidePage(12, 27, "Guided Policy Search：局部控制器教全局策略", "局部 trajectory controller 与全局 neural policy 不是单向监督：两者通过分布约束交替靠近，避免老师在学生永远到不了的状态上给标签。")],
        },
        {
          title: "2. BPTT 的 Jacobian 链与梯度失稳",
          intuition: "穿过模型求导看似直接，长时域里却要把每一步局部导数连乘。",
          paragraphs: [
            "确定性模型下，s_{t+1}=f(s_t,π_θ(s_t))。θ 不只影响当前动作，还通过状态影响所有未来动作；链式法则中的 ds_{t+1}/dθ 同时包含策略直接项与经状态返回的递归项。若局部 Jacobian 奇异值反复大于 1，梯度爆炸；小于 1 则消失。",
            "更棘手的是 model bias：解析梯度可能在学得模型中极其精确，却指向现实中不存在的漏洞。可用短 horizon、真实状态重启、梯度裁剪或局部模型缓解，但最终仍要在真实环境闭环验证。",
          ],
          formula: {
            latex: String.raw`\frac{d s_{t+1}}{d\theta}=\frac{\partial f}{\partial s_t}\frac{d s_t}{d\theta}+\frac{\partial f}{\partial a_t}\left(\frac{\partial\pi_\theta}{\partial\theta}+\frac{\partial\pi_\theta}{\partial s_t}\frac{d s_t}{d\theta}\right)`,
            explanation: "状态敏感度递归传到未来。长时域梯度包含多次 Jacobian 乘积，因此数值尺度和模型误差都会累积。",
            symbols: [{ symbol: "∂f/∂s", meaning: "动力学对状态的局部 Jacobian" }, { symbol: "∂f/∂a", meaning: "动力学对动作的局部 Jacobian" }, { symbol: "ds_t/dθ", meaning: "策略参数对未来状态的总影响" }],
          },
        },
        {
          title: "3. Dyna、MVE 与 MBPO：模型 rollout 放在哪里",
          intuition: "模型不一定直接输出动作；它也可以只补短期 target 或生成训练 transition。",
          paragraphs: [
            "Dyna 从真实 replay 状态出发，在模型中采 transition，再用普通 model-free update。Model-based value expansion（MVE）用模型 rollout H 步，把真实 reward 前缀接到末端 learned value；H=0 退化为一步 value target，H 太大则被模型偏差主导。",
            "MBPO 的经验结论是频繁重训模型、从真实 buffer 状态启动短 rollout，并随训练逐步调整长度。模型样本数量可以很大，但有效信息仍受真实状态覆盖限制；把同一段模型误差重复一百万次不会变成真实数据。",
          ],
          formula: {
            latex: String.raw`\hat V_H(s_t)=\sum_{h=0}^{H-1}\gamma^h\hat r_{t+h}+\gamma^H V_\phi(\hat s_{t+H})`,
            explanation: "H 控制依赖模型的长度：更长可传播真实模型奖励，更短减少 compounding bias。",
            symbols: [{ symbol: "H", meaning: "模型 rollout 长度" }, { symbol: "ŝ", meaning: "模型想象状态" }, { symbol: "V_φ", meaning: "末端 bootstrap value" }],
          },
        },
        {
          title: "4. ELBO：不可积 latent variable 怎样训练",
          intuition: "q(z|x) 提议哪些 latent 解释 x，再用重建质量和先验一致性共同评分。",
          paragraphs: [
            "边缘似然 p(x)=∫p(x|z)p(z)dz 往往不可解。插入 q(z|x) 并用 Jensen 得到 ELBO：期望重建对数似然减 KL。Amortized inference 用一个 encoder 对所有 x 预测 q 的参数。",
            "连续高斯 latent 可写 z=μ_φ(x)+σ_φ(x)⊙ε，ε∼N(0,I)，让随机性移到无参数噪声上，从而低方差反传。Lecture 13 对比了这一 reparameterization 与高方差 policy-gradient estimator。",
          ],
          formula: {
            latex: String.raw`\log p_\theta(x)\ge \mathbb E_{q_\phi(z|x)}[\log p_\theta(x|z)]-D_{KL}(q_\phi(z|x)\|p(z))`,
            explanation: "第一项要求 latent 能解释数据，第二项让近似后验不要任意偏离先验。",
            symbols: [{ symbol: "z", meaning: "latent variable" }, { symbol: "q_φ", meaning: "近似后验/encoder" }, { symbol: "p_θ(x|z)", meaning: "likelihood/decoder" }],
          },
          example: {
            title: "一条样本的 ELBO",
            steps: ["期望 log-likelihood 为 −1.2。", "KL(q||p)=0.3。", "ELBO=−1.2−0.3=−1.5，因此 negative ELBO loss 为 1.5。"],
            result: "减小 loss 既要重建更好，也要控制 latent 编码代价。",
          },
          figures: [slidePage(13, 13, "Jensen 不等式与 ELBO", "下界不是凭空出现的正则项。把 q(z|x) 乘除进积分后，对 log 内的随机变量应用 Jensen；下界与 log p(x) 的差正好是 posterior KL。")],
        },
        {
          title: "5. ELBO 的逐行推导与 reparameterization",
          intuition: "先把难算的 posterior 换成可采样的 q，再精确记录哪一步用了 Jensen。",
          paragraphs: [
            "从 log p(x)=log∫p(x,z)dz 开始，乘除 q(z|x)：log E_q[p(x,z)/q(z|x)]。由于 log 是凹函数，Jensen 给 log E[Y]≥E[logY]；展开后得到 E_q log p(x|z)−KL(q||p)。另一种分解是 log p(x)=ELBO+KL(q(z|x)||p(z|x))，直接说明差距非负。",
            "要同时优化 encoder 参数 φ，不能把 z 当作不可导采样节点。Gaussian q 写成 z=μ_φ(x)+σ_φ(x)⊙ε、ε∼N(0,I)，于是样本对 φ 有显式可导路径。离散 latent 通常需 score-function、枚举或连续松弛。",
          ],
          formula: {
            latex: String.raw`\log p(x)=\log\mathbb E_{q_\phi}\!\left[\frac{p_\theta(x,z)}{q_\phi(z|x)}\right]\ge\mathbb E_q[\log p_\theta(x,z)-\log q_\phi(z|x)]`,
            explanation: "唯一的不等号来自 Jensen；q 覆盖不到 posterior 质量时，下界会松。",
            symbols: [{ symbol: "q_φ(z|x)", meaning: "可采样的近似后验" }, { symbol: "p_θ(x,z)", meaning: "生成模型的联合分布" }],
          },
        },
        {
          title: "6. 从 optimality variable 到最大熵 RL",
          intuition: "高奖励动作更可能被视为‘最优’，但相近动作不必被硬切成唯一赢家。",
          paragraphs: [
            "定义 p(O_t=1|s_t,a_t)∝exp(r(s_t,a_t)/α)。给定整条轨迹都 optimal 后做后验推断，会得到 log-sum-exp 的 soft Bellman backup 和 Boltzmann policy。α 控制奖励相对熵的尺度。",
            "直接推断会偏好能‘碰巧’到好结果的随机转移，即 optimism problem。Lecture 14 用 variational distribution 固定真实动力学，优化期望奖励加策略熵，连接 entropy-regularized policy gradient、soft Q-learning 与 SAC。",
          ],
          formula: {
            latex: String.raw`J_{MaxEnt}(\pi)=\mathbb E_\pi\left[\sum_t r(s_t,a_t)+\alpha\mathcal H(\pi(\cdot|s_t))\right],\quad \pi(a|s)\propto\exp((Q(s,a)-V(s))/\alpha)`,
            explanation: "策略既追求回报，也在同等好动作间保持熵；温度 α 越小越接近 greedy。",
            symbols: [{ symbol: "α", meaning: "温度/熵权重" }, { symbol: "H", meaning: "策略熵" }, { symbol: "V", meaning: "soft value，即 log-partition" }],
          },
          example: {
            title: "soft policy 的两动作概率",
            steps: ["Q(A)=2、Q(B)=1、α=1。", "未归一化权重为 e²≈7.39 与 e¹≈2.72。", "归一化后 π(A)≈0.731，π(B)≈0.269。"],
            result: "更优动作更常选，但次优动作仍保留探索概率。",
          },
          figures: [slidePage(14, 29, "Optimality variable 的图模型", "把 O_t=1 视为每一步‘最优’的观测，向后消息汇总未来 optimality。阅读图时要分清环境转移概率和人为定义的 exp(r/α) likelihood。")],
        },
        {
          title: "7. Backward message 与 soft Bellman backup",
          intuition: "未来‘保持最优’的概率从终点向前传，取对数后就是 soft value。",
          paragraphs: [
            "定义 β_t(s_t,a_t)=p(O_{t:T}=1|s_t,a_t)。对下一状态和下一动作边缘化即可做 backward message passing。确定性动力学下，取 αlog 后得到 Q=r+γV'；对动作积分产生 log-sum-exp，因此 V 是 Q 的 soft maximum。",
            "归一化后 posterior policy 为 exp((Q−V)/α)。α→0 时 log-sum-exp 趋近 max；α 较大时更多近优动作保留概率。这说明最大熵策略不是额外拍脑袋加噪声，而是该概率模型下的条件分布。",
          ],
          formula: {
            latex: String.raw`Q(s,a)=r(s,a)+\gamma\mathbb E_{s'}[V(s')],\quad V(s)=\alpha\log\int\exp(Q(s,a)/\alpha)da`,
            explanation: "soft Bellman backup 用 log-sum-exp 取代硬 max；离散动作时积分换成求和。",
            symbols: [{ symbol: "Q", meaning: "执行动作后的 soft return" }, { symbol: "V", meaning: "动作分布的 log-partition" }, { symbol: "α", meaning: "温度" }],
          },
        },
        {
          title: "8. Optimism problem 与 variational 修正",
          intuition: "如果推断可以改写环境概率，它会假装随机好运更常发生。",
          paragraphs: [
            "朴素 posterior p(τ|O=1) 同时重新加权动作和随机转移。某动作只有 1% 概率中大奖，条件在‘轨迹最优’后，这 1% 会被过度放大，看起来像环境会配合智能体；但真实控制只能改变动作分布，不能改变 p(s'|s,a)。",
            "Variational control 令 q(τ)=p(s_0)∏q(a_t|s_t)p(s_{t+1}|s_t,a_t)，强制 q 与真实动力学相同，只优化策略部分。最小化 q 与 optimality posterior 的 KL 后，目标化为期望 reward 加 causal policy entropy，避免把随机转移当可控变量。",
          ],
          formula: {
            latex: String.raw`q(\tau)=p(s_0)\prod_t q(a_t\mid s_t)p(s_{t+1}\mid s_t,a_t),\quad \min_q D_{KL}(q(\tau)\|p(\tau\mid O_{1:T}=1))`,
            explanation: "q 只能改动作条件分布，环境转移保持原样；这条结构约束消除对随机动力学的虚假乐观。",
            symbols: [{ symbol: "q(τ)", meaning: "变分轨迹分布" }, { symbol: "p(s'|s,a)", meaning: "固定的真实动力学" }, { symbol: "O", meaning: "optimality 变量" }],
          },
        },
      ],
      recordings: [
        recording(12, "Model-Based Policy Learning", "观看重点：穿过模型反传为何不稳、Dyna/MVE/MBPO、local models、guided policy search 与 distillation。"),
        recording(13, "Variational Inference and Generative Models", "观看重点：Jensen、entropy/KL、amortized inference、reparameterization 与 VAE。"),
        recording(14, "Reframing Control as an Inference Problem", "观看重点：optimality graphical model、backward messages、optimism problem 与 variational maximum-entropy control。"),
      ],
      pitfalls: ["把 Dyna 生成的大量样本当作无偏真实数据。", "只把 ELBO 背成‘重建加 KL’，却说不清下界和后验近似。", "把动作熵、状态覆盖和技能多样性当成同一件事。"],
      exercises: [
        { question: "α→0 时 soft policy 怎样变化？", answer: "越来越集中在 Q 最大动作，逼近硬 greedy；若并列则仍可在并列动作间分配概率。" },
        { question: "为何 reparameterization 通常比对 z 用 REINFORCE 方差低？", answer: "它把参数影响通过可导路径直接传给样本，而不是只用 log-probability 乘回报的 score-function 估计。" },
      ],
      sources: [slide(12, "Model-Based Policy Learning"), video(12, "Model-Based Policy Learning"), slide(13, "Variational Inference and Generative Models"), video(13, "Variational Inference and Generative Models"), slide(14, "Reframing Control as an Inference Problem"), video(14, "Reframing Control as an Inference Problem")],
    },
    {
      slug: "irl-transfer-multitask",
      index: 9,
      title: "逆强化学习、迁移与多任务学习",
      subtitle: "对应 Week 9 / Lectures 15–16：从示范推断意图，再迁移到新任务与新域",
      duration: "8–10 小时",
      summary: "先处理‘奖励从哪里来’：MaxEnt IRL 用概率模型解释专家行为；再处理‘先前经验如何复用’：finetune、domain randomization、distillation、contextual 与 modular policies。",
      objectives: ["说明 IRL 的不适定性", "推导 MaxEnt IRL 的数据项与 partition function", "解释 GAIL 与 reward recovery 的差异", "比较 forward transfer、多任务与 meta-learning"],
      prerequisites: ["第 2、8 章", "最大似然与 partition function", "domain shift"],
      concepts: [
        { name: "Inverse RL", explanation: "给定专家轨迹，推断能解释这些行为的奖励函数，再用 forward RL 求策略。", why: "人往往擅长示范，却难以把意图写成无漏洞 reward。", example: "从驾驶轨迹推断舒适、守道和避碰的权衡。", boundary: "奖励本质上不唯一；不同 reward 可诱导同一最优策略。" },
        { name: "Maximum Entropy IRL", explanation: "令轨迹概率与 exp(r_θ(τ)) 成正比，用最大似然学习 reward。", why: "为专家次优和多种合理轨迹提供明确概率模型。", example: "高奖励路径更可能，但不是只有唯一最短路径有概率。", boundary: "计算 partition function 或其梯度通常需要内层规划/采样。" },
        { name: "Domain randomization", explanation: "训练时随机化外观或物理参数，让策略覆盖目标域可能出现的变化。", why: "比在单一模拟器上过拟合更有机会零样本迁移到真实世界。", example: "随机质量、摩擦、光照和纹理训练机器人。", boundary: "若真实域超出随机化范围，鲁棒训练不保证转移。" },
        { name: "Contextual / modular policy", explanation: "contextual policy 显式接收任务信息；modular policy 把机器人特定与任务特定组件组合。", why: "多任务共享不等于把所有情况硬塞进没有任务标识的单网络。", example: "同一机器人根据 goal 向量选择抓取或放置，不同机器人复用任务模块。", boundary: "模块边界是建模假设；分解错误会限制可表达策略。" },
      ],
      sections: [
        {
          title: "1. 从模仿动作到推断意图",
          intuition: "换了动力学后动作可能不同，但目标可以保持。",
          paragraphs: [
            "标准 imitation 复制专家动作；IRL 试图恢复 reward，使新 agent 在不同动力学下仍能重新规划。Lecture 15 先展示 feature matching 和 maximum-margin，再指出奖励多解与专家次优建模困难。",
            "MaxEnt IRL 在环境轨迹基准测度 μ(τ)=p(s_0)∏_t p(s_{t+1}|s_t,a_t)（需要时再含动作先验）上，按 exp(r_θ(τ)) 重新加权。确定性动力学或把 μ 省略进积分记号时，才可简写成 exp(r)/Z。对 reward 参数求 log-likelihood，得到专家特征期望减模型轨迹特征期望。",
          ],
          formula: {
            latex: String.raw`p_\theta(\tau)=\frac{\mu(\tau)}{Z_\theta}\exp\!\left(\sum_t r_\theta(s_t,a_t)\right),\quad \mu(\tau)=p(s_0)\prod_t p(s_{t+1}\mid s_t,a_t)`,
            explanation: "reward 对物理可行轨迹的基准概率重新加权，而不是取代动力学。似然梯度仍是专家特征期望减模型特征期望。",
            symbols: [{ symbol: "μ(τ)", meaning: "由初始分布和环境动力学给出的轨迹基准测度" }, { symbol: "Z_θ", meaning: "在 μ 上积分得到的 partition function" }, { symbol: "τ_E", meaning: "专家轨迹" }],
          },
          example: {
            title: "奖励多解",
            steps: ["专家总选 A，不选 B。", "reward(A)=1、reward(B)=0 能解释。", "reward(A)=100、reward(B)=−7 也能解释。", "甚至所有 reward 加同一常数也不改变固定时域最优动作。"],
            result: "轨迹不能唯一确定 reward，需要结构、正则或概率假设。",
          },
          figures: [slidePage(15, 16, "MaxEnt IRL 的内外循环", "该算法在外层用专家—模型 feature expectation 差更新 reward，在内层重新求 soft-optimal policy。两层交替，而不是一次监督回归。")],
        },
        {
          title: "2. Feature matching 与 maximum-margin IRL",
          intuition: "如果 reward 是特征的线性组合，专家真正约束的是累计特征，而不是唯一权重向量。",
          paragraphs: [
            "设 r_w(s,a)=w^Tφ(s,a)，轨迹回报就是 w^TΦ(τ)，其中 Φ 是累计 feature count。Feature expectation matching 寻找策略，使 E_πΦ 接近 E_EΦ；maximum-margin 方法进一步要求专家回报比候选策略至少高一个 margin。",
            "这揭示 IRL 的不可辨识性：若两个 reward 权重在所有可访问轨迹上的排序相同，示范无法区分它们。Potential-based shaping 还会系统地产生策略等价 reward。因此评估不能只比较恢复的参数，要看新动力学下策略行为与 reward 泛化。",
          ],
          formula: {
            latex: String.raw`\Phi(\tau)=\sum_t\gamma^t\phi(s_t,a_t),\quad \mathbb E_E[\Phi]-\mathbb E_{\pi_w}[\Phi]=0\ \text{ at feature matching}`,
            explanation: "线性 reward 的 likelihood/最优性梯度都落到累计特征差；这不保证 w 本身唯一。",
            symbols: [{ symbol: "φ(s,a)", meaning: "人为或学习到的 reward 特征" }, { symbol: "Φ(τ)", meaning: "折扣累计 feature count" }, { symbol: "w", meaning: "reward 权重" }],
          },
        },
        {
          title: "3. Guided Cost Learning、GAIL 与可迁移 reward",
          intuition: "reward 学习与 policy 采样交替，看起来像生成器和判别器的博弈。",
          paragraphs: [
            "未知动力学和连续空间下，guided cost learning 用当前 policy 采样近似 partition function，再更新 reward，并让 policy 针对新 reward 优化。Lecture 15 随后连接 GAN：GAIL 的 discriminator 区分专家与策略 occupancy。",
            "普通 GAIL discriminator 在收敛后未必是可复用 reward；AIRL 等结构试图把目标从动力学中解耦。选择方法前应明确要的是复现行为，还是得到可重新规划的目标。",
          ],
          formula: {
            latex: String.raw`\min_\pi\max_D\;\mathbb E_{d_E}[\log D(s,a)]+\mathbb E_{d_\pi}[\log(1-D(s,a))]-\lambda\mathcal H(\pi)`,
            explanation: "判别器比较专家与策略的状态—动作占用，策略试图让两者不可区分；熵正则防止策略过早塌缩。",
            symbols: [{ symbol: "D", meaning: "判别器" }, { symbol: "d_E,d_π", meaning: "专家和策略 occupancy" }, { symbol: "λ", meaning: "GAIL 的策略熵权重" }],
          },
        },
        {
          title: "4. Guided cost sampling 的内外循环",
          intuition: "reward 更新需要负样本，policy 又需要当前 reward；两者交替产生彼此所需的数据。",
          paragraphs: [
            "连续轨迹空间的 partition function 无法枚举。Guided cost learning 用 proposal policy q(τ) 采非专家轨迹，以 importance weight exp(r_θ(τ))/q(τ) 近似 Z；reward 更新后，再用 trajectory optimization 改进 q，让它覆盖新 reward 的高概率区域。",
            "若 proposal 漏掉高 reward 模式，Z 会被低估，reward 可能在未采样区域任意抬高。实践因此混合旧轮次样本、监控 importance weight 有效样本量，并让 policy 与 cost 同步改进。它不是一次监督分类。",
          ],
          formula: {
            latex: String.raw`Z_\theta=\mathbb E_{\tau\sim q}\left[\frac{\mu(\tau)e^{r_\theta(\tau)}}{q(\tau)}\right]\approx\frac1N\sum_i\frac{\mu(\tau_i)e^{r_\theta(\tau_i)}}{q(\tau_i)}`,
            explanation: "proposal q 只负责提供轨迹；权重校正回目标的基准测度与 exponentiated reward。支持集不足时估计仍会失败。",
            symbols: [{ symbol: "q(τ)", meaning: "当前轨迹采样策略诱导的 proposal" }, { symbol: "Z_θ", meaning: "reward 模型归一化常数" }],
          },
        },
        {
          title: "5. 迁移与多任务：到底复用什么",
          intuition: "可复用的是策略、价值、动力学、表征，也可能只是组件。",
          paragraphs: [
            "Lecture 16 先讲 forward transfer：直接运行、finetune、source randomization、domain adaptation。RL finetune 比监督学习更难，因为任务不够多样，收敛策略熵低，来到新域后不再探索。Maximum-entropy pretraining 能保留多种解。",
            "多任务时，共享动力学适合 model-based transfer；多个教师可蒸馏到统一策略；明确 task context 可训练 contextual policy；机器人×任务的组合则可用 modular network。Meta-learning 留到 Week 12，因为它学的是适应规则，而非单个共享策略。",
          ],
          example: {
            title: "物理参数随机化",
            steps: ["训练时质量均匀采样 [0.8,1.2] kg。", "真实物体质量 1.1 kg，位于训练覆盖内。", "若真实质量 2.0 kg，则属于外推，不能因‘做过 randomization’就宣称鲁棒。"],
            result: "随机化是否有效要看目标域是否落在训练变化支持集内。",
          },
          figures: [slidePage(16, 40, "Policy distillation：用教师分布而非硬动作", "多个任务教师输出整条动作分布，学生用 KL/soft target 学习。教师的次优动作概率携带相似性，但学生容量不足时也会发生任务干扰。")],
          checks: ["GAIL 学到的 discriminator 一定是可迁移 reward 吗？", "多任务 policy 与 meta-policy 的输出目标有何不同？"],
        },
        {
          title: "6. Context、distillation 与 modularity 的取舍",
          intuition: "共享越多，数据利用越好；共享错了，任务之间就会互相伤害。",
          paragraphs: [
            "Contextual policy π(a|s,z) 把任务 ID、目标或连续参数 z 作为输入，适合任务信息在执行时已知。Distillation 先训练多个教师，再让学生最小化教师—学生 KL；它可压缩模型并合并数据，但不保证学生容量足以同时复现所有专家。",
            "Modular policy 把任务模块和机器人模块组合，试图实现未见过的机器人×任务搭配。好处是组合泛化，代价是模块分解必须与真实因果结构一致。若共享 trunk 导致 negative transfer，应比较完全独立、全共享和模块化三条基线，而不是只报告最终平均分。",
          ],
          formula: {
            latex: String.raw`L_{distill}=\mathbb E_{(s,z)}\left[D_{KL}(\pi_{teacher,z}(\cdot|s)\|\pi_{student}(\cdot|s,z))\right]`,
            explanation: "soft teacher distribution 比单个 argmax 动作保留更多相对偏好；温度必须在教师和学生端一致解释。",
            symbols: [{ symbol: "z", meaning: "任务 context" }, { symbol: "π_teacher,z", meaning: "任务 z 的教师策略" }, { symbol: "π_student", meaning: "统一学生策略" }],
          },
        },
      ],
      recordings: [recording(15, "Inverse Reinforcement Learning", "观看重点：reward 多解、MaxEnt IRL、guided cost learning、GAN/GAIL 连接与 reward transfer。"), recording(16, "Transfer and Multi-Task Learning", "观看重点：Montezuma 的先验例子、RL finetune 困难、sim-to-real randomization、distillation/context/modularity。")],
      pitfalls: ["声称示范能唯一恢复真实 reward。", "把能模仿 occupancy 的 discriminator 直接当成跨动力学 reward。", "把训练域随机得很花等同于覆盖真实域。"],
      exercises: [
        { question: "为何 IRL 比 BC 更可能跨动力学迁移？", answer: "BC 绑定专家动作；若 IRL 恢复了目标，可在新动力学下重新求解不同动作。前提是 reward 确实被正确解耦。" },
        { question: "contextual policy 的 context 可以是什么？", answer: "目标位置、任务 ID、语言描述、动力学参数或由历史推断出的任务 latent。" },
      ],
      sources: [slide(15, "Inverse Reinforcement Learning"), video(15, "Inverse Reinforcement Learning"), slide(16, "Transfer and Multi-Task Learning"), video(16, "Transfer and Multi-Task Learning")],
    },
    {
      slug: "distributed-rl",
      index: 10,
      title: "分布式强化学习",
      subtitle: "对应 Week 10 / Lecture 17：Actor—Learner、policy lag 与可复用系统抽象",
      duration: "5–7 小时",
      summary: "沿 DQN、GORILA、A3C、IMPALA、Ape-X/R2D3 的系统演化，理解算力并行改变了数据新鲜度、replay 和校正需求；最后用 RLlib 的 policy/trajectory/loss 抽象拆解系统。",
      objectives: ["画出同步与异步 actor—learner 数据流", "计算 policy-lag importance ratio", "比较 A3C、IMPALA 与 Ape-X", "识别吞吐、延迟与数据陈旧度的权衡"],
      prerequisites: ["Actor-Critic", "Q-learning 与 replay", "importance sampling"],
      concepts: [
        { name: "Actor—Learner 架构", explanation: "actor 并行与环境交互，learner 集中或分布式更新参数。", why: "环境模拟和网络优化可重叠，提高吞吐。", example: "100 个 actor 推送 trajectory 给 GPU learner。", boundary: "更多 actor 不一定更快收敛；queue 过长会让数据过时。" },
        { name: "Policy lag", explanation: "actor 采样时使用行为策略 μ，learner 更新后目标策略已变成 π。", why: "on-policy 梯度用陈旧数据会偏，需要 ratio 或 V-trace 等校正。", example: "actor 每 1000 步才同步一次权重。", boundary: "importance ratio 在长轨迹上可高方差，实践中常截断。" },
        { name: "Distributed replay", explanation: "多个 actor 向共享 replay 写 transition，learner off-policy 采样。", why: "适合 DQN/Ape-X 式高吞吐和数据复用。", example: "按 TD error 分布式设置优先级。", boundary: "优先级改变采样分布，需要权重校正；热点数据也可能降低多样性。" },
        { name: "系统抽象", explanation: "把 policy evaluation、trajectory postprocessing、loss 与执行策略分离。", why: "相同算法组件可组合成同步、异步、单机或集群实现。", example: "同一 policy graph 配 SyncSamples 得 A2C，配异步执行可成 A3C 类结构。", boundary: "抽象提高复用，不消除算法对一致性和时序的要求。" },
      ],
      sections: [
        {
          title: "1. 并行化的不是一个 for-loop",
          intuition: "RL 同时有状态化环境、神经网络、replay 和异步队列。",
          paragraphs: [
            "Lecture 17 从 DQN 到 GORILA/A3C：A3C 让每个 worker 收短 rollout、算梯度并异步发给 master，worker 的不同探索提高样本多样性；它移除 replay，却引入参数异步。",
            "IMPALA 进一步分离 actor 与 learner，Ape-X 则保留大 replay 并扩展 off-policy Q-learning。选择架构不能只看 steps/s，还要看每个样本到被训练时经历了多少参数版本。",
          ],
          example: {
            title: "吞吐与陈旧度",
            steps: ["20 个 actor 每秒各产 100 step，总输入 2000 step/s。", "learner 只能处理 1500 step/s，queue 每秒积压 500 step。", "10 秒后积压 5000 step，样本被消费时对应的策略已明显陈旧。"],
            result: "扩 actor 前先量 learner 服务率和 queue age。",
          },
        },
        {
          title: "2. Policy lag 的校正",
          intuition: "数据是谁采的，梯度想更新谁，必须同时记住。",
          paragraphs: [
            "若 actor 用 μ 采样而 learner 优化 π，单步 importance ratio ρ_t=π(a_t|s_t)/μ(a_t|s_t)。IMPALA 的 V-trace 对 ratio 截断，用有限方差换少量偏差来修 critic 与 actor。",
            "Lecture 17 的系统史不是算法年表，而是在说明架构变化如何引出统计修正：A3C 接近 on-policy，IMPALA 有 policy lag，Ape-X 天生 off-policy 并依赖 replay。",
          ],
          formula: {
            latex: String.raw`\rho_t=\frac{\pi(a_t\mid s_t)}{\mu(a_t\mid s_t)},\qquad \bar\rho_t=\min(\rho_{max},\rho_t)`,
            explanation: "ratio 将行为策略样本校正到目标策略；截断限制极端权重。",
            symbols: [{ symbol: "μ", meaning: "actor 采样时的行为策略" }, { symbol: "π", meaning: "learner 当前目标策略" }, { symbol: "ρ_max", meaning: "截断阈值" }],
          },
          example: {
            title: "手算 policy-lag ratio",
            steps: ["actor 采样时 μ(a|s)=0.25。", "learner 当前 π(a|s)=0.40。", "ρ=0.40/0.25=1.6；若阈值 1.0，则截断权重为 1.0。"],
            result: "该动作在当前策略下更常见，未经截断会被放大 1.6 倍。",
          },
          figures: [slidePage(17, 11, "Policy lag：先写出行为策略与目标策略", "这一页先要求对 actor 与 critic 都做 importance correction。正文随后展开 V-trace：c_i 控制多步传播，ρ_i 修正当前 TD residual。")],
        },
        {
          title: "3. V-trace target 的完整递推",
          intuition: "陈旧轨迹中的每个 TD residual 都要按沿途可信程度向前传播。",
          paragraphs: [
            "IMPALA 保存 actor 行为概率 μ(a_t|s_t)，learner 计算当前 π 后得到 ρ_t。V-trace value target 从 V(s) 出发，累加未来 TD residual；每个 residual 乘本步截断 ρ_i，并乘此前各步的截断 c_j。c 控制 trace 长度，ρ 控制校正强度，两者可以取不同上限。",
            "Actor 更新常使用 r_t+γv_{t+1}−V(s_t) 再乘截断 ρ_t。若根本没记录 μ，learner 无法复原 ratio；若 queue age 太大，大量 ratio 被截断，系统虽然还能训练，但偏差与有效样本量都会改变。",
          ],
          formula: {
            latex: String.raw`v_s=V(s)+\sum_{t=s}^{s+n-1}\gamma^{t-s}\left(\prod_{i=s}^{t-1}c_i\right)\delta_t^V,\quad \delta_t^V=\bar\rho_t[r_t+\gamma V(s_{t+1})-V(s_t)]`,
            explanation: "空乘积为 1。ρ 截断单步 off-policy residual，c 决定这个 residual 能沿 trace 传多远。",
            symbols: [{ symbol: "v_s", meaning: "V-trace critic target" }, { symbol: "ρ̄_t", meaning: "截断 importance ratio" }, { symbol: "c_i", meaning: "trace coefficient，通常也由 ratio 截断得到" }],
          },
        },
        {
          title: "4. RLlib 视角：算法组件与执行策略分离",
          intuition: "先定义 policy、trajectory processing 和 loss，再决定这些组件如何分布式运行。",
          paragraphs: [
            "课堂后半由 Richard Liaw 讲 Ray/RLlib。难点包括 stateful simulator、异步、嵌套并行和不同深度学习框架。Policy Graph 抽象 π_θ、trajectory postprocessor ρ_θ(X) 与 loss L(θ,X)，Policy Optimizer 决定同步采样、replay 或异步梯度。",
            "工程检查至少记录 environment steps/s、learner updates/s、queue age、参数版本差、replay age 和 wall-clock return。只报告最大吞吐会掩盖统计效率下降。",
          ],
          checks: ["为什么 actor 数翻倍可能让学习更差？", "off-policy Q-learning 与 on-policy actor-critic 对 policy lag 的敏感性为何不同？"],
        },
      ],
      recordings: [recording(17, "Distributed RL", "本讲嘉宾讲者为 Richard Liaw。建议结合 slides 核对 A3C/IMPALA/Ape-X 的数据流、policy lag 校正，以及 Ray/RLlib 对 stateful、asynchronous workload 的抽象。")],
      pitfalls: ["把 steps/s 当成唯一性能指标。", "异步 actor 不记录行为策略概率，事后无法做严格校正。", "queue 无限增长却仍增加 actor。"],
      exercises: [
        { question: "μ(a|s)=0.5、π(a|s)=0.1，ratio 是多少？", answer: "0.2；该样本动作在目标策略下更少见，应降权。" },
        { question: "Ape-X 为什么适合许多 actor？", answer: "Q-learning 是 off-policy，可把各 actor 数据汇入共享 prioritized replay；但仍要处理数据年龄与优先级偏差。" },
      ],
      sources: [slide(17, "Distributed RL"), video(17, "Distributed RL")],
    },
    {
      slug: "exploration",
      index: 11,
      title: "探索：从 bandit 到深度 RL",
      subtitle: "对应 Week 11 / Lectures 18–19 / Homework 5",
      duration: "9–11 小时",
      summary: "从 bandit 的 regret 出发，依次讲 optimism、Thompson sampling、information gain，再把它们迁移为 pseudo-count、RND、bootstrap Q 与 VIME。后半比较示范如何缓解探索，并说明 batch/offline Q 的支持集外估计问题。",
      objectives: ["区分 exploration 与 exploitation", "计算 UCB 与 count bonus", "解释 episodic posterior sampling", "区分预测误差、信息增益和新颖度", "说明示范数据为何不自动修好 off-policy Q"],
      prerequisites: ["第 5、8 章", "Bayesian posterior", "熵与 KL"],
      concepts: [
        { name: "Regret", explanation: "每轮最佳动作期望奖励与实际所选动作奖励之差的累计。", why: "它衡量为获取信息付出的机会成本，而不只是最终策略回报。", example: "试一家未知餐馆可能损失今晚收益，却改善以后选择。", boundary: "复杂 MDP 的深度探索不等同于逐步 bandit regret。" },
        { name: "Optimism / UCB", explanation: "用估计均值加不确定性上界评分，未知动作暂时当成可能很好。", why: "让 agent 主动收集能排除高价值可能性的样本。", example: "访问次数少的动作获得更大 bonus。", boundary: "不确定性若校准错误，optimism 会反复奖励噪声或不可控状态。" },
        { name: "Thompson sampling", explanation: "从未知量后验采一个可能世界，并在一段时间内按它行动。", why: "产生时间上一致的探索，而非每步独立随机抖动。", example: "Bootstrapped DQN 每个 episode 固定一个 Q head。", boundary: "bootstrap ensemble 只是后验近似，成员相关时探索会退化。" },
        { name: "Intrinsic reward", explanation: "把 novelty、prediction improvement 或 information gain 作为额外奖励。", why: "稀疏外部奖励前也能驱动状态覆盖和知识获取。", example: "RND 用固定随机网络与预测网络误差奖励新状态。", boundary: "预测误差会奖励随机电视噪声；误差大不一定能学到有用信息。" },
      ],
      sections: [
        {
          title: "1. Bandit 给出的三条探索原则",
          intuition: "未知可能好、从后验抽一个世界、选择最有信息的试验。",
          paragraphs: [
            "Lecture 18 用药物选择、餐馆与钻井说明 exploration/exploitation。Bandit 没有长时状态，因而能清楚推导 UCB、Thompson sampling 和 information-directed sampling；深度 RL 方法多是这些原则的不完美迁移。",
            "UCB 给均值加置信项；Thompson 从 reward posterior 采样；information gain 直接问动作会让 posterior 改变多少。三者都依赖某种不确定性，而不是简单加动作噪声。",
          ],
          formula: {
            latex: String.raw`a_t=\arg\max_a\left[\hat\mu_a+c\sqrt{\frac{\log t}{N_t(a)}}\right]`,
            explanation: "经验均值负责 exploitation，访问次数少带来的置信项负责 exploration。",
            symbols: [{ symbol: "μ̂_a", meaning: "动作 a 的经验平均奖励" }, { symbol: "N_t(a)", meaning: "截至 t 对动作 a 的尝试次数" }, { symbol: "c", meaning: "探索强度" }],
          },
          example: {
            title: "两臂 UCB 手算",
            steps: ["t=100、c=1；A 均值 0.7、访问 50 次，B 均值 0.5、访问 5 次。", "A bonus=√(ln100/50)≈0.303，总分≈1.003。", "B bonus=√(ln100/5)≈0.960，总分≈1.460。"],
            result: "尽管 B 当前均值更低，因不确定性更大仍会被探索。",
          },
        },
        {
          title: "2. 连续状态怎样近似‘访问次数’",
          intuition: "像素几乎不会完全重复，所以需要密度、哈希或学习误差定义相似的新颖度。",
          paragraphs: [
            "Pseudo-count 用生成模型在更新前后的密度变化反推出虚拟访问次数；hash count 先把相近状态压到离散桶；EX2 用 exemplar discriminator 判断新状态能否与 replay 区分。Homework 5 依次实现 histogram、KDE 与 EX2。",
            "RND 更直接：固定随机 target network，训练 predictor 拟合已见状态；预测误差作 bonus。Lecture 18 明确指出这只是 heuristic count/error，若观测含不可预测噪声会产生 noisy-TV trap。",
          ],
          formula: {
            latex: String.raw`\tilde r(s,a)=r(s,a)+\alpha B(N(s)),\qquad B(N)=N^{-1/2}`,
            explanation: "稀有状态 bonus 大，重复访问后按平方根衰减。连续状态需先定义伪计数或密度。",
            symbols: [{ symbol: "α", meaning: "内在奖励权重" }, { symbol: "N(s)", meaning: "真实或近似访问次数" }],
          },
          example: {
            title: "访问次数 bonus",
            steps: ["状态首次前 N=1，bonus=1。", "访问 4 次后 bonus=1/2。", "访问 100 次后 bonus=0.1。"],
            result: "bonus 自动衰减，把资源转向还没覆盖的状态。",
          },
          figures: [slidePage(18, 32, "EX2：用 exemplar classification 定义新颖度", "EX2 为候选状态训练‘它自己 vs replay’的分类器。容易与历史区分表示密度低、较新颖；这和直接计算欧氏距离或固定直方图不是同一件事。")],
        },
        {
          title: "3. KDE 与 EX2 的分数从哪里来",
          intuition: "连续空间没有精确计数，只能先定义‘附近有多少历史样本’。",
          paragraphs: [
            "KDE 把每个历史状态放一个 kernel，密度是这些 kernel 的平均。bandwidth h 太小，每个点都像孤岛；h 太大，真正不同区域被抹平。Homework 5 要比较 histogram 与 KDE，目的正是观察离散桶边界和 bandwidth 如何改变 bonus。",
            "EX2 不显式归一化密度，而是为新状态 x 训练 exemplar classifier：正类是 x 的增强样本，负类来自 replay。若分类器很容易认出 x，说明它与历史分布不同。该分数依赖判别器容量、负样本和训练收敛，不能直接当精确 Bayesian count。",
          ],
          formula: {
            latex: String.raw`\hat p_h(x)=\frac{1}{Nh^d}\sum_{i=1}^{N}K\!\left(\frac{x-x_i}{h}\right),\qquad b_{KDE}(x)\propto(\hat p_h(x)+\varepsilon)^{-1/2}`,
            explanation: "KDE 用邻域质量代替访问次数；维度 d 增大后密度估计迅速变难，因此像素输入通常先学习表示。",
            symbols: [{ symbol: "h", meaning: "kernel bandwidth" }, { symbol: "d", meaning: "状态表示维数" }, { symbol: "K", meaning: "kernel 函数" }],
          },
        },
        {
          title: "4. Information gain 与 VIME",
          intuition: "真正有信息的 transition 会改变我们对动力学参数的信念，而不只是难预测。",
          paragraphs: [
            "设动力学参数 posterior 为 p(θ|D)。观察新 transition 后，若 posterior 明显改变，说明它提供了信息；VIME 用更新前后参数 posterior 的 KL 作为 intrinsic reward。随机电视可能始终预测不准，却不一定持续改变可学习参数的 posterior，因此 information gain 比裸 prediction error 更接近‘学到了什么’。",
            "精确 Bayesian neural network posterior 很难，VIME 使用变分近似 q_φ(θ)。一次 transition 做近似 posterior 更新 φ→φ'，再计算 KL(q_{φ'}||q_φ)。分数受优化步长和后验族影响，仍不是免费的真信息量。",
          ],
          formula: {
            latex: String.raw`r_t^{int}=\eta\,D_{KL}\!\left(p(\theta\mid D\cup\{\xi_t\})\|p(\theta\mid D)\right),\quad \xi_t=(s_t,a_t,s_{t+1})`,
            explanation: "bonus 测量看完 transition 后参数信念改变多少；已充分解释或纯不可学噪声不应长期获得同样奖励。",
            symbols: [{ symbol: "θ", meaning: "动力学模型参数" }, { symbol: "D", meaning: "已有 transition 数据" }, { symbol: "η", meaning: "内在奖励尺度" }],
          },
          figures: [slidePage(19, 9, "VIME：posterior KL 作为信息奖励", "这一页把 information gain 写成模型参数 posterior 更新前后的 KL。实现近似时必须说明 posterior family 与单步更新方式。")],
        },
        {
          title: "5. 示范、探索与 batch/offline 支持集",
          intuition: "好数据能告诉你去哪，却不保证 Q 在没见过的动作上不会胡说。",
          paragraphs: [
            "Lecture 19 比较预训练再 finetune、把示范放进 off-policy buffer，以及 imitation auxiliary loss。示范可跨过稀疏奖励探索瓶颈，但 early RL bad batch 可能忘掉初始化；Q-learning 虽能直接用示范，max 仍可能选数据支持外动作。",
            "讲义在此局部讨论 fitted/batch Q：只用固定数据时，bootstrap 会查询 dataset 几乎没覆盖的动作，产生外推误差；BEAR 用 support constraint，BCQ 做分布匹配。这是 2019 课中的一段内容，不应改写成一整周独立 offline RL 课程。",
          ],
          formula: {
            latex: String.raw`\max_a Q(s,a)\quad\text{is unsafe when }a\notin\operatorname{supp}(D(\cdot|s))`,
            explanation: "数据之外的动作没有真实 target 约束，却可能被函数逼近器赋予最高 Q。",
            symbols: [{ symbol: "supp(D)", meaning: "数据行为动作的支持区域" }],
          },
          checks: ["prediction error 与 information gain 为什么不同？", "把专家数据放进 replay 后，为什么 max-Q 仍会出错？"],
        },
        {
          title: "6. Demonstration + RL 的三种组合",
          intuition: "示范可以初始化策略、填 replay，或持续提供辅助约束；三种做法解决的问题不同。",
          paragraphs: [
            "第一种先 BC 再 RL finetune，简单但 early bad rollout 可能让策略迅速忘掉示范。第二种把 demonstration 永久保留在 replay，并用优先采样让稀有成功轨迹反复训练；这适合 off-policy 算法，却仍需处理 sampling bias。",
            "第三种在 TD loss 之外加入 imitation margin 或 log-likelihood loss，使专家动作在训练中持续受保护。总损失系数过大时策略无法超过专家，过小时又会遗忘。评估要分别报告纯 RL、BC→RL、demo replay 和辅助 loss，而不是把所有技巧绑在一起。",
          ],
          formula: {
            latex: String.raw`L=L_{TD}+\lambda_{BC}\,\mathbb E_{(s,a_E)\sim D_E}[-\log\pi_\theta(a_E\mid s)]+\lambda_{reg}L_{reg}`,
            explanation: "TD 项从奖励学习，BC 项维持专家动作概率；λ_BC 决定模仿先验在后训练中保留多强。",
            symbols: [{ symbol: "D_E", meaning: "专家数据" }, { symbol: "λ_BC", meaning: "示范辅助损失权重" }, { symbol: "L_TD", meaning: "价值或 critic 的 TD 目标" }],
          },
        },
      ],
      recordings: [recording(18, "Exploration Part 1", "观看重点：bandit 三类原则、pseudo-count/hash/EX2/RND，以及 episode-level bootstrapped Q 的一致探索。"), recording(19, "Exploration Part 2", "观看重点：information gain/VIME、示范与 RL 的组合，以及固定数据支持之外的 Q 外推问题。")],
      lab: {
        title: "Count bonus 穿越稀疏奖励走廊",
        goal: "在离散链式环境比较 ε-greedy Q-learning 与 N(s)^−1/2 内在奖励。",
        file: "/labs/cs285/count_based_exploration.py",
        steps: ["运行多随机种子实验。", "比较到达稀疏终点的首次 episode 和总次数。", "修改 α，观察过弱与过强 bonus。"],
        expected: ["适中 bonus 更早发现远端奖励。", "访问次数上升后 bonus 衰减。", "脚本打印 PASS。"],
        sourceNote: "对应 Homework 5 的 count-based reward modification；另有 kde_ex2_novelty.py 独立检验 bandwidth 与 exemplar novelty，不复制官方作业解答。",
      },
      pitfalls: ["把随机噪声带来的 prediction error 当成可学习信息。", "每步随机 Q head，失去 temporally coherent exploration。", "固定数据上仍对所有动作无约束取 max。"],
      exercises: [
        { question: "一个状态 N 从 4 增到 16，N^−1/2 bonus 变成原来的多少？", answer: "从 1/2 变 1/4，是原来的一半。" },
        { question: "为何示范不能保证 Q-learning 不发生分布外外推？", answer: "示范只覆盖部分动作，Bellman max 仍可能选择数据未覆盖却被网络高估的动作。" },
      ],
      sources: [slide(18, "Exploration Part 1（含 pseudo-count、KDE、EX2 与 RND）"), video(18, "Exploration Part 1"), slide(19, "Exploration Part 2（含 VIME、示范与 batch Q）"), video(19, "Exploration Part 2"), homework(5, "Exploration"), starterCode(5), { title: "独立实验：KDE 与 exemplar novelty", url: "/labs/cs285/kde_ex2_novelty.py", kind: "code", note: "对应 HW5 的连续新颖度思想；不是官方 TODO 解答。" }],
    },
    {
      slug: "meta-rl",
      index: 12,
      title: "Meta-RL：学习如何适应",
      subtitle: "对应 Week 12 / Lecture 20：RNN、梯度适应与 task-belief 三条路线",
      duration: "7–9 小时",
      summary: "Meta-RL 学的不是一个任务的策略，而是从少量新经验得到策略的适应规则。按原讲义比较 recurrent、MAML 类 optimization 和 latent task-belief + SAC。",
      objectives: ["写出 outer loop 与 inner adaptation", "比较 RL² 与 MAML 的表达性和一致性", "把隐藏任务看成 POMDP latent", "解释 off-policy task-belief 方法为何省样本"],
      prerequisites: ["第 4、8、9 章", "RNN", "POMDP 与变分推断"],
      concepts: [
        { name: "Task distribution", explanation: "Meta-training 从一族 MDP p(M) 采任务，目标是在新任务上用少量数据快速适应。", why: "没有任务分布，就无法定义‘学会如何学习’的训练期望。", example: "不同目标速度或不同关节参数构成任务族。", boundary: "训练任务太少会 meta-overfit，新任务离分布太远也无法保证适应。" },
        { name: "Inner / outer loop", explanation: "inner loop 用少量任务数据改变策略；outer loop 让这种改变后的策略在任务分布上表现更好。", why: "区分普通预训练与真正针对适应后的性能训练。", example: "MAML 外层对一次 policy-gradient 更新后的回报求梯度。", boundary: "inner loop 不一定是梯度，也可由 RNN hidden state 或 Bayesian posterior 完成。" },
        { name: "Recurrent meta-RL", explanation: "RNN 的 hidden state 跨 episode 保留，让网络从历史 action、state、reward 中学出隐式学习算法。", why: "表达性强，可利用无奖励但有信息的经验。", example: "RL² 在第一个 episode 探索，第二个 episode 按推断任务执行。", boundary: "有限训练分布下不保证数据增多就收敛到最优，讲义称其不 consistent。" },
        { name: "Task belief", explanation: "显式 encoder 从 transition context 推断隐藏任务 z 的 posterior，再条件化策略。", why: "把 meta-RL 看成隐藏任务 POMDP，能做 posterior sampling 和 off-policy context reuse。", example: "PEARL 用无序 transition 集推断 reward/dynamics latent。", boundary: "posterior 和先验是近似，context 数据质量决定任务辨识。" },
      ],
      sections: [
        {
          title: "1. Meta-RL 学的是适应规则",
          intuition: "普通 RL 在一个 MDP 内学策略，Meta-RL 在 MDP 分布上学‘拿到新数据后怎么变’。",
          paragraphs: [
            "Lecture 20 把 meta-training/outer loop 与 adaptation/inner loop 分开。目标不是训练集任务回报，而是适应后在同一任务上的回报。适应过程还必须主动探索：第一批数据的价值在于让第二批策略更好。",
            "Goal-conditioned policy 已知目标；Meta-RL 往往不知道 task，需要从 reward 与 transition 历史推断。奖励比 goal 更一般，例如‘接近目标同时避开区域并惩罚动作’不能只写成一个目标状态。",
          ],
          formula: {
            latex: String.raw`\max_\theta\;\mathbb E_{M\sim p(M)}\left[J_M\big(U(\theta,D_M^{adapt})\big)\right]`,
            explanation: "θ 参数化初始策略或学习器，U 是使用少量适应数据后的更新规则。",
            symbols: [{ symbol: "M", meaning: "一个任务/MDP" }, { symbol: "U", meaning: "inner-loop adaptation" }, { symbol: "D_adapt", meaning: "新任务少量经验" }],
          },
          example: {
            title: "适应前后两轮",
            steps: ["任务均匀为‘向左’或‘向右’，初始不知道。", "第一轮试向右，得到 +1，识别为向右任务。", "第二轮持续向右得到 10 分；第一轮动作的价值主要是辨识任务。"],
            result: "Meta-objective 会给能产生有用信息的适应轨迹 credit。",
          },
        },
        {
          title: "2. RNN 与 gradient-based adaptation",
          intuition: "一个把学习写进 hidden state，一个把学习写成参数更新。",
          paragraphs: [
            "RL² 让 RNN hidden state 跨 episode 延续，理论上能表示任意适应函数；缺点是训练困难且没有一致性保证。MAML 学一个初始化 θ，使一两步梯度就得到好策略，结构清晰但需要二阶导。",
            "讲义指出 optimization-based 方法的一处表达限制：若适应数据没有 reward，标准 policy-gradient inner loss 可能不更新，即使这些数据透露了应避开的状态；RNN 则仍可编码信息。",
          ],
          formula: {
            latex: String.raw`\theta'_M=\theta-\alpha\nabla_\theta\mathcal L_M^{adapt}(\theta),\qquad \theta\leftarrow\theta-\beta\nabla_\theta\sum_M\mathcal L_M^{test}(\theta'_M)`,
            explanation: "MAML 外层梯度穿过 inner update，因此通常含二阶项。",
            symbols: [{ symbol: "α", meaning: "inner-loop 学习率" }, { symbol: "β", meaning: "outer-loop 学习率" }, { symbol: "θ'_M", meaning: "任务 M 适应后的参数" }],
          },
          example: {
            title: "一维 MAML 更新",
            steps: ["初始 θ=0，任务损失 L=(θ−2)^2，inner α=0.25。", "梯度在 θ=0 为 −4。", "θ'=0−0.25×(−4)=1。"],
            result: "一次更新把参数向任务最优值 2 推进一半。",
          },
          figures: [slidePage(20, 20, "MAML：外层梯度穿过内层更新", "图中的训练损失负责产生 task-specific 参数，测试损失才塑造共享初始化。若只在同一批数据上更新和评价，就看不到真正的快速适应。")],
        },
        {
          title: "3. Meta-imitation：从一段新示范生成策略",
          intuition: "普通 BC 需要同任务大量示范；meta-imitation 先跨任务学习如何解释一两段新示范。",
          paragraphs: [
            "训练时每个任务拆成 support demonstration 与 query examples。适应器用 support 更新 hidden state、latent 或参数，再在同任务 query 上计算 imitation loss。外层因此奖励‘看过一段新示范后会做’，而不是把所有任务平均成一个动作。",
            "若 support 与 query 来自同一条轨迹，模型可能靠时间邻近或背景捷径；应跨 rollout 划分，并测试新物体、新目标或新动力学。Meta-imitation 仍依赖示范覆盖，不会凭空解决部署分布偏移。",
          ],
          formula: {
            latex: String.raw`\theta'_M=U(\theta,D_M^{support}),\quad L_{meta}=\mathbb E_M\mathbb E_{(s,a)\sim D_M^{query}}[-\log\pi_{\theta'_M}(a\mid s)]`,
            explanation: "support 只负责适应，query 衡量适应是否泛化到同任务的新轨迹。",
            symbols: [{ symbol: "D_support", meaning: "新任务给适应器看的少量示范" }, { symbol: "D_query", meaning: "同任务独立评估示范" }],
          },
        },
        {
          title: "4. Model-based Meta-RL：快速适应模型再规划",
          intuition: "任务变化若主要发生在动力学或奖励，先适应模型可能比直接改整张策略更可解释。",
          paragraphs: [
            "一种路线 meta-learn dynamics initialization，新任务收少量 transition 后更新模型，再用 MPC；另一种让 latent z 表示任务动力学，context encoder 推断 z 后条件化预测。规划器不必在 meta-training 时固定，可在测试时改变目标或约束。",
            "优势是模型误差可单独诊断，缺点是适应后的模型会被规划器放大。评估必须同时看 one-step prediction、multi-step rollout 和闭环 return；只证明参数更新后 MSE 下降，不等于 control adaptation 成功。",
          ],
          formula: {
            latex: String.raw`\phi'_M=\phi-\alpha\nabla_\phi\sum_{(s,a,s')\in D_M^{adapt}}\|f_\phi(s,a)-s'\|^2,\quad a_t=\operatorname{MPC}(f_{\phi'_M},s_t)`,
            explanation: "inner loop 适应动力学参数，外层按适应后模型带来的控制表现塑造初始化。",
            symbols: [{ symbol: "f_φ", meaning: "可快速适应的动力学模型" }, { symbol: "φ'_M", meaning: "任务 M 上适应后的模型" }],
          },
        },
        {
          title: "5. 隐藏任务 POMDP 与 task-belief",
          intuition: "状态可见但‘我在哪个 MDP’不可见，历史 transition 是任务传感器。",
          paragraphs: [
            "把 M 视为 episode 内固定 latent，context encoder q_φ(z|c) 从 (s,a,r,s') 集合推断 task belief。由于每条 transition 在 Markov 假设下都提供任务证据，可用 permutation-invariant encoder。",
            "PEARL 类方法从 posterior 采 z，并用 SAC 条件策略行动；off-policy replay 同时训练 critic、actor 和 inference network，讲义报告相对 on-policy meta-RL 的显著样本效率优势，但这依赖任务 latent 可由短 context 辨识。",
          ],
          formula: {
            latex: String.raw`z\sim q_\phi(z\mid c),\qquad a\sim\pi_\theta(a\mid s,z),\qquad c=\{(s_i,a_i,r_i,s'_i)\}_{i=1}^K`,
            explanation: "context 先形成 task belief，策略再针对抽到的 task hypothesis 行动。",
            symbols: [{ symbol: "z", meaning: "隐藏任务 latent" }, { symbol: "c", meaning: "适应期 transition context" }],
          },
          checks: ["Meta-RL 与 goal-conditioned policy 的信息条件有何不同？", "为什么 task encoder 可不关心 transition 排列顺序？"],
        },
        {
          title: "6. PEARL 的 posterior regularization 与主动辨识",
          intuition: "context encoder 既要辨认任务，又不能把每条训练轨迹记成互不相干的编码。",
          paragraphs: [
            "PEARL 用 KL(q_φ(z|c)||p(z)) 把 task posterior 约束到共享先验，并把 z 输入 off-policy actor/critic。训练可从 replay 重组 context 与 RL batch，提高真实样本复用；测试时先从 prior 采 z 探索，收集 context 后更新 posterior。",
            "KL 太强会 posterior collapse，不同任务编码相同；太弱会过拟合训练任务。更重要的是，标准 posterior sampling 产生的探索不一定最有辨识性：若两个任务在常规状态下奖励相同，需要策略主动访问能区分它们的状态。",
          ],
          formula: {
            latex: String.raw`L_{enc}=L_{critic}(\phi,\psi)+\beta D_{KL}(q_\phi(z\mid c)\|p(z)),\qquad z\sim q_\phi(z\mid c)`,
            explanation: "critic 回报让 z 保留任务相关信息，KL 限制编码容量并允许从统一 prior 开始测试。",
            symbols: [{ symbol: "β", meaning: "task-information bottleneck 强度" }, { symbol: "p(z)", meaning: "测试开始时的任务先验" }, { symbol: "q_φ", meaning: "context-conditioned task posterior" }],
          },
        },
      ],
      recordings: [recording(20, "Meta Reinforcement Learning", "官方 slides 标注讲者 Kate Rakelly。建议结合 slides 核对 outer/inner loop、RL²、MAML、meta-imitation、model-based adaptation 与 task-belief + SAC。")],
      pitfalls: ["把多任务联合训练直接称为 Meta-RL。", "只评估适应前表现。", "meta-training task 太少却不检查 meta-overfitting。"],
      exercises: [
        { question: "为什么普通 finetune 不一定算 Meta-learning？", answer: "若预训练目标只优化适应前表现，没有对适应后结果反向塑造初始化或更新规则，就只是可迁移表征，不是完整 meta-objective。" },
        { question: "task belief 为什么要保留不确定性而非只输出单个 z？", answer: "少量 context 可能对应多个任务；posterior sampling 能保持假设并驱动辨识性探索。" },
      ],
      sources: [slide(20, "Meta Reinforcement Learning"), video(20, "Meta Reinforcement Learning")],
    },
    {
      slug: "information-and-open-problems",
      index: 13,
      title: "信息论探索与开放问题",
      subtitle: "对应 Week 13 / Lecture 21：无奖励技能学习、稳定性、效率与问题设定",
      duration: "7–9 小时",
      summary: "用 entropy 与 mutual information 区分动作随机、状态覆盖和技能可控性；再按原课收束到稳定性、样本效率、泛化、监督来源和奖励设定。",
      objectives: ["计算离散 entropy 与 mutual information", "解释 goal reaching、state coverage 与 skill diversity 的不同", "写出 DIAYN 类 intrinsic reward", "从稳定性、效率、泛化和监督检查 RL 问题"],
      prerequisites: ["第 8、11、12 章", "熵、KL 与条件分布"],
      concepts: [
        { name: "State entropy", explanation: "H(S) 衡量策略访问状态分布的覆盖广度。", why: "未知未来目标到来前，广覆盖能提高已有可达状态的机会。", example: "Skew-Fit 重采样稀有 goal，使最终状态更均匀。", boundary: "高 state entropy 不代表行为可由指定技能稳定复现。" },
        { name: "Mutual information", explanation: "I(Z;S) 衡量观察状态后能减少多少对技能变量 Z 的不确定性。", why: "鼓励不同技能访问可区分状态，同时每个固定技能保持可控。", example: "DIAYN discriminator 从状态预测是哪个 skill 产生的。", boundary: "MI 目标取决于选取的 state feature，可能学到容易区分但无任务价值的行为。" },
        { name: "Unsupervised Meta-RL", explanation: "先无奖励生成任务或技能，再用它们 meta-train 适应器。", why: "真实 meta-training task distribution 难以人工枚举。", example: "技能发现给环境产生伪任务，真实 reward 只在 meta-test 出现。", boundary: "自动任务与下游任务错配时，预训练可能没有帮助。" },
        { name: "Problem formulation", explanation: "RL 的数据、目标和监督来源是可设计的，不应默认单任务标量奖励就是唯一形式。", why: "很多失败来自问题假设而非优化器，例如奖励不可得、模拟器不代表现实或无法反复在线采样。", example: "机器人可同时利用示范、语言、偏好和无标签预测数据。", boundary: "扩大监督来源不能掩盖评估目标；最终仍要说明系统被优化成什么。" },
      ],
      sections: [
        {
          title: "1. 动作随机、状态覆盖与技能多样性不是一回事",
          intuition: "随机挥动可以动作熵很高，却哪里也到不了；覆盖很多地点也不代表能按口令重现某种行为。",
          paragraphs: [
            "Lecture 21 先讲没有外部 reward 的行为学习。Goal-reaching 可通过 imagined goals 覆盖状态；Skew-Fit 对稀有 goal 加权提高 state entropy。但 goal 不能表达所有时序行为，且 MaxEnt action policy 未必可控。",
            "DIAYN 引入技能 z：对固定 z，希望动作有足够探索；跨 z，希望终态或访问状态容易区分。Discriminator q(z|s) 给 intrinsic reward，最大化 I(Z;S) 的变分下界。",
          ],
          formula: {
            latex: String.raw`r_{DIAYN}(s,z)=\log q_\phi(z\mid s)-\log p(z),\quad J=\mathbb E\!\left[\sum_t r_{DIAYN}(s_t,z)+\alpha\mathcal H(\pi(\cdot\mid s_t,z))\right]`,
            explanation: "判别器项提高技能—状态互信息；动作条件熵让固定技能仍有足够探索。两项不能合并成含糊的‘增加随机性’。",
            symbols: [{ symbol: "Z", meaning: "技能索引" }, { symbol: "S", meaning: "访问状态" }, { symbol: "q_φ", meaning: "技能判别器" }],
          },
          example: {
            title: "二元技能的信息量",
            steps: ["Z 均匀取两种技能，所以 H(Z)=1 bit。", "若状态能完全确定技能，H(Z|S)=0。", "I(Z;S)=1 bit；若状态与技能无关，则 I=0。"],
            result: "互信息奖励的目标是让不同技能留下可辨认的状态后果。",
          },
        },
        {
          title: "2. Skew-Fit：反复重采样稀有 achieved goals",
          intuition: "如果训练目标总从已经常见的状态采样，策略只会越来越擅长去常见地方。",
          paragraphs: [
            "Skew-Fit 把历史 achieved goals 拟合成密度 q(g)，再按 q(g)^α 重采样；α<0 时低密度 goal 获得更大权重。Goal-conditioned policy 尝试到达这些稀有目标，新到达状态再回流进 buffer，形成覆盖—重采样—再覆盖的循环。",
            "权重不能无限放大：极低密度可能只是密度模型误差或不可达状态。实践会裁剪权重、混入均匀/原始采样，并用真实 achieved goal 而不是任意像素目标训练。它提高的是目标/状态覆盖，不直接保证可学习长时技能。",
          ],
          formula: {
            latex: String.raw`p_{relabel}(g)=\frac{q_\phi(g)^\alpha}{\int q_\phi(\tilde g)^\alpha d\tilde g},\qquad \alpha<0`,
            explanation: "密度越低，负指数后的采样权重越大；归一化和权重裁剪决定数值稳定性。",
            symbols: [{ symbol: "q_φ(g)", meaning: "achieved-goal 密度模型" }, { symbol: "α", meaning: "skew 指数，负值偏向稀有 goal" }],
          },
        },
        {
          title: "3. DIAYN 互信息下界的逐步含义",
          intuition: "先均匀抽一个技能，让策略行动，再问最终状态是否能告诉我们抽中了哪个技能。",
          paragraphs: [
            "互信息 I(Z;S)=H(Z)−H(Z|S)。技能先验 p(z) 通常固定均匀，所以 H(Z) 是常数；难点是未知 posterior p(z|s)。用判别器 q_φ(z|s) 替代 posterior，可得下界 E[log q_φ(z|s)−log p(z)]。",
            "只最大化判别项可能学会静止在几个容易区分的位置。DIAYN 还加入 H(A|S,Z)，让每个技能内部保持动作熵；但 action entropy 高仍不推出 state entropy 高。评估应同时画 discriminator accuracy、各技能 state occupancy 与可复现性。",
          ],
          formula: {
            latex: String.raw`I(Z;S)=\mathbb E_{z,s}[\log p(z\mid s)-\log p(z)]\ge\mathbb E_{z,s}[\log q_\phi(z\mid s)-\log p(z)]`,
            explanation: "不等号来自用 q 近似真实 skill posterior；判别器训练差时 intrinsic reward 也是偏的。",
            symbols: [{ symbol: "p(z)", meaning: "预设技能先验" }, { symbol: "p(z|s)", meaning: "真实但未知的技能 posterior" }, { symbol: "q_φ", meaning: "可训练判别器" }],
          },
        },
        {
          title: "4. 从无奖励技能到快速适应",
          intuition: "先自动提出练习题，再用这些练习题训练一个学习器。",
          paragraphs: [
            "无监督 meta-RL 把 task acquisition 与 meta-learning 串联：先通过 goal/skill discovery 生成 reward functions，再把它们作为 meta-training tasks，最后在真实未知 reward 上快速适应。",
            "这也暴露 meta-overfitting：自动技能若只覆盖容易区分的动作，而下游任务关心接触或精细控制，任务分布仍错。必须报告 pretraining coverage 与 downstream adaptation 的联系。",
          ],
          example: {
            title: "技能预训练的边界",
            steps: ["四个技能只学会向东南西北移动。", "下游任务是快速到达不同位置，这些技能有用。", "下游任务若是控制夹爪力度，方向技能几乎不提供相关适应。"],
            result: "无监督不等于无假设；状态表示和技能目标决定学到什么。",
          },
        },
        {
          title: "5. 课程最后留下的检查表",
          intuition: "算法跑出曲线只是开始，还要问它是否稳定、省数据、可泛化，以及监督是否现实。",
          paragraphs: [
            "Lecture 21 把核心算法问题分为 stability、efficiency、generalization。Q-learning 有 moving target 与函数逼近误差；policy gradient 方差高；model-based 会被 policy 利用。真实 sample complexity 还应乘上调参次数，而不是只算最好一次运行。",
            "更根本的问题是 formulation：单任务还是多任务？reward 从哪里来？能否利用 demonstration、language、human preference、self-supervision？课程结论不是某个算法胜出，而是先选择与数据和监督条件匹配的问题。",
          ],
          formula: {
            latex: String.raw`\text{effective interaction cost}\approx \text{steps per run}\times\text{number of seeds and tuning runs}`,
            explanation: "这不是统计恒等式，而是部署预算的工程核算：失败的超参数实验也消耗真实交互。",
            symbols: [{ symbol: "steps per run", meaning: "一次训练需要的环境步数" }, { symbol: "runs", meaning: "随机种子与调参试验总数" }],
          },
          checks: ["action entropy 高能推出 state entropy 高吗？", "为什么真实机器人上必须把调参次数算进样本成本？"],
        },
      ],
      recordings: [recording(21, "Information-Theoretic Exploration, Challenges and Open Problems", "观看重点：imagined goals/Skew-Fit、DIAYN 的 mutual information、unsupervised meta-RL，以及稳定性—效率—泛化—监督来源的结课检查表。")],
      pitfalls: ["把 action entropy、state entropy 和 I(skill;state) 混用。", "宣称 unsupervised skill 一定对任意下游任务有用。", "只报告最好 seed 和最好超参数所需环境步数。"],
      exercises: [
        { question: "Z 有 4 个均匀技能，状态能完全辨认技能时 I(Z;S) 是多少？", answer: "H(Z)=log2 4=2 bit，H(Z|S)=0，所以互信息为 2 bit。" },
        { question: "为什么模型式 RL 的一次运行样本少，不一定意味着真实开发成本最低？", answer: "模型类别、horizon、ensemble 和规划器仍需调参；所有失败运行都消耗真实交互与工程时间。" },
      ],
      sources: [slide(21, "Information-Theoretic Exploration, Challenges and Open Problems"), video(21, "Information-Theoretic Exploration, Challenges and Open Problems")],
    },
  ],
} satisfies OpenCourse;
