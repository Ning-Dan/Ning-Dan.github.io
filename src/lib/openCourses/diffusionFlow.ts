import type { OpenCourse } from "@/lib/openCourseTypes";

const courseUrl = "https://diffusion.csail.mit.edu/2026/index.html";
const notesUrl = "https://diffusion.csail.mit.edu/2026/docs/lecture_notes.pdf";
const arxivUrl = "https://arxiv.org/abs/2506.02070";
const labRepoUrl = "https://github.com/eje24/iap-diffusion-labs/tree/2026";

export const diffusionFlowCourse = {
  slug: "diffusion-flow",
  title: "Flow Matching 与 Diffusion Models 导论",
  shortTitle: "Diffusion & Flow",
  provider: "MIT 6.S184 / 6.S975（IAP 2026）",
  sourceUrl: courseUrl,
  description:
    "沿 MIT 原课的五讲顺序，从“生成就是采样”出发，逐步推到 ODE、SDE、Flow Matching、Score Matching、Classifier-Free Guidance、潜空间、DiT/U-Net 与离散 CTMC；后三章再展开讲义附录、传统 diffusion 记号和 Generator Matching。每章把讲义公式、slides 图示重点、课堂口头解释和官方 notebook 的实现路径对齐。",
  provenance:
    "本课程是 MIT 6.S184/6.S975 IAP 2026 配套材料的中文学习整理。课程讲义作者为 Peter Holderrieth 与 Ezra Erives，slides 由 Peter Holderrieth 与 Ron Shprints 制作。前八章沿用原课顺序、记号和主要例子；标为“课堂录像补充”的内容来自六段公开视频中的口头解释或问答。本站实验是为了在普通 CPU 上核对机制而写的缩小版，不是 MIT notebook 的逐行翻译。",
  licenseNote:
    "MIT 课程网站标注为 CC BY-NC-SA；本中文整理注明原作者与来源，并按非商业、署名、相同方式共享的要求使用。官方 iap-diffusion-labs 仓库另以 MIT License 发布；本站实验重新实现了相同教学目标，并保留仓库链接与来源说明。",
  prerequisites: [
    "线性代数：向量、矩阵与二次型",
    "多元微积分：梯度、散度、链式法则",
    "基础概率：高斯分布、条件概率、期望",
    "能阅读 Python；官方实验使用 PyTorch，本站综合实验使用 NumPy",
  ],
  outcomes: [
    "把生成任务写成从简单分布到数据分布的采样问题",
    "手算 Euler 与 Euler–Maruyama，并解释随机项为什么按平方根步长缩放",
    "从条件概率路径推导 Flow Matching 的可训练目标",
    "说明 score、DSM、Fokker–Planck 方程和 SDE extension 的关系",
    "实现并审查 classifier-free guidance，而不把它误认为精确条件采样",
    "核对 VAE、U-Net、DiT、patch token 与 latent tensor 的形状",
    "用 CTMC、率矩阵和逐 token 分类理解离散 diffusion",
    "在传统 DDPM/DDIM 记号与本课 probability-path 记号之间互相翻译",
    "用 infinitesimal generator 对照 ODE、SDE、CTMC 的训练与采样算法",
  ],
  chapters: [
    {
      slug: "generation-as-sampling",
      index: 1,
      title: "生成就是采样",
      subtitle: "先把“生成得好”改写成一个可计算的问题",
      duration: "70 分钟",
      summary:
        "对应原讲义第 1 节和 Lecture 1 前半段。先把图像、视频、分子写成向量，再区分未知的数据分布、有限数据集和可执行的生成器。",
      objectives: [
        "解释为什么生成不是寻找唯一最优样本",
        "区分 pdata、训练数据集与模型分布",
        "把有条件生成写成对 pdata(·|y) 的采样",
      ],
      prerequisites: ["随机变量与概率密度", "条件概率"],
      recordings: [
        {
          title: "Lecture 1: Flow and Diffusion Models",
          youtubeId: "9eJQQVrUUoI",
          note: "前半段：生成建模、数据分布、条件生成；含如何理解新颖性与分布目标的课堂问答。",
        },
      ],
      concepts: [
        {
          name: "对象的向量表示",
          explanation:
            "课程先把要生成的对象记为 z∈R^d。RGB 图像可写成 H×W×3 个实数，T 帧视频再多一个时间维，N 个原子的坐标可写成 3×N 个实数。这里的“向量”可以保留张量形状，不要求真的摊平成一列。",
          why: "ODE、SDE、概率密度和神经网络都需要明确状态空间；不先规定 z 在哪里，后面的梯度和向量场没有对象。",
          example: "一张 32×32 灰度手写数字是 1024 维对象；后续 Lab 3 就在这个空间里生成 MNIST，再把形状保留为 [1,32,32] 交给 DiT。",
          boundary: "文本 token 是离散对象，不能直接套用 R^d 上的梯度；原课在最后用 CTMC 单独处理。",
        },
        {
          name: "数据分布 pdata",
          explanation:
            "pdata 不是一个图片文件夹，而是假想中产生真实样本的概率分布。它给“哪些对象常见、哪些组合罕见”一个数学表达。课程默认我们能取得它的样本，却不能逐点算出 pdata(z)。",
          why: "如果只说“生成一张好图”，好坏没有统一目标；说“让输出像从 pdata 抽到的样本”，便能研究分布是否匹配。",
          example: "“一只狗”的分布应包含不同品种、姿态和背景。只输出同一张最典型的狗图并没有覆盖这个分布。",
          boundary: "网络图片集合只是 pdata 的有限代理，而且会带有选择偏差、重复和错误标注；数据多不自动等于真实世界分布。",
        },
        {
          name: "生成即采样",
          explanation:
            "生成器的目标是返回随机变量 Z，使 Z 的分布接近 pdata。Flow/Diffusion 的具体做法是先采 X0∼pinit（常用标准高斯），再通过一段动力学把它变成 X1。",
          why: "随机起点让同一个模型能输出多个合理答案；若所有请求都从同一点沿确定 ODE 出发，终点也只有一个。",
          example: "每次从不同高斯噪声出发，经过同一向量场，终点可成为不同的狗图；变化来自初始随机性，ODE 本身仍是确定的。",
          boundary: "“样本逼真”不等于“学到了真实密度的数值”。Flow Matching 可以只靠数据样本训练，而不显式计算 pdata(z)。",
        },
        {
          name: "条件生成",
          explanation:
            "加入提示 y 后，目标从 Z∼pdata 变成 Z∼pdata(·|y)。训练数据也从单独的 z 变为配对样本 (z,y)。",
          why: "用户通常不只要求“生成任意图片”，而是指定类别、文字提示、低分辨率输入或其他条件。",
          example: "y=“一只柯基犬”时，生成器应覆盖多种合理柯基图，而不是退化为数据集中某一张图。",
          boundary: "条件生成仍要保持多样性。把提示符合度推到最大可能牺牲多样性，这正是后面 CFG 权重的取舍。",
        },
      ],
      sections: [
        {
          title: "1.1 从主观评价到分布",
          intuition:
            "一张图没有唯一正确答案，分布才同时容纳“许多答案都对”和“有些答案更常见”。",
          paragraphs: [
            "原课用“生成一张狗的图片”开场。若把任务写成优化某个唯一目标，模型很容易只找一种代表性结果；把任务写成对 pdata 的采样，则每个高概率区域都应该获得相应的样本份额。",
            "注意，pdata 是建模假设，不是从互联网上下载后就能精确得到的函数。我们实际拿到的是 z1,…,zN∼pdata。训练算法必须只依赖这些样本或由样本构造出的监督信号。",
            "课堂录像补充：学生问如何定义生成的“新颖性”，讲师明确把它与分布匹配的主目标区分开；仅由 Z∼pdata 并不能给出一条完整的新颖性指标。这提醒我们不要把课程的形式化目标夸大成所有生成质量问题的答案。",
          ],
          formula: {
            latex: "z_1,\\ldots,z_N \\sim p_{\\mathrm{data}},\\qquad Z_{\\mathrm{model}}\\sim p_{\\mathrm{model}},\\quad p_{\\mathrm{model}}\\approx p_{\\mathrm{data}}",
            explanation:
              "左侧是训练时拥有的有限样本；右侧表示模型输出分布应接近数据分布。约等号需要用具体评估方法解释，不代表逐点密度相等。",
            symbols: [
              { symbol: "z_i", meaning: "第 i 个训练样本" },
              { symbol: "p_data", meaning: "未知的数据生成分布" },
              { symbol: "Z_model", meaning: "生成器输出的随机变量" },
            ],
          },
          example: {
            title: "手算一个两模态数据集",
            steps: [
              "设 pdata 只在 z=-2 与 z=2 上各放 1/2 的概率。",
              "总输出均值应为 0，但只检查均值会漏掉分布结构：永远输出 0 也有均值 0。",
              "因此生成建模关心整个分布，而不是一两个统计量。",
            ],
            result: "分布匹配比“平均结果正确”更强；这也是后续用双峰玩具数据检查采样器的原因。",
          },
          checks: ["若模型永远输出训练集均值，它是否完成了生成？为什么？"],
        },
        {
          title: "1.2 条件分布不是筛选后的单点",
          intuition: "条件 y 缩小了允许的样本集合，但通常不会把它缩成唯一答案。",
          paragraphs: [
            "有条件数据集由 (z,y) 对组成。对固定 y，pdata(z|y) 仍是一整个分布；训练时既要让图像与提示一致，也要覆盖条件内部的变化。",
            "课程先推无条件模型，再推广到条件模型。这个安排是为了减少记号，不表示真实系统可以忽略条件；Lecture 3-B 会把 y 放进向量场，并用 CFG 加强提示影响。",
          ],
          formula: {
            latex: "Z \\sim p_{\\mathrm{data}}(\\cdot\\mid y)",
            explanation: "点号表示被采样的对象位置，y 在一次生成中固定。",
            symbols: [
              { symbol: "Z", meaning: "生成的对象" },
              { symbol: "y", meaning: "文本、类别或其他条件" },
              { symbol: "p_data(·|y)", meaning: "给定条件后的数据分布" },
            ],
          },
          example: {
            title: "同一提示的三次生成",
            steps: [
              "固定 y=“雨中的红色自行车”。",
              "分别抽三个 X0∼N(0,I)。",
              "用相同的条件向量场处理三个起点，得到构图不同但都符合提示的终点。",
            ],
            result: "提示决定目标分布，初始噪声选择其中的具体样本。",
          },
        },
        {
          title: "1.3 从采样目标进入动力学",
          intuition: "直接从复杂 pdata 抽样很难，从高斯抽样很容易；模型要学习的是两者之间的运输。",
          paragraphs: [
            "设 pinit 是标准高斯。生成器先抽 X0∼pinit，再把 X0 逐步变成 X1。Flow model 用 ODE 做确定运输；diffusion model 用 SDE，在运输过程中继续注入随机性。",
            "本章只定义起点与终点。中间怎样移动、怎样训练向量场，分别是第 2、3 章的任务。不要在尚未定义概率路径时就把“加噪—去噪”当成唯一解释。",
          ],
          figures: [
            {
              title: "Flow model 的生成入口",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf#page=25",
              caption: "Lecture 1 第 25 页把随机初值、ODE 轨迹和最终样本画在同一张图上。这里引用它来对照本节的端点记号：随机性先来自 X0，向量场负责运输。",
              credit: "MIT IAP 2026 Lecture 1 slides（Peter Holderrieth、Ron Shprints）, p.25；PDF 远程页引用",
              kind: "pdf-page",
              page: 25,
            },
          ],
          formula: {
            latex: "X_0\\sim p_{\\mathrm{init}}=\\mathcal N(0,I_d),\\qquad X_1\\sim p_{\\mathrm{data}}",
            explanation: "这是模型要满足的端点条件；它还没有指定中间时刻 Xt 的分布。",
            symbols: [
              { symbol: "X_0", meaning: "容易采样的随机初值" },
              { symbol: "X_1", meaning: "生成的终点" },
              { symbol: "I_d", meaning: "d 维单位矩阵" },
            ],
          },
        },
      ],
      pitfalls: [
        "把数据集文件夹当成可逐点求值的 pdata",
        "用均值或单张代表图代替完整分布",
        "认为条件提示会唯一决定输出，忽略条件分布内部的多样性",
        "把“生成即采样”误解为已经解决真实性、偏见、版权和新颖性评估",
      ],
      exercises: [
        {
          question: "为什么一个总输出均值正确的模型仍可能完全失败？",
          answer: "均值只是一阶统计量。双峰数据 {-2,+2} 与恒定输出 0 都有均值 0，但后者没有覆盖任一真实模态。",
        },
        {
          question: "训练时不能计算 pdata(z)，Flow Matching 为什么仍有可能工作？",
          answer: "它只要求能从数据集采样 z，再构造可计算的条件路径与监督目标；无需逐点查询未知边缘密度。",
        },
      ],
      sources: [
        { title: "MIT 6.S184/6.S975 2026 课程主页", url: courseUrl, kind: "course", note: "Lecture 1 主题与先修要求" },
        { title: "课程讲义 §1: Generative Modeling As Sampling", url: notesUrl, kind: "notes", note: "对象表示、pdata、数据集与条件生成" },
        { title: "Lecture 1 slides, pp. 7–14", url: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf", kind: "slides", note: "狗图例子与 generation-as-sampling 总结" },
        { title: "Lecture 1 recording", url: "https://www.youtube.com/watch?v=9eJQQVrUUoI", kind: "video", note: "约 05:00–12:20；含新颖性与其他生成模型的课堂问答" },
        { title: "Holderrieth & Erives, arXiv:2506.02070", url: arxivUrl, kind: "paper", note: "课程讲义的可引用版本" },
      ],
    },
    {
      slug: "ode-sde-sampling",
      index: 2,
      title: "ODE、SDE 与数值采样",
      subtitle: "同一个噪声起点，怎样沿向量场走到数据",
      duration: "110 分钟",
      summary:
        "对应 Lecture 1 后半段与官方 Lab 1。用风场和羽毛建立 ODE 直觉，再加入 Brownian motion，手算 Euler 与 Euler–Maruyama。",
      objectives: [
        "区分向量场、ODE 轨迹和 flow map",
        "解释 Brownian 增量的方差与步长关系",
        "实现 Euler 和 Euler–Maruyama",
        "用 OU 过程理解 drift 与 diffusion 的竞争",
      ],
      prerequisites: ["导数与一阶微分方程", "高斯分布的均值和方差"],
      recordings: [
        {
          title: "Lecture 1: Flow and Diffusion Models",
          youtubeId: "9eJQQVrUUoI",
          note: "后半段：vector field、ODE flow、Euler、Brownian、SDE 与 OU；与第 1 章共用原课录像。",
        },
      ],
      concepts: [
        {
          name: "向量场与 ODE",
          explanation:
            "向量场 u_t(x) 为每个时间 t、位置 x 指定一个速度向量。ODE 要求轨迹 X_t 的瞬时速度等于当前位置的向量：dX_t/dt=u_t(X_t)。",
          why: "神经网络并不直接一次吐出最终图片；它预测当前状态下一小步该往哪里走。",
          example: "课堂把向量场比作天气图上的风，羽毛的运动轨迹就是跟随风场的 ODE 解。",
          boundary: "向量不只有方向，也有大小。课堂约 18 分钟专门纠正了“单位方向”的误解。",
        },
        {
          name: "Flow map",
          explanation:
            "给定同一向量场，flow ψ_t(x0) 同时描述所有初值 x0 在时间 t 的位置。单条轨迹固定一个 x0；flow 是把每个起点都映到对应终点的函数。",
          why: "生成时 X0 是随机变量。要谈整个初始分布如何被搬运，就需要看 ψ_t 对所有起点的作用。",
          example: "若 u_t(x)=-θx，则 ψ_t(x0)=e^{-θt}x0，所有点都指数收缩到 0。",
          boundary: "SDE 的未来还依赖新噪声，不能只用确定的 ψ_t(x0) 表示。",
        },
        {
          name: "Brownian motion 与 SDE",
          explanation:
            "SDE 在 drift u_t(X_t)dt 之外加入 σ_t dW_t。Brownian 增量 W_{t+h}-W_t 服从 N(0,hI)，因此标准差是 √h。",
          why: "它让动力学本身带随机性，并为 diffusion sampling、Langevin dynamics 和 Fokker–Planck 方程提供统一语言。",
          example: "同一个 X0 和同一个 drift，重复模拟两次会因每步噪声不同得到两条锯齿轨迹。",
          boundary: "dW_t 不是普通可微函数的 dt 倍数；把噪声写成 hσε 会得到错误方差。",
        },
        {
          name: "Euler 与 Euler–Maruyama",
          explanation:
            "Euler 用当前速度作局部直线近似；Euler–Maruyama 再加一个 √hσε。步长 h 越小通常离真实连续轨迹越近，但需要更多网络调用。",
          why: "训练完向量场仍不能直接得到样本，必须实际积分 ODE/SDE。数值误差是生成质量与推理成本的来源。",
          example: "1000 步 Brownian 模拟中若 h=0.001，每步噪声标准差约 0.0316σ，而不是 0.001σ。",
          boundary: "更小步长不修复错误的向量场；它只减少求解器离散误差。",
        },
      ],
      sections: [
        {
          title: "2.1 ODE：从局部速度到完整 flow",
          intuition: "站在 x 处只看一支箭头是局部信息；不断重查当前位置的箭头，才形成完整轨迹。",
          paragraphs: [
            "ODE 由初值与演化规则组成。课堂问答指出，初值不需要额外携带速度，因为一阶 ODE 在 t=0 已由 u_0(X_0) 给出速度；同时下一瞬间只依赖当前 x,t，因此这里的动力学具有 Markov 性。",
            "对 u_t(x)=-θx，验证 ψ_t(x0)=e^{-θt}x0 只需两步：先看 ψ_0(x0)=x0，再求导得到 dψ_t/dt=-θψ_t。这个例子会在 OU 过程中再次出现。",
          ],
          formula: {
            latex: "\\frac{dX_t}{dt}=u_t(X_t),\\quad X_0=x_0;\\qquad \\psi_t(x_0)=e^{-\\theta t}x_0\\;\\text{ when }u_t(x)=-\\theta x",
            explanation: "ψ 是 ODE 对所有初始条件的解映射；第二式是线性向量场的解析解。",
            symbols: [
              { symbol: "u_t(x)", meaning: "时间相关的速度向量场" },
              { symbol: "X_t", meaning: "一条轨迹在 t 时的位置" },
              { symbol: "ψ_t", meaning: "把初值映到 t 时刻位置的 flow" },
              { symbol: "θ", meaning: "向原点收缩的强度" },
            ],
          },
          example: {
            title: "两步 Euler 手算",
            steps: [
              "令 x0=2、θ=0.5、h=0.25。",
              "第一步 x0.25=2+0.25×(-0.5×2)=1.75。",
              "第二步 x0.5=1.75+0.25×(-0.5×1.75)=1.53125。",
              "解析值 2e^-0.25≈1.5576；误差来自把弯曲轨迹分段近似成直线。",
            ],
            result: "减小 h 会降低这个例子的全局离散误差，但增加向量场求值次数。",
          },
        },
        {
          title: "2.2 SDE：随机项为什么是 √h",
          intuition: "独立小噪声累加时方差相加；要让总方差与总时间成正比，每步标准差就必须是 √h。",
          paragraphs: [
            "Brownian motion 满足独立增量和 W_{t+h}-W_t∼N(0,hI)。若走 n=1/h 步，每步方差 h，总方差 n×h=1。若错误使用 hε，总方差会变成 n h²=h，步长越小反而越没有噪声。",
            "Euler–Maruyama 只是 SDE 的最简单模拟器。它让每一步包含可预测的 drift 和不可预测的 Gaussian increment；这与“先给 ODE 终点加一次噪声”不是同一过程。",
          ],
          formula: {
            latex: "X_{t+h}=X_t+h u_t(X_t)+\\sqrt{h}\\,\\sigma_t\\epsilon_t,\\qquad \\epsilon_t\\sim\\mathcal N(0,I_d)",
            explanation: "前两项是 Euler drift，第三项匹配 Brownian 增量的 h 方差。",
            symbols: [
              { symbol: "h", meaning: "数值步长" },
              { symbol: "σ_t", meaning: "diffusion coefficient，控制噪声幅度" },
              { symbol: "ε_t", meaning: "每一步独立的标准高斯噪声" },
            ],
          },
          example: {
            title: "检查方差尺度",
            steps: [
              "取总时长 1、h=0.01，因此走 100 步。",
              "每步噪声方差为 hσ²=0.01σ²。",
              "100 个独立增量相加，终点方差约为 100×0.01σ²=σ²。",
            ],
            result: "这正好复现 W_1∼N(0,I)；代码实验用 20,000 条轨迹检查该结论。",
          },
          figures: [
            {
              title: "Euler–Maruyama 的一步更新",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf#page=31",
              caption: "Lecture 1 第 31 页把 drift 步与方差为 h 的随机增量分开画出。对照正文时，重点看随机项的尺度是 √h，而不是 h。",
              credit: "MIT IAP 2026 Lecture 1 slides（Peter Holderrieth、Ron Shprints）, p.31；PDF 远程页引用",
              kind: "pdf-page",
              page: 31,
            },
          ],
        },
        {
          title: "2.3 OU 过程：拉回与扩散的平衡",
          intuition: "drift 像橡皮筋把点拉回原点，diffusion 像持续抖动把点推散。",
          paragraphs: [
            "Ornstein–Uhlenbeck 过程令 u_t(x)=-θx、σ_t=σ。θ 越大，回拉越强；σ 越大，扩散越强。长时间后它趋向均值 0、方差 σ²/(2θ) 的高斯。",
            "官方 Lab 1 不只画单条轨迹，还比较许多终点的直方图。这个区分很重要：SDE 的轨迹可以很乱，但我们最终关心的是各时刻的边缘分布。",
          ],
          formula: {
            latex: "dX_t=-\\theta X_t\\,dt+\\sigma\\,dW_t,\\qquad X_t\\xrightarrow[t\\to\\infty]{d}\\mathcal N\\left(0,\\frac{\\sigma^2}{2\\theta}\\right)",
            explanation: "箭头上的 d 表示依分布收敛；有限时间不等于已经到稳态。",
            symbols: [
              { symbol: "θ", meaning: "均值回归强度，要求 θ>0" },
              { symbol: "σ", meaning: "常数噪声强度" },
            ],
          },
          checks: ["固定 σ²/(2θ) 时同时增大 σ 和 θ，会改变稳态分布还是收敛速度？"],
        },
        {
          title: "2.4 用微分方程做生成",
          intuition: "随机性可放在起点，也可同时放在演化过程；两者都能定义生成器。",
          paragraphs: [
            "Flow model 令 X0∼pinit 并模拟 dX_t=u_t^θ(X_t)dt；diffusion model 再给定 σ_t 并模拟 SDE。两者的共同目标是 X1∼pdata。神经网络参数化的是向量场，不是已经求好的 flow。",
            "这一章只说明怎样从一个已知向量场采样。下一章才回答最关键的问题：怎样从只有样本的数据集学习正确的边缘向量场。",
          ],
        },
      ],
      lab: {
        title: "Lab 1 对齐实验：ODE、SDE、OU 与 Langevin",
        goal: "在一份 NumPy 脚本里走完官方 Lab 1 的五个机制检查，不需要 GPU。",
        file: "/labs/diffusion-flow/lab1_ode_sde_complete.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab1_ode_sde_complete.py。",
          "先比较线性 ODE 的 Euler 终点与解析解，再检查 Brownian 终点方差 σ²T。",
          "比较 OU 过程有限时刻的经验均值、方差与解析公式。",
          "让 Langevin dynamics 从偏置初值靠近已知高斯目标，并验证高斯上的 Langevin drift 等于 OU drift。",
        ],
        expected: ["Euler 误差小于 0.002", "Brownian 与 OU 的经验矩匹配理论值", "Langevin 的均值误差明显下降", "最后打印 PASS"],
        sourceNote: "结构对齐官方 Lab 1 的 Euler、Euler–Maruyama、Brownian、OU 与 Langevin。本站用 NumPy 批量模拟并加自动断言；轨迹绘图和 PyTorch 版本仍以官方 starter/solution 为准。",
      },
      pitfalls: [
        "把向量场误称为只含方向的单位向量",
        "认为神经网络直接参数化 flow map，而非需要积分的 vector field",
        "在 Euler–Maruyama 中把随机项写成 hσε",
        "只看几条随机轨迹就判断分布是否正确",
        "认为步长变小可以消除模型训练误差",
      ],
      exercises: [
        { question: "ODE 与 SDE 的随机性分别可以来自哪里？", answer: "ODE 通常只由随机初值 X0 带来随机性；SDE 除随机初值外，每个时间增量还包含 Brownian 随机项。" },
        { question: "h 从 0.01 减到 0.0025，单步 Brownian 噪声标准差变成原来的多少？", answer: "√(0.0025/0.01)=1/2；不是 1/4。" },
        { question: "σ=0 时 Euler–Maruyama 与 Euler 有何关系？", answer: "随机项消失，两者更新式相同；ODE 可视为 diffusion coefficient 为零的 SDE 特例。" },
      ],
      sources: [
        { title: "课程讲义 §2: Flow and Diffusion Models", url: notesUrl, kind: "notes", note: "ODE/SDE 定义、Euler、Euler–Maruyama、OU 过程与采样算法" },
        { title: "Lecture 1 slides, pp. 16–34", url: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf", kind: "slides", note: "flow、数值步进、Brownian 与 OU 图示" },
        { title: "Lecture 1 recording", url: "https://www.youtube.com/watch?v=9eJQQVrUUoI", kind: "video", note: "约 13:30 起；风场/羽毛直觉及 18:10–19:20 的课堂问答" },
        { title: "Official Lab 1: Simulating ODEs and SDEs", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_one.ipynb", kind: "assignment", note: "Euler、Euler–Maruyama、Brownian、OU、Langevin" },
        { title: "Official Lab 1 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_one_complete.ipynb", kind: "code", note: "官方 PyTorch 参考实现" },
        { title: "本站前置检查：Euler 与 Brownian 方差", url: "/labs/diffusion-flow/ode_sde_euler.py", kind: "code", note: "综合 Lab 1 前的短脚本；用于单独核对步长与 √h 噪声。" },
      ],
    },
    {
      slug: "flow-matching",
      index: 3,
      title: "概率路径与 Flow Matching",
      subtitle: "把不可见的边缘向量场，变成可采样的监督学习目标",
      duration: "150 分钟",
      summary:
        "对应 Lecture 2 与讲义第 3 节。依次建立条件/边缘概率路径、条件/边缘向量场、continuity equation 和 conditional flow matching loss。",
      objectives: [
        "区分概率路径快照和单个粒子的动力学轨迹",
        "推导高斯条件路径的条件向量场",
        "用 posterior 加权解释 marginalization trick",
        "写出可直接采样训练的 CFM 算法",
      ],
      prerequisites: ["第 1–2 章", "Bayes 公式", "期望与条件期望"],
      recordings: [
        {
          title: "Lecture 2: Flow Matching",
          youtubeId: "PNkMKWW8Khw",
          note: "完整推导 conditional/marginal path 与 vector field、continuity equation 和 CFM；含 posterior 加权口头直觉。",
        },
      ],
      concepts: [
        {
          name: "条件概率路径",
          explanation:
            "对每个数据点 z，p_t(x|z) 是从 pinit 到 δ_z 的一族分布：t=0 是噪声，t=1 收缩到 z。它回答每个时刻“总体长什么样”。",
          why: "只规定 X0 和 X1 不足以给每个中间时刻的训练样本；路径给出任意 t 的加噪样本 x。",
          example: "高斯路径 p_t(·|z)=N(α_t z,β_t²I)，可用 x=α_tz+β_tε 直接采样。",
          boundary: "slides 特别强调：概率路径只规定 marginals，不规定同一个粒子怎样从前一帧走到后一帧。",
        },
        {
          name: "边缘概率路径",
          explanation:
            "先抽 z∼pdata，再抽 x∼p_t(·|z)，忘掉 z 后得到 p_t(x)。它从 pinit 连到整个 pdata，而不是某一个 z。",
          why: "真正的生成器要覆盖数据分布，不能只是把噪声压到已知训练样本。",
          example: "若 pdata 有左右两个簇，两个条件路径分别向各自 z 收缩；混合所有 z 后，边缘路径逐渐显出双峰。",
          boundary: "我们能从 p_t 采样，却通常不能计算积分 p_t(x)=∫p_t(x|z)pdata(z)dz。",
        },
        {
          name: "条件与边缘向量场",
          explanation:
            "u_t^target(x|z) 让 ODE 的分布跟随条件路径；u_t^target(x) 是在给定当前 x 后，对所有可能 z 的条件速度做 posterior 加权平均。",
          why: "条件场有解析监督，边缘场才是能生成新样本的场。marginalization trick 把两者连接起来。",
          example: "当前位置更像由右侧数据点加噪得到时，posterior 给右侧速度更大权重；位于两个模态中间时，两个方向会折中。",
          boundary: "直接运行固定 z 的条件场只会重建已知 z，本身不是生成模型。",
        },
        {
          name: "Continuity equation",
          explanation:
            "∂_t p_t=-div(p_tu_t) 表示某处概率密度的变化等于概率质量的净流入。它是判断向量场是否跟随指定概率路径的条件。",
          why: "marginalization trick 的证明靠它把每个 z 的条件流守恒关系积分起来。",
          example: "若一个区域边界上流入多于流出，该区域密度增加；负散度正对应净流入。",
          boundary: "这是分布层面的偏微分方程，不是单条样本轨迹的 ODE。SDE 情况还会多一个 Laplacian 扩散项。",
        },
        {
          name: "Conditional Flow Matching",
          explanation:
            "训练时抽 z、t、ε，构造 x_t，再让网络 u_t^θ(x_t) 回归可计算的条件速度。尽管目标含 z，网络输入通常只有 x_t,t，因此最优回归结果是条件期望，也就是边缘场。",
          why: "未知边缘场和 pdata 密度都无法直接监督，而条件速度可以解析计算。",
          example: "直线路径 α_t=t、β_t=1-t 时，x_t=tz+(1-t)ε，目标速度恒为 z-ε。",
          boundary: "“两个 loss 梯度相同”是在期望与相应正则条件下的理论结论；有限数据、有限网络和优化误差仍会影响结果。",
        },
      ],
      sections: [
        {
          title: "3.1 先选分布的路径",
          intuition: "把从噪声到数据想成一叠时间切片；先规定每片应有的分布，再寻找产生这些切片的动力学。",
          paragraphs: [
            "条件路径满足 p_0(·|z)=pinit、p_1(·|z)=δ_z。Dirac δ_z 的含义很简单：从它采样永远得到 z。对数据点再做边缘化，便得到 p_0=pinit、p_1=pdata。",
            "课堂录像把这个路径称为设计选择：不同 α_t、β_t 可以连接同样的端点。课程最常用 Gaussian CondOT 路径，因为样本和条件速度都有解析式。",
            "不要把 slide 中相邻时间的散点连成“真实粒子轨迹”。同一组边缘分布可以由不同 ODE/SDE 动力学生成；路径只管快照。",
          ],
          formula: {
            latex: "p_t(\\cdot\\mid z)=\\mathcal N(\\alpha_tz,\\beta_t^2I),\\qquad x_t=\\alpha_tz+\\beta_t\\epsilon,\\;\\epsilon\\sim\\mathcal N(0,I)",
            explanation: "α 控制数据成分，β 控制噪声标准差；边界取 α0=0、β0=1、α1=1、β1=0。",
            symbols: [
              { symbol: "z", meaning: "数据样本" },
              { symbol: "ε", meaning: "独立标准高斯噪声" },
              { symbol: "α_t, β_t", meaning: "随时间变化的 signal/noise schedule" },
              { symbol: "δ_z", meaning: "全部质量集中在 z 的 Dirac 分布" },
            ],
          },
          example: {
            title: "直线路径上的三个快照",
            steps: [
              "取 z=3、ε=-1、α_t=t、β_t=1-t。",
              "t=0 时 x=-1，只剩噪声。",
              "t=0.25 时 x=0；t=0.75 时 x=2。",
              "t=1 时 x=3，落到数据点。",
            ],
            result: "这是一条由同一 ε 耦合出的直线轨迹；概率路径本身只要求每个 t 的分布正确，并不强制采用这种耦合。",
          },
        },
        {
          title: "3.2 从路径导出条件速度",
          intuition: "若已经写出 x_t 怎样随 t 变化，对它求导就是沿这条耦合轨迹的速度。",
          paragraphs: [
            "对 x_t=α_tz+β_tε 求导，得到 α̇_tz+β̇_tε。训练时我们持有 z、ε，所以这就是最方便的监督目标。若希望把它写成只含当前 x 和 z 的函数，用 ε=(x-α_tz)/β_t 代回。",
            "课堂明确说不用死记通式；重要的是知道它是 x 与 z 的时间相关线性组合，并且是后续训练目标。直线路径更简单：α̇=1、β̇=-1，因此目标为 z-ε。",
          ],
          formula: {
            latex: "u_t^{\\mathrm{target}}(x\\mid z)=\\left(\\dot\\alpha_t-\\frac{\\dot\\beta_t}{\\beta_t}\\alpha_t\\right)z+\\frac{\\dot\\beta_t}{\\beta_t}x",
            explanation: "将 x=α_tz+β_tε 对 t 求导，并消去 ε 后得到；β_t=0 的端点要用极限或避免直接代入。",
            symbols: [
              { symbol: "α̇_t, β̇_t", meaning: "schedule 对时间的导数" },
              { symbol: "u_target(x|z)", meaning: "跟随条件路径的条件向量场" },
            ],
          },
          example: {
            title: "用有限差分核对训练目标",
            steps: [
              "仍取 z=3、ε=-1，直线路径速度应为 4。",
              "计算 [x(t+h)-x(t)]/h。",
              "因为 x(t)=4t-1，任意非零 h 都精确得到 4。",
            ],
            result: "实验脚本把解析速度、有限差分和端点条件放在同一组断言里。",
          },
        },
        {
          title: "3.3 Marginalization trick 与守恒",
          intuition: "当前 noisy x 不知道最终属于哪个 z，就对所有可能终点的速度按“它来自该 z 的概率”求平均。",
          paragraphs: [
            "权重 p_t(x|z)pdata(z)/p_t(x) 正是 Bayes posterior p(z|x_t=x)。因此边缘场可写成 E[u_t(x|Z)|X_t=x]。课堂用“站在 x，看所有可能来源，再按相信程度平均方向”解释这一步。",
            "continuity equation 证明这个平均场产生的边缘分布恰好是 p_t。关键不是每个样本追随原先配对的 z，而是整体概率质量在每个时间切片正确。",
          ],
          formula: {
            latex: "u_t^{\\mathrm{target}}(x)=\\int u_t^{\\mathrm{target}}(x\\mid z)\\,\\frac{p_t(x\\mid z)p_{\\mathrm{data}}(z)}{p_t(x)}\\,dz=\\mathbb E[u_t(x\\mid Z)\\mid X_t=x]",
            explanation: "积分中的分数是 posterior；它把可知的条件场变成未知但真正需要的边缘场。",
            symbols: [
              { symbol: "p_t(x)", meaning: "对数据 z 边缘化后的路径密度" },
              { symbol: "p(z|x_t)", meaning: "给定当前 noisy x 的终点 posterior" },
            ],
          },
          checks: ["为什么固定 z 的条件场不能直接用作无条件生成器？"],
        },
        {
          title: "3.4 CFM loss：看得见的目标训练看不见的场",
          intuition: "平方损失下，不能看到 z 的网络会学会对所有可能 z 的目标取条件平均。",
          paragraphs: [
            "理想 FM loss 直接回归边缘场，但边缘场涉及不可计算的 posterior。CFM 改为回归条件场：抽 z∼pdata、t∼Unif[0,1]、x∼p_t(·|z)，计算平方误差。",
            "讲义定理给出 L_FM=L_CFM+C，其中 C 与 θ 无关，所以梯度相同。训练完成后，从高斯抽 X0，用网络向量场积分到 t=1 即可生成。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{CFM}}(\\theta)=\\mathbb E_{z,t,x}\\left[\\lVert u_t^\\theta(x)-u_t^{\\mathrm{target}}(x\\mid z)\\rVert^2\\right]",
            explanation: "直线 CondOT 时可用 x=tz+(1-t)ε、target=z-ε 完全由采样得到一条训练记录。",
            symbols: [
              { symbol: "θ", meaning: "神经网络参数" },
              { symbol: "t∼Unif[0,1]", meaning: "均匀抽取训练时间" },
              { symbol: "C", meaning: "不影响 θ 梯度的常数差" },
            ],
          },
          figures: [
            {
              title: "Gaussian path 的 CFM 训练式",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260122_Lecture_02.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260122_Lecture_02.pdf#page=25",
              caption: "Lecture 2 第 25 页把抽噪声、构造 x_t 和条件向量场目标压成一条训练式。正文把这一页拆回四个随机变量，便于逐项核对实现。",
              credit: "MIT IAP 2026 Lecture 2 slides（Peter Holderrieth、Ron Shprints）, p.25；PDF 远程页引用",
              kind: "pdf-page",
              page: 25,
            },
          ],
        },
      ],
      lab: {
        title: "Lab 2 对齐实验：二维 GMM 的 Flow 与 Score",
        goal: "在二维双峰数据上训练两个小回归器，并分别执行 ODE、同边缘 SDE 与任意 source 的 linear bridge。",
        file: "/labs/diffusion-flow/lab2_gmm_flow_score.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab2_gmm_flow_score.py。",
          "比较 CFM 与 score 回归器拟合前后的验证 MSE。",
          "从高斯起点积分 ODE，检查样本是否靠近两个 GMM 模态；再加入 score correction 与 Brownian noise 模拟 SDE。",
          "把 source 换成均匀分布，核对 linear bridge 的端点和有限差分速度。",
        ],
        expected: ["CFM 与 score 验证 MSE 都下降", "ODE 样本更接近双峰中心", "ODE/SDE 样本保持有限", "最后打印 PASS"],
        sourceNote: "结构对齐官方 Lab 2 的二维 GMM、CFM/score trainer、ODE/SDE extension 和 arbitrary-source linear path。轻量脚本只拟合随机特征的末层；完整 MLP、可视化和训练循环见官方 notebook。",
      },
      pitfalls: [
        "把概率路径的快照当作已经指定了唯一的粒子轨迹",
        "认为能从 p_t 采样就一定能计算 p_t(x)",
        "直接用固定 z 的条件场生成，结果只能收缩到已知数据点",
        "在 β_t=0 的端点直接除以 β_t",
        "只背高斯条件向量场通式，不理解它来自对 x_t 求导",
      ],
      exercises: [
        { question: "直线路径为何得到 u_target=z-ε？", answer: "x_t=tz+(1-t)ε；对 t 求导得 z-ε，与 t 无关。" },
        { question: "marginal vector field 的 posterior 权重表达什么？", answer: "给定当前 noisy 状态 x 后，它衡量每个数据点 z 是潜在终点/来源的相对可信度。" },
        { question: "CFM 网络没收到 z，为何不会只复现条件场？", answer: "对固定 x,t，平方损失最优预测是所有可能 z 条件目标的平均，即边缘向量场。" },
      ],
      sources: [
        { title: "课程讲义 §3: Flow Matching", url: notesUrl, kind: "notes", note: "条件/边缘路径、marginalization trick、continuity equation 与 CFM 定理" },
        { title: "Lecture 2 slides", url: "https://diffusion.csail.mit.edu/2026/docs/20260122_Lecture_02.pdf", kind: "slides", note: "Flow Matching matrix、路径快照警告、Gaussian/CondOT 图示" },
        { title: "Lecture 2 recording", url: "https://www.youtube.com/watch?v=PNkMKWW8Khw", kind: "video", note: "约 15:30–32:00；含未知 pdata、条件场用途与 posterior 加权直觉" },
        { title: "Official Lab 2: Flow Matching and Score Matching", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_two.ipynb", kind: "assignment", note: "二维 GMM、Gaussian/linear paths、训练与采样" },
        { title: "Official Lab 2 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_two_complete.ipynb", kind: "code", note: "官方 PyTorch 参考实现" },
        { title: "本站前置检查：一维 Conditional Flow Matching", url: "/labs/diffusion-flow/conditional_flow_matching.py", kind: "code", note: "综合二维 GMM 实验前，先核对路径端点、速度与边缘方差。" },
      ],
    },
    {
      slug: "score-matching-sde",
      index: 4,
      title: "Score Matching 与 SDE 扩展",
      subtitle: "同一条概率路径，为什么既能确定地走，也能随机地走",
      duration: "150 分钟",
      summary:
        "对应 Lecture 3-A 与讲义第 4 节。先把 score 当作密度上坡方向，再推 DSM、Fokker–Planck 和保持同一边缘路径的 SDE family。",
      objectives: [
        "计算高斯 score 并解释方向",
        "说明边缘 score 为什么也可用条件目标学习",
        "从 Fokker–Planck 看清 noise 与 score correction 的配对",
        "区分理论等价的 SDE family 与实践误差",
      ],
      prerequisites: ["第 3 章", "log 的梯度", "散度与 Laplacian 的基本直觉"],
      recordings: [
        {
          title: "Lecture 3-A: Score Functions and Score Matching",
          youtubeId: "ngC3QnYSVNM",
          note: "score/DSM、Fokker–Planck 与 SDE sampling；含 noise 推散、score 拉回和理论/实践误差讨论。",
        },
      ],
      concepts: [
        {
          name: "Score function",
          explanation:
            "分布 q 的 score 是 ∇_x log q(x)。它不告诉你密度绝对值，却告诉当前位置往哪个方向移动会最快进入更高密度区域。",
          why: "对 Gaussian probability path，score 与 vector field 都是 x,z 的线性函数，可以互相转换；早期 diffusion 模型常直接学习 score 或 noise。",
          example: "一维 N(μ,σ²) 的 score 为 -(x-μ)/σ²；x 在 μ 右边时 score 为负，指回均值。",
          boundary: "score 为零只表示局部驻点，不保证该点是全局最高密度；多峰分布中会有多个吸引区和鞍点。",
        },
        {
          name: "Denoising Score Matching",
          explanation:
            "未知边缘 score ∇log p_t(x) 无法直接算，但条件 score ∇log p_t(x|z) 对高斯路径有解析式。回归条件 score 与回归边缘 score 的 loss 只差 θ 无关常数。",
          why: "它把密度梯度学习变成“从带噪 x 预测加入的噪声/干净数据”的监督问题。",
          example: "x=α_tz+β_tε 时，条件 score=-ε/β_t；乘上 β_t 后，网络相当于预测 -ε。",
          boundary: "β_t 接近 0 时 1/β_t 会数值不稳，因此实际实现常改成 noise、denoiser 或 velocity parameterization 并配权重。",
        },
        {
          name: "Fokker–Planck equation",
          explanation:
            "它描述 SDE 的边缘密度如何变化：drift 搬运概率质量，Laplacian 项让概率质量扩散。σ=0 时退化为 continuity equation。",
          why: "仅给 ODE 加噪会改变 p_t；Fokker–Planck 精确告诉我们应补哪一个 drift correction 才保持原路径。",
          example: "各向同性噪声向所有方向摊开密度，score correction 把质量推回高密度区；课堂称它们是一对抵消的作用。",
          boundary: "方程保证的是理想连续时间边缘分布；有限网络与离散求解器并不自动满足。",
        },
        {
          name: "SDE extension trick",
          explanation:
            "在已知边缘场 u_t 和 score 后，可任选 σ_t≥0，使用 drift u_t+(σ_t²/2)∇log p_t 并加入 σ_tdW_t，理论上仍跟随相同 p_t。",
          why: "训练一次后得到一族 deterministic/stochastic samplers，可按任务与数值表现选择噪声强度。",
          example: "σ_t=0 回到原 ODE；σ_t>0 时轨迹更锯齿，但正确 correction 让每个时间的总体直方图不变。",
          boundary: "课堂强调“理论都相同、实践会不同”：训练误差与数值误差使 σ 的选择需要实测，SDE 不是必然优于 ODE。",
        },
      ],
      sections: [
        {
          title: "4.1 Score 是 log-density 的上坡方向",
          intuition: "不知道山的绝对海拔，仍可根据坡度往山顶走；score 就是概率地形的坡度。",
          paragraphs: [
            "直接对 q(x) 求梯度会受密度尺度影响；对 log q 求梯度得到 ∇q/q，更适合表达相对变化。Gaussian score 的分母 σ²说明分布越窄，同样偏离均值时回拉越强。",
            "和 vector field 一样，条件 score 可边缘化为 E[∇log p_t(x|Z)|X_t=x]。因此 Flow Matching 的 posterior averaging 结构在 Score Matching 中原样出现。",
          ],
          formula: {
            latex: "s_t(x\\mid z)=\\nabla_x\\log p_t(x\\mid z)=-\\frac{x-\\alpha_tz}{\\beta_t^2}",
            explanation: "这是均值 α_tz、协方差 β_t²I 的高斯对 x 的 log-density 梯度。",
            symbols: [
              { symbol: "s_t", meaning: "score function 或 score network 的目标" },
              { symbol: "∇_x", meaning: "只对当前状态 x 求梯度" },
              { symbol: "β_t²", meaning: "条件高斯的方差" },
            ],
          },
          example: {
            title: "一维 score 手算",
            steps: [
              "令 q=N(0.5,0.8²)，在 x=1.2 处。",
              "x-μ=0.7，σ²=0.64。",
              "score=-0.7/0.64=-1.09375。",
            ],
            result: "负号表示应向左走回高密度区；配套脚本用 log-density 有限差分核对这个数值。",
          },
        },
        {
          title: "4.2 DSM：用已知腐化过程做监督",
          intuition: "不知道混合后总体密度的坡度，但知道某张干净图是怎样被高斯噪声腐化的。",
          paragraphs: [
            "Score Matching 的理想目标是边缘 score；conditional/denoising score matching 改用条件 score。证明与 CFM 相同：二者平方 loss 只差与 θ 无关的条件方差项。",
            "对 Gaussian path，代入 x=α_tz+β_tε 后，score target=-ε/β_t。若直接回归它，t 接近数据端时 β_t→0 会放大数值；讲义因此解释了 ε-prediction 和其他重参数化的来源。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{DSM}}(\\theta)=\\mathbb E\\left[\\left\\lVert s_t^\\theta(x)+\\frac{x-\\alpha_tz}{\\beta_t^2}\\right\\rVert^2\\right]",
            explanation: "负号已包含在 target 中；括号为预测减 target。实际实现往往乘时间权重避免低噪声端爆炸。",
            symbols: [
              { symbol: "s_t^θ(x)", meaning: "网络预测的边缘 score" },
              { symbol: "z", meaning: "干净数据" },
              { symbol: "x", meaning: "按条件路径腐化后的样本" },
            ],
          },
          checks: ["当 β_t=0.01 时，固定 ε 的 score target 会放大多少？这说明什么？"],
        },
        {
          title: "4.3 加噪不能只加一半",
          intuition: "noise 把质量均匀推散；若要保留原来的 p_t，必须同时加入沿 score 的回推。",
          paragraphs: [
            "Fokker–Planck 中的 (σ²/2)Δp 是扩散。把 correction (σ²/2)∇log p 加进 drift 后，-div[p(σ²/2)∇log p] 恰好抵消扩散项，因为 p∇log p=∇p。剩余部分就是原 ODE 的 continuity equation。",
            "课堂口头补充把 score correction 描述为“噪声把样本推离 data manifold，score 把它推回”。这是直觉，不是说真实数据严格位于一张已知流形上；数学依据仍是 Fokker–Planck 恒等式。",
          ],
          formula: {
            latex: "dX_t=\\left[u_t(X_t)+\\frac{\\sigma_t^2}{2}\\nabla\\log p_t(X_t)\\right]dt+\\sigma_t\\,dW_t",
            explanation: "对任意合适的 σ_t，这个 SDE 与原 u_t ODE 具有相同的边缘概率路径 p_t。",
            symbols: [
              { symbol: "u_t", meaning: "原先跟随 p_t 的边缘向量场" },
              { symbol: "σ_t²/2 score", meaning: "抵消扩散所需的 drift correction" },
              { symbol: "dW_t", meaning: "Brownian 随机增量" },
            ],
          },
          example: {
            title: "从 ODE 到一族 sampler",
            steps: [
              "选 σ_t=0，得到 deterministic flow sampler。",
              "选常数 σ>0，在每步加入 √hσε。",
              "同时把 (σ²/2)score 加进 drift；若漏掉它，边缘分布会被额外摊平。",
              "分别减小步长比较结果，区分模型误差和求解误差。",
            ],
            result: "理论上的同路径不代表有限步实现完全相同；slides 明确指出 ODE sampling 往往已经很好，SDE 是选项而非必需。",
          },
          figures: [
            {
              title: "Fokker–Planck 方程的两种质量变化",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf#page=16",
              caption: "Lecture 3 第 16 页并列 drift 造成的净流入和 diffusion 造成的摊平。正文中的 score correction 正是为了抵消后者。",
              credit: "MIT IAP 2026 Lecture 3 slides（Peter Holderrieth、Ron Shprints）, p.16；PDF 远程页引用",
              kind: "pdf-page",
              page: 16,
            },
          ],
        },
        {
          title: "4.4 时间约定与文献翻译",
          intuition: "有些论文从数据往噪声计时，有些课程从噪声往数据计时；方向相反不一定算法相反。",
          paragraphs: [
            "本课采用 flow-time：t=0 是噪声、t=1 是数据。传统 diffusion 文献常取 t=0 为数据，随 t 增大而加噪，再在采样时逆时间。阅读公式前必须先写清端点。",
            "Lecture 3 slides 把 DDIM 类比 probability-flow ODE，把 score-based SDE、flow matching、rectified flow 与 stochastic interpolants 放到同一概率路径视角。这里是概念对应，不应把所有离散算法的每个更新式说成完全相同。",
          ],
        },
      ],
      lab: {
        title: "实验：训练 score 并组成同边缘 SDE",
        goal: "在二维 GMM 上实际拟合 score，再把它放进 drift correction；不是只检查一个解析高斯。",
        file: "/labs/diffusion-flow/lab2_gmm_flow_score.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab2_gmm_flow_score.py。",
          "找到 score_target=-x0/(1-t) 的构造，并说明它来自哪条 Gaussian conditional path。",
          "核对 SDE drift=u+(σ²/2)s 与 √hσε 两项同时出现。",
          "将 sigma 暂设为 0，确认采样器退化成 ODE 更新，再恢复。",
        ],
        expected: ["score 验证 MSE 低于零预测基线", "SDE 样本为有限值且横向方差大于 1.3", "最后打印 PASS"],
        sourceNote: "对应官方 Lab 2 的 score trainer 与 SDE extension。本站是 CPU 机制实验，不替代官方 PyTorch 网络与图形评估。",
      },
      pitfalls: [
        "把 score 当成密度值而不是 log-density 梯度",
        "忽略 β_t→0 时 raw score target 的数值问题",
        "给 ODE 加噪却漏掉 score drift correction",
        "把理想 SDE family 的同边缘结论当成有限步数值结果相同",
        "阅读论文时不检查 data/noise 的时间方向",
      ],
      exercises: [
        { question: "N(μ,σ²) 在 x=μ 时 score 是多少？能推出什么？", answer: "score 为 0，只能推出这是 log-density 的驻点；对单峰高斯它也是峰值，但一般分布不能仅凭 score=0 判定全局最大。" },
        { question: "SDE extension 中为何 correction 系数是 σ²/2？", answer: "Fokker–Planck 的扩散项系数是 σ²/2；利用 p∇log p=∇p，该 drift 产生的散度项正好抵消它。" },
        { question: "σ=0 时还需要 score network 吗？", answer: "若直接持有边缘 vector field 做 ODE sampling，不需要额外 score；Gaussian path 下两者可线性转换。" },
      ],
      sources: [
        { title: "课程讲义 §4: Score Functions and Score Matching", url: notesUrl, kind: "notes", note: "score、转换公式、SDE extension、Fokker–Planck、DSM" },
        { title: "Lecture 3 slides, pp. 6–22", url: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf", kind: "slides", note: "Gaussian score、DSM、SDE sampling 与实践误差" },
        { title: "Lecture 3-A recording", url: "https://www.youtube.com/watch?v=ngC3QnYSVNM", kind: "video", note: "约 20:00–29:00；含 SDE family、噪声/score 直觉及理论与实践差异" },
        { title: "Official Lab 2", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_two.ipynb", kind: "assignment", note: "conditional score、SDE extension 与 Langevin flow" },
        { title: "Official Lab 2 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_two_complete.ipynb", kind: "code", note: "2026 分支含 diffusion coefficient 修正" },
        { title: "本站前置检查：Gaussian score 与 CFG 系数", url: "/labs/diffusion-flow/score_and_cfg.py", kind: "code", note: "用标量有限差分和边界条件隔离检查两个易错公式。" },
      ],
    },
    {
      slug: "classifier-free-guidance",
      index: 5,
      title: "Guidance 与 Classifier-Free Guidance",
      subtitle: "让模型更听提示，也看清它偏离了什么",
      duration: "110 分钟",
      summary:
        "对应 Lecture 3-B 与讲义第 5 节。从 vanilla conditional generation 出发，经 Bayes 分解得到 classifier guidance，再消去额外 classifier，推到 CFG。",
      objectives: [
        "写出 guided CFM 的训练样本构造",
        "从 Bayes 公式推导 classifier guidance",
        "解释 label dropout 如何让一个网络兼顾有条件与无条件场",
        "说明 guidance scale 大于 1 时为何是启发式外推",
      ],
      prerequisites: ["第 3–4 章", "Bayes 公式", "条件 score"],
      recordings: [
        {
          title: "Lecture 3-B: Classifier-Free Guidance",
          youtubeId: "8oWZ1bHwyRI",
          note: "从 vanilla guidance 到 classifier/CFG；含为何不单训 noisy classifier、schedule 是否依赖 prompt、CFG 公式现场修正等课堂问答。",
        },
      ],
      concepts: [
        {
          name: "Vanilla guided generation",
          explanation:
            "把 y 输入网络，训练 u_t^θ(x|y) 回归与 z 对应的条件速度。数据加载器现在采 (z,y)，但 Gaussian corruption path 通常仍只由 z,t 决定。",
          why: "这是最直接的条件 Flow Matching：学习每个提示下的 pdata(·|y)，不额外改动采样公式。",
          example: "MNIST 中 y 是数字类别；训练记录包含带噪图 x_t、时间 t 和标签 y，目标仍是 z-ε。",
          boundary: "课堂问答指出路径原则上也可依赖 y，只是常见实践不这样做；不能把“不依赖 prompt”说成数学必要条件。",
        },
        {
          name: "Classifier guidance",
          explanation:
            "Bayes 给出 guided score=unconditional score+∇log p_t(y|x)。将后一个“分类器梯度”乘 w>1，便强化提示相关方向。",
          why: "朴素条件模型可能因欠拟合或配对数据噪声而不够贴合提示，额外梯度能推高 p(y|x)。",
          example: "若 unconditional 方向偏向常见狗图，classifier 梯度会把当前 noisy image 推向更像“柯基”的区域。",
          boundary: "分类器必须能处理各噪声等级的 x_t；普通干净图分类器不能直接替代，而且文本 y 使 p(y|x) 更难建模。",
        },
        {
          name: "Classifier-free guidance",
          explanation:
            "同一网络既预测有条件场 u(x|y)，也通过空条件 ∅ 预测无条件场 u(x|∅)。推理时用 (1-w)u_empty+w u_cond 外推。",
          why: "它实现与 classifier guidance 相同的代数强化效果，却不用维护第二个 noisy classifier。",
          example: "训练时以概率 η 把原标签换成 ∅；推理时一次批量前向可同时算 conditional/unconditional 预测再组合。",
          boundary: "“classifier-free”不是不使用条件，而是不单独训练 classifier。通常仍需两份预测或等价批处理，计算并非免费。",
        },
        {
          name: "Guidance scale w",
          explanation:
            "w=1 返回原条件场；w>1 沿 u_cond-u_empty 继续走，增强提示影响；w=0 则只用无条件场。",
          why: "它提供提示符合度与自然度/多样性之间可调的推理旋钮。",
          example: "u_empty=-0.25、u_cond=0.75 时，w=1 得 0.75，w=3 得 2.75，已经越过条件预测而非在两者之间插值。",
          boundary: "slides 明确写出：w≠1 时不再精确建模原数据分布。大 w 可能导致过饱和、伪影与多样性降低。",
        },
      ],
      sections: [
        {
          title: "5.1 先训练一个真正的条件场",
          intuition: "条件模型首先要学会“给定 y 时往哪里走”，CFG 不是替代这一步的魔法。",
          paragraphs: [
            "训练样本改为 (z,y)∼pdata(z,y)，再抽 t、ε，构造 x_t。条件网络收到 x_t,t,y，回归和无条件 CFM 相同的 target。y 改变网络应取的边缘平均，却不一定改变对单个 z 的 corruption path。",
            "课堂有人问为何条件向量场 target 本身不依赖 prompt。回答是：常见做法让 noising schedule 与 prompt 无关，因为给定完整 z 后 target 已确定；原则上可以设计 prompt-dependent schedule，但不是主流设置。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{guided\\ CFM}}=\\mathbb E_{(z,y),t,x}\\left[\\lVert u_t^\\theta(x\\mid y)-u_t^{\\mathrm{target}}(x\\mid z)\\rVert^2\\right]",
            explanation: "y 出现在网络输入和数据联合分布中；target 对给定 z 的 Gaussian path 可不显式依赖 y。",
            symbols: [
              { symbol: "(z,y)", meaning: "数据对象与其提示/标签配对" },
              { symbol: "u^θ(x|y)", meaning: "待学习的 guided marginal vector field" },
            ],
          },
        },
        {
          title: "5.2 从 Bayes 到 classifier guidance",
          intuition: "条件方向=一般自然图方向+让标签更可信的方向；放大后一项就是 guidance。",
          paragraphs: [
            "由 p_t(x|y)=p_t(x)p_t(y|x)/p_t(y)，对 x 求 log 梯度时 p_t(y) 消失。Gaussian path 下 vector field 与 score 线性可换，因此 guided vector field 也能拆成 unconditional field 与 classifier gradient。",
            "课堂重点解释 classifier guidance 的两项代价：需要另训一个覆盖 noisy x_t 的分类器；若 y 是长文本，分类似然及其对 x 的梯度都难处理。CFG 的动机正是去掉这个额外模型。",
          ],
          formula: {
            latex: "\\nabla_x\\log p_t(x\\mid y)=\\nabla_x\\log p_t(x)+\\nabla_x\\log p_t(y\\mid x)",
            explanation: "第二项是对 noisy x 的 classifier log-likelihood 梯度；乘 w>1 会人为强化提示。",
            symbols: [
              { symbol: "p_t(y|x)", meaning: "在噪声级 t 下由 x 预测条件 y 的 classifier" },
              { symbol: "w", meaning: "guidance scale" },
            ],
          },
          example: {
            title: "为什么不能直接拿 ImageNet classifier",
            steps: [
              "生成早期 x_t 接近高斯噪声，和干净 ImageNet 图不同。",
              "classifier gradient 必须在这些 noisy states 上仍有意义。",
              "因此需要按所有 t 训练噪声条件 classifier，额外增加模型与维护成本。",
            ],
            result: "CFG 用同一生成网络的 conditional/unconditional 差代替显式 classifier gradient。",
          },
        },
        {
          title: "5.3 CFG 的代数、训练和推理",
          intuition: "先从 empty prompt 走到 conditional prediction，再沿这条差向量继续外推。",
          paragraphs: [
            "利用上一节 Bayes 分解与 Gaussian vector/score 转换，可把 classifier-guided field 化为 (1-w)u(x)+wu(x|y)。把无条件分支写成 u(x|∅)，就只需一个支持空条件的网络。",
            "训练时以概率 η 做 label dropout：把 y 换成 ∅，但 target 不变。推理时分别求 u_cond 与 u_empty，再组合。这里最常见的 bug 是把系数写成 w u_empty+(1-w)u_cond，方向完全颠倒。",
            "课堂录像推导时讲师现场改正了板书中的系数。本站采用讲义最终公式，并把这段口头修正当作审式提醒：实现应测试 w=1 必须精确返回 conditional prediction。",
          ],
          formula: {
            latex: "\\tilde u_t(x\\mid y)=(1-w)u_t(x\\mid\\varnothing)+w u_t(x\\mid y)=u_t(x\\mid\\varnothing)+w[u_t(x\\mid y)-u_t(x\\mid\\varnothing)]",
            explanation: "两个写法完全相同。w=1 是 conditional，w>1 是 extrapolation。",
            symbols: [
              { symbol: "∅", meaning: "训练中显式使用的空条件 token" },
              { symbol: "η", meaning: "训练时丢弃原条件的概率" },
              { symbol: "ũ_t", meaning: "CFG 强化后的采样向量场" },
            ],
          },
          example: {
            title: "三个权重的含义",
            steps: [
              "给定 u_empty=-0.25、u_cond=0.75。",
              "w=0 得 -0.25：纯无条件。",
              "w=1 得 0.75：原条件模型。",
              "w=3 得 -0.25+3×1=2.75：越过条件预测继续强化。",
            ],
            result: "w>1 不是 convex combination；它可能提升提示一致性，也可能离开训练数据支持。",
          },
          figures: [
            {
              title: "Classifier-Free Guidance 的采样组合",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf#page=33",
              caption: "Lecture 3 第 33 页给出推理时的加权向量场。正文保留两种等价写法，用 w=1 检查 conditional 与 unconditional 的系数是否写反。",
              credit: "MIT IAP 2026 Lecture 3 slides（Peter Holderrieth、Ron Shprints）, p.33；PDF 远程页引用",
              kind: "pdf-page",
              page: 33,
            },
          ],
        },
        {
          title: "5.4 CFG 的统计边界",
          intuition: "更像提示不等于更像真实数据；guidance 主动改变了采样目标。",
          paragraphs: [
            "w=1 时，在理想建模与精确求解条件下，guided field 对应 pdata(·|y)。w≠1 时 ũ 不再是真实 guided vector field；原课称其为由经验效果支持的 heuristic。",
            "因此评估不能只看 prompt score。还应观察多样性、伪影、颜色饱和、失败类别，并记录 solver、步数和 w。把单个漂亮样本当作 CFG 参数证据是不充分的。",
          ],
          checks: ["为什么 w=4 的输出更像标签，也不能说它更接近 pdata(x|y)？"],
        },
      ],
      lab: {
        title: "Lab 3 前半：label dropout 与条件网络入口",
        goal: "先验证空标签真的按指定概率进入训练批次，再检查 time Fourier encoding 和 CFG 所需的条件接口。",
        file: "/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py。",
          "检查 10,000 个标签中约 20% 被换成 null label，未丢弃标签保持不变。",
          "核对 time Fourier encoding 的输出 shape；它是网络条件入口，不是 CFG 权重本身。",
          "CFG 标量组合仍可用保留的 score_and_cfg.py 单独核对 w=1 与外推方向。",
        ],
        expected: ["label dropout 率在 0.18–0.22", "Fourier shape 为 [3,16]", "最后打印 PASS"],
        sourceNote: "结构对齐官方 Lab 3 的 labeled sampler、null class 与 classifier-free trainer。完整 MNIST 条件训练和双分支采样见官方 starter/solution。",
      },
      pitfalls: [
        "把 classifier-free 误解成模型不使用条件",
        "把 w>1 当作两预测之间的插值",
        "交换 conditional 与 unconditional 的系数",
        "训练时未做 label dropout，却在推理时调用空条件分支",
        "声称 CFG 仍精确采样原条件数据分布",
      ],
      exercises: [
        { question: "为何 CFG 通常仍需 conditional 与 unconditional 两次预测？", answer: "组合式需要 u(x|y) 和 u(x|∅) 两个值；它们可在一次批量前向中并行算，但信息上两支都不可少。" },
        { question: "w=1 与 w=0 分别是什么？", answer: "w=1 是原条件场；w=0 是空条件/无条件场。" },
        { question: "label dropout 的 target 是否也要清空？", answer: "不需要。只把条件 y 替换为 ∅，同一 noisy x 的条件速度 target 仍由 z、ε、t 决定。" },
      ],
      sources: [
        { title: "课程讲义 §5: Guidance", url: notesUrl, kind: "notes", note: "vanilla guidance、Bayes 推导、CFG 训练与采样公式" },
        { title: "Lecture 3 slides, pp. 23–37", url: "https://diffusion.csail.mit.edu/2026/docs/20260123_Lecture_03.pdf", kind: "slides", note: "Corgi 例子、CFG 权重图、heuristic 边界" },
        { title: "Lecture 3-B recording", url: "https://www.youtube.com/watch?v=8oWZ1bHwyRI", kind: "video", note: "约 06:00–26:00；classifier 代价、CFG 推导、课堂问答与板书修正" },
        { title: "Official Lab 3: Conditional Image Model", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_three.ipynb", kind: "assignment", note: "label dropout、CFG、MNIST 条件采样" },
        { title: "Official Lab 3 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_three_complete.ipynb", kind: "code", note: "2026 分支含 guidance embedding dimension 与 label sampling 修正" },
      ],
    },
    {
      slug: "latent-vae",
      index: 6,
      title: "潜空间与 VAE",
      subtitle: "为什么现代图像生成器不直接在百万维像素上反复积分",
      duration: "120 分钟",
      summary:
        "对应 Lecture 4 前半段与讲义 §6.2。先看像素空间的代价，再从普通 autoencoder 的分布问题推到 VAE 和 latent diffusion recipe。",
      objectives: [
        "核算像素空间与 latent 空间的维度/内存差别",
        "解释 reconstruction loss 为何不约束 latent distribution",
        "写出 VAE 的 reconstruction 与 prior 两项",
        "串起 encode → latent generation → decode 的完整流程",
      ],
      prerequisites: ["神经网络编码器/解码器", "KL divergence", "第 1–5 章"],
      recordings: [
        {
          title: "Lecture 4: Latent Spaces and Neural Network Architectures",
          youtubeId: "g0MB1CCBmsI",
          note: "前半段讲高维反复调用的成本、AE 的 latent 分布问题、VAE 两项损失与信息损失问答；后半段对应下一章。",
        },
      ],
      concepts: [
        {
          name: "Latent space",
          explanation:
            "encoder E 把高维对象 x 压缩为较小的 z，decoder D 再把 z 还原为 x。生成模型改为学习 latent 数据集 {E(x_i)} 的分布。",
          why: "高分辨率图像的向量场输出极大，而且采样要反复调用网络；压缩能同时降低单次调用与序列长度成本。",
          example: "slides 给出 [3,256,256]→[4,32,32]，标量数从 196,608 降到 4,096，即 48 倍。",
          boundary: "维度低不自动表示语义好；encoder 可能丢细节或让 latent 分布破碎难学。",
        },
        {
          name: "Autoencoder reconstruction",
          explanation:
            "普通 AE 训练 D(E(x))≈x，确保单个输入能重建。这个目标只约束配对重建，不规定所有 E(x) 在 latent 空间怎样分布。",
          why: "diffusion/flow 要从简单分布生成新的 latent；若训练 latent 是彼此隔离的小岛，中间区域解码可能无意义。",
          example: "两个相近图像可以被 encoder 放到很远位置，只要 decoder 各自记住返回路径，reconstruction loss 仍很小。",
          boundary: "重建误差低不能推出 latent 易采样；反过来，过强正则也可能损害重建。",
        },
        {
          name: "Variational autoencoder",
          explanation:
            "VAE encoder 输出分布 q_φ(z|x)，常用对角高斯的 μ,σ；训练同时优化 reconstruction NLL 和 KL[q_φ(z|x)||p(z)]。",
          why: "KL 项把每个后验拉向简单 prior，使聚合后的 latent 更规则，便于在其中训练生成模型。",
          example: "用 z=μ+σε 的 reparameterization，把随机采样写成对 μ,σ 可反向传播的确定函数加外部噪声。",
          boundary: "KL 只是软约束，不保证聚合 posterior 完全等于 prior；β 太大还可能导致 posterior collapse。",
        },
        {
          name: "Latent diffusion recipe",
          explanation:
            "先训练或取得 autoencoder，冻结它并编码全数据；再在 latent 上训练 flow/diffusion；采样 latent 后只在最后 decode 一次。",
          why: "把昂贵的多步生成放进小空间，解码高分辨率图像只做一次。",
          example: "Stable Diffusion 系列在预训练 autoencoder 的 latent 中做 Flow/Diffusion，而不是每步预测整张 RGB 图。",
          boundary: "最终质量上限还受 autoencoder 限制；生成模型无法恢复 encoder 永久丢掉的信息。",
        },
      ],
      sections: [
        {
          title: "6.1 为什么像素空间太贵",
          intuition: "分类器看一次高维图；diffusion sampler 要在同样的高维空间看几十次，因此代价被放大。",
          paragraphs: [
            "slides 用 3×600×1000=180 万维说明高分辨率输入。存下 x 只是第一笔开销；网络还要输出同形状向量场、保留 attention/feature maps 的中间激活，并重复求值约 50–100 次。",
            "课堂口头追问“为什么监督学习没这么突出”：分类器通常只前向一次并输出小标签，而生成 sampler 多次输出高维对象。这个比较是动机说明，实际成本仍取决于架构、分辨率和 solver。",
          ],
          formula: {
            latex: "d_{\\mathrm{pixel}}=C H W,\\qquad d_{\\mathrm{latent}}=C_z H_z W_z",
            explanation: "先计算标量数量，再讨论 dtype、batch、activation 和 attention，避免只用“分辨率低很多”含糊描述。",
            symbols: [
              { symbol: "C,H,W", meaning: "像素图的通道、高、宽" },
              { symbol: "C_z,H_z,W_z", meaning: "latent tensor 的通道、高、宽" },
            ],
          },
          example: {
            title: "Stable Diffusion slides 的形状算术",
            steps: [
              "像素张量 [3,256,256] 含 196,608 个标量。",
              "latent [4,32,32] 含 4,096 个标量。",
              "标量数比例为 196,608/4,096=48。",
              "这不是端到端速度必然提升 48 倍，因为模型通道、attention 和 decoder 另有成本。",
            ],
            result: "形状给出可核对的压缩量，但不能直接冒充 wall-clock speedup。",
          },
        },
        {
          title: "6.2 普通 AE 的缺口：只重建，不塑造分布",
          intuition: "地图能把每个地址来回翻译，不代表地址之间排得整齐。",
          paragraphs: [
            "普通 AE 最小化 ||D(E(x))-x||²。只要 decoder 能从每个编码恢复原图，编码点可以形成孔洞、细丝或相隔很远的簇；在这些 latent 上插值或从简单 prior 抽样可能落到未训练区域。",
            "Lecture 4 的课堂问答明确把“压缩会损失多少信息”留作经验问题：由数据、容量、loss 和压缩率共同决定，不能仅从公式保证。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{AE}}=\\mathbb E_x\\lVert D_\\theta(E_\\phi(x))-x\\rVert^2",
            explanation: "该式约束每个样本的重建，没有 p(z) 或 latent density 项。",
            symbols: [
              { symbol: "E_φ", meaning: "encoder" },
              { symbol: "D_θ", meaning: "decoder" },
            ],
          },
          checks: ["AE reconstruction loss 很低，为什么仍不能直接从 N(0,I) 抽 z 解码？"],
        },
        {
          title: "6.3 VAE：在重建与规则 latent 之间权衡",
          intuition: "每个样本不再占一个孤立坐标，而是占一个可重叠的小高斯邻域，并被轻推向共同 prior。",
          paragraphs: [
            "VAE 令 q_φ(z|x)=N(μ_φ(x),diag σ_φ²(x))，从中采 z，再最大化 p_θ(x|z) 的 likelihood。KL 项衡量后验与 p(z)=N(0,I) 的差异。",
            "reparameterization z=μ+σ⊙ε 把随机性移到 ε∼N(0,I)，因此对 μ、σ 的梯度仍可通过 z 传播。实践常把 log variance 作为网络输出并限制数值范围。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{VAE}}=\\mathbb E_{q_\\phi(z\\mid x)}[-\\log p_\\theta(x\\mid z)]+\\beta\\,D_{KL}(q_\\phi(z\\mid x)\\Vert\\mathcal N(0,I))",
            explanation: "第一项保真，第二项整形 latent；β 控制二者权衡。",
            symbols: [
              { symbol: "q_φ(z|x)", meaning: "encoder 给出的近似后验" },
              { symbol: "p_θ(x|z)", meaning: "decoder likelihood" },
              { symbol: "β", meaning: "prior regularization 权重" },
            ],
          },
          example: {
            title: "KL 项在一维的含义",
            steps: [
              "若 q=N(μ,σ²)、p=N(0,1)，KL=0.5(μ²+σ²-logσ²-1)。",
              "μ 偏离 0 会由 μ² 惩罚。",
              "σ 太小或太大都会被 σ²-logσ²-1 惩罚，最小值在 σ=1。",
            ],
            result: "KL 同时限制后验中心和尺度；把它解释成“让均值接近零”会漏掉方差项。",
          },
        },
        {
          title: "6.4 Latent generator 的五步闭环",
          intuition: "autoencoder 改变训练数据的坐标系，Flow/Diffusion 算法本身原样运行。",
          paragraphs: [
            "原 slides 的 recipe 是：收集 x_i；编码为 z_i；把 z_i 当新数据集；在 z 空间训练 generative model；采样 z 后 decode。通常生成模型训练期间冻结 autoencoder，避免 latent 坐标系漂移。",
            "这条链中必须分别评估 reconstruction 与 generation。前者隔离 autoencoder 上限，后者评估 latent model；只看最终图无法判断错误来自哪一段。",
          ],
          figures: [
            {
              title: "Latent diffusion 的训练与生成闭环",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf#page=18",
              caption: "Lecture 4 第 18 页列出 encode、latent 建模和 decode 的顺序。正文引用它来区分 autoencoder 重建误差与 latent generator 误差。",
              credit: "MIT IAP 2026 Lecture 4 slides（Peter Holderrieth、Ron Shprints）, p.18；PDF 远程页引用",
              kind: "pdf-page",
              page: 18,
            },
          ],
        },
      ],
      lab: {
        title: "Lab 3 后半：VAE 与 latent CFM smoke test",
        goal: "运行 reparameterization、KL、reconstruction 与一次 latent CFM 参数更新，确认各项能接成闭环。",
        file: "/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py。",
          "找到 z=μ+exp(logvar/2)ε，并核对逐样本 KL 非负。",
          "检查 reconstruction MSE 只是在随机 smoke test 中为有限值，不把它当成训练质量。",
          "观察 latent CFM 单步更新前后 MSE；它验证梯度链路，不声称已经生成 MNIST。",
        ],
        expected: ["VAE latent shape 与 μ 相同", "KL 非负且 reconstruction MSE 有限", "latent CFM 单步 MSE 下降", "最后打印 PASS"],
        sourceNote: "对应官方 Lab 3 的 VAE、latent data 与 latent diffusion trainer。本站不下载 MNIST，也不训练卷积 VAE；完整模型和可视化必须运行官方 PyTorch notebook。",
      },
      pitfalls: [
        "把标量压缩比例直接说成端到端加速比例",
        "认为 AE reconstruction 好就能从任意 latent 采样",
        "把 VAE KL 说成保证 aggregated posterior 精确为标准高斯",
        "忽略 autoencoder 的信息损失和生成质量上限",
        "联合训练时不记录 encoder 是否冻结，导致数据坐标系不断变化",
      ],
      exercises: [
        { question: "为什么 diffusion 对高维输出比分类更敏感？", answer: "它通常要多次调用网络，并且每次输出与当前图/latent 同形状的向量场；分类一般只前向一次并输出小标签向量。" },
        { question: "VAE 的两项 loss 各管什么？", answer: "reconstruction/NLL 保留输入信息；KL 让每个后验接近共同 prior，改善 latent 的可建模性。" },
        { question: "最终图模糊，怎样先区分 VAE 与 diffusion 的责任？", answer: "先对真实图做 encode-decode reconstruction；若已经模糊，瓶颈在 autoencoder，否则再检查 latent generator。" },
      ],
      sources: [
        { title: "课程讲义 §6.2: Working in Latent Space", url: notesUrl, kind: "notes", note: "AE、VAE、ELBO/KL、latent generation recipe" },
        { title: "Lecture 4 slides, pp. 2–18", url: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf", kind: "slides", note: "180 万维例子、AE 缺口、VAE 与 latent shape" },
        { title: "Lecture 4 recording", url: "https://www.youtube.com/watch?v=g0MB1CCBmsI", kind: "video", note: "约 02:30–58:00；前半讲 latent/VAE，约 56 分钟处讨论压缩的信息损失" },
        { title: "Official Lab 3", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_three.ipynb", kind: "assignment", note: "MNIST VAE、latent diffusion 与 image-valued conditional path" },
        { title: "本站前置检查：latent 与 patch shape", url: "/labs/diffusion-flow/latent_patch_shapes.py", kind: "code", note: "综合 DiT/VAE smoke test 前，先验证压缩比例与 patch round trip。" },
      ],
    },
    {
      slug: "unet-dit-architectures",
      index: 7,
      title: "U-Net、DiT 与条件编码",
      subtitle: "把 x、t、prompt 变成一个同形状的向量场预测",
      duration: "150 分钟",
      summary:
        "对应 Lecture 4 后半段与讲义 §6.1、§6.3。按原课顺序处理 time/prompt embedding、patchify、attention、DiT/U-Net，再回看 Stable Diffusion 3 与 Movie Gen。",
      objectives: [
        "核对 vector field 网络的输入输出 contract",
        "计算 patch token 数和 hidden shape",
        "区分 self-attention、cross-attention 与 time AdaLN",
        "比较 U-Net 与 DiT 的结构偏置",
      ],
      prerequisites: ["第 6 章", "矩阵乘法与 softmax", "Transformer 基础"],
      recordings: [
        {
          title: "Lecture 4: Latent Spaces and Neural Network Architectures",
          youtubeId: "g0MB1CCBmsI",
          note: "后半段讲 time/text embedding、patchification、DiT block、U-Net 和大模型案例；与第 6 章共用原课录像。",
        },
      ],
      concepts: [
        {
          name: "Vector-field network contract",
          explanation:
            "u_t^θ(x|y) 输入当前 noisy image/latent x、标量时间 t 和条件 y，输出与 x 完全同形状的速度或等价参数化。",
          why: "求解器要执行 x←x+h u；形状不一致就无法逐元素更新。",
          example: "输入 latent [B,4,32,32]，最终 unpatchify 后输出也必须是 [B,4,32,32]。",
          boundary: "网络内部 hidden width 可以更大；“同形状”只约束模型外部 contract。",
        },
        {
          name: "Time 与 prompt embedding",
          explanation:
            "一维 t 先经 sinusoidal/MLP 变成 d 维 time embedding；文字 y 常由 CLIP、T5 或 LLM encoder 变成 S 个 d 维 token。",
          why: "同一个 x 在不同噪声级需要不同预测；prompt token 则告诉网络向哪一类条件分布运输。",
          example: "time embedding 可控制 AdaLN 的 scale/shift/gate；text tokens 作为 cross-attention 的 keys/values。",
          boundary: "特定 sinusoidal 频率不是核心定理；核心是 t 必须可区分并进入每层计算。",
        },
        {
          name: "Patchify 与 DiT",
          explanation:
            "把 C×H×W 图像按 P×P 切成 N=(H/P)(W/P) 个 token，每个原始 token 有 CP² 个值，再线性映射到 hidden dimension d。",
          why: "Transformer 接收序列而不是二维像素网格；patchification 在两种表示之间搭桥。",
          example: "[4,32,32] latent、P=2 会得到 16×16=256 个 token，每个 patch 原始维度 4×4=16。",
          boundary: "patch 越小 token 越多，self-attention 的 N² 成本越高；patch 越大则可能损失局部细节。",
        },
        {
          name: "Self-/cross-attention 与 AdaLN",
          explanation:
            "self-attention 令 image tokens 互相通信；cross-attention 让 image queries 读取 prompt keys/values；time embedding 常经 adaptive normalization 调制层。",
          why: "三条通道分别处理空间/全局图像关系、语义条件和噪声时间。",
          example: "DiT block 先更新图像自身，再读取文本，最后过 MLP；每个 residual branch 可由 time 产生的 gate 缩放。",
          boundary: "具体顺序、是否显式 cross-attention、是否 joint attention 因模型而异；这里是课程给出的通用设计。",
        },
        {
          name: "U-Net",
          explanation:
            "U-Net 用多尺度 encoder、mid block 和 decoder，skip connections 把高分辨率细节从下采样端送到上采样端。输入输出天然是 image-shaped tensor。",
          why: "卷积的局部性与多尺度结构很适合图像向量场，也是早期 diffusion 的主流骨干。",
          example: "讲义示例把 [3,256,256] 编到 [512,32,32] 再解码，skip features 帮助恢复空间细节。",
          boundary: "现代 U-Net 常混入 attention；“U-Net vs Transformer”不是卷积与 attention 完全互斥。",
        },
      ],
      sections: [
        {
          title: "7.1 三种输入，一个同形状输出",
          intuition: "x 告诉模型现在在哪里，t 告诉模型处于哪一段运输，y 告诉模型目的地属于什么条件。",
          paragraphs: [
            "原课先固定接口 u_t^θ(x|y): R^d×[0,1]×Y→R^d，再讨论架构。time 虽只有一维，却不能直接被深层网络忽略，因此通常升维并注入多个 block。",
            "文本 prompt 不是一个类别整数，而是长度 S 的 embedding 序列。课程列出 CLIP、T5 与 LLM embeddings；使用哪一种属于系统设计，不改变 Flow Matching loss 的数学形式。",
          ],
          formula: {
            latex: "u_\\theta:\\mathbb R^{C\\times H\\times W}\\times[0,1]\\times\\mathbb R^{S\\times d}\\to\\mathbb R^{C\\times H\\times W}",
            explanation: "外部输入输出 contract；实际模型往往在 latent C_z×H_z×W_z 中运行。",
            symbols: [
              { symbol: "S", meaning: "prompt token 序列长度" },
              { symbol: "d", meaning: "模型 hidden dimension" },
              { symbol: "C,H,W", meaning: "当前 image/latent 的形状" },
            ],
          },
        },
        {
          title: "7.2 Patchify 后的 shape ledger",
          intuition: "切 patch 只是重排，线性 projection 才把原始 patch 值变成模型 token。",
          paragraphs: [
            "对 P 能整除 H,W 的情况，Patchify(x)∈R^{N×C′}，其中 C′=CP²、N=(H/P)(W/P)。再乘 W∈R^{C′×d} 得 N×d token。最后模型输出经线性层回到 C′ 并 unpatchify。",
            "先做可逆 patchify 检查能发现轴顺序、token 排列和 off-by-one 错误。官方 Lab 3 使用 einops 处理 b c h w；本站脚本用二维列表把同一形状账本显式化。",
          ],
          formula: {
            latex: "N=\\frac HP\\frac WP,\\qquad C'=CP^2,\\qquad \\mathrm{PatchEmb}(x)\\in\\mathbb R^{N\\times d}",
            explanation: "batch 维省略；若 H 或 W 不能整除 P，需要 padding/cropping 规则。",
            symbols: [
              { symbol: "P", meaning: "patch 边长" },
              { symbol: "N", meaning: "image token 数" },
              { symbol: "C′", meaning: "每个未投影 patch 的标量数" },
            ],
          },
          example: {
            title: "[4,32,32] latent 的两种 patch",
            steps: [
              "P=2：N=16×16=256，C′=4×4=16。",
              "P=4：N=8×8=64，C′=4×16=64。",
              "两者重排前后总标量数都为 4096。",
              "但 self-attention pair 数从 256² 降到 64²，即 16 倍差距。",
            ],
            result: "patch 大小改变计算图与局部信息粒度，不改变未投影时的总数据量。",
          },
        },
        {
          title: "7.3 DiT block：三条信息怎样汇合",
          intuition: "图像 token 先彼此交流，再读取文本；time 不占一个普通 token，而是调制每层处理方式。",
          paragraphs: [
            "scaled dot-product attention 计算 softmax(QKᵀ/√d_h)V。self-attention 中 Q,K,V 都来自 x；cross-attention 中 Q 来自图像、K,V 来自 prompt。多头结果拼接后再投影。",
            "AdaLN 由 time embedding 产生 γ,β，对 normalized x 做 (1+γ)⊙Norm(x)+β；实现还可生成 residual gates。类别条件的简化 DiT 可能把 class embedding 与 time 合并，而不使用显式 cross-attention。",
          ],
          formula: {
            latex: "\\mathrm{Attention}(Q,K,V)=\\mathrm{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d_h}}\\right)V",
            explanation: "除以 √d_h 控制 logits 尺度；softmax 对 key 维归一化。",
            symbols: [
              { symbol: "Q", meaning: "每个 image token 发出的查询" },
              { symbol: "K,V", meaning: "被查询的图像或文本表示" },
              { symbol: "d_h", meaning: "单个 attention head 的维度" },
            ],
          },
          checks: ["cross-attention 中若把 prompt 放在 Q、image 放在 K,V，输出序列长度会跟谁一致？"],
        },
        {
          title: "7.4 U-Net、DiT 与原课案例",
          intuition: "两种骨干都在实现同一个 vector-field contract，差别是内部如何组织空间和条件信息。",
          paragraphs: [
            "U-Net 用卷积、多尺度和 skip connection；DiT 用 patch sequence 和 attention。选择不是由 Flow Matching 定理决定，而由规模、分辨率、数据与工程预算决定。",
            "原讲义以 Stable Diffusion 3 说明 latent Flow Matching、CFG、MM-DiT 与多种 text embeddings 的组合；以 Movie Gen 说明把 autoencoder、patchification 和 attention 扩展到时间维。这里保留课程案例用于识别组件，不把论文中的规模数字当作永久产品规格。",
            "slides 的关键学习法是“实现一个 transformer 最容易理解”。官方 Lab 3 在 MNIST 上实现 conditional DiT，先用 GMM sanity check 条件采样，再进入 32×32 图像。",
          ],
          figures: [
            {
              title: "DiT 的输入、block 与 unpatchify",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf#page=26",
              caption: "Lecture 4 第 26 页画出 image tokens、time/prompt 条件、Transformer blocks 与 unpatchify。它对应本章反复检查的输入输出 contract。",
              credit: "MIT IAP 2026 Lecture 4 slides（Peter Holderrieth、Ron Shprints）, p.26；PDF 远程页引用",
              kind: "pdf-page",
              page: 26,
            },
          ],
        },
      ],
      lab: {
        title: "Lab 3 中段：从 patch 到 AdaLN-gated DiT",
        goal: "在 NumPy 中逐项核对 patch/depatch、attention 和带门控 AdaLN block 的 forward contract。",
        file: "/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py。",
          "核对 [2,3,8,8] 经 P=2 得 [2,16,12]，再无损 depatchify。",
          "检查每个 attention query 的权重和为 1。",
          "把两个 residual gate 置零时 block 必须成为 identity；恢复 gate 后输出 shape 仍与输入一致。",
        ],
        expected: ["patch round trip 完全相等", "attention 行和为 1", "zero-gate block 是 identity", "最后打印 PASS"],
        sourceNote: "结构对齐官方 Lab 3 的 Fourier encoder、patchifier、MHA、AdaLN-gated DiT 与 depatchifier。本站只做 forward smoke test；完整 MNIST DiT 训练见官方 notebook。",
      },
      pitfalls: [
        "忘记 vector field 输出必须与 x 同形状",
        "混淆 patch 原始维度 C′ 与 transformer hidden dimension d",
        "在 cross-attention 中颠倒 query/source，导致输出序列长度不符",
        "把 time 当普通常量，只在网络入口拼一次后被深层忽略",
        "把课程通用 DiT block 误称为所有工业模型的固定结构",
      ],
      exercises: [
        { question: "[8,64,64] latent 用 P=4，token 数和原始 patch 维度是多少？", answer: "N=(64/4)²=256；C′=8×4²=128。" },
        { question: "self-attention 与 cross-attention 的 K,V 分别来自哪里？", answer: "self-attention 的 Q,K,V 都来自 image tokens；cross-attention 的 Q 来自 image，K,V 来自 prompt/source tokens。" },
        { question: "为什么 DiT 最终需要 unpatchify？", answer: "求解器需要与 x 同形状的 vector field；Transformer 输出是 token 序列，必须投影回每 patch 的值并按空间位置还原。" },
      ],
      sources: [
        { title: "课程讲义 §6.1 and §6.3", url: notesUrl, kind: "notes", note: "conditioning embeddings、DiT、U-Net、Stable Diffusion 3 与 Movie Gen" },
        { title: "Lecture 4 slides, pp. 19–39", url: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf", kind: "slides", note: "time/text encoding、patchify、DiT block、案例" },
        { title: "Lecture 4 recording", url: "https://www.youtube.com/watch?v=g0MB1CCBmsI", kind: "video", note: "后半段；网络 contract、attention 与实现说明" },
        { title: "Official Lab 3", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_three.ipynb", kind: "assignment", note: "MNIST conditional DiT、AdaLN、CFG sampling" },
        { title: "Official Lab 3 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_three_complete.ipynb", kind: "code", note: "完整 PyTorch DiT 参考实现" },
      ],
    },
    {
      slug: "discrete-ctmc",
      index: 8,
      title: "离散 Diffusion 与 CTMC",
      subtitle: "连续空间的运输思想，怎样改写为 token 跳转",
      duration: "150 分钟",
      summary:
        "对应 Lecture 5 与讲义第 7 节。明确离散 diffusion 没有 ODE/SDE，再以 CTMC、rate matrix、KFE、离散边缘化和 masked language model 串起训练与采样。",
      objectives: [
        "解释 rate matrix 的对角线与非对角线",
        "用 Kolmogorov forward equation 推进离散概率",
        "对比连续 vector field 与离散 transition rates",
        "说明离散 FM 为什么化为逐 token cross-entropy",
      ],
      prerequisites: ["Markov chain", "分类交叉熵", "第 3 章的 conditional/marginal 结构"],
      recordings: [
        {
          title: "Lecture 5: Discrete Diffusion Models and Discrete Flow Matching",
          youtubeId: "d0kmyEJN2hI",
          note: "CTMC、rate matrix、factorized path、KFE、posterior network、masked diffusion，以及和 autoregressive 模型的课堂讨论。",
        },
      ],
      concepts: [
        {
          name: "Continuous-time Markov chain",
          explanation:
            "CTMC 的状态属于有限/可数集合 S，停留一段随机时间后跳到另一个状态。给定当前状态，下一跳分布不依赖更早历史。",
          why: "文本 token 不能沿欧氏空间连续移动，CTMC 用离散跳转承担“从 noise 到 data”的动力学角色。",
          example: "一个 token 可从 [MASK] 以随时间变化的 rate 跳到“cat”，而不是经过介于两个 token 之间的数值。",
          boundary: "课堂反复强调：离散 diffusion 名称沿用思想，但这里没有 Brownian SDE，也没有连续 ODE flow。",
        },
        {
          name: "Rate matrix Q_t",
          explanation:
            "对 y≠x，Q_t(y|x)≥0 是从 x 跳到 y 的瞬时率；对角 Q_t(x|x)=-Σ_{y≠x}Q_t(y|x)，保证总概率守恒。",
          why: "它是离散世界中 vector field 的对应物，决定极短时间 h 内各跳转的概率约为 hQ。",
          example: "Q(B|A)=2 表示在很短 h=0.01 内，A→B 的概率约为 0.02；它不是“概率等于 2”。",
          boundary: "rate 可以大于 1，概率不可以；h 必须足够小，使线性近似合法。",
        },
        {
          name: "Kolmogorov forward equation",
          explanation:
            "d p_t(x)/dt=Σ_y Q_t(x|y)p_t(y)，即 x 的概率变化等于所有 y 流向 x 的净贡献。",
          why: "它是 continuity equation 的离散对应，用来证明条件 rate 边缘化后仍跟随指定 probability path。",
          example: "两状态 A/B 中，dp_B/dt=q_AB p_A-q_BA p_B；第一项流入 B，第二项流出 B。",
          boundary: "矩阵采用行还是列表示会改变转置位置；实现前必须固定 Q(y|x) 的索引约定。",
        },
        {
          name: "Factorized mixture path",
          explanation:
            "序列每个位置独立地以 κ_t 保留数据 token z_j，否则从初始 token 分布采噪声。κ_0=0、κ_1=1。",
          why: "它能直接采 noisy sequence，并得到只改一个 token 的 factorized conditional rates。",
          example: "masked diffusion 令初始分布全是 [MASK]；随 t 增大，不同位置按后验逐渐显露最终 token。",
          boundary: "slides 说概率质量是“teleport”而非在空间平移；不能把连续直线插值图原样套到 token。",
        },
        {
          name: "Discrete marginalization 与分类",
          explanation:
            "边缘 rate 等于条件 rate 对终点 posterior p_{1|t}(z|x) 的平均。factorized path 下只需网络预测每个位置最终 token 的 posterior。",
          why: "训练生成模型由此化成 d 个并行分类问题，loss 是逐位置 token NLL。",
          example: "输入部分 masked 的句子，网络为每个位置输出 |V| 个 logits；真实 z_j 是 cross-entropy 标签。",
          boundary: "逐位置输出 factorized 不表示语言依赖被忽略；每个位置的 logits 可由看过整段 x 的 Transformer 产生。",
        },
      ],
      sections: [
        {
          title: "8.1 从连续移动改成离散跳转",
          intuition: "图像点可以向右移动 0.1，token 却不能从 cat 移动 0.1 后变成另一个合法词。",
          paragraphs: [
            "Lecture 5 开场先纠正名称：离散 diffusion/flow matching 推广的是 noising、conditional-to-marginal 和 denoising 训练原则，不是把 SDE/ODE 直接搬到词表。数学对象改为 CTMC。",
            "CTMC 的小时间转移满足 P(X_{t+h}=y|X_t=x)=hQ_t(y|x)+o(h)，y≠x。对角线是负的，不是留在原状态的概率；真正的留存概率约为 1+hQ_t(x|x)。",
          ],
          formula: {
            latex: "Q_t(x\\mid x)=-\\sum_{y\\ne x}Q_t(y\\mid x),\\qquad P(X_{t+h}=y\\mid X_t=x)=\\mathbf 1_{\\{y=x\\}}+hQ_t(y\\mid x)+o(h)",
            explanation: "列 x 的 rates 求和为 0（按本课 Q(y|x) 约定）。第二式对所有 y 都成立；y≠x 时指示函数为 0，y=x 时给出留存概率。",
            symbols: [
              { symbol: "S", meaning: "离散状态空间，如词表序列 V^d" },
              { symbol: "Q_t(y|x)", meaning: "x 到 y 的瞬时跳转率" },
              { symbol: "h", meaning: "足够小的模拟步长" },
            ],
          },
          figures: [
            {
              title: "离散路径中的概率质量是跳转而非平移",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260130_Lecture_05.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260130_Lecture_05.pdf#page=18",
              caption: "Lecture 5 第 18 页特意对比连续运输与离散 teleport。正文引用它来阻止一个常见误解：token 没有可供 ODE 沿用的欧氏直线。",
              credit: "MIT IAP 2026 Lecture 5 slides（Peter Holderrieth、Ron Shprints）, p.18；PDF 远程页引用",
              kind: "pdf-page",
              page: 18,
            },
          ],
          example: {
            title: "两状态 rate 不是 probability",
            steps: [
              "设 q_AB=2、q_BA=1，初始全在 A。",
              "h=0.01 时第一步 A→B 概率约 0.02。",
              "B 的方程是 dp_B/dt=2p_A-p_B。",
              "长期稳态满足 2p_A=p_B 与 p_A+p_B=1，所以 p_B=2/3。",
            ],
            result: "rate=2 合法；只有乘上小步长后的跳转概率需落在 [0,1]。",
          },
        },
        {
          title: "8.2 离散路径与 KFE",
          intuition: "连续 continuity 看空间边界的流入流出；KFE 直接把所有状态之间的流量求和。",
          paragraphs: [
            "对单 token，mixture path 可写 p_t(x|z)=(1-κ_t)pinit(x)+κ_tδ_z(x)。对长度 d 的序列取各位置乘积。它不是把 token 插成实数，而是随时间减小噪声分布权重、增大数据 token 权重。",
            "条件 rate 只允许错误位置跳到其最终 z_j，幅度含 κ̇_t/(1-κ_t)。t→1 时 rate 可能发散，因此实际求解器要避开端点、解析处理或采用稳定 schedule。",
          ],
          formula: {
            latex: "\\frac{d}{dt}p_t(x)=\\sum_{y\\in S}Q_t(x\\mid y)p_t(y)",
            explanation: "这是 KFE。y=x 的负对角项自动计入从 x 流出的概率。",
            symbols: [
              { symbol: "κ_t", meaning: "数据 token 的混合权重" },
              { symbol: "δ_z", meaning: "集中在最终 token/序列 z 的离散点质量" },
            ],
          },
          checks: ["为什么 rate 的对角线必须是其他 outgoing rates 的负和？"],
        },
        {
          title: "8.3 离散 marginalization trick",
          intuition: "当前位置 x 可能来自许多完整句子 z；平均“跳向各 z”的 rate 时，权重仍是终点 posterior。",
          paragraphs: [
            "离散定理与连续版本结构相同：Q_t(y|x)=Σ_z Q_t^z(y|x)p_{1|t}(z|x)。证明工具从 continuity equation 换成 KFE。",
            "factorized mixture path 的边缘 rate 可写成 κ̇_t/(1-κ_t)[p_{1|t}(z_j=v_i|x)-δ_{x_j}(v_i)]。唯一未知的是每个位置的终点 posterior，所以用 Transformer 输出 d×|V| logits。",
          ],
          formula: {
            latex: "\\mathcal L_{\\mathrm{DFM}}(\\theta)=\\mathbb E_{z,t,x}\\left[\\sum_{j=1}^{d}-\\log p_{1\\mid t}^\\theta(z_j\\mid x)_j\\right]",
            explanation: "训练步骤是：抽完整 z，按路径腐化成 x，让每个位置分类回真实 token z_j。",
            symbols: [
              { symbol: "d", meaning: "序列长度" },
              { symbol: "|V|", meaning: "词表大小" },
              { symbol: "p^θ_{1|t}", meaning: "网络预测的终点 token posterior" },
            ],
          },
          example: {
            title: "三 token masked 训练样本",
            steps: [
              "完整 z=[the,cat,sat]，t 时腐化为 x=[[MASK],cat,[MASK]]。",
              "Transformer 读取整个 x 与 t，为三个位置各输出词表 logits。",
              "loss 仍以 z 的三个真实 token 为标签求和，不只训练 masked 位置是本讲义通式。",
              "由 posterior logits 构造 rates，再在每个足够小的时间步按离散转移分布抽取新 token。rate 乘 h 只是局部近似；实际实现还要保证一步概率非负，或使用可保持概率合法的专用 CTMC 求解器。",
            ],
            result: "并行预测 posterior 不等于所有位置独立理解语言；共享 Transformer 可利用整句上下文。",
          },
        },
        {
          title: "8.4 Masked diffusion 与 autoregressive 的取舍",
          intuition: "可任意顺序改多个 token 带来灵活性，也丢掉了天然的从左到右语义分解。",
          paragraphs: [
            "masked diffusion 把 [MASK]^d 作为初始状态，随时间逐步显露 token。slides 用一段文学文本从全 mask 到完整句子的快照展示任意位置的恢复。为避免复制受版权保护的长段落，本站只保留机制说明并链接原 slides。",
            "课堂讨论列出潜在优点：多 token 并行、任意顺序、编辑；也列出潜在缺点：没有 KV cache、要学习任意顺序、未必更快。这里没有定论，不能从“并行更新”直接推出 wall-clock 胜过 autoregressive。",
          ],
        },
      ],
      lab: {
        title: "实验：两状态 CTMC 与 KFE",
        goal: "从最小 rate matrix 出发检查概率守恒、Euler 推进和稳态。",
        file: "/labs/diffusion-flow/discrete_ctmc.py",
        steps: [
          "运行 python3 public/labs/diffusion-flow/discrete_ctmc.py。",
          "核对每一步 p_A+p_B=1。",
          "比较 Euler 的 p_B(t=1) 与两状态解析解。",
          "增大 h，观察精度下降；若 h 太大还可能违反概率范围断言。",
        ],
        expected: ["p_B(t=1) 接近解析值", "一步 A→B 概率为 0.02", "最后打印 PASS"],
        sourceNote: "对应 Lecture 5 的 rate matrix/KFE 概念；官方 2026 labs 未提供单独 CTMC notebook，本站补充一个标准库最小实验。",
      },
      pitfalls: [
        "把 discrete diffusion 说成 token 上的 Brownian SDE",
        "把 rate 大于 1 判为非法概率",
        "忘记 rate matrix 对角线是 outgoing rates 的负和",
        "混用 Q(y|x) 的行/列约定",
        "认为逐 token cross-entropy 意味着模型看不到其他位置",
        "从并行 token 更新直接推断推理一定更快",
      ],
      exercises: [
        { question: "Q(B|A)=5 是否非法？", answer: "不非法，它是瞬时率。若步长 h=0.01，一步跳转概率约 0.05；需要控制 h 使概率近似有效。" },
        { question: "KFE 与 continuity equation 的共同点是什么？", answer: "都表达概率守恒与净流入；前者对离散状态求和，后者对连续空间用负散度。" },
        { question: "为什么 DFM loss 是分类而不是速度 MSE？", answer: "factorized path 的边缘 rates 可由每个位置最终 token 的 posterior 重参数化；该 posterior 自然用词表 softmax 与 cross-entropy 学习。" },
      ],
      sources: [
        { title: "课程讲义 §7: Discrete Diffusion Models", url: notesUrl, kind: "notes", note: "CTMC、KFE、离散 marginalization、DFM loss 与 MDLM" },
        { title: "Lecture 5 slides", url: "https://diffusion.csail.mit.edu/2026/docs/20260130_Lecture_05.pdf", kind: "slides", note: "离散 FM matrix、teleport 图示、masked text 与 AR 对比" },
        { title: "Lecture 5 recording", url: "https://www.youtube.com/watch?v=d0kmyEJN2hI", kind: "video", note: "约 02:00 起；明确无 ODE/SDE、rate/KFE 推导及课堂权衡讨论" },
        { title: "MIT 课程实验仓库（2026）", url: labRepoUrl, kind: "code", note: "原课三份 lab 聚焦连续模型；CTMC 最小实验为本站补充" },
      ],
    },
    {
      slug: "mathematical-appendices",
      index: 9,
      title: "数学附录：条件期望、存在性与守恒方程",
      subtitle: "把正文里被快速带过的数学条件补回来",
      duration: "180 分钟",
      summary:
        "对应课程讲义附录 A–C，并补上正文算法所需的边界条件。重点不是重讲一遍概率论，而是解释 CFM 为什么学到条件平均、ODE/SDE 何时有唯一解，以及 continuity、Fokker–Planck、KFE 各自守恒什么。",
      objectives: [
        "把条件期望解释为平方损失下的最佳预测",
        "区分 ODE/SDE 的充分存在条件、数值近似与模型误差",
        "从测试函数推到 Fokker–Planck 方程，并写清积分分部假设",
        "说明有限状态 CTMC 的率矩阵怎样定义唯一转移核",
      ],
      prerequisites: ["第 2–4、8 章", "多元微积分", "基础条件概率"],
      concepts: [
        {
          name: "条件期望是 L² 投影",
          explanation:
            "给定只能看到 Y 的预测器 g(Y)，使 E||X-g(Y)||² 最小的函数是 g*(Y)=E[X|Y]。CFM 网络看见的是 (X_t,t)，看不见配对终点 Z，因此平方回归自动把不同 Z 的条件速度平均成边缘速度。",
          why: "这一步把“posterior 加权”从一句直觉变成可核对的优化结论。",
          example: "若 X 在给定 Y=y 时以 1/4 取 -2、以 3/4 取 2，最佳平方预测是 1；输出最常见值 2 并不使 MSE 最小。",
          boundary: "条件期望只说明平方损失的总体最优解。有限数据、优化失败或模型容量不足时，训练网络未必达到它。",
        },
        {
          name: "适定性不是自动保证",
          explanation:
            "存在性回答“有没有解”，唯一性回答“同一初值会不会产生多条解”，连续依赖性回答“初值小扰动是否只造成小变化”。局部 Lipschitz 与增长条件是常见的充分条件，不是唯一可能的条件。",
          why: "若动力学本身不唯一，所谓 flow map、逆映射和稳定采样都会失去明确含义。",
          example: "x'=sqrt(|x|)、x(0)=0 可先停在 0 任意长时间再离开，因此解不唯一；Euler 代码却只会返回其中一条数值轨迹。",
          boundary: "不能笼统地说“神经网络总是 C¹ 且导数有界”。ReLU 不可处处微分；不过有限权重的 Lipschitz 网络通常仍可用更一般的 ODE 唯一性定理处理。",
        },
        {
          name: "弱形式与 Fokker–Planck",
          explanation:
            "先看任意光滑测试函数 φ 的期望怎样变化，再把导数从 φ 移到密度 p 上。这样得到的 PDE 叫前向方程；它描述边缘分布，不描述某条样本轨迹。",
          why: "score correction 的系数 σ²/2 正是由扩散项的二阶导数决定，不能靠直觉猜。",
          example: "纯 Brownian motion 的 b=0、σ=1，方程退化成热方程 ∂_t p=(1/2)Δp，高斯方差随时间线性增长。",
          boundary: "积分分部需要密度和通量在无穷远足够快衰减，或在有限区域指定合适边界条件；PDE 的唯一性也需要额外正则性。",
        },
        {
          name: "CTMC 的转移核",
          explanation:
            "给定合法率矩阵 Q_t，转移概率是 KFE 这组线性 ODE 的解。有限状态、连续且有界 rates 下，初值问题有唯一解，并保持总概率为 1。",
          why: "Q 本身不是一步概率；真正的采样对象是由 Q 积分得到的转移核。",
          example: "常数率矩阵时 P_{t|0}=exp(tQ)。Euler 近似 I+hQ 只在 h 足够小时才是合法随机矩阵。",
          boundary: "可数无限状态若总跳出率无界，可能在有限时间发生无限次跳转；有限状态的简单证明不能原样套用。",
        },
      ],
      sections: [
        {
          title: "9.1 条件期望为何出现在 Flow Matching",
          intuition: "网络只能依据输入作答；同一输入对应多个监督目标时，平方损失取它们的平均。",
          paragraphs: [
            "设监督目标为 V、网络输入为 Y=(X_t,t)。把 V 写成 E[V|Y]+(V-E[V|Y])，展开平方后，交叉项的条件期望为零。于是任意 g(Y) 的风险都等于不可约条件方差，加上 ||g(Y)-E[V|Y]||²。",
            "在 CFM 中 V=u_t(X_t|Z)。因此总体最优预测是 E[u_t(X_t|Z)|X_t,t]，也就是 posterior 加权的边缘向量场。这个等式解释了训练目标，却不保证单个训练 pair 会沿同一 Z 走到终点；概率路径约束的是整体边缘。",
          ],
          formula: {
            latex: "\\mathbb E\\lVert V-g(Y)\\rVert^2=\\mathbb E\\lVert V-\\mathbb E[V\\mid Y]\\rVert^2+\\mathbb E\\lVert g(Y)-\\mathbb E[V\\mid Y]\\rVert^2",
            explanation: "第一项与 g 无关，第二项在 g(Y)=E[V|Y] 时达到 0。",
            symbols: [
              { symbol: "V", meaning: "条件速度或其他回归目标" },
              { symbol: "Y", meaning: "模型在决策时实际能看到的信息" },
              { symbol: "E[V|Y]", meaning: "给定输入后的条件平均" },
            ],
          },
          example: {
            title: "两种终点共用一个 noisy state",
            steps: [
              "设当前 x 对应左终点的 posterior 为 0.25、条件速度为 -3。",
              "对应右终点的 posterior 为 0.75、条件速度为 1。",
              "边缘速度是 0.25×(-3)+0.75×1=0。",
              "CFM 网络输出 0 不是“犹豫”，而是该 x 上的净概率通量恰好抵消。",
            ],
            result: "边缘场由 posterior 加权，而不是选择概率最大的单一终点。",
          },
        },
        {
          title: "9.2 ODE 与 SDE：定理保证到哪里为止",
          intuition: "求解器能运行，不等于连续模型一定存在、唯一或已经被精确求出。",
          paragraphs: [
            "讲义采用一个易用的充分条件：u 对 x 连续可微且导数有界；SDE 再要求 σ_t 连续。在更常见的表述中，对 x 全局 Lipschitz 并满足线性增长即可得到有限时间的强解唯一性。局部 Lipschitz 通常只给局部解，还要排除 finite-time explosion。",
            "存在性定理讨论连续方程；Euler 与 Euler–Maruyama 讨论离散近似。步长趋近零时的收敛还需要各自的正则条件。模型训练误差不会因为 h 变小而消失，反过来，网络完全正确也不代表粗步求解器没有偏差。",
          ],
          formula: {
            latex: "\\lVert u(t,x)-u(t,y)\\rVert+\\lVert\\sigma(t,x)-\\sigma(t,y)\\rVert\\le L\\lVert x-y\\rVert,\\qquad \\lVert u(t,x)\\rVert+\\lVert\\sigma(t,x)\\rVert\\le C(1+\\lVert x\\rVert)",
            explanation: "全局 Lipschitz 控制分叉，线性增长排除有限时间爆炸；这是常用充分条件，不是必要条件。",
            symbols: [
              { symbol: "L", meaning: "对状态变量的 Lipschitz 常数" },
              { symbol: "C", meaning: "增长上界常数" },
              { symbol: "σ(t,x)", meaning: "一般可依赖状态的 diffusion coefficient" },
            ],
          },
          checks: ["把 Euler 步数加倍后结果不变，能否证明训练场正确？为什么？"],
        },
        {
          title: "9.3 从 Itô 公式到 Fokker–Planck",
          intuition: "不跟踪每条随机轨迹，改为询问所有光滑观测量的平均值怎样变化。",
          paragraphs: [
            "对 dX_t=b_t(X_t)dt+σ_t dW_t，Itô 公式给 dE[φ(X_t)]/dt=E[b·∇φ+(σ²/2)Δφ]。把期望写成对 p_t 的积分，再做一次和两次分部积分，便得到密度的前向方程。",
            "若在漂移中加入 (σ²/2)∇log p_t，则 -div[p_t(σ²/2)∇log p_t]=-(σ²/2)Δp_t，正好抵消扩散项。这是第 4 章 SDE extension 的推导，不是“score 大致把噪声拉回来”的近似说法。",
          ],
          formula: {
            latex: "\\partial_t p_t=-\\nabla\\!\\cdot(b_t p_t)+\\frac{\\sigma_t^2}{2}\\Delta p_t",
            explanation: "这里写的是空间无关的标量 σ_t。一般矩阵扩散 a=σσᵀ 时，二阶项变为 (1/2)Σ_ij ∂_i∂_j(a_ij p)。",
            symbols: [
              { symbol: "b_t", meaning: "SDE drift" },
              { symbol: "Δ", meaning: "对空间变量求 Laplacian" },
              { symbol: "p_t", meaning: "X_t 的边缘密度" },
            ],
          },
          checks: ["若 σ 依赖 x，为什么不能仍写成 (σ²/2)Δp？"],
        },
        {
          title: "9.4 三类方程的守恒结构",
          intuition: "continuity、Fokker–Planck 与 KFE 看起来不同，核对时都先检查总质量导数是否为零。",
          paragraphs: [
            "ODE 的 continuity equation 只有 drift 通量；SDE 的 Fokker–Planck 多一个二阶扩散项；CTMC 的 KFE 把空间微分换成状态间求和。三者都要求流出一个位置的质量同时成为别处的流入。",
            "有限 CTMC 中，每列 rates 和为零使 dΣ_x p_t(x)/dt=0。非负 off-diagonal rates 再保证转移概率不会立刻跑到负数。附录 C 的存在唯一性证明把 KFE 视作线性 ODE，并继续核对非负性、归一化与 Chapman–Kolmogorov 性质。",
          ],
          formula: {
            latex: "\\text{ODE: }\\partial_t p=-\\nabla\\cdot(up),\\quad \\text{SDE: }\\partial_t p=-\\nabla\\cdot(bp)+\\tfrac12\\sigma^2\\Delta p,\\quad \\text{CTMC: }\\dot p=Qp",
            explanation: "三个式子使用本课的列向量与 Q(y|x) 约定。换成行向量记号时 CTMC 会写成 ṗ=pQ。",
            symbols: [
              { symbol: "u", meaning: "确定动力学的速度场" },
              { symbol: "b", meaning: "随机动力学的漂移" },
              { symbol: "Q", meaning: "离散状态的生成元矩阵" },
            ],
          },
        },
      ],
      lab: {
        title: "附录验证：解析矩与数值轨迹",
        goal: "用 Lab 1 的解析解检查数值模拟，但不把有限样本通过当作存在唯一性证明。",
        file: "/labs/diffusion-flow/lab1_ode_sde_complete.py",
        steps: [
          "运行脚本并记录 Euler、Brownian、OU 的经验误差。",
          "指出哪些断言验证了离散实现，哪些数学条件并未由测试覆盖。",
          "把 OU 步数减半，观察离散误差和 Monte Carlo 误差怎样混在一起。",
        ],
        expected: ["所有解析矩检查通过", "能区分定理、数值收敛与统计误差", "最后打印 PASS"],
        sourceNote: "讲义附录提供数学证明；脚本只验证若干可计算后果，不能替代证明。",
      },
      pitfalls: [
        "把平方损失最优解等同于有限网络一定学到该解",
        "声称所有神经网络都连续可微且导数有界",
        "由求解器没有报错推断连续方程存在唯一",
        "推导 Fokker–Planck 时省略边界条件和扩散矩阵的状态依赖",
        "在 CTMC 中只检查列和为零，却不检查 off-diagonal rates 非负",
      ],
      exercises: [
        { question: "为什么 E[V|Y] 是平方损失最优解，却未必是绝对误差最优解？", answer: "平方损失由条件均值最小化；绝对误差通常由条件中位数最小化，目标函数改变后最佳统计量也改变。" },
        { question: "ReLU 网络不满足处处 C¹，是否必然导致 ODE 不唯一？", answer: "不必然。ReLU 是 Lipschitz 的，有限权重网络通常也是 Lipschitz；可用不要求处处可微的 Picard–Lindelöf 型条件得到唯一性。" },
        { question: "Fokker–Planck 方程描述的是轨迹还是边缘分布？", answer: "它描述每个时刻的边缘密度 p_t。不同随机过程可能共享同一组边缘分布，却有不同的联合轨迹分布。" },
      ],
      sources: [
        { title: "课程讲义 Appendix A: A Reminder on Probability Theory", url: notesUrl, kind: "notes", note: "随机向量、条件密度、条件期望与 tower property" },
        { title: "课程讲义 Appendix B: A Proof of the Fokker–Planck Equation", url: notesUrl, kind: "notes", note: "从 Itô 公式与积分分部证明必要性，并讨论 PDE 唯一性" },
        { title: "课程讲义 Appendix C: Existence and Uniqueness of CTMCs", url: notesUrl, kind: "notes", note: "把 KFE 作为线性 ODE，并核对合法转移核" },
        { title: "Lecture 1 slides, pp. 19 and 30", url: "https://diffusion.csail.mit.edu/2026/docs/20260120_Lecture_01.pdf", kind: "slides", note: "ODE/SDE existence and uniqueness 的课堂版本" },
      ],
    },
    {
      slug: "vae-ddpm-ddim",
      index: 10,
      title: "VAE 补充与传统 Diffusion 记号",
      subtitle: "把 ELBO、forward/reverse process、DDPM 与 DDIM 翻译回概率路径",
      duration: "210 分钟",
      summary:
        "前半对应讲义附录 D，补足 VAE joint KL、ELBO、aggregated posterior 与重建/生成的分工；后半对应附录 E 的文献路线，并加入 DDPM、DDIM 原论文中最常见的离散时间公式。",
      objectives: [
        "从 encoder/decoder joint KL 推出 VAE loss 与 ELBO",
        "区分 per-example posterior、aggregated posterior 与 prior",
        "写出 DDPM forward marginal、噪声预测训练和 reverse update",
        "说明 DDIM、reverse-time SDE 与 probability-flow ODE 的联系和差别",
      ],
      prerequisites: ["第 4、6、9 章", "KL divergence", "高斯条件分布"],
      concepts: [
        {
          name: "VAE 的 joint distribution 视角",
          explanation:
            "encoder joint 是 q_φ(x,z)=p_data(x)q_φ(z|x)，decoder joint 是 p_θ(x,z)=p_prior(z)p_θ(x|z)。VAE loss 等于两者 KL 加一个与参数无关的常数，也等于负 ELBO 的数据期望。",
          why: "这比“重建项加 KL 正则”多说明一层：两项共同试图让编码和生成的联合模型相容。",
          example: "即使每个 q(z|x) 都接近 prior，仍应单独测真实数据经 encode-decode 的重建质量，以及从 latent generator 采样后的生成质量。",
          boundary: "有限 β 权重、感知 loss、对抗 loss 等工程 VAE 目标不再严格等于原始 joint KL；需按实际训练式解释。",
        },
        {
          name: "Forward noising process",
          explanation:
            "传统 diffusion 从数据 x_0 出发，逐步加高斯噪声。由于每步是线性高斯转移，可直接一次采到 x_t，无需真的循环 t 步；这正是本课 Gaussian conditional probability path 的反向时间写法。",
          why: "训练若能直接抽 x_t，便可随机抽一个时间训练，不必在每个 batch 模拟整条 Markov chain。",
          example: "给定累计保真系数 ᾱ_t，直接令 x_t=√ᾱ_t x_0+√(1-ᾱ_t)ε。t 越大，数据比例越小。",
          boundary: "本节 β_t 表示 DDPM 的离散噪声方差 schedule；正文 Gaussian path 中 β_t 常表示标准差。两种记号不能混用。",
        },
        {
          name: "Reverse model 与噪声预测",
          explanation:
            "DDPM 用网络 ε_θ(x_t,t) 估计 forward 中的噪声，再据此构造 p_θ(x_{t-1}|x_t) 的均值。训练常用简化噪声 MSE；采样时每个反向步还加入指定方差的高斯噪声。",
          why: "“预测噪声”是 score 的一种重参数化，不是让模型随意输出要删除的像素。",
          example: "当网络准确预测 ε 时，可先还原 x̂_0，再计算一步 reverse mean；实现通常直接合并成闭式系数。",
          boundary: "简化 MSE 与完整变分下界的权重不同。课程连续时间 DSM 是等式框架，不能把所有 DDPM 训练目标都称为同一个精确 likelihood。",
        },
        {
          name: "DDIM 的确定采样路径",
          explanation:
            "DDIM 使用与 DDPM 相同的常见噪声预测器，却选择不同的非 Markovian 生成过程。η=0 时更新是确定的，随机性只来自初始 x_T。",
          why: "它说明训练目标不唯一决定采样轨迹；同一组边缘信息可配不同动力学。",
          example: "先由 x_t 与 ε_θ 算 x̂_0，再把 x̂_0 和同一个预测噪声按 ᾱ_{t-1} 重新组合成 x_{t-1}。",
          boundary: "DDIM 的离散更新与 probability-flow ODE 思想相近，但不能把任意步长的 DDIM 更新逐项等同于某个通用 ODE 求解器。",
        },
      ],
      sections: [
        {
          title: "10.1 VAE loss、ELBO 与 aggregated posterior",
          intuition: "encoder 和 decoder 各自定义一个 x-z 联合分布；训练是在让两种联合解释靠近。",
          paragraphs: [
            "展开 D_KL(q_φ(x,z)||p_θ(x,z)) 后，log p_data(x) 与参数无关，剩下的正是 E_x D_KL(q_φ(z|x)||p_prior(z)) 与负重建 log-likelihood。再用 KL 非负性，可得到 ELBO≤log p_θ(x)。",
            "aggregated posterior q_φ(z)=∫q_φ(z|x)p_data(x)dx 是 latent generator 真正要拟合的训练分布。单个 q_φ(z|x) 靠近 prior 不等于 q_φ(z) 已精确等于 prior；VAE loss 只给近似压力。讲义附录还区分 reconstruction sampler 与 generation sampler，因此 rFID 和 gFID 要分开看。",
          ],
          formula: {
            latex: "-\\mathrm{ELBO}(x)=\\mathbb E_{z\\sim q_\\phi(z|x)}[-\\log p_\\theta(x|z)]+D_{\\mathrm{KL}}(q_\\phi(z|x)\\|p_{\\mathrm{prior}}(z))",
            explanation: "第一项取决于 decoder likelihood 的选择；像素 MSE 对应固定方差 Gaussian likelihood 的一种情形。",
            symbols: [
              { symbol: "q_φ(z|x)", meaning: "encoder 给出的近似后验" },
              { symbol: "p_θ(x|z)", meaning: "decoder likelihood" },
              { symbol: "q_φ(z)", meaning: "对真实数据聚合后的 latent 分布" },
            ],
          },
          checks: ["为什么从 q_φ(z|x) 重建得好，不能证明从 prior 直接采样也好？"],
        },
        {
          title: "10.2 DDPM forward process：循环加噪怎样化成一次采样",
          intuition: "线性高斯转移可以合并；训练抽到任意噪声级，不必先走完前面的所有步。",
          paragraphs: [
            "设离散步噪声方差为 β_t^step，α_t=1-β_t^step，ᾱ_t=∏_{s=1}^t α_s。逐步转移 q(x_t|x_{t-1})=N(√α_t x_{t-1},β_t^step I) 合并后，得到给定干净 x_0 的 closed-form marginal。",
            "训练算法是：抽 x_0、抽离散 t、抽 ε，构造 x_t，再最小化 ||ε_θ(x_t,t)-ε||²。它与第 4 章的 noise-prediction DSM 形式一致，但时间方向相反，且离散 schedule 已在训练前固定。",
          ],
          formula: {
            latex: "q(x_t\\mid x_0)=\\mathcal N(\\sqrt{\\bar\\alpha_t}x_0,(1-\\bar\\alpha_t)I),\\qquad x_t=\\sqrt{\\bar\\alpha_t}x_0+\\sqrt{1-\\bar\\alpha_t}\\epsilon",
            explanation: "第二式是第一式的重参数化采样。这里 x_0 是数据、x_T 接近噪声，与本课 flow-time 相反。",
            symbols: [
              { symbol: "β_t^step", meaning: "第 t 个离散 forward step 的噪声方差" },
              { symbol: "ᾱ_t", meaning: "从第 1 步到第 t 步累计保留的数据比例" },
              { symbol: "ε", meaning: "标准高斯噪声" },
            ],
          },
          figures: [
            {
              title: "两套时间方向的对照",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260128_Lecture_04_edited.pdf#page=35",
              caption: "Lecture 4 第 35 页并列 flow time 与 diffusion time。阅读 DDPM/DDIM 公式前先用这页核对 t=0 究竟是数据还是噪声。",
              credit: "MIT IAP 2026 Lecture 4 slides（Peter Holderrieth、Ron Shprints）, p.35；PDF 远程页引用",
              kind: "pdf-page",
              page: 35,
            },
          ],
        },
        {
          title: "10.3 DDPM reverse sampling：从 ε 预测得到一步均值",
          intuition: "网络不直接记住 x_{t-1}；它先估计 x_t 中混入的噪声，再用 Gaussian posterior 的系数走一步。",
          paragraphs: [
            "常见 ε 参数化下，reverse mean 写成 μ_θ(x_t,t)=α_t^{-1/2}[x_t-(1-α_t)(1-ᾱ_t)^{-1/2}ε_θ(x_t,t)]。从 x_T∼N(0,I) 开始，按 t=T,…,1 重复计算均值；除最后一步外，再加 σ_t z。",
            "这段算法包含三种误差：噪声预测误差、有限离散步数造成的过程近似，以及 reverse variance 的选择。增加采样步数只直接处理其中一部分，不能修复训练错误。",
          ],
          formula: {
            latex: "x_{t-1}=\\frac{1}{\\sqrt{\\alpha_t}}\\left(x_t-\\frac{1-\\alpha_t}{\\sqrt{1-\\bar\\alpha_t}}\\epsilon_\\theta(x_t,t)\\right)+\\sigma_t z",
            explanation: "t>1 时通常取 z∼N(0,I)，最后一步取 z=0。σ_t 的具体选择依赖所用 DDPM variance 约定。",
            symbols: [
              { symbol: "ε_θ", meaning: "训练得到的噪声预测器" },
              { symbol: "σ_t", meaning: "reverse transition 的标准差" },
              { symbol: "z", meaning: "每个 reverse step 的新高斯噪声" },
            ],
          },
          example: {
            title: "正式采样循环的检查顺序",
            steps: [
              "初始化 x_T∼N(0,I)。",
              "对 t=T,…,1 计算 ε_θ(x_t,t) 与 μ_θ。",
              "若 t>1，抽 z 并令 x_{t-1}=μ_θ+σ_t z；若 t=1，令 z=0。",
              "输出 x_0，并连同 schedule、步数和 variance 约定记录结果。",
            ],
            result: "只有“反复去噪”这句话不足以复现 DDPM；系数和最后一步是否加噪都必须明确。",
          },
        },
        {
          title: "10.4 DDIM、reverse-time SDE 与 probability-flow ODE",
          intuition: "模型提供的是关于各噪声级分布的信息，采样器决定用怎样的轨迹消费这些信息。",
          paragraphs: [
            "DDIM 在 η=0 时先算 x̂_0=(x_t-√(1-ᾱ_t)ε_θ)/√ᾱ_t，再令 x_{t-1}=√ᾱ_{t-1}x̂_0+√(1-ᾱ_{t-1})ε_θ。它不在每步注入新噪声，因此给定 x_T 后轨迹确定。η>0 的一般式会重新加入受控随机项。",
            "score-SDE 文献从 forward SDE 的 time reversal 推导随机 sampler，也给出共享边缘的 probability-flow ODE。本课则先规定 probability path，再由 continuity/Fokker–Planck 直接构造 vector field 与 SDE family。两条路线在 Gaussian path 上可互相翻译，但“轨迹联合分布相同”和“每个时刻边缘相同”不是一回事。",
          ],
          formula: {
            latex: "\\hat x_0=\\frac{x_t-\\sqrt{1-\\bar\\alpha_t}\\epsilon_\\theta(x_t,t)}{\\sqrt{\\bar\\alpha_t}},\\qquad x_{t-1}=\\sqrt{\\bar\\alpha_{t-1}}\\hat x_0+\\sqrt{1-\\bar\\alpha_{t-1}}\\epsilon_\\theta(x_t,t)\\quad(\\eta=0)",
            explanation: "这是 DDIM 的确定性特例。跳步 schedule 时，t-1 应理解为选定序列中的下一个较小噪声级。",
            symbols: [
              { symbol: "x̂_0", meaning: "由当前 noisy state 估计的干净样本" },
              { symbol: "η", meaning: "DDIM 一般式中的随机性控制参数" },
              { symbol: "ᾱ", meaning: "与训练 schedule 一致的累计系数" },
            ],
          },
        },
      ],
      lab: {
        title: "VAE 与 latent diffusion 的轻量接口检查",
        goal: "验证 reparameterization、KL、reconstruction 与 latent CFM 的 shape 和一阶更新。",
        file: "/labs/diffusion-flow/lab3_dit_vae_latent_smoke.py",
        steps: [
          "运行脚本，核对 VAE 的 z shape、KL 非负与 reconstruction MSE 有限。",
          "说明随机 decoder 的 MSE 为什么不能当成 VAE 已训练好的证据。",
          "打开官方 Lab 3 starter/solution，对照卷积 encoder/decoder、MNIST dataloader 与完整训练循环。",
        ],
        expected: ["本地 NumPy smoke test 通过", "能指出它未覆盖的端到端训练", "最后打印 PASS"],
        sourceNote: "完整 MNIST VAE/DiT 需要 PyTorch、数据下载和多轮优化。GPU 不是数学上的硬性要求，但会显著缩短训练；本站未把 smoke test 冒充为官方重训练结果，完整实现直接链接官方 starter/solution。",
      },
      pitfalls: [
        "把 per-example q(z|x) 与 aggregated posterior q(z) 混为一谈",
        "认为 VAE reconstruction 好就能从 prior 或 latent generator 生成得好",
        "混用 DDPM 的 β step variance 与本课 Gaussian path 的 β standard deviation",
        "忽略传统 diffusion 与本课 flow-time 的方向相反",
        "把 DDIM 确定更新、probability-flow ODE 和任意 ODE solver 说成逐项相同",
      ],
      exercises: [
        { question: "为什么 DDPM 训练可以直接抽 x_t，而不从 x_0 循环 t 次？", answer: "线性 Gaussian forward transitions 可以解析合并，q(x_t|x_0) 有闭式均值与方差，可用一次高斯噪声重参数化采样。" },
        { question: "DDIM η=0 时还有随机性吗？", answer: "给定初始 x_T 后更新是确定的；不同生成样本仍来自不同的随机 x_T。" },
        { question: "VAE loss 中 KL 为零是否理想？", answer: "不一定。若对所有 x 都有 q(z|x)=prior，latent 不携带输入信息，decoder 可能难以重建；实践要在 rate 与 distortion 之间取舍。" },
      ],
      sources: [
        { title: "课程讲义 Appendix D: Additional Perspectives on VAEs", url: notesUrl, kind: "notes", note: "joint KL、ELBO、aggregated posterior、reconstruction/generation 与 rate-distortion" },
        { title: "课程讲义 Appendix E: A Guide to the Diffusion Model Literature", url: notesUrl, kind: "notes", note: "离散/连续时间、forward process、time reversal 与 probability-path 视角" },
        { title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239", kind: "paper", note: "DDPM forward/reverse Markov chain、变分训练与 noise-prediction 参数化" },
        { title: "Denoising Diffusion Implicit Models", url: "https://arxiv.org/abs/2010.02502", kind: "paper", note: "DDIM 的非 Markovian 过程与确定性采样" },
        { title: "Score-Based Generative Modeling through SDEs", url: "https://arxiv.org/abs/2011.13456", kind: "paper", note: "reverse-time SDE 与 probability-flow ODE" },
        { title: "High-Resolution Image Synthesis with Latent Diffusion Models", url: "https://arxiv.org/abs/2112.10752", kind: "paper", note: "在压缩 latent 中训练 diffusion 的代表性工作" },
        { title: "Official Lab 3 starter", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/labs/lab_three.ipynb", kind: "assignment", note: "MNIST DiT、VAE 与 latent diffusion 完整练习" },
        { title: "Official Lab 3 solution", url: "https://github.com/eje24/iap-diffusion-labs/blob/2026/solutions/lab_three_complete.ipynb", kind: "code", note: "官方 PyTorch 参考实现；需要数据下载与实际训练" },
      ],
    },
    {
      slug: "generator-matching-algorithms",
      index: 11,
      title: "Generator Matching 与训练/采样算法",
      subtitle: "用 infinitesimal generator 收束连续 flow、SDE 与离散 CTMC",
      duration: "180 分钟",
      summary:
        "从讲义 Remark 40 出发，解释 Generator Matching 中的 generator 到底是什么，再把 CFM、score training、CFG 和 DFM 写成可逐行实现的算法。最后标清本站 NumPy 实验和官方 PyTorch labs 的能力边界。",
      objectives: [
        "写出 ODE、SDE 与 CTMC 的 infinitesimal generator",
        "解释 conditional generator 如何经 posterior 平均成为 marginal generator",
        "按随机变量顺序复述连续和离散训练算法",
        "区分机制 smoke test、完整训练与规模化复现",
      ],
      prerequisites: ["第 3–5、8–10 章", "梯度与 Hessian", "Markov 过程基础"],
      concepts: [
        {
          name: "Infinitesimal generator",
          explanation:
            "generator L_t 不直接返回下一状态，而是给任意测试函数 f 的瞬时条件变化率：L_t f(x)=lim_{h→0}E[f(X_{t+h})-f(X_t)|X_t=x]/h。它决定 Markov 过程的局部演化。",
          why: "vector field 和 rate matrix 看似两套对象，作用在测试函数上后都是 generator 的特例。",
          example: "ODE 有 Lf=u·∇f；SDE 多出 (1/2)Tr(a∇²f)；CTMC 是 Σ_y Q(y|x)[f(y)-f(x)]。",
          boundary: "generator 的定义域、闭包和过程存在性在一般状态空间中有技术条件；本章只在光滑欧氏过程与有限 CTMC 上使用公式。",
        },
        {
          name: "Generator marginalization",
          explanation:
            "先为每个终点 z 构造 conditional Markov process 及 generator L_t^z，再按 p(z|X_t=x) 对其作用结果求条件平均，可得到驱动 marginal path 的 generator。",
          why: "连续 CFM 的 vector-field marginalization 和离散 DFM 的 rate marginalization因此是同一个学习原则。",
          example: "ODE 只平均 u_t(x|z)；CTMC 平均 Q_t^z(y|x)；SDE 还要明确二阶扩散部分是否随 z 变化。",
          boundary: "“都叫 generator”不表示损失函数必然相同。回归 vector field、预测 score 与分类 posterior 使用不同输出空间和 proper loss。",
        },
        {
          name: "训练算法是一组可采样随机变量",
          explanation:
            "simulation-free training 的核心不是省略算法，而是把目标写成可直接采样的 (z,t,x,target) 四元组。每个变量的分布和 shape 都应在代码中可追踪。",
          why: "若只写“加噪后训练网络”，最容易漏掉时间方向、条件目标、label dropout 或端点稳定性。",
          example: "CondOT CFM 一条记录是 z∼data、ε∼N、t∼U、x=(1-t)ε+tz、v=z-ε。",
          boundary: "训练不模拟 ODE/SDE，不等于部署不需要求解器；生成仍要积分动力学。",
        },
        {
          name: "复现边界",
          explanation:
            "本站脚本用于检查公式、shape、采样器和小回归问题。官方 labs 还包括图形诊断、PyTorch 网络、MNIST 数据、DiT/VAE 训练和超参数循环。",
          why: "把 smoke test 写成“完成官方实验”会掩盖最耗时也最容易失败的训练部分。",
          example: "Lab 3 本地脚本执行一个 AdaLN-DiT forward 和一次 latent CFM 更新；官方 notebook 要训练 conditional DiT 与 VAE 后再看样本。",
          boundary: "GPU 会改善训练时间但不是所有 MNIST 练习的硬性前提；能否在 CPU 完成取决于 epoch、模型宽度和时间预算。",
        },
      ],
      sections: [
        {
          title: "11.1 三种动力学的一张 generator 表",
          intuition: "不比较轨迹长什么样，先比较它们如何改变任意观测函数 f。",
          paragraphs: [
            "确定 ODE 在小时间 h 内移动 hu，因此 f 的一阶变化是 hu·∇f。Itô SDE 的 Brownian 增量均值为零，但二阶 Taylor 项平均后留下 (1/2)Tr(a∇²f)。CTMC 以 rate Q(y|x) 跳到 y，所以把每种跳转带来的 f(y)-f(x) 加权求和。",
            "对应的 forward equation 是 generator 的伴随作用在分布上：ODE 得 continuity，SDE 得 Fokker–Planck，CTMC 得 KFE。Generator Matching 使用的统一性在这一层，而不是宣称状态空间都能做欧氏插值。",
          ],
          formula: {
            latex: "\\mathcal L_t^{\\mathrm{ODE}}f=u_t\\cdot\\nabla f,\\quad \\mathcal L_t^{\\mathrm{SDE}}f=b_t\\cdot\\nabla f+\\tfrac12\\mathrm{Tr}(a_t\\nabla^2 f),\\quad \\mathcal L_t^{\\mathrm{CTMC}}f(x)=\\sum_y Q_t(y|x)[f(y)-f(x)]",
            explanation: "a_t=σ_tσ_tᵀ。CTMC 式把 y=x 项写进去也无妨，因为 f(x)-f(x)=0。",
            symbols: [
              { symbol: "f", meaning: "generator 定义域中的测试函数" },
              { symbol: "a", meaning: "SDE diffusion covariance" },
              { symbol: "L_t", meaning: "Markov 过程的 infinitesimal generator" },
            ],
          },
          figures: [
            {
              title: "从 Flow Matching 到一般 Generator Matching",
              src: "https://diffusion.csail.mit.edu/2026/docs/20260130_Lecture_05.pdf",
              href: "https://diffusion.csail.mit.edu/2026/docs/20260130_Lecture_05.pdf#page=40",
              caption: "Lecture 5 第 40 页在课程结尾提出更一般的 Markov generator 视角。正文在此补出 ODE、SDE 与 CTMC 对测试函数的三个具体公式。",
              credit: "MIT IAP 2026 Lecture 5 slides（Peter Holderrieth、Ron Shprints）, p.40；PDF 远程页引用",
              kind: "pdf-page",
              page: 40,
            },
          ],
        },
        {
          title: "11.2 Flow/Score 的正式训练与采样",
          intuition: "训练直接抽概率路径；采样才求解动力学。两段不要写在一个含糊的“去噪循环”里。",
          paragraphs: [
            "CFM 训练：反复抽 z∼p_data、ε∼N(0,I)、t∼U[0,1]，构造 x_t=α_tz+β_tε 与条件速度 target，再对 ||u_θ(x_t,t)-target||² 做梯度更新。Score training 使用同一 x_t，但回归 -ε/β_t 或等价噪声 ε。",
            "ODE 采样：抽 X_0∼p_init，选时间网格并重复 X←X+h u_θ(X,t)。SDE extension 采样：同一循环把 drift 换成 u_θ+(σ²/2)s_θ，再加 √hσε。二者都应记录 solver、步数、端点处理和 network evaluation 次数。",
          ],
          formula: {
            latex: "z,\\epsilon,t\\longrightarrow x_t=\\alpha_tz+\\beta_t\\epsilon\\longrightarrow \\begin{cases}v^{\\mathrm{target}}_t=\\dot\\alpha_tz+\\dot\\beta_t\\epsilon\\\\ s^{\\mathrm{target}}_t=-\\epsilon/\\beta_t\\end{cases}",
            explanation: "这是一条训练记录的数据流。β_t=0 的端点不可直接用于 raw score target，实践常避开端点或预测 ε。",
            symbols: [
              { symbol: "α_t,β_t", meaning: "Gaussian conditional path schedule" },
              { symbol: "v_target", meaning: "CFM 的监督速度" },
              { symbol: "s_target", meaning: "conditional score 监督" },
            ],
          },
          example: {
            title: "实现前应写出的两个循环",
            steps: [
              "训练循环只采 (z,ε,t)，构造 x_t 与 target，反向传播；不调用 ODE solver。",
              "采样循环只从 p_init 起步，按时间网格反复调用已训练网络。",
              "若使用 CFG，每次采样步还要取得 empty 与 conditional 两个预测并组合。",
              "若使用 SDE，再加入 score correction 和独立 Brownian increment。",
            ],
            result: "把训练和采样分开写，才能看出“simulation-free training”省掉了哪一段，又保留了哪一段。",
          },
        },
        {
          title: "11.3 离散 DFM 的正式训练与采样",
          intuition: "连续模型回归速度，factorized 离散模型预测终点 token posterior；两者共享 conditional-to-marginal 逻辑。",
          paragraphs: [
            "训练：抽完整序列 z、时间 t，再按 mixture path 独立腐化每个位置得到 x。Transformer 读取整段 x 与 t，输出每个位置对词表的 logits，以真实 z_j 做 cross-entropy。",
            "采样：从 p_init（masked 模型中是全 [MASK]）开始；每个时间步由 posterior logits 和 schedule 构造 off-diagonal rates，补齐负对角线，再用合法 CTMC transition 更新状态。直接采用 I+hQ 时必须控制 h 使每列概率非负；更稳健的 solver 不应被“按 rate 随便抽一下”替代。",
          ],
          formula: {
            latex: "z,t\\longrightarrow x\\sim p_t(\\cdot|z)\\longrightarrow \\ell(\\theta)=\\sum_j-\\log p_\\theta(z_j|x,t),\\qquad Q_t=\\mathbb E[Q_t^Z\\mid X_t=x]",
            explanation: "分类网络学习终点 posterior；rate 是由 posterior 与已知 conditional rate 组合出的采样对象。",
            symbols: [
              { symbol: "z_j", meaning: "第 j 个位置的干净 token" },
              { symbol: "x", meaning: "按离散路径腐化后的整段输入" },
              { symbol: "Q_t", meaning: "用于 CTMC 采样的边缘 rate matrix" },
            ],
          },
        },
        {
          title: "11.4 三份官方 Lab 与本站代码的边界",
          intuition: "本地实验回答“公式链路通不通”，官方 notebook 还回答“网络能不能在数据上学出来”。",
          paragraphs: [
            "Lab 1 本地综合脚本覆盖 Euler、Euler–Maruyama、Brownian、OU、Langevin，并以解析矩做断言；官方 notebook 另有轨迹图和 PyTorch 数据流。Lab 2 本地脚本在二维 GMM 上拟合随机特征末层，实际运行 CFM、score、ODE 和 SDE；官方版本训练可调 MLP 并提供更完整可视化。",
            "Lab 3 本地脚本覆盖 label dropout、Fourier、patch/depatch、attention、AdaLN-gated DiT forward、VAE 公式与 latent CFM 单步。它没有下载 MNIST，也没有训练完整 DiT/VAE。要复现实验结果，应运行官方 starter，遇到实现问题再对照 solution；CPU 可运行小配置，若要在合理时间完成多轮图像训练，GPU 更实际。",
          ],
          checks: [
            "报告结果时是否写明用了本站 smoke test 还是官方完整 notebook？",
            "是否把网络一次 loss 下降误写成已经学会生成？",
          ],
        },
      ],
      pitfalls: [
        "把 generator 误解成直接生成样本的 neural generator",
        "因公式统一就忽略状态空间、输出类型和损失函数差异",
        "训练时不写随机变量来源与 shape",
        "把 simulation-free training 误解成生成时也不需要积分",
        "把 NumPy forward/smoke test 报告为完整 MNIST 或 DiT 训练",
      ],
      exercises: [
        { question: "SDE generator 为什么有 Hessian 项，而单条 Euler–Maruyama 更新里的噪声均值为零？", answer: "Brownian 增量的一阶项均值为零，但二阶 Taylor 项含增量协方差 O(h)，除以 h 后留下 (1/2)Tr(a∇²f)。" },
        { question: "CFM 与 DFM 的网络输出为什么不同？", answer: "连续 CondOT 可直接回归欧氏速度；factorized 离散路径通过终点 token posterior 重参数化 rates，因此自然输出词表 logits 并用 cross-entropy。" },
        { question: "本地 Lab 3 打印 PASS 能确认什么？", answer: "它确认各 NumPy 部件的 shape、不变量和一次优化更新；不能确认完整 PyTorch DiT/VAE 已在 MNIST 上收敛。" },
      ],
      sources: [
        { title: "课程讲义 Remark 40: Generator Matching", url: notesUrl, kind: "notes", note: "从 vector field 与 rate matrix 推广到一般 Markov generators" },
        { title: "Generator Matching: Generative Modeling with Arbitrary Markov Processes", url: "https://arxiv.org/abs/2410.20587", kind: "paper", note: "Generator Matching 正式框架与一般状态空间例子" },
        { title: "Flow Matching for Generative Modeling", url: "https://arxiv.org/abs/2210.02747", kind: "paper", note: "conditional flow matching 与 Gaussian probability paths" },
        { title: "Flow Matching Guide and Code", url: "https://arxiv.org/abs/2412.06264", kind: "paper", note: "本课附录 A 部分来源之一，含统一记号与实现指南" },
        { title: "Flow Straight and Fast: Rectified Flow", url: "https://arxiv.org/abs/2209.03003", kind: "paper", note: "直线路径、reflow 与少步采样路线；不等于所有 CFM 都自动一步生成" },
        { title: "Classifier-Free Diffusion Guidance", url: "https://arxiv.org/abs/2207.12598", kind: "paper", note: "label dropout 与 conditional/unconditional 组合" },
        { title: "Scalable Diffusion Models with Transformers", url: "https://arxiv.org/abs/2212.09748", kind: "paper", note: "DiT 与 AdaLN-Zero 架构来源" },
        { title: "Discrete Flow Matching", url: "https://arxiv.org/abs/2407.15595", kind: "paper", note: "离散状态空间的 probability path 与 posterior 参数化" },
        { title: "A Continuous Time Framework for Discrete Denoising Models", url: "https://arxiv.org/abs/2205.14987", kind: "paper", note: "CTMC 离散 denoising 的连续时间框架" },
        { title: "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis", url: "https://arxiv.org/abs/2403.03206", kind: "paper", note: "课程中的 Stable Diffusion 3 案例" },
        { title: "Movie Gen: A Cast of Media Foundation Models", url: "https://arxiv.org/abs/2410.13720", kind: "paper", note: "课程中的 latent video generation 案例" },
        { title: "MIT 2026 official labs", url: labRepoUrl, kind: "code", note: "三份 starter 与 solution；完整 PyTorch 训练以此为准" },
      ],
    },
  ],
  coverage: [
    {
      source: "Lecture 1 slides + video 9eJQQVrUUoI",
      mappedTo: "第 1–2 章",
      note: "生成即采样；vector field、ODE/SDE、Euler/Euler–Maruyama、Brownian 与 OU。",
    },
    {
      source: "Lecture 2 slides + video PNkMKWW8Khw",
      mappedTo: "第 3 章",
      note: "Flow Matching matrix；conditional/marginal path 与 field；continuity equation；CFM。",
    },
    {
      source: "Lecture 3-A slides + video ngC3QnYSVNM",
      mappedTo: "第 4 章",
      note: "score/DSM、Fokker–Planck、SDE extension，以及 ODE/SDE 实践误差讨论。",
    },
    {
      source: "Lecture 3-B slides + video 8oWZ1bHwyRI",
      mappedTo: "第 5 章",
      note: "vanilla guidance、classifier guidance、CFG 推导、label dropout 与 heuristic 边界。",
    },
    {
      source: "Lecture 4 slides + video g0MB1CCBmsI",
      mappedTo: "第 6–7 章",
      note: "latent/VAE；time/text embeddings；patchify；DiT/U-Net；大规模图像/视频案例。",
    },
    {
      source: "Lecture 5 slides + video d0kmyEJN2hI",
      mappedTo: "第 8 章",
      note: "CTMC、rate matrix、KFE、离散 marginalization、DFM/MDLM 与 AR 权衡。",
    },
    {
      source: "Official Lab 1（2026）",
      mappedTo: "第 2、9 章实验",
      note: "Euler、Euler–Maruyama、Brownian、OU 与 Langevin；本地综合脚本逐项做解析或统计断言。",
    },
    {
      source: "Official Lab 2（2026）",
      mappedTo: "第 3–4 章实验与讲解",
      note: "Gaussian/linear probability paths、二维 GMM、Flow/Score Matching、SDE extension。",
    },
    {
      source: "Official Lab 3（2026）",
      mappedTo: "第 5–7、10–11 章实验与讲解",
      note: "labeled sampling、CFG、MNIST、patchify、AdaLN、conditional DiT、VAE 与 latent diffusion。",
    },
    {
      source: "课程讲义 §§1–7",
      mappedTo: "第 1–8 章",
      note: "核心定义、公式、定理与原课五讲顺序；录像口误处采用讲义最终版本。",
    },
    {
      source: "课程讲义 Appendices A–C",
      mappedTo: "第 9 章",
      note: "概率论提醒、Fokker–Planck 自包含证明、有限 CTMC 的存在唯一性。",
    },
    {
      source: "课程讲义 Appendix D",
      mappedTo: "第 10.1 节",
      note: "VAE joint KL、ELBO、aggregated posterior、reconstruction/generation 与 rate-distortion。",
    },
    {
      source: "课程讲义 Appendix E + DDPM/DDIM 原论文",
      mappedTo: "第 10.2–10.4 节",
      note: "forward process、time reversal、传统离散时间公式、DDIM 与 probability-flow ODE；DDIM 细节是明确标注的论文扩展。",
    },
    {
      source: "课程讲义 Remark 40 + Generator Matching 论文",
      mappedTo: "第 11 章",
      note: "一般 Markov generator 视角，以及 Flow/Score/DFM 的正式训练与采样算法。",
    },
    {
      source: "本站轻量实验",
      mappedTo: "8 个可运行 Python 脚本",
      note: "保留原有 5 个最小检查，新增 3 个按官方 Lab 1–3 结构对齐的 NumPy 综合实验；完整 PyTorch/MNIST 训练仍指向官方 starter/solution。",
    },
  ],
} satisfies OpenCourse;
