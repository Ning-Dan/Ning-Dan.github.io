import type { LessonWalkthrough } from "../lessonWalkthroughTypes";

export const actionWalkthroughs = {
  "action-representations": {
    intro:
      "先建立一份 7D 动作契约，再沿训练集分位数、编码、解码、越界统计和元数据保存走完闭环。完成后，每个 token 都应能追溯到明确的物理量，而不只是整数数组中的一个位置。",
    beforeYouStart: [
      "在仓库根目录打开终端；下面所有命令都从仓库根目录运行。",
      "确认 python --version 为 Python 3.10 或更高版本；实验只使用标准库，不需要安装 PyTorch。",
      "在编辑器中打开 public/labs/action_tokenizer.py，并另外准备一张三列表：字段、当前值、如果写错会造成什么后果。",
      "先执行 New-Item -ItemType Directory -Force work/action-representations；再执行 Copy-Item public/labs/action_tokenizer.py work/action-representations/action_tokenizer_work.py。所有故意修改只在副本进行。",
      "本章中的 frame、units、dt_seconds 等值属于这个 Toy 合同，不是所有机器人的统一标准。",
    ],
    steps: [
      {
        title: "第 1 步：先把 7 个数翻译成物理命令",
        goal: "在接触 tokenizer 之前，先确认模型输出的第 j 维究竟控制什么。",
        actions: [
          "定位 main() 中 ActionContract(...) 的实例化代码，不要先看 encode()。按顺序抄下 names：dx、dy、dz、droll、dpitch、dyaw、gripper。",
          "把 command_type=eef_delta_pose 和 frame=tool 写进表格。这表示前 6 维在这个实验中被解释为工具坐标系下的末端增量位姿；它不是关节角，也不是世界坐标系绝对位姿。",
          "逐项把 units 与 names 对齐：前三维是 m，中间三维是 rad，最后一维是 binary。再写下 dt_seconds=0.05，也就是合同期望每 50 ms 一个动作。",
          "对照 valid_mask 与 fixed_values：前 6 维为 True/None，gripper 为 False/0.0。由此先预测：编码后的最后一维不会占用普通 token，而解码后必须恢复为 0.0。",
        ],
        code: `names              = (dx, dy, dz, droll, dpitch, dyaw, gripper)
units              = (m,  m,  m,  rad,   rad,    rad,  binary)
valid_mask         = (T,  T,  T,  T,     T,      T,    F)
fixed_values       = (-,  -,  -,  -,     -,      -,    0.0)
command_type/frame = eef_delta_pose / tool
dt                 = 0.05 s`,
        expected: [
          "你得到的是一个带语义、坐标系、单位、周期和有效维度的动作接口，而不只是 shape=(7,)。",
          "你能在运行前预测 tokens[-1] 应为 -1，restored[-1] 应为 0.0。",
        ],
        checkpoint:
          "合上脚本后，你仍能说出第 1 维与第 4 维的单位、参考坐标系以及夹爪为何是无效维。说不出就不要进入量化。",
        troubleshooting: [
          "不要把 droll/dpitch/dyaw 当成角度制；本合同明确写的是 rad。",
          "不要仅抄 shape。若遗漏 frame 或 command_type，相同的 7 个浮点数可能被执行成完全不同的运动。",
        ],
      },
      {
        title: "第 2 步：逐条执行合同校验，并故意破坏一次",
        goal: "理解 ActionContract.validate() 拦截的是哪类接口错误，并亲眼看到错误发生在 tokenizer 之前。",
        actions: [
          "阅读 ActionContract.validate() 的三个判断块：先检查宽度一致且必须为 7D，再检查 dt/frame/command_type，最后配对检查 valid_mask 与 fixed_values。",
          "手工验证当前 gripper 配对：active=False 且 fixed=0.0，满足“无效维必须有有限固定值”。前六维 active=True 且 fixed=None，也满足“有效维不能有固定值”。",
          "在 work/action-representations/action_tokenizer_work.py 的 main() 中，只把 fixed_values 最后一个 0.0 临时改成 None；不要改 public/labs 原文件。运行下面命令。",
          "确认异常来自 contract.validate()，然后立刻把 None 恢复为 0.0。再次运行，确保脚本恢复通过。",
        ],
        code: `python work/action-representations/action_tokenizer_work.py

# 故意改错时应看到的关键错误：
ValueError: inactive dimensions need finite fixed values`,
        expected: [
          "错误版本在 ActionTokenizer.fit() 一开始调用 contract.validate() 时停止，不会带着含糊的夹爪语义继续训练。",
          "恢复 0.0 后，最终重新出现 action tokenizer: ALL CHECKS PASSED。",
        ],
        checkpoint:
          "你能解释为何 active=True/fixed=0.0 也应报错：同一维不能既由模型预测又被声明为固定。",
        troubleshooting: [
          "若没有报错，确认改的是 main() 中传给 ActionContract 的 fixed_values，而不是 dataclass 的类型注解。",
          "若恢复后仍报错，用 git diff -- public/labs/action_tokenizer.py 检查是否误改了 7 个元素的数量。",
        ],
      },
      {
        title: "第 3 步：用纸笔完成一次分箱与还原",
        goal: "在阅读实现前，先理解 token 是区间编号，而不是动作值本身。",
        actions: [
          "先用一个易算的假设区间练习：令 dx 的 low=-0.04、high=0.04、bins=32，因此单箱宽度为 (0.04-(-0.04))/32=0.0025。",
          "对 dx=0.01 手算索引：floor((0.01-(-0.04))/0.0025)=floor(20)=20。",
          "按箱中心解码：-0.04+(20+0.5)×0.0025=0.01125；往返误差为 0.00125，恰好等于半箱宽 0.00125（实现使用 ≤，因此端点相等是允许的）。",
          "再对无效的 gripper 维手算：encode 不使用 low/high，直接写 -1；decode 看到 -1 后返回 fixed_values 中的 0.0。",
        ],
        code: `width = (high - low) / bins
token = floor((value - low) / width)
restored = low + (token + 0.5) * width

dx: 0.01 -> token 20 -> 0.01125
gripper: 0.0 -> token -1 -> fixed 0.0`,
        expected: [
          "你得到的 20 只在 low/high/bins 这份元数据不变时有意义。",
          "量化误差上界是半个箱宽只对未被裁剪、使用箱中心解码的值成立。",
        ],
        checkpoint:
          "不看公式，自己再算 value=-0.02 在同一假设区间中的 token：答案应为 8；箱中心解码为 -0.01875。",
        troubleshooting: [
          "若算出 token=8.0 没问题，但进入程序前要取整数索引；实现使用 int(...)。",
          "这里的 ±0.04 是手算用的假设边界。脚本实际使用 500 条训练数据的 1%/99% 分位数，因此精确 low/high 会略微收缩。",
        ],
      },
      {
        title: "第 4 步：追踪训练数据如何变成 low/high",
        goal: "弄清量化边界只能由训练数据拟合，并知道每一维是独立拟合的。",
        actions: [
          "阅读 quantile(values, q)：它先排序，再用 p=(n-1)q 定位左右样本并做线性插值。这里不是直接取 min/max。",
          "回到 main()：random.Random(9) 固定随机种子；500 行中，平移维采样自 [-0.04,0.04]，旋转维采样自 [-0.2,0.2]，gripper 恒为 0.0。",
          "阅读 ActionTokenizer.fit() 的 for j, active 循环。对 active=False 的第 7 维，low/high 都写 None；对前六维，分别计算 q=.01 和 q=.99。",
          "确认 fit() 还检查三件事：训练集非空、每行恰为 7D、所有值有限；有效维若 hi-lo≤1e-9 会拒绝零动态范围。",
          "在笔记中写出数据泄漏规则：真实项目只准用训练 split 拟合 low/high，验证集和测试集只能调用 encode，不能重新 fit。",
        ],
        expected: [
          "你能画出 train rows → 每列 → 1%/99% 分位数 → low/high 的单向数据流。",
          "你能解释为何 gripper 恒为 0 但不会触发零范围错误：它在 valid_mask 中已被声明为无效维。",
        ],
        checkpoint:
          "回答：若 dpitch 在训练集中恒为 0，但 valid_mask 仍为 True，会发生什么？答案是 fit() 抛出 active dimension 4 has zero range。",
        troubleshooting: [
          "不要在全数据上 fit 后再划分 train/test；那会让测试分布参与边界估计。",
          "分位数裁剪不是安全限位。真实机器人还必须在执行层使用硬件允许范围、速度和加速度限制。",
        ],
      },
      {
        title: "第 5 步：逐行追踪 probe，然后运行基线",
        goal: "把手算与 encode()/decode() 的真实执行路径对上，并确认确定性输出。",
        actions: [
          "阅读 encode()：每个有效值先统计低端/高端越界，再裁剪到 [lo,hi]，按箱宽取整数，最后限制到 [0,bins-1]。注意越界计数发生在裁剪之前。",
          "阅读 decode()：无效维要求 token 必须为 -1；有效维要求 0≤token<bins，并用箱中心还原。",
          "回到 main()，先读 probe=(.01,-.02,.03,.05,-.1,.15,0.0)，在纸上标出前三维是米、中三维是弧度、末维固定。",
          "运行 python public/labs/action_tokenizer.py，把四行输出逐行抄到实验记录，不要只记录 PASS。",
          "解释第一行：6 个普通 token 加一个 -1；解释第二行：0.006102 是六个有效维的最大往返误差，不是模型预测误差。",
        ],
        code: `python public/labs/action_tokenizer.py`,
        expected: [
          "7D tokens: (20, 7, 28, 19, 7, 28, -1)",
          "max active round-trip error: 0.006102",
          "clip-high counts: [1, 1, 1, 1, 1, 1, 0]",
          "metadata round-trip + NaN rejection: PASS，随后是 action tokenizer: ALL CHECKS PASSED。",
        ],
        checkpoint:
          "指出 clip-high 为 1 的来源：不是 probe，而是随后显式编码的 (9,9,9,9,9,9,0)。",
        troubleshooting: [
          "若数值不同，先确认 random.Random(9)、500 条数据和默认 bins=32 没被前一步遗留修改。",
          "若只有最后 token 不为 -1，检查 valid_mask 最后一项和 fixed_values 最后一项是否已恢复。",
        ],
      },
      {
        title: "第 6 步：把 32 箱改成 8 箱，量化代价立刻可见",
        goal: "通过只改一个变量，观察词表更小与精度更低之间的直接权衡。",
        actions: [
          "在 work/action-representations/action_tokenizer_work.py 找到 main() 中 tokenizer = ActionTokenizer.fit(train, contract)。只在这一行加入 bins=8。",
          "在运行前预测：有效 token 应全部落在 0–7，最大往返误差通常会上升，因为每个箱子变为原来的 4 倍宽。",
          "运行同一条命令并记录 tokens 与 max active round-trip error。将它们与 32 箱基线并排写出。",
          "确认本次确定性结果的最大误差约为 0.024543，而不是 0.006102；这说明压缩 token 范围付出了分辨率代价。",
          "把工作副本里的 bins=8 删除，重新运行并确认回到基线输出；public/labs 基准文件始终不应变化。",
        ],
        code: `# 临时改成
tokenizer = ActionTokenizer.fit(train, contract, bins=8)

python work/action-representations/action_tokenizer_work.py

# 预期关键输出
7D tokens: (5, 1, 7, 4, 1, 7, -1)
max active round-trip error: 0.024543`,
        expected: [
          "token 范围缩小到 0–7，夹爪仍为 -1，因为有效掩码不受 bins 影响。",
          "最大往返误差约扩大 4 倍；这说明 bins 是动作分辨率超参数，不是越大或越小都无代价。",
        ],
        checkpoint:
          "能用一句话解释：为什么 bins 改变后模型输出 head 的类别数也必须同步改变，但 7D 合同的单位和坐标系不应改变。",
        troubleshooting: [
          "若出现 token out of range，检查是否只改了 fit 的 bins，却手工构造了旧范围 token。",
          "若恢复后仍输出 8 箱结果，保存文件并确认调用行已去掉 bins=8。",
        ],
      },
      {
        title: "第 7 步：审计裁剪、NaN 和可复现元数据",
        goal: "分清“模型能编码”与“系统知道发生了异常”，并理解部署时为何必须携带元数据。",
        actions: [
          "定位 tokenizer.encode((9,9,9,9,9,9,0))：9 远高于六个有效维的 high，因此每维 clipped_high 加 1，但数值仍会被裁到最高箱。",
          "定位 NaN 的 try/except：encode() 在进入逐维编码前用 math.isfinite 拒绝 NaN。记录这与裁剪的差异：有限越界值被裁剪并计数，非有限值直接失败。",
          "定位 metadata()，逐项确认保存 contract、low、high、bins。随后 temporary directory 中写出 JSON、读回，并断言 frame 仍为 tool。",
          "写下部署加载顺序：先加载并 validate contract → 核对版本/单位/frame/dt → 加载 low/high/bins → 才允许解码模型 token。",
        ],
        expected: [
          "六个高端裁剪计数均为 1，固定夹爪维为 0。",
          "NaN 被拒绝；JSON 往返后 frame 保留。这验证的是接口防护，不是机器人运动安全。",
        ],
        checkpoint:
          "回答：为什么不能只保存 bins=32？因为同一个 token 20 在不同 low/high 下解码成不同物理动作，而且还缺少 frame、unit 和无效维语义。",
        troubleshooting: [
          "temporary directory 会在 with 块结束后删除；本实验只验证往返，不会在仓库留下 metadata.json。",
          "真实系统中的裁剪计数应进入监控；频繁裁剪通常提示训练分布、标定或合同不匹配，不能靠静默裁剪掩盖。",
        ],
      },
      {
        title: "第 8 步：把单个 7D 动作迁移成 H×dₐ 动作块",
        goal: "把已验证的单步合同扩展到真实 VLA 常见的动作序列，同时保留可审计性。",
        actions: [
          "先在纸上选一个明确形状，例如 H=16、dₐ=7。一个训练标签的 shape 应为 (16,7)，不是把 112 个数当成没有时间轴的向量。",
          "对每个时间步 h 独立应用同一份 7D contract：第 h 行的列顺序、单位、frame 和 valid_mask 都不变；输出 token shape 仍为 (16,7)。",
          "若 episode 尾部不足 16 步，新增 time_valid_mask，shape=(16,)，让 loss 忽略 padding；不要把 padding 当成真实的零动作学习。",
          "low/high 仍只从训练 split 拟合。记录输入 action shape、token shape、time_valid_mask shape，并在训练第一批次立即 assert。",
          "解码一个 batch 后，分别报告每个动作维的往返误差与裁剪率；不要只报告把米和弧度混在一起的单个平均数。",
          "最后把连续执行留给下一章的带时间戳队列；tokenizer 只定义表示，不负责 TTL、延迟或安全停机。",
        ],
        code: `actions.shape        == (batch, H, 7)
tokens.shape         == (batch, H, 7)
time_valid_mask.shape == (batch, H)

loss = masked_loss(pred_tokens, target_tokens, time_valid_mask)`,
        expected: [
          "你得到一份可交给模型的序列合同：物理列语义没有因增加时间轴而丢失，padding 也不会污染 loss。",
          "你能明确区分表示层验收（shape、往返误差、裁剪率）与执行层验收（延迟、TTL、限幅）。",
        ],
        checkpoint:
          "最终交付物中必须同时出现 contract 版本、H、dₐ、动作列顺序、time mask 规则和训练集拟合的 low/high；缺一项就不能复现实验。",
        troubleshooting: [
          "若模型输出是 (batch,7,H)，先明确转置位置并加 shape 断言，不能靠广播让 loss 悄悄运行。",
          "若不同 embodiment 的 dₐ 不同，需要各自 valid mask/adapter；不能用补零假装所有机器人共享完全相同的物理合同。",
        ],
      },
    ],
    finalArtifact: [
      "一张完整的 7D ActionContract 表：names、command_type、frame、units、dt、gripper 语义、valid/fixed mask 和版本。",
      "32 箱与 8 箱的 tokens、最大往返误差对照记录。",
      "裁剪、NaN 拒绝和 metadata 往返的验收结果。",
      "一份从 7D 扩展到 H×7 的 shape 与 time_valid_mask 方案。",
    ],
    verifiedBoundary:
      "已在本地标准库 Toy 脚本中确认合同校验、分位数量化、往返误差、裁剪计数、NaN 拒绝和 JSON 元数据往返。它没有验证任何具体机器人的控制频率、硬件限位、坐标标定或真机安全性；这些必须针对目标机器人另行测量和验收。",
    knowledgeCheck: [
      {
        question: "为什么 shape=(7,) 不能算完整的动作定义？",
        answer:
          "因为 shape 不包含每列语义、命令类型、参考坐标系、单位、时间间隔、夹爪语义和无效维规则；缺少其中任一项，相同数组都可能被解释成不同物理命令。",
      },
      {
        question: "为什么 low/high 只能在训练 split 上拟合？",
        answer:
          "若用验证或测试数据拟合边界，就把其分布信息泄漏进预处理。正确流程是训练集 fit，其他 split 只使用冻结的元数据 encode。",
      },
      {
        question: "32 箱改成 8 箱后，什么变了，什么不应变？",
        answer:
          "token 类别范围和量化误差改变；动作列的物理语义、单位、坐标系、valid mask 与固定值不应改变。",
      },
      {
        question: "为什么裁剪通过不等于安全？",
        answer:
          "量化器只是把有限越界值压回训练分位区间。它不知道硬件位置、速度、加速度、碰撞或急停约束，执行层仍需独立安全限制。",
      },
    ],
  },

  "action-chunking": {
    intro:
      "这一章把“输出一段动作”拆成可执行的时间线：观测何时产生、请求何时到达、旧动作何时过期、每个 tick 最多走多远。你会先手算同一条时间线，再运行脚本，最后故意放宽 TTL 看见断言失败。",
    beforeYouStart: [
      "在编辑器中打开 public/labs/chunked_controller.py；终端停在仓库根目录。",
      "先执行 New-Item -ItemType Directory -Force work/action-chunking；再执行 Copy-Item public/labs/chunked_controller.py work/action-chunking/chunked_controller_work.py。基线运行原文件，故障注入只改副本。",
      "准备画一条从 0.00 s 到 0.30 s 的时间轴，刻度为 0.01 s。",
      "本实验是一维位置 Toy executor；它验证队列语义，不代表真实机械臂控制器。",
      "先不要改 dt、ttl 或 max_step；完成基线后每次只改一个变量。",
    ],
    steps: [
      {
        title: "第 1 步：读清一个 chunk 携带的五项信息",
        goal: "先建立消息合同，避免把动作数组与它的生成时刻分开。",
        actions: [
          "阅读 ActionChunk dataclass，抄下 request_id、observation_time、action_start_time、dt、targets。",
          "解释五项含义：request_id 标识请求；observation_time 用于判断输入观测是否新鲜；action_start_time 是第一个动作目标的排程时刻；dt 是相邻目标的时间间隔；targets 按时间排列。",
          "阅读 validate()：dt 必须为正、targets 非空且每个元素有限。注意它没有验证碰撞或真实关节限位。",
          "在纸上为 main() 的 first chunk 预留一行：request_id=1、observation_time=0、action_start_time=0.05、dt=0.05；targets 留到第 3 步计算。",
        ],
        code: `ActionChunk(
  request_id=1,
  observation_time=0.00,
  action_start_time=0.05,
  dt=0.05,
  targets=(...),
)`,
        expected: [
          "你能指出新旧 chunk 的比较依据是 observation_time，而不是到达顺序或 request_id 数值本身。",
          "你能解释为何 targets 不能脱离 action_start_time 和 dt 使用：第 i 项的排程时刻是 action_start_time+i×dt。",
        ],
        checkpoint:
          "回答：request_id=3 是否天然比 request_id=2 更新？本脚本不这样判断；receive() 真正比较的是 observation_time。",
        troubleshooting: [
          "不要把 observation_time 当 arrival_time。后者由 DelayedNetwork 根据 latency 计算。",
          "真实分布式系统还要定义时钟同步和时间戳来源；Toy 脚本假设所有时间使用同一时基。",
        ],
      },
      {
        title: "第 2 步：手算 p99 延迟与动作储备",
        goal: "把“延迟很高”转换成至少需要覆盖多少个动作周期。",
        actions: [
          "找到 main() 中 10 个 latencies，并按升序核对它们已经排列：最大值为 0.22 s。",
          "阅读 percentile() 的 nearest-rank 实现：索引为 ceil(q×n)-1。代入 q=.99、n=10，得到 ceil(9.9)-1=9，因此 p99=latencies[9]=0.22 s。",
          "加入 margin=.03 s，得到要覆盖的时间 0.25 s。再除以 dt=.05 s/action，ceil(0.25/0.05)=5 个动作。",
          "把这 5 个动作写成“本组端到端样本换算出的初始储备”。样本只有 10 个，最大值充当 nearest-rank p99，不能据此声称已经掌握真实尾部。",
        ],
        code: `p99 = 0.22 s
margin = 0.03 s
dt = 0.05 s/action
reserve = ceil((0.22 + 0.03) / 0.05) = 5 actions`,
        expected: [
          "你在运行前得到 p99=220 ms、reserve=5。",
          "你知道 reserve 是延迟预算换算，不是 chunk horizon 的唯一决定因素；任务动态和重规划策略也会限制 H。",
        ],
        checkpoint:
          "若 dt 改成 0.10 s 且其他值不变，手算 reserve=ceil(2.5)=3；这不意味着降低控制频率一定更安全。",
        troubleshooting: [
          "不要把 0.22 当 22 ms；脚本中的单位是秒。",
          "percentile() 使用的是该脚本明确实现的 nearest-rank 规则；其他统计库的插值定义可能给出不同 p99。",
        ],
      },
      {
        title: "第 3 步：手算 goal_chunk 生成的 8 个目标",
        goal: "确认 horizon 表示未来目标数量，并理解生成器输出的是绝对目标位置。",
        actions: [
          "阅读 goal_chunk()：step=(goal-observation)/horizon，targets 第 i 项为 observation+step×(i+1)。",
          "代入 observation=0、goal=1、horizon=8，得到 step=0.125。",
          "写出完整 targets：(0.125,0.25,0.375,0.5,0.625,0.75,0.875,1.0)。",
          "在时间轴上把它们标为计划目标；暂时不要把它们写成实际 position，因为 SafeExecutor 还会施加 max_step 限幅。",
        ],
        code: `step = (1.0 - 0.0) / 8 = 0.125
targets = (0.125, 0.250, 0.375, 0.500,
           0.625, 0.750, 0.875, 1.000)`,
        expected: [
          "第一个计划目标是 0.125，而不是 0 或 1。",
          "8 个目标覆盖 8 个控制 tick；在 dt=.05 时名义跨度为 0.4 s，但本实验 TTL=.18 s 会更早阻止旧 chunk 继续执行。",
        ],
        checkpoint:
          "自己计算 observation=.24、goal=1、horizon=8 的 step：0.095；第一个目标应为 0.335。",
        troubleshooting: [
          "不要混淆 horizon 与动作维度；这里 targets 是 8 个一维时间步，不是一个 8D 同时动作。",
          "真实 H×dₐ chunk 应让每个 targets[h] 成为 dₐ 维向量。",
        ],
      },
      {
        title: "第 4 步：沿时间轴追踪网络到达顺序",
        goal: "理解 heap 依据 arrival_time 交付，而执行器依据 observation_time 判断新鲜度。",
        actions: [
          "阅读 DelayedNetwork.send()：arrival_time=chunk.observation_time+latency，然后把 InFlight 压入最小堆。",
          "对 first 手算 arrival_time=0+.04=.04 s，在时间轴 .04 处做标记。",
          "阅读 ready(now)：只要堆顶 arrival_time≤now 就弹出。因此 ready(.03) 必须为空，ready(.04) 必须返回恰好一个 chunk。",
          "继续追踪 receive(delivered[0],.04)：age=.04-0=.04，小于 ttl=.18，而且 observation_time=0 大于初始 -∞，所以接收成功。",
        ],
        code: `send at observation_time 0.00
latency                     0.04
arrival_time                0.04

ready(0.03) -> []
ready(0.04) -> [first]
receive age  -> 0.04 s < 0.18 s`,
        expected: [
          "你得到从观测到到达的完整时间关系，而不是只知道“有 40 ms 延迟”。",
          "你能解释：即使某 chunk 刚到达，也可能因其 observation_time 太旧而被 TTL 拒绝。",
        ],
        checkpoint:
          "若 latency=.20，arrival_time=.20，此时 age=.20>ttl=.18；ready 会交付，但 receive 应拒绝。",
        troubleshooting: [
          "若把 arrival_time 写成 now+latency，重放历史事件时会改变结果；本脚本明确以 observation_time 为起点。",
          "heap 只解决到达排序，不替代 stale/out-of-order 检查。",
        ],
      },
      {
        title: "第 5 步：逐 tick 手算限幅后的真实位置",
        goal: "看清计划目标与执行位置之间为何不同。",
        actions: [
          "阅读 SafeExecutor.tick() 的正常分支：先核对 action_start_time+index×dt 是否已经到达；再取当前 target、推进 index，并把 target-position 裁到 [-max_step,max_step]。",
          "第一个 target=.125，初始 position=0，差值 .125 被 max_step=.08 限为 .08，所以 position=.08。",
          "第二个 target=.25，差值 .17，再加 .08 得 .16；第三个 target=.375，差值 .215，再加 .08 得 .24。",
          "把计划序列 (.125,.25,.375) 与实际序列 (.08,.16,.24) 并排写出，并注明限制发生在执行器而不是模型。",
        ],
        code: `tick  target  previous  clipped_delta  new_position
1     .125    .00       .08            .08
2     .250    .08       .08            .16
3     .375    .16       .08            .24`,
        expected: [
          "states 精确等于 [0.08,0.16,0.24]。",
          "你理解 max_step 是 Toy 速率限制；真实系统通常还需要每关节/末端轴的速度、加速度、jerk 与工作空间约束。",
        ],
        checkpoint:
          "若 max_step=.20，前三步将是 [.125,.25,.375]；因为每次目标差都不超过 .20。",
        troubleshooting: [
          "不要把 max_step=.08 解释为 0.08 m/s；脚本把它当每个 tick 的最大位置变化，物理单位需由外部合同定义。",
          "位置限幅不能替代碰撞检测。",
        ],
      },
      {
        title: "第 6 步：区分 TTL 过期与乱序拒绝",
        goal: "分别走通两条常被混为一谈的失败路径。",
        actions: [
          "先看 tick(.20)：active chunk 的 observation_time=0，所以 age=.20>.18。tick 清空 active、controlled_stops 加 1，并返回当前 position=.24，也就是 hold。",
          "再看 newer：observation_time=.21，在 now=.25 接收，age=.04，且 .21>latest_observation_time=0，因此接收成功。",
          "最后看 older_late：observation_time=.10，在 now=.26 时 age=.16，并没有超过 TTL；但 .10≤latest_observation_time=.21，所以仍被拒绝。",
          "在笔记中分别写下原因：first 是 expired；older_late 是 out-of-order。二者都累计 rejected/stops，但判据不同。",
        ],
        code: `tick(.20):       .20 - .00 = .20 > ttl .18 -> hold .24
receive(newer):   .25 - .21 = .04, .21 > .00 -> accept
receive(older):   .26 - .10 = .16 < ttl, but .10 <= .21 -> reject`,
        expected: [
          "过期时不重放旧动作，而是保持 .24；controlled_stops=1。",
          "乱序 chunk 即使尚未超过 TTL 也不能覆盖更新状态；rejected_stale=1。",
        ],
        checkpoint:
          "你能不看代码回答 older_late 被拒绝的唯一直接原因：不是 age，而是 observation_time 不新于 latest_observation_time。",
        troubleshooting: [
          "脚本把 TTL 过期和乱序都计入 rejected_stale/controlled stop 的简化计数；生产系统应拆分指标以便定位网络与推理问题。",
          "hold 是本 Toy 的 controlled stop。真实机器人应由经过风险分析的停止策略决定保持、制动还是退回安全姿态。",
        ],
      },
      {
        title: "第 7 步：跑通基线，再放宽 TTL 制造失败",
        goal: "用确定性输出核验全部手算，并通过单变量反例理解过长 TTL 的风险。",
        actions: [
          "先运行 python public/labs/chunked_controller.py，逐行对照前六步的 p99、reserve、states、hold 和计数。",
          "打开 work/action-chunking/chunked_controller_work.py，找到 main() 中 SafeExecutor(ttl=.18, max_step=.08)，只把 ttl=.18 临时改为 ttl=.30。",
          "再次运行。此时 tick(.20) 不再过期，会继续走第四个旧目标并把 position 从 .24 推到 .32；随后 assert held == .24 失败。",
          "解释反例：延长 TTL 虽减少停机，却让基于旧观测生成的动作继续执行；可用性和陈旧风险必须同时评估。",
          "把 ttl 恢复为 .18，重新运行直到 ALL CHECKS PASSED。",
        ],
        code: `python public/labs/chunked_controller.py
python work/action-chunking/chunked_controller_work.py

# 临时反例：
executor = SafeExecutor(ttl=.30, max_step=.08)
# 预期在 assert held == .24 处失败；此时 held 实际为 .32。`,
        expected: [
          "基线输出 latency p99=220 ms; reserve=5 actions at 50 ms/action。",
          "基线 limited states 为 [0.08,0.16,0.24]，controlled-stop hold 为 0.24。",
          "ttl=.30 的反例触发 AssertionError，而不是继续显示 ALL CHECKS PASSED；恢复后重新通过。",
        ],
        checkpoint:
          "用自己的话解释：TTL 不是越大越好。它必须限制感知—决策闭环允许使用多旧的观测。",
        troubleshooting: [
          "若反例没有在 held 断言失败，确认修改的是 main() 实例，而不是 __init__ 的默认值；main() 显式传入了 .18。",
          "若恢复后 stale 断言失败，检查是否误改 observation_time=.21/.10。",
        ],
      },
      {
        title: "第 8 步：迁移到 H×dₐ 真正动作块",
        goal: "把一维队列机制扩展为 VLA 服务与机器人执行器之间可验收的接口。",
        actions: [
          "把 targets 从 tuple[float,...] 改成概念上的 tuple[tuple[float,...],...]：外层长度 H，内层长度 dₐ。先选并记录例如 H=16、dₐ=7、dt=.05。",
          "每个 chunk 同时携带 schema_version、request_id、observation_time、clock_id、action_start_time、frame、units、dt 和 H×dₐ targets；接收时先做 shape/finite/合同版本检查。",
          "响应晚到时按 action_start_time 和 dt 跳过已经属于过去的前缀；observation_time 只参与新鲜度判断，不能代替执行排程锚点。",
          "把 max_step 扩展为每维限制向量，并在每个 tick 对 dₐ 维分别限幅；禁止依赖广播悄悄把标量限制用于所有米/弧度维。",
          "用真实端到端时间戳记录 observation→encode→inference→network→receive→execute，直接统计端到端 p50/p95/p99；不要把若干分项 p99 相加冒充测量结果。",
          "做四个故障注入：延迟超过 TTL、旧请求晚到、chunk 含 NaN、模型服务断流；逐项记录执行器是否进入预先定义的 controlled stop。",
          "最后才接 shadow mode 或仿真回放；真机前还需独立的硬件限位、碰撞监测、急停和人工审批。",
        ],
        code: `targets.shape == (H, action_dim)
max_step.shape == (action_dim,)

receive gates:
schema -> shape -> finite -> clock/timestamp/TTL -> skip expired prefix -> per-axis limits -> queue`,
        expected: [
          "你得到一份可实现的 chunk 服务合同和故障注入清单，而不只是“使用 action chunking”。",
          "Toy 中的 reserve=5 只作为计算示例；真实 reserve 必须使用目标部署链路的端到端测量重新计算。",
        ],
        checkpoint:
          "最终设计必须能回答：哪次观测产生了当前动作、动作何时过期、乱序如何拒绝、断流后机器人具体做什么。",
        troubleshooting: [
          "若模型 query rate 与底层 servo rate 不同，要明确重采样/插值或分层控制，不要把 dt 混成一个值。",
          "若网络与机器人时钟不同步，应先建立单调时间基准或校时方案，否则 age 判定不可信。",
        ],
      },
    ],
    finalArtifact: [
      "一条标有 observation、arrival、receive、tick、TTL 的完整时间轴。",
      "p99=220 ms、margin=30 ms、dt=50 ms 推得 reserve=5 的手算。",
      "计划 targets 与实际 limited states 的逐 tick 对照表。",
      "ttl=.30 反例及恢复记录，以及 H×dₐ 服务合同与四项故障注入清单。",
    ],
    verifiedBoundary:
      "已在本地一维 Toy 队列中确认 nearest-rank p99、到达堆、max_step 限幅、TTL hold、乱序拒绝和 NaN 拒绝。没有验证真实网络时钟、机械臂动态、碰撞安全或任何硬实时保证；220 ms 与 reserve=5 只是脚本注入数据的结果。",
    knowledgeCheck: [
      {
        question: "为什么刚到达的 chunk 仍可能被拒绝？",
        answer:
          "到达新不等于观测新。receive 用 now-observation_time 检查 TTL，并与 latest_observation_time 比较；网络中刚到达的消息可能基于很旧的观测或已经乱序。",
      },
      {
        question: "计划前三个 targets 为什么是 .125/.25/.375，实际状态却是 .08/.16/.24？",
        answer:
          "goal_chunk 生成目标，而 SafeExecutor 每个 tick 将 target-position 裁到 ±max_step=.08，所以执行位置受限。",
      },
      {
        question: "older_late 的 age=.16 小于 TTL=.18，为何仍拒绝？",
        answer:
          "它的 observation_time=.10 不晚于已经接收的 .21，属于乱序旧状态，不能覆盖更新 chunk。",
      },
      {
        question: "为什么不能直接把几个模块的 p99 相加成系统 p99？",
        answer:
          "分项延迟可能相关，各自第 99 百分位通常也不是同一次请求。直接相加既可能高估，也可能低估系统 p99。生产预算应优先使用同一请求边界的端到端样本；若要概率保证，还需显式分配尾部风险。",
      },
    ],
  },

  "diffusion-policy": {
    intro:
      "这一章从一个具体的 +2 动作样本开始：亲手加噪、写出监督目标，再跟进 TinyDenoiser 的训练与 DDPM 反向采样。你还会把预测噪声的符号故意翻转，看双峰结构怎样被破坏，最后才讨论如何扩到图像/语言条件下的 H×dₐ。",
    beforeYouStart: [
      "打开 public/labs/diffusion_multimodal_1d.py；从文件顶部说明开始读，先确认任务是两个有效模式 -2 和 +2。",
      "先执行 New-Item -ItemType Directory -Force work/diffusion-policy；再执行 Copy-Item public/labs/diffusion_multimodal_1d.py work/diffusion-policy/diffusion_work.py。所有符号破坏只改副本。",
      "终端位于仓库根目录；脚本只使用标准库，但完整训练约需数秒到十几秒。",
      "准备记录五列：clean_action、step、noise、noisy_action、target_noise。",
      "本实验验证一维多峰机制，不验证图像条件、轨迹平滑性或机器人成功率。",
    ],
    steps: [
      {
        title: "第 1 步：先算清为什么单点 MSE 会落在两峰中间",
        goal: "理解生成式动作策略要解决的具体问题，而不是从网络结构背起。",
        actions: [
          "把 Toy 专家分布写成：一半样本靠近 -2，一半靠近 +2，每个峰叠加标准差 0.12 的高斯噪声。对应实现是 sample_expert()。",
          "暂时忽略峰内小噪声，令预测为常数 a。均方误差为 0.5(a+2)²+0.5(a-2)²=a²+4。",
          "对 a 求导得到 2a=0，因此常数 MSE 最优解 a=0；但 0 不属于任一专家主峰。",
          "在笔记中写明：这里证明的是这个对称、无条件 Toy 分布下的条件均值现象，不是说所有 BC/MSE 策略都会输出危险均值。若观测能区分模式，条件均值可以不同。",
        ],
        code: `L(a) = 0.5(a + 2)^2 + 0.5(a - 2)^2
     = a^2 + 4
dL/da = 2a = 0  =>  a* = 0`,
        expected: [
          "你得到单点回归最优值 0，而两个有效模式在约 -2/+2。",
          "你能说出扩散模型本章的目标：学习能从同一条件采样出多个模式的分布，而不是只回归一个平均动作。",
        ],
        checkpoint:
          "若两峰概率改成 75% 在 -2、25% 在 +2，常数 MSE 最优值是加权均值 -1；这仍不等于扩散模型必然更安全。",
        troubleshooting: [
          "不要把“均值位于模式之间”误写成 MSE 的实现 bug；它是该损失对多峰无条件目标的统计性质。",
          "真实任务中动作是否多峰、均值是否危险都必须从条件数据与任务约束验证。",
        ],
      },
      {
        title: "第 2 步：对一个 +2 样本亲手执行前向加噪",
        goal: "把 DDPM 训练样本公式落实为一个可核算数值。",
        actions: [
          "阅读 make_schedule()：第 0 步 beta₀=.015，所以 alpha₀=.985，alpha_bar₀=.985。",
          "取具体 clean_action x₀=2.0、step=0、noise ε=-0.5。按 train() 中公式计算 sqrt(.99)×2 + sqrt(.01)×(-.5)。",
          "算得 noisy_action x_t≈1.9400。训练输入 features() 的第一项为 x_t/3≈0.6467；tau=0，另外两项 sin(0)=0、cos(0)=1。",
          "监督目标不是 clean_action，而是本次实际加入的 ε=-0.5。若模型预测 -0.2，这个单样本噪声 MSE 为 (-0.2-(-0.5))²=.09。",
        ],
        code: `beta_0 = 0.01
alpha_bar_0 = 0.99
x_0 = 2.0
epsilon = -0.5

x_t = sqrt(0.99)*2.0 + sqrt(0.01)*(-0.5)
    ≈ 1.9400
features = (1.9400/3, 0, 0, 1)
target_noise = -0.5`,
        expected: [
          "你得到 x_t≈1.9400 和特征约 (0.6467,0,0,1)。",
          "你能指出 train_batch() 的 target_noise 来自随机 ε，而不是模式标签或 x₀。",
        ],
        checkpoint:
          "把预测改为 -0.5，单样本 loss 应为 0；预测为 +0.5，loss 应为 1。",
        troubleshooting: [
          "不要把 beta 与 alpha_bar 混用；代码先算 alpha=1-beta，再累乘得到 alpha_bar。",
          "手算有四舍五入误差即可；训练代码使用完整浮点值。",
        ],
      },
      {
        title: "第 3 步：逐行读出一条训练样本是怎样生成的",
        goal: "把 sample_expert、schedule、随机时间步和 features 串成一条数据管线。",
        actions: [
          "先读 sample_expert(rng)：rng.random()<.5 选择 -2，否则 +2，再加 rng.gauss(0,.12)。它没有观测或语言条件。",
          "读 train(seed=17, iterations=4500, batch_size=64)：固定 seed 后，每个 iteration 重新构造 64 条样本。",
          "对每条样本按代码顺序编号：采 clean_action → 均匀采 step∈[0,49] → 采标准高斯 noise → 查 alpha_bar → 生成 noisy_action → 构造四维 features → 把 noise 作为 label。",
          "读 features(noisy_action,step,total_steps)：网络看到 x_t/3、tau、sin(pi tau)、cos(pi tau)。后 3 项让网络知道当前噪声阶段。",
          "在纸上写 shape：单样本 inputs=(4,)，target_noise 是标量；一个 batch 是 64 个这样的 pair。",
        ],
        code: `clean_action ~ expert mixture
step         ~ Uniform{0,...,49}
noise        ~ N(0,1)
noisy_action = sqrt(alpha_bar[step])*clean_action
             + sqrt(1-alpha_bar[step])*noise
inputs.shape = (4,)
target       = noise`,
        expected: [
          "你能从任意 batch pair 反向说出四个 feature 的来源。",
          "你知道时间条件不可省略：同一个 noisy_action 在不同噪声阶段对应的去噪任务不同。",
        ],
        checkpoint:
          "回答 batch_size=64 是否代表 64 个固定数据文件：不是；脚本每次迭代在线采样 64 个 Toy 样本。",
        troubleshooting: [
          "脚本中的 step 是扩散时间索引，不是机器人轨迹的第 h 个控制时间步。迁移到 H×dₐ 时这两个轴必须分开命名。",
          "这里 features 只有 4 维；真实 Diffusion Policy 会加入视觉/状态条件和更强的时序网络。",
        ],
      },
      {
        title: "第 4 步：沿 TinyDenoiser 走完前向、loss 与一次更新",
        goal: "知道究竟哪个输出在拟合噪声，以及 loss 如何推动参数改变。",
        actions: [
          "阅读 TinyDenoiser.__init__：输入宽度 width=4，隐藏层 hidden=32；w1 形状概念上是 (32,4)，w2 是 (32,)，最终输出一个 predicted_noise。",
          "阅读 forward()：每个隐藏单元先做线性组合再 tanh，输出层对 32 个 hidden_values 加权求和。",
          "阅读 train_batch()：error=prediction-target_noise，loss 累加 error²/batch_size；grad_prediction=2×error/batch_size。",
          "继续读 old_w2 的用途：先保存更新前的输出权重，再把梯度反传到隐藏层；最后四组参数都由 _adam_update() 更新。",
          "用第 2 步的单样本复核：prediction=-.2、target=-.5 时 error=.3、平方误差=.09；batch 中还要除以样本数后累加。",
        ],
        code: `inputs (4)
  -> Linear(4,32) + tanh
  -> Linear(32,1)
  -> predicted_noise

error = predicted_noise - target_noise
loss  = mean(error^2)`,
        expected: [
          "你能明确说出模型不是直接分类 -2/+2，也不是直接回归 clean_action；当前参数化预测加入的噪声。",
          "你能在代码中找到 loss、四组梯度以及 Adam 的一阶/二阶状态。",
        ],
        checkpoint:
          "为什么 old_w2 要在更新前复制？当前实现虽然统一在末尾更新参数，但反向计算隐藏梯度必须使用同一次前向对应的输出权重。",
        troubleshooting: [
          "不要把隐藏层 32 当成扩散步数；schedule 有 50 步，两者是不同超参数。",
          "这个手写网络用于暴露机制，不应作为真实 VLA 的性能实现。",
        ],
      },
      {
        title: "第 5 步：运行训练，并正确解释并不单调的 loss",
        goal: "复现确定性结果，同时避免把一个 mini-batch loss 曲线误读成质量证明。",
        actions: [
          "运行 python public/labs/diffusion_multimodal_1d.py；等待脚本完成 4500 次、每次 64 样本的训练。",
          "记录四个 checkpoints：iteration 1、500、1500、4500。它们来自不同随机 batch，所以最后一个值可以高于第 1500 次。",
          "记录 single-MSE baseline≈-0.0630。它来自用 1000 个不同固定种子各采一个专家动作后的样本均值，接近理论 0 但不会精确等于 0。",
          "不要只以 loss 下降为验收；继续记录采样分位数和 negative/central/positive 三段计数，它们更直接对应本实验的双峰目标。",
        ],
        code: `python public/labs/diffusion_multimodal_1d.py`,
        expected: [
          "training MSE checkpoints: [1.2887, 0.4228, 0.3473, 0.3680]",
          "terminal alpha_bar=0.003536；它足够小，因而从 N(0,1) 初始化是明确的近似，但不是有限步严格恒等。",
          "single-MSE baseline (expert mean): -0.0630",
          "sample q10/q50/q90 约为 [-2.098,1.551,2.129]。",
          "mode counts: negative=197, central=1, positive=202, total=400，随后出现 max_abs、PASS 与 BOUNDARY。",
        ],
        checkpoint:
          "解释为何 0.3680 高于 0.3473 仍不自动代表训练退化：这是不同在线随机 batch 的瞬时 MSE；应同时用固定验证集和最终采样指标判断。",
        troubleshooting: [
          "若输出不同，确认 seed=17、iterations=4500、batch_size=64、采样 seed=23 均未修改。",
          "若运行时间明显过长，先确认使用本机 Python 而非带调试逐行模式；不要为了赶时间直接把输出文本当结果。",
        ],
      },
      {
        title: "第 6 步：手算反向采样的一步",
        goal: "理解模型预测的噪声如何在 DDPM 更新中把 x_t 推向低噪声样本。",
        actions: [
          "阅读 sample()：每条样本先从 N(0,1) 近似初始化 action，再从 step=49 倒序走到 0。先检查终端 ᾱ_T≈0.003536；若它不够小，标准高斯初值会明显错配 q(x_T)。",
          "取一个具体演示：step=49、action=1.0、predicted_noise=.2。由 schedule 得 beta=.20、alpha=.80、alpha_bar≈.003536。",
          "代入 mean=(action-beta×predicted_noise/sqrt(1-alpha_bar))/sqrt(alpha)，算得 mean≈1.073233。",
          "step>0 时还会加后验噪声；该步 posterior_variance≈.199823，因此实际下一状态是 1.073233+sqrt(.199823)×z。z 每次采样不同，这是随机生成的一部分。",
          "当 step=0 时不再加随机项，直接令 action=mean。",
        ],
        code: `step = 49
x_t = 1.0
predicted_noise = 0.2
beta = 0.20
alpha = 0.80
alpha_bar = 0.0035364

mean = (x_t - beta*predicted_noise/sqrt(1-alpha_bar))/sqrt(alpha)
     ≈ 1.073233
posterior_variance ≈ 0.199823`,
        expected: [
          "你能指出采样循环方向是 49→0，而训练 step 是随机采样。",
          "你知道一次 mean 更新还不是最终动作；要走完整个 schedule，且 step>0 包含随机后验项。",
        ],
        checkpoint:
          "若 step=0，代码是否仍采 z？不会；else 分支直接 action=mean。",
        troubleshooting: [
          "不要把 sample() 中的 count=400 当 diffusion steps；每条样本使用 50 个 steps，一共生成 400 条样本。",
          "本手算固定 predicted_noise=.2 只是解释公式；真实值由训练后的 TinyDenoiser.forward() 给出。",
        ],
      },
      {
        title: "第 7 步：把去噪符号改错，观察模式验收失败",
        goal: "用一个明确反例确认反向公式的符号不是书写细节。",
        actions: [
          "在 work/diffusion-policy/diffusion_work.py 的 sample() 中，紧跟 predicted_noise,_=model.forward(...) 临时加入 predicted_noise = -predicted_noise；不要修改训练部分或原文件。",
          "运行 python work/diffusion-policy/diffusion_work.py。固定随机种子下，样本绝对值会膨胀到约 220，并在 assert max_abs < 4.0 处失败。",
          "解释原因：mean 公式本应减去预测噪声，先把预测值取反等价于沿错误方向修正。只看正负模式计数可能漏掉这种爆炸，所以脚本还检查数值范围。",
          "删除工作副本中的临时取反行，重新运行；必须恢复 negative=197、central=1、positive=202、max_abs<4 和最终 PASS。",
        ],
        code: `predicted_noise, _ = model.forward(...)
predicted_noise = -predicted_noise  # 只为错误消融临时加入

python work/diffusion-policy/diffusion_work.py

# 固定种子下预期失败（末尾数值约 220）：
AssertionError: <max_abs>`,
        expected: [
          "错误版本不会显示最终 PASS，而是在样本范围断言处失败。",
          "恢复后重新得到 max_abs<4；这验证了测试能捕捉该符号错误。",
        ],
        checkpoint:
          "你能指出改错发生在采样器，不在训练数据或模型权重；因此相同模型也会因 solver 公式错误而生成坏结果。",
        troubleshooting: [
          "若错误版本仍通过，确认临时行位于 sample() 的反向循环内、mean 计算之前。",
          "若恢复后结果仍不对，重新从 public/labs 复制覆盖工作副本；git diff -- public/labs/diffusion_multimodal_1d.py 应始终为空。",
        ],
      },
      {
        title: "第 8 步：把标量机制迁移到条件 H×dₐ 动作",
        goal: "明确真实 VLA 扩展时每个张量、条件和验收项怎样变化。",
        actions: [
          "选择明确目标形状，例如 clean_actions.shape=(B,H,dₐ)=(32,16,7)；noise 使用完全相同 shape，diffusion step 可按 batch 采样为 (B,) 后正确广播。",
          "对整个动作块做 x_t=sqrt(alpha_bar_t)×A+sqrt(1-alpha_bar_t)×ε；denoiser 必须输出 predicted_noise.shape=(32,16,7)。第一批就 assert 三者 shape 完全一致。",
          "把图像、语言和机器人 state 编成 condition；网络输入不再只是四维 features。做三项条件消融：打乱语言、遮挡图像、置乱 state，并与未消融的固定验证 episodes 比较。",
          "loss 对 B/H/dₐ 求 masked mean；episode 尾部 padding 必须用 time_valid_mask 排除。米、弧度和夹爪维还应分别报告归一化与反归一化误差。",
          "采样器从 shape=(B,H,dₐ) 的高斯噪声开始，每一扩散步输出同 shape；解码后交给带时间戳、TTL 和限幅的 chunk executor，而不是直接无限制下发。",
          "完成 record→split→train-only normalization→train→offline replay→simulation→shadow mode→受控真机的证据链；Toy 双峰 PASS 不能跳过这些阶段。",
        ],
        code: `clean_actions.shape   == (B, H, action_dim)
noise.shape           == (B, H, action_dim)
predicted_noise.shape == (B, H, action_dim)
time_mask.shape       == (B, H)

loss = masked_mean((predicted_noise - noise) ** 2)`,
        expected: [
          "你得到从 1D 噪声预测到条件动作块的逐项 shape 映射。",
          "验收同时包含固定验证 loss、条件消融、采样分布、回放/仿真行为和执行层安全门，而不只是一条训练曲线。",
        ],
        checkpoint:
          "最终实现应能打印一个 batch 的 image/language/state/action/noise/prediction/mask shape，并解释每个轴；否则先不要启动长训练。",
        troubleshooting: [
          "扩散 step t 与机器人时间轴 H 是两个独立轴；命名成 diffusion_step 与 horizon_index 可避免混淆。",
          "若不同动作维量纲差异大，应只用训练 split 的统计量归一化，并保存元数据；否则大尺度维可能主导 loss。",
        ],
      },
    ],
    finalArtifact: [
      "两峰分布下常数 MSE 最优值为 0 的完整手算。",
      "x₀=2、ε=-.5、step=0 的前向加噪与噪声 loss 手算，以及终端 ᾱ_T 检查。",
      "训练 checkpoints、采样分位数和三段 mode counts 的复现记录。",
      "错误符号导致样本范围断言失败的消融记录，以及恢复 PASS 的证据。",
      "条件 H×dₐ 训练、采样、消融和部署验收清单。",
    ],
    verifiedBoundary:
      "已在确定性一维 Toy 实验中确认噪声监督训练、50 步 DDPM 近似反向采样、终端 ᾱ_T 与双峰样本计数；错误去噪符号会被样本范围验收捕获。该结果不证明有限步先验严格匹配，也不证明图像/语言条件、轨迹动力学、Diffusion Policy 复现或真机安全。",
    knowledgeCheck: [
      {
        question: "这个 Toy 中，为什么常数 MSE 预测接近 0？",
        answer:
          "两峰近似以相等概率位于 -2 和 +2，平方误差的常数最优解是其均值 0。脚本样本均值 -0.0630 是有限采样结果。",
      },
      {
        question: "train_batch() 的监督标签是什么？",
        answer:
          "是构造 x_t 时实际采入的标准高斯 noise ε。当前参数化让 TinyDenoiser 预测噪声，而不是直接预测 clean_action。",
      },
      {
        question: "为什么训练 loss 的最后一个 checkpoint 比前一个高仍可能正常？",
        answer:
          "每个 checkpoint 是不同在线随机 mini-batch 的瞬时 MSE，并非同一固定验证集。判断质量还需固定验证 loss 与采样分布指标。",
      },
      {
        question: "将实验迁移到 H×dₐ 时，扩散 step 与 H 有何区别？",
        answer:
          "扩散 step 表示噪声等级/solver 迭代；H 是机器人未来动作的时间轴。二者独立，网络要在每个扩散阶段预测整个 H×dₐ 噪声张量。",
      },
    ],
  },

  "flow-matching": {
    intro:
      "这一章用最简单的条件运输问题把 flow matching 拆开：噪声 ε 经过条件 c 平移成动作 A=ε+2c。你会从一条样本手算插值点和目标速度，再训练四个权重、逐步积分 ODE，并通过反向时间符号错误看到终点偏离。",
    beforeYouStart: [
      "打开 public/labs/flow_matching_1d.py；终端位于仓库根目录。",
      "先执行 New-Item -ItemType Directory -Force work/flow-matching；再执行 Copy-Item public/labs/flow_matching_1d.py work/flow-matching/flow_work.py。方向错误实验只改副本。",
      "准备一张表记录 noise、condition、data、tau、x_tau、target velocity。",
      "先固定示例 noise=-0.7、condition=+1、tau=.25；不要一开始就运行脚本。",
      "本实验是可解析的一维平移流，不代表真实 π₀/π₀.₅ 的网络规模、条件编码或机器人性能。",
    ],
    steps: [
      {
        title: "第 1 步：用一个样本手算路径与速度标签",
        goal: "在训练前明确模型在哪个点、朝哪个方向学习速度。",
        actions: [
          "从文件说明读出 Toy 映射：data A=noise ε+2×condition c。代入 ε=-.7、c=+1，得到 A=1.3。",
          "阅读 make_rows() 的线性插值：x_tau=(1-tau)×noise+tau×data。代入 tau=.25，得到 .75×(-.7)+.25×1.3=-.2。",
          "目标速度是 data-noise=1.3-(-.7)=2。注意它在这个特殊平移问题中只由 condition 决定。",
          "调用 features 的顺序写成 (x_tau,tau,condition,1)=(-.2,.25,1,1)。若权重为 [0,0,2,0]，velocity=2，单样本平方误差为 0。",
        ],
        code: `noise = -0.7
condition = +1
data = noise + 2*condition = 1.3
tau = 0.25
x_tau = (1-tau)*noise + tau*data = -0.2
target_velocity = data - noise = 2.0
features = (-0.2, 0.25, 1.0, 1.0)`,
        expected: [
          "你得到路径中点 x_tau=-.2 和目标速度 +2。",
          "你能解释 [0,0,2,0]：速度不依赖 x 或 tau，只需把 condition 乘 2；这是该 Toy 构造导致的解析答案。",
        ],
        checkpoint:
          "把 condition 改成 -1、noise 保持 -.7：data=-2.7，target velocity=-2；权重 [0,0,2,0] 仍正确。",
        troubleshooting: [
          "不要把 tau=.25 代入 data；data 由 noise 与 condition 决定，tau 只选择 noise→data 路径上的位置。",
          "真实 flow field 通常会依赖 x、time 和高维条件；本例速度常数是刻意简化。",
        ],
      },
      {
        title: "第 2 步：逐行读出 make_rows 的训练样本",
        goal: "确认训练数据覆盖两个条件和整条插值路径，而不是只使用端点。",
        actions: [
          "阅读 make_rows(seed,count)：condition 从 (-1,+1) 随机二选一，noise 来自 N(0,1)，data=noise+2condition。",
          "tau 从 [0,1) 均匀采样；x_tau 是 noise 和 data 的线性插值；target 永远是 data-noise。",
          "写出单条 row 的 shape：features 是 4 元 tuple，target 是标量。main() 生成 512 条 train_rows 和不同 seed 的 256 条 test_rows。",
          "确认 train seed=3、test seed=4；test_rows 不参与 train() 更新，只用于 initial/final held-out loss。",
          "把数据流画成 ε,c,tau → A,x_tau → features,target，不要把 test_rows 接回训练箭头。",
        ],
        code: `train_rows = make_rows(seed=3, count=512)
test_rows  = make_rows(seed=4, count=256)

row = ((x_tau, tau, condition, 1.0), data - noise)`,
        expected: [
          "你能指出训练和测试不是同一随机样本，但来自同一已知 Toy 分布。",
          "两个 condition 都必须出现，否则无法检验模型是否学习条件方向。",
        ],
        checkpoint:
          "回答 tau=0 与 tau→1 时 x_tau 分别靠近哪里：tau=0 是 noise，tau→1 靠近 data。",
        troubleshooting: [
          "这里没有真实数据文件；make_rows 在线合成样本。迁移真实 VLA 时必须建立 episode split 和训练集归一化。",
          "若把相同 rows 同时用作 train/test，只能验证拟合，不能作为泛化证据。",
        ],
      },
      {
        title: "第 3 步：手推 loss 与第一次梯度方向",
        goal: "理解线性速度场如何从零权重走向 condition 权重 2。",
        actions: [
          "阅读 velocity()：prediction 是 weights 与四维 features 的点积，并拒绝非有限结果。",
          "阅读 loss()：对所有 rows 计算 (prediction-target)² 的平均。零权重对每条样本预测 0，而 target 是 ±2，所以理论初始 MSE=4。",
          "用第 1 步单样本做一次示意梯度：prediction=0、target=2、error=-2。condition 特征为 1，因此该权重梯度 2×error×1=-4。",
          "若只用这一条样本且 lr=.05，更新为 w_c=0-.05×(-4)=.2，方向朝正确的 +2 移动。",
          "回到 train()：真实更新对 512 条样本求平均，执行 steps=2500；不要把单样本 .2 当成脚本第一次实际权重。",
        ],
        code: `prediction = w dot features
error = prediction - target
gradient_j = mean(2 * error * feature_j)

# 单样本示意
grad_condition = 2 * (-2) * 1 = -4
w_condition <- 0 - 0.05*(-4) = 0.2`,
        expected: [
          "你在运行前预测 initial loss 应为 4，最终 condition 权重应接近 2。",
          "你能说明其他权重为何理论答案为 0：在该构造中真实速度不依赖 x、tau 或 bias。",
        ],
        checkpoint:
          "若 condition=-1、target=-2、零预测，condition 权重的梯度仍为 -4；两个条件共同推动 w_c 朝 +2。",
        troubleshooting: [
          "梯度中的两个负号容易算错：error=-2，condition=-1 的另一案例 error=+2，乘起来仍给相同方向。",
          "线性模型在这个问题上足够是因为数据生成规则本身线性；不能据此推断真实动作流也只需四个权重。",
        ],
      },
      {
        title: "第 4 步：运行训练并核对解析答案",
        goal: "用 held-out loss 与权重同时验收，而不只看终端的 PASS。",
        actions: [
          "运行 python public/labs/flow_matching_1d.py。",
          "先核对 learned weights 的顺序来自 features：(x,tau,condition,bias)，不是随意四个数字。",
          "确认第三个权重为 2.0，其他约为 0；这与第 1 步的解析速度 v=2c 一致。",
          "确认 held-out MSE 从 4.000000 降到打印精度下 0；再记录 forward/reverse endpoint error 与 wrong-sign endpoint。",
        ],
        code: `python public/labs/flow_matching_1d.py`,
        expected: [
          "learned [x, tau, condition, bias] weights: [-0.0, 0.0, 2.0, -0.0]",
          "held-out velocity MSE: 4.000000 -> 0.0000000000",
          "forward/reverse max endpoint error: 0.00000000",
          "wrong-sign endpoint: -2.7 (expected 1.3)，随后为 ALL CHECKS PASSED。",
        ],
        checkpoint:
          "如果只看到 loss=0 却没检查权重，你会漏掉什么？可能存在特征泄漏或不可解释的等价拟合；本例可用解析答案额外核验。",
        troubleshooting: [
          "若输出不同，检查 steps=2500、lr=.05、train/test seed 与 features 顺序是否被修改。",
          "-0.0 是浮点显示，不代表显著负权重；绝对值在打印精度下为零。",
        ],
      },
      {
        title: "第 5 步：逐 tick 积分 forward ODE",
        goal: "把学到的速度场变成最终动作，并看清 solver 步长的作用。",
        actions: [
          "阅读 euler_solve(weights,noise,condition,steps=20)：初值 x=noise，dt=1/steps=.05，循环在 tau=i×dt 查询速度并执行 x+=dt×velocity。",
          "对 probe noise=-.7、condition=+1，训练后 velocity≈2。每步增量 .05×2=.1。",
          "写出前三个状态：-.7→-.6→-.5→-.4；20 步总增量 2，终点 1.3，等于 noise+2condition。",
          "再对 condition=-1 检查：velocity=-2，每步减 .1，noise=-.7 时终点 -2.7。",
        ],
        code: `x_0 = -0.7
dt = 1/20 = 0.05
v = 2*condition = 2

x_1 = -0.7 + 0.05*2 = -0.6
x_2 = -0.5
x_3 = -0.4
...
x_20 = 1.3`,
        expected: [
          "forward endpoint 与 data 的误差低于 1e-3，实际打印最大误差为 0.00000000。",
          "在这个常速度 Toy 中 Euler 20 步可精确到浮点误差；真实非线性速度场会有离散化误差。",
        ],
        checkpoint:
          "若 steps=10，dt=.1、每步增量 .2、总增量仍为 2；本例仍准确是因为速度恒定，不代表真实模型可随意减少 solver steps。",
        troubleshooting: [
          "不要把 solver steps=20 当机器人 action horizon H；solver 在生成一个样本时积分，H 是被生成动作块的时间维。",
          "真实部署需实测 solver 步数对延迟与动作质量的影响。",
        ],
      },
      {
        title: "第 6 步：把 reverse-time 的两个符号逐项对齐",
        goal: "理解换用 t=1 噪声→t=0 数据约定时，为何 dt 与 velocity 表达要一起变换。",
        actions: [
          "阅读 reverse_convention() 的 docstring：该函数用 t=1 noise 到 t=0 data 的时间标记。",
          "函数设置 dt=-1/20；tau=1-i/20，再调用 -velocity(weights,x,1-tau,condition)。",
          "对 condition=+1，原 velocity=+2，函数内变成 -2；与 dt=-.05 相乘仍是 +.1，所以从 -.7 走到 1.3。",
          "把两个负号分别圈出。只改变时间方向却漏改速度参数化，或者重复翻转，都会沿错误方向积分。",
        ],
        code: `dt = -0.05
reported_velocity = -2
increment = dt * reported_velocity = +0.1

# 每步仍从 noise 朝 data 前进`,
        expected: [
          "forward 和 reverse_convention 对四个 probes 的终点一致，最大误差小于 1e-3。",
          "你能把“时间坐标约定”与“物理运输方向”分开说明。",
        ],
        checkpoint:
          "如果 dt 为负但仍直接乘原 velocity=+2，第一个状态会从 -.7 走到 -.8，方向错误。",
        troubleshooting: [
          "阅读其他代码库时不要只凭函数名判断方向；先找 noise/data 分别位于哪个时间端点、训练 target 如何定义、solver 的 dt 符号。",
          "本函数注释提到 openpi-style 只是在说明时间约定；本 Toy 不是 openpi 模型复现。",
        ],
      },
      {
        title: "第 7 步：故意删掉一个负号，确认终点断言能抓住",
        goal: "通过错误消融建立对 solver 方向的单元测试。",
        actions: [
          "在 work/flow-matching/flow_work.py 的 reverse_convention() 中，只把 x += dt*(-velocity(...)) 临时改成 x += dt*(velocity(...))；保留 dt=-1/steps。",
          "运行脚本。reverse 结果会朝反方向移动，errors 中出现远大于 1e-3 的值，并在 assert max(errors)<1e-3 处失败。",
          "用 probe(-.7,+1) 手算错误终点：每步增量 -.05×2=-.1，20 步后为 -2.7，而正确目标是 +1.3，相差 4.0。",
          "恢复 velocity 前的负号，重新运行，确认 forward/reverse max endpoint error 回到 0.00000000。",
          "再读 main() 自带的 wrong 循环：它显式使用错误的 -velocity 和正 dt，最终打印 -2.7；这是同一类方向错误的可见反例。",
        ],
        code: `# 错误消融（临时）
x += dt * velocity(weights, x, 1-tau, condition)

python work/flow-matching/flow_work.py

# probe noise=-0.7, condition=+1
wrong endpoint = -0.7 - 20*0.1 = -2.7
correct target = 1.3`,
        expected: [
          "临时错误版本触发 endpoint error 断言，不会输出最终 ALL CHECKS PASSED。",
          "恢复后脚本仍会打印内置 wrong-sign endpoint=-2.7，但所有正式 forward/reverse probes 通过；内置 wrong 仅用于展示，不参与正确 solver。",
        ],
        checkpoint:
          "你能写出一个最小 solver 测试：选择已知可解析的平移流，分别验证 forward/reverse 终点，而不是只检查结果有限。",
        troubleshooting: [
          "若改错后仍通过，确认修改的是 reverse_convention()，而不是 main() 最后的内置 wrong 演示循环。",
          "恢复时保留括号中的负号：dt*(-velocity(...))。",
        ],
      },
      {
        title: "第 8 步：迁移到条件 H×dₐ flow action expert",
        goal: "把一维解析流映射到真实动作块，同时保留可检查的训练与 solver 契约。",
        actions: [
          "设 data actions A.shape=(B,H,dₐ)，例如 (32,16,7)；采 noise ε 为同 shape，tau 为 (B,) 并明确广播到时间/动作维。",
          "构造线性路径 x_tau=(1-tau)ε+tau A，target_velocity=A-ε。网络接收 x_tau、tau 和由图像/语言/state 得到的 condition，输出 velocity.shape=(B,H,dₐ)。",
          "第一批打印并 assert ε、A、x_tau、predicted_velocity、target_velocity shape 完全一致；padding 用 (B,H) time_valid_mask 排除。",
          "先在 32 个样本上过拟合：固定 batch 后确认 masked velocity loss 显著下降，并保存/重载后比较同输入输出。随后打乱语言、遮挡图像，检查条件依赖是否真实存在。",
          "solver 从 ε 开始积分整个 H×dₐ 张量。至少做 solver steps 消融（如 2/5/10/20）并同时报告端到端延迟、离线动作误差和仿真成功率，不能只选最快设置。",
          "反归一化后通过动作合同、finite/shape、限幅、时间戳、TTL 与 watchdog，再进入回放、仿真、shadow mode 和受控真机。",
        ],
        code: `epsilon.shape             == (B, H, action_dim)
actions.shape             == (B, H, action_dim)
x_tau                     = (1-tau)*epsilon + tau*actions
target_velocity           = actions - epsilon
predicted_velocity.shape  == (B, H, action_dim)

loss = masked_mean((predicted_velocity - target_velocity) ** 2)`,
        expected: [
          "你得到从一维 v=2c 到条件张量速度场的完整对应关系。",
          "迁移验收包含 shape、过拟合、条件消融、solver 方向/步数、延迟和执行门控，而不把 Toy 的零 endpoint error 外推到机器人。",
        ],
        checkpoint:
          "在长训练前，你必须能对一个 batch 任选一个元素 (b,h,j) 手算 x_tau 与 target_velocity，并在代码打印值中对上。",
        troubleshooting: [
          "tau 广播轴错误可能不会立刻报错；显式 reshape 为 (B,1,1) 并断言结果 shape。",
          "真实 flow 模型若速度依赖 x/tau，Euler 减少步数会产生误差；必须通过目标任务实测，不可沿用本常速度 Toy 的结论。",
        ],
      },
    ],
    finalArtifact: [
      "noise=-.7、condition=+1、tau=.25 的 data、x_tau、target velocity 手算。",
      "零权重 initial MSE=4 与 condition 权重趋近 2 的梯度解释。",
      "20 步 forward/reverse ODE 的逐步方向与终点记录。",
      "删除 reverse velocity 负号后终点 -2.7、误差 4.0 的失败消融与恢复结果。",
      "条件 H×dₐ flow 训练、solver 步数消融和部署门控清单。",
    ],
    verifiedBoundary:
      "已在一维解析平移流中确认条件速度回归、held-out MSE、forward/reverse Euler 约定和错误符号检测。由于真实速度场高维且非线性，本例的零终点误差、20 步结果和四参数线性模型不能作为 π 系列模型复现或真机效果证据。",
    knowledgeCheck: [
      {
        question: "在该 Toy 中，为什么正确权重是 [0,0,2,0]？",
        answer:
          "A=ε+2c，所以目标速度 A-ε=2c，只依赖 condition 特征；x、tau 和 bias 的系数都为 0。",
      },
      {
        question: "noise=-.7、condition=+1、tau=.25 时，x_tau 和 target velocity 分别是多少？",
        answer:
          "data=1.3，x_tau=.75×(-.7)+.25×1.3=-.2；target velocity=data-noise=2。",
      },
      {
        question: "reverse_convention 中为什么 dt 和 velocity 都带负号？",
        answer:
          "它把时间坐标改成 t=1 噪声到 t=0 数据。dt 为负，同时速度表达相对原 tau 约定翻转；两个负号相乘后物理运输仍从 noise 朝 data。",
      },
      {
        question: "为什么本例 steps=10 仍可准确，不能证明真实模型也能用 10 步？",
        answer:
          "本例速度是常数 2c，Euler 对常速度积分恰好。真实网络速度随 x、time、condition 变化，会产生离散化误差，必须实测质量与延迟。",
      },
    ],
  },
} satisfies Record<string, LessonWalkthrough>;
