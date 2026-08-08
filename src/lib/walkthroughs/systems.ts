import type { LessonWalkthrough } from "../lessonWalkthroughTypes";

export const systemWalkthroughs = {
  pi05: {
    intro:
      "这一带练不要求你先有 GPU。核心路线会带你亲手建立证据卡、画出 π₀.₅ 的双路径、跑通一个本地 flow 模型并做一次有预期结果的改动；云端路线被明确隔离为选做。完成后，你应能说清论文报告了什么、公开代码提供了什么、你自己实际验证了什么。",
    beforeYouStart: [
      "在个人网站仓库根目录打开 PowerShell；下面所有路径都相对仓库根目录。",
      "核心部分只需要 Python 3.10+ 和文本编辑器，不需要 GPU、机器人或下载 checkpoint。",
      "准备 2.5 小时连续时间；做到步骤 7 即完成核心。步骤 8 是选做，不具备官方支持环境时直接停下。",
      "动态资料必须记录 URL、revision（若有）和查阅日期；本章提供的 2026-08-08 快照是可复查基线，不代表永远最新。",
    ],
    steps: [
      {
        title: "第 1 步：建立学习目录和证据账本",
        goal: "先把“读到的事实”和“自己的理解”分开放，避免最后把官方结论写成个人复现。",
        actions: [
          "运行下面的命令建立 work/pi05，并确认当前路径仍是网站仓库根目录。",
          "新建 work/pi05/evidence.md，把模板原样复制进去；暂时只填写 checked_at，不急着写结论。",
          "在 status 列只允许四个值：已确认事实、合理推测、个人观点、暂无法验证。",
        ],
        code: String.raw`New-Item -ItemType Directory -Force work/pi05 | Out-Null
@'
# π₀.₅ evidence ledger

checked_at: 2026-08-08

| claim | status | source | revision/date | what I actually checked |
|---|---|---|---|---|
|  |  |  |  |  |

## 我的复现边界
- 本机实际运行：
- 只阅读未运行：
- 尚无证据：
'@ | Set-Content -Encoding utf8 work/pi05/evidence.md`,
        expected: [
          "work/pi05/evidence.md 存在，并且表格有五列。",
          "“官方报告成功”与“我在本机复现成功”有不同的记录位置。",
        ],
        checkpoint: "你能不看教程说出四种证据标签，并解释“论文里有”为什么不等于“我跑过”。",
        troubleshooting: [
          "若提示路径不存在，先运行 Get-Location，确认输出是个人网站仓库，再重新执行。",
          "若中文乱码，用 VS Code 右下角把文件编码改为 UTF-8 后重新保存。",
        ],
      },
      {
        title: "第 2 步：按固定问题阅读三个一手来源",
        goal: "不是泛读论文，而是从一手来源取回三个能回答架构、训练与公开实现边界的问题。",
        actions: [
          "打开 π₀.₅ 官方项目页 https://www.pi.website/blog/pi05，只找：模型输出什么高层语义、输出什么低层动作、项目报告在哪类环境评测。",
          "打开论文 https://arxiv.org/abs/2504.16054，在摘要和方法图中核对上述三项；不要从二手博客补空。",
          "打开固定 openpi 快照 https://github.com/Physical-Intelligence/openpi/tree/15a9616a00943ada6c20a0f158e3adb39df2ccac ，记录它公开了哪些配置、checkpoint 或服务接口。该 revision 是 2026-08-08 的课程审计快照，不是“最新版本”声明。",
          "在 evidence.md 各写一行；每行只写一个可核对 claim，并在 what I actually checked 中写具体页面/小节。",
        ],
        code: String.raw`| π₀.₅ 报告显式 semantic action 与连续低层动作路径 | 已确认事实 | https://www.pi.website/blog/pi05 | checked 2026-08-08 | 我查看了官方项目页的方法说明 |
| openpi 快照可供检查公开实现边界 | 已确认事实 | https://github.com/Physical-Intelligence/openpi/tree/15a9616a00943ada6c20a0f158e3adb39df2ccac | commit 15a9616; checked 2026-08-08 | 我查看了该 revision 的 README/config，而非假定 main 不变 |
| 该模型会在我的机器人上成功 | 暂无法验证 | 无本机 rollout | 2026-08-08 | 未下载 checkpoint、未接目标 embodiment |`,
        expected: [
          "至少三条单一 claim，每条都有直接 URL 与日期或 revision。",
          "不会出现“π₀.₅ 很强”这种无法验收的笼统句子。",
          "你的硬件成功率仍明确写为暂无法验证。",
        ],
        checkpoint: "把 evidence.md 合上后，你仍能分别说出项目页、论文和公开仓库能支持哪类结论。",
        troubleshooting: [
          "若页面内容和课程描述不同，以固定 revision/论文原文为准，并把差异写进账本，不要静默改结论。",
          "若某个网页打不开，先标记“暂时无法核对”，不要用搜索摘要代替原文。",
        ],
      },
      {
        title: "第 3 步：亲手画出双路径，不把 semantic action 画成 world model",
        goal: "把 observation、原任务、文字子任务和连续 action chunk 的条件关系画准确。",
        actions: [
          "新建 work/pi05/dataflow.md，复制下面的 Mermaid 图。",
          "用一个具体任务替换方括号：例如原任务“整理桌面”，semantic action“拿起红杯”，低层输出写 H×dₐ action chunk。",
          "在图下写一句检验语句：如果某模块没有预测 action-conditioned future state，它就不能仅因输出文字步骤而被称为 world model。",
          "沿箭头口述一次：原任务 ℓ 不应在生成低层动作时被无理由丢掉。",
        ],
        code: String.raw`# π₀.₅ 数据流

flowchart LR
  O[多相机观测 o_t + proprio] --> V[VLM prefix]
  L[原任务 l：整理桌面] --> V
  V --> S[semantic action l_hat_t：拿起红杯]
  V --> F[flow action expert]
  S --> F
  L --> F
  F --> A[连续动作块 A_t，shape = H x d_a]

边界：这张图没有 action-conditioned future-state prediction，因此不能据此把 semantic action 称为 world model。`,
        expected: [
          "图中原任务 ℓ、观测 oₜ 和 semantic action ℓ̂ₜ 都进入低层动作路径。",
          "输出 action chunk 明确写出 H×dₐ，而不是含糊写“机器人动作”。",
          "图中没有凭空出现 future state 或 reward。",
        ],
        checkpoint: "你能指出 semantic action、continuous action 和 future-state prediction 三者分别回答什么问题。",
        troubleshooting: [
          "若 Mermaid 不渲染，先保留文本和箭头关系；这一步验收的是因果/条件结构，不是绘图软件。",
          "若你想删掉原任务到 flow expert 的箭头，必须额外写明条件独立假设；否则保留它。",
        ],
      },
      {
        title: "第 4 步：用一个具体时刻展开链式分解",
        goal: "把公式变成可检查的生成过程，而不是背一行概率符号。",
        actions: [
          "新建 work/pi05/factorization.md，先复制公式，再填入下面给出的整理桌面示例。",
          "第一行写已知条件：oₜ 中看见红杯、托盘和机械臂状态，ℓ 是“整理桌面”。",
          "第二行写高层采样：模型先产生 ℓ̂ₜ=“拿起红杯”。",
          "第三行写低层条件：动作块仍以 oₜ、ℓ、ℓ̂ₜ 为条件；不要把原任务自动删掉。",
          "最后写一个反例：若 ℓ̂ₜ 错成“推开托盘”，即使低层动作平滑，也可能完成错误目标。",
        ],
        code: String.raw`p(A_t, l_hat_t | o_t, l)
= p(l_hat_t | o_t, l) * p(A_t | o_t, l, l_hat_t)

已知：o_t = [红杯位置、托盘位置、机械臂状态]；l = “整理桌面”
高层：l_hat_t = “拿起红杯”
低层：A_t ~ p(A_t | o_t, “整理桌面”, “拿起红杯”)

反例：l_hat_t 错成“推开托盘”时，低层动作即使连续且无 NaN，也可能服务于错误子目标。`,
        expected: [
          "联合概率被拆成高层语义项与低层动作项。",
          "每个符号都能对应到示例中的具体信息。",
          "你写出一个“低层数值正常但语义失败”的反例。",
        ],
        checkpoint: "不看原文，能从概率乘法规则重新写出分解，并说明为什么低层仍保留原任务条件。",
        troubleshooting: [
          "若把等式写成两个互不相关概率相加，回到联合概率的链式法则：p(x,y|c)=p(y|c)p(x|y,c)。",
          "若示例只有名词没有观测，补上相机/状态；动作不是仅由语言生成。",
        ],
      },
      {
        title: "第 5 步：跑通本地 flow 核心，再读输出",
        goal: "用一个真实训练和 ODE 采样脚本建立“条件速度场→动作”的手感。",
        actions: [
          "运行原始脚本并把终端输出保存到 work/pi05/flow-baseline.txt。",
          "打开 public/labs/flow_matching_1d.py，依次找到 make_rows、train、euler_solve；在 flow-notes.md 中分别写一句“它的输入、监督目标、输出”。",
          "检查输出的条件权重约为 2、held-out MSE 接近 0、正反时间 convention 到达同一终点、wrong-sign 远离 1.3。",
          "只在看到 ALL CHECKS PASSED 后，把 evidence.md 加一行“本地 1D 条件 flow Toy 已验证”；不要写“π₀.₅ 已复现”。",
        ],
        code: String.raw`python public/labs/flow_matching_1d.py 2>&1 | Tee-Object work/pi05/flow-baseline.txt
Get-Content work/pi05/flow-baseline.txt`,
        expected: [
          "learned [x, tau, condition, bias] weights 约为 [0, 0, 2, 0]。",
          "held-out velocity MSE 从约 4 降到接近 0。",
          "wrong-sign endpoint 约为 -2.7，而正确目标是 1.3。",
          "最后出现 conditional flow training + ODE solver: ALL CHECKS PASSED。",
        ],
        checkpoint: "你能指出为什么 loss 低仍要检查 ODE endpoint，以及 wrong-sign 测试捕获了哪一种错误。",
        troubleshooting: [
          "若 python 命令不存在，尝试 py -3 public/labs/flow_matching_1d.py；仍失败则先安装 Python 3.10+。",
          "若断言失败，先恢复脚本原文件；不要为得到 PASS 而删除 assert。",
          "若输出文件为空，先直接运行不带 Tee-Object 的命令，确认错误是否发生在 Python 启动阶段。",
        ],
      },
      {
        title: "第 6 步：复制脚本并改变条件幅度，先预测再运行",
        goal: "通过一个只改一处的实验，确认你理解模型学到的是 condition 对速度的作用。",
        actions: [
          "复制脚本到 work/pi05/flow_matching_1d_experiment.py，禁止直接改 public/labs 下的基准文件。",
          "在复制文件的 make_rows 中，把 data = noise+2*condition 改为 data = noise+3*condition。",
          "运行前先在 flow-notes.md 写预测：condition 权重应从约 2 变成约 3；原脚本固定 expected=noise+2*condition 的断言会失败。",
          "运行并确认断言确实失败；随后把 probes 循环中的 expected 改为 noise+3*condition，并把 wrong-sign 目标检查对应更新，再运行到 PASS。",
          "记录“第一次失败是合理的测试保护，不是训练失败”。",
        ],
        code: String.raw`Copy-Item public/labs/flow_matching_1d.py work/pi05/flow_matching_1d_experiment.py
# 用编辑器只改复制文件，然后运行：
python work/pi05/flow_matching_1d_experiment.py`,
        expected: [
          "第一次只改数据生成式后，旧 endpoint 断言失败，证明测试捕获了规格变化。",
          "同步更新目标规格后，学得的 condition 权重约为 3，held-out MSE 仍接近 0。",
          "原始 public/labs/flow_matching_1d.py 没有变化。",
        ],
        checkpoint: "你能解释“训练数据目标改变”和“为了让测试绿而删断言”的区别，并能指出需要同步更新的规格。",
        troubleshooting: [
          "若第一次没有失败，确认你改的是 make_rows 中的数据终点，而不是只改注释。",
          "若权重仍约为 2，搜索复制文件中的 +2*condition，确认训练数据生成式确实已改。",
          "若更新后仍失败，逐个打印 probe 的 noise、condition、expected 和 forward，先查目标是否还有旧常数。",
        ],
      },
      {
        title: "第 7 步：完成核心证据卡并做口头验收",
        goal: "把理解、代码验证和未验证部分收束成别人能审查的一页材料。",
        actions: [
          "新建 work/pi05/core-report.md，按模板填满四栏；每个事实至少附一个 URL、文件路径或终端输出。",
          "在“已确认事实”中写论文/官方项目的架构主张；在“本机已验证”中只写 1D flow Toy；在“合理推测”中写层级文字可能帮助调试；在“暂无法验证”中保留你的硬件成功率。",
          "用 90 秒口述 dataflow.md；录音不是必需，但不能照着文章逐字念。",
          "回看 evidence.md，删掉任何没有来源却写成事实的句子。",
        ],
        code: String.raw`# π₀.₅ 核心报告

## 已确认事实（来自一手来源）
- claim：
  source/revision/date：

## 本机已验证
- 1D 条件 flow：命令、输出文件、验证了什么

## 合理推测 / 个人观点
- 推测：
- 为什么只是推测：

## 暂无法验证
- checkpoint / 环境 / 成功率 / 真机兼容性：
`,
        expected: [
          "报告包含四类边界，且“本机已验证”没有 π₀.₅ checkpoint 或真机性能。",
          "能在 90 秒内讲清 observation→semantic action→continuous chunk。",
          "所有动态代码能力都绑定固定 revision 与查阅日期。",
        ],
        checkpoint: "如果现在停止、不做云端步骤，你仍已完成完整的核心学习目标，而不是留下半个实验。",
        troubleshooting: [
          "若报告只能复制原文，回到 factorization.md，用自己的整理桌面例子重写。",
          "若分不清事实与推测，问：另一人能否仅凭给出的来源复核？不能就不要标事实。",
        ],
      },
      {
        title: "第 8 步（明确选做）：通过环境门禁后再碰 openpi",
        goal: "把昂贵的 checkpoint/云端尝试变成可审计实验；不满足条件时学会正确停下。",
        actions: [
          "先阅读固定 revision README，而不是直接复制今天 main 分支命令；在 env-card.md 记录 OS、Python/JAX/CUDA、GPU、显存、磁盘、revision 和查阅日期。",
          "逐项填写 GO/NO-GO：官方支持环境、磁盘、GPU、checkpoint 访问、可接受费用。任一项未知就写 NO-GO，核心成绩不受影响。",
          "只有 GO 时，按照该 revision README 创建隔离环境，先做 random-observation inference；记录 observation keys、输出 shape、finite 与 normalization revision。",
          "再启动 policy server/client smoke；命令启动、checkpoint 加载、产生 finite action、完成 rollout 分四行记录，不得合并成“复现成功”。",
          "只有 smoke 通过且预算允许时才进入 LIBERO 多 seed rollout或微调；成功率必须附 N、seed、revision 与失败类别。",
        ],
        code: String.raw`# work/pi05/env-card.md
checked_at: 2026-08-08
openpi_revision: 15a9616a00943ada6c20a0f158e3adb39df2ccac
official_readme_checked: NO
os:
python_jax_cuda:
gpu_vram:
free_disk:
checkpoint_access:
cost_limit:
decision: NO-GO
reason:

# 只有把 decision 改为 GO 后，才从该 revision README 复制实际命令。`,
        expected: [
          "无 GPU/不兼容环境时，合理结果是保存 NO-GO 环境卡并停止，而不是伪造日志。",
          "若执行选做，至少有 revision、环境、random inference shape/finite 和 server/client 日志。",
          "只有真实 rollout 才产生成功率；smoke-only 明确写 smoke-only。",
        ],
        checkpoint: "你能回答自己目前做到“读懂”“加载”“推理”“服务连通”“rollout”“微调”中的哪一级，并拿出对应日志。",
        troubleshooting: [
          "checkpoint 不加载：先核对 config 与权重是否来自同一 revision，不要混用不同 release。",
          "出现 OOM：记录失败配置，降低 batch/训练参数前先核官方边界；不要把启动成功当成可训练。",
          "action shape 正确但数值异常：停止 rollout，检查 norm stats、frame、unit、gripper 和 action adapter。",
          "Windows/WSL 问题：若该 revision 未声明支持，就标环境未验证，优先使用官方支持环境。",
        ],
      },
    ],
    finalArtifact: [
      "work/pi05/evidence.md：带来源、revision、日期与四类证据标签的账本。",
      "work/pi05/dataflow.md 与 factorization.md：双路径图和可口述的数值化链式分解。",
      "work/pi05/flow-baseline.txt、flow-notes.md 与复制实验脚本：本地 flow 训练、失败测试和规格更新记录。",
      "work/pi05/core-report.md：明确区分官方事实、本机验证、推测/观点和未验证项。",
      "可选 work/pi05/env-card.md 与真实 smoke/rollout 日志；没有合适环境时保留 NO-GO 即为正确结果。",
    ],
    verifiedBoundary:
      "本站已验证的是 public/labs/flow_matching_1d.py 的特制 1D 条件 transport 与 ODE 符号检查。π₀.₅ 架构主张来自官方项目页/论文，公开实现能力绑定 2026-08-08 的 openpi commit 15a9616 快照；本站没有替学习者运行 checkpoint、LIBERO、微调或真机，因此性能、资源需求和硬件兼容性必须保留为暂无法验证，直到出现个人日志。",
    knowledgeCheck: [
      {
        question: "为什么 p(Aₜ,ℓ̂ₜ|oₜ,ℓ) 的低层项仍保留原任务 ℓ？",
        answer: "链式法则自然得到 p(ℓ̂ₜ|oₜ,ℓ)p(Aₜ|oₜ,ℓ,ℓ̂ₜ)。只有额外假设在给定观测和子任务后 Aₜ 与原任务条件独立，才可删掉 ℓ；教程没有默认这个额外假设。",
      },
      {
        question: "semantic action 为什么不自动等于 world model？",
        answer: "semantic action 是高层策略输出；world model 至少要描述执行候选动作后的未来状态/观测分布。可读的文字步骤本身没有完成 action-conditioned future prediction。",
      },
      {
        question: "本地 flow 脚本 PASS 能支持什么结论，不能支持什么？",
        answer: "它支持 1D 条件速度训练、正反时间约定和 ODE endpoint 单测在该 Toy 中正确；不能支持 π₀.₅ checkpoint、复杂图像动作、多峰策略、LIBERO 成功率或真机安全。",
      },
      {
        question: "为什么 openpi 命令启动成功不能写成“复现 π₀.₅”？",
        answer: "启动只验证软件入口。完整主张还涉及匹配的 checkpoint/config、输入与归一化、动作输出、server/client、rollout 样本和论文训练能力；公开实现也未必覆盖论文完整配方。",
      },
    ],
  },

  "data-and-adaptation": {
    intro:
      "这一带练从一份可生成的 30 帧 Toy manifest 开始。你会亲眼看到正常审计、split 泄漏、NaN、train-only 统计和 BC 门禁各自长什么样，再把相同字段映射到自己的数据。目标不是“列一张检查清单”，而是让你真正产出 manifest、错误日志、replay 记录和实验卡。",
    beforeYouStart: [
      "在仓库根目录打开 PowerShell；Python 3.10+ 即可完成步骤 1–8，不需要 GPU。",
      "不要先拿真实大数据训练。先用脚本生成的 demo 学会每个字段和失败输出，再映射真实数据。",
      "内置 JSONL 是课程审计层，不是 LeRobotDataset v3 的原生存储格式；接入 LeRobot 时必须保留字段映射。",
      "ACT/VLA 的实际训练命令随仓库 revision、数据与硬件变化；本带练先完成可迁移的门禁，真实训练只能在锁定实现后记录为已运行。",
    ],
    steps: [
      {
        title: "第 1 步：建立数据工作区和动作契约",
        goal: "在看数据前先写清楚每一维动作的物理含义，让后续 shape 正确却语义错误的问题可被发现。",
        actions: [
          "创建 work/data-adaptation，并新建 action_contract.yaml。",
          "先使用下面的 3D Toy 契约；逐行读出 command_type、frame、unit、dt 和 gripper 语义。",
          "若你有自己的机器人，在文件底部另加 target_robot 区块，不要覆盖 Toy；未知字段写 UNKNOWN。",
          "检查 names、units、valid_mask 长度都等于 action_dim。",
        ],
        code: String.raw`New-Item -ItemType Directory -Force work/data-adaptation | Out-Null
@'
revision: toy-eef-delta-base-m-v1
action_dim: 3
command_type: eef_delta
frame: base
dt_seconds: 0.1
names: [dx, dy, gripper]
units: [m, m, binary]
valid_mask: [true, true, true]
gripper_semantics: "0=open, 1=closed"

target_robot:
  revision: UNKNOWN
  action_dim: UNKNOWN
  command_type: UNKNOWN
  frame: UNKNOWN
  dt_seconds: UNKNOWN
'@ | Set-Content -Encoding utf8 work/data-adaptation/action_contract.yaml`,
        expected: [
          "文件中没有匿名的 action[0]；它被命名为 dx，并绑定 base frame 与 m。",
          "Toy 与真实机器人契约分开，未知信息没有被猜测。",
        ],
        checkpoint: "你能解释为什么同样是数值 0.03，在 joint velocity 与 base-frame EEF delta 下含义完全不同。",
        troubleshooting: [
          "若目标数据没有 frame/unit 元数据，标 UNKNOWN 并停止真实动作解码；不要从数值范围反猜。",
          "若夹爪是 -1/+1 或连续宽度，修改语义并提升 revision，不能沿用 Toy 名称。",
        ],
      },
      {
        title: "第 2 步：生成 30 帧 demo，并逐项读懂审计输出",
        goal: "先看到一份已知正确的数据长什么样，再碰真实数据。",
        actions: [
          "运行 --write-demo，把 demo 写到工作区；命令同时会审计它。",
          "把输出保存为 audit-demo.txt，然后圈出 records、episodes、三个 split 数、state_dim、action_dim 和 round-trip error。",
          "用 Get-Content 只看第一条 JSON，逐个找到 episode_id、frame_index、两个时间戳、language、images、state、action、action_valid 和 contract revision。",
          "解释为什么 30 records 不是 30 个独立 episode：脚本生成 6 个 episode，每个 5 帧。",
        ],
        code: String.raw`python public/labs/audit_robot_dataset.py --write-demo work/data-adaptation/demo.jsonl 2>&1 | Tee-Object work/data-adaptation/audit-demo.txt
Get-Content work/data-adaptation/demo.jsonl -TotalCount 1`,
        expected: [
          "输出 records=30、episodes=6，train/val/test episode 数为 4/1/1。",
          "state_dim=4、action_dim=3。",
          "train_action_mean 为 [0.09, -0.025, 0.4]，round-trip 最大误差约 1.73e-18。",
          "最后出现 AUDIT PASS。",
        ],
        checkpoint: "不看输出，你能说出一帧记录和一个 episode 的区别，以及为什么 split 应绑定 episode。",
        troubleshooting: [
          "若没有 WROTE 行，检查 work/data-adaptation 是否存在且可写。",
          "若输出数字不同，确认没有修改 public/labs/audit_robot_dataset.py；先恢复基准再继续。",
          "若 JSON 一整行难读，可在编辑器中格式化，但不要改变原文件后再把它当基准。",
        ],
      },
      {
        title: "第 3 步：建立真实数据到审计字段的映射表",
        goal: "把“我的数据差不多有这些”变成逐字段可执行的转换规格。",
        actions: [
          "新建 source_mapping.csv，复制表头和示范前三行。",
          "继续为 REQUIRED 字段逐行填写：episode_id、split、frame_index、timestamp_s、action_timestamp_s、task_id、language、images、state、action、action_valid、action_contract_revision。",
          "source_field 写原始数据真实字段；conversion 写单位、坐标或时间转换；没有来源写 MISSING，不得写“同上”。",
          "给每个时间戳注明 clock/source。若 action_timestamp 只是估算，在 note 写合理推测而非事实。",
        ],
        code: String.raw`required_field,source_field,conversion,evidence_status,note
episode_id,trajectory_id,string(),已确认事实,原始轨迹边界
split,MISSING,按 episode 分组后生成,暂无法验证,未生成前禁止训练
frame_index,step_index,int(),已确认事实,每个 episode 从0连续递增
timestamp_s,MISSING,UNKNOWN,暂无法验证,需要相机或采集时钟
action_timestamp_s,MISSING,UNKNOWN,暂无法验证,不能默认等于图像时间
task_id,MISSING,string(),暂无法验证,
language,MISSING,string(),暂无法验证,
images,MISSING,每个相机写 path+timestamp_s,暂无法验证,
state,MISSING,转为 finite float list,暂无法验证,
action,MISSING,按 action_contract.yaml 转换,暂无法验证,
action_valid,MISSING,bool[action_dim],暂无法验证,
action_contract_revision,MISSING,固定 revision 字符串,暂无法验证,`,
        expected: [
          "12 个必需字段都有一行，未知项明确为 MISSING/UNKNOWN。",
          "动作转换指向 action_contract.yaml，而不是只写 reshape。",
          "图像时间与动作时间没有被强行当成同一个时间。",
        ],
        checkpoint: "任取一个目标字段，你都能指出它从哪里来、如何转换、目前证据状态是什么。",
        troubleshooting: [
          "若原始格式把语言放 episode metadata，可在转换时复制到帧，但要保留 language 有效区间。",
          "若没有动作有效位，先判断所有维是否始终有效；padding/缺失动作不能伪装成真实零动作。",
        ],
      },
      {
        title: "第 4 步：故意制造 split 泄漏和 NaN，学会读 FAIL",
        goal: "亲眼看到两个高风险错误如何被拒绝，而不是只背“不要泄漏、不要 NaN”。",
        actions: [
          "先运行 split 注入；注意 PowerShell 中 Python 返回非零退出码是预期行为，不要把它当安装失败。",
          "在 split-error.txt 找到 episode-000 crosses splits，并写一句解释：同一轨迹的相邻帧进入不同集合。",
          "再运行 NaN 注入，在 nan-error.txt 找到 state/action 的 finite 错误或无法生成 train normalization 的连锁错误。",
          "把两个错误、触发字段、应在何阶段阻断写入 failure-table.md。",
        ],
        code: String.raw`python public/labs/audit_robot_dataset.py --demo --inject-error split 2>&1 | Tee-Object work/data-adaptation/split-error.txt
Write-Host "split exit code: $LASTEXITCODE"
python public/labs/audit_robot_dataset.py --demo --inject-error nan 2>&1 | Tee-Object work/data-adaptation/nan-error.txt
Write-Host "nan exit code: $LASTEXITCODE"`,
        expected: [
          "两个命令的 exit code 都是 1，并以 AUDIT FAIL 结束。",
          "split 日志明确指出某个 episode 跨 train/val。",
          "NaN 日志明确拒绝非有限 action；错误不是被静默替换成 0。",
        ],
        checkpoint: "你能解释为什么这两个错误必须在训练前阻断，以及仅观察 training loss 为什么发现不了 split 泄漏。",
        troubleshooting: [
          "若 exit code 是 0，检查 --inject-error 参数是否与 --demo 同时使用。",
          "若终端因非零码停止流水线，分别运行两条 python 命令；FAIL 正是本步骤的正确输出。",
          "若想跳过坏行继续训练，先停下；应生成拒绝清单并修源数据，而不是 try/except 吞掉。",
        ],
      },
      {
        title: "第 5 步：审计一份你真正要用的 manifest",
        goal: "把 demo 学到的字段契约迁移到真实导出，并按第一条错误逐层修复。",
        actions: [
          "先复制 demo 为 target-manifest.jsonl；若尚无真实数据，就在副本中改 language/task_id，练习安全修改后重新审计。",
          "有真实数据时，依据 source_mapping.csv 导出每帧一行 JSON；不要手工改几万行，应从原始数据生成。",
          "运行 --input；若 FAIL，只处理日志第一条 error，修复源转换器后重新完整导出，再审计。",
          "把每次运行日期、数据 revision、records/episodes、PASS/FAIL、首个错误写入 audit-history.csv。",
        ],
        code: String.raw`Copy-Item work/data-adaptation/demo.jsonl work/data-adaptation/target-manifest.jsonl
python public/labs/audit_robot_dataset.py --input work/data-adaptation/target-manifest.jsonl 2>&1 | Tee-Object work/data-adaptation/audit-target.txt

# audit-history.csv 表头：
run_at,dataset_revision,records,episodes,result,first_error`,
        expected: [
          "未改坏的副本仍输出 AUDIT PASS。",
          "真实导出若失败，会留下完整日志和可追踪的数据 revision。",
          "修复发生在转换/源数据，而不是删除审计断言。",
        ],
        checkpoint: "你能从 audit-history.csv 找到某次失败对应的确切数据版本和第一条错误。",
        troubleshooting: [
          "提示 missing 字段：回 source_mapping.csv 补来源或生成规则，不要在审计器中降低 REQUIRED。",
          "维度漂移：按 episode/frame 定位源记录；不要用截断到最短维度掩盖。",
          "时间不递增：确认单位是秒还是毫秒、排序键是 frame_index 还是文件名字符串。",
        ],
      },
      {
        title: "第 6 步：验证 train-only 归一化，并写出部署契约",
        goal: "把审计报告中的 mean/std 变成 checkpoint 必须携带的 metadata。",
        actions: [
          "从 audit-target.txt 抄出 train_action_mean/std，写入 norm_metadata.json；source_split 必须是 train。",
          "记录 dataset_revision、action_contract_revision、computed_at 和 method=pstdev。",
          "手算第一维值 0.03 的 z-score：(0.03-0.09)/0.042426≈-1.414；再反变换应回到 0.03。",
          "把 deployment_rule 写成：模型输出按相同 metadata 反归一化；revision 不匹配则拒绝，而不是猜。",
        ],
        code: String.raw`{
  "dataset_revision": "demo-v1",
  "source_split": "train",
  "computed_at": "2026-08-08",
  "action_contract_revision": "eef-delta-base-m-v1",
  "method": "population_mean_pstdev",
  "mean": [0.09, -0.025, 0.4],
  "std": [0.04242640687119285, 0.011180339887498949, 0.4898979485566356],
  "deployment_rule": "revision mismatch => reject"
}`,
        expected: [
          "第一维 z-score 约 -1.414，反变换误差在浮点精度范围内。",
          "metadata 明确只来自 train，而不是全数据。",
          "norm revision 与 action contract revision 同时记录。",
        ],
        checkpoint: "你能解释为什么把 val/test 混入 mean/std 也是信息泄漏，以及部署必须加载训练时同一份 metadata。",
        troubleshooting: [
          "若 std 为 0，不要除零；把该维声明为常量/固定值并给出显式规则。",
          "若手算回不去，检查反归一化公式是 z*std+mean，并确认单位未在中途重复转换。",
        ],
      },
      {
        title: "第 7 步：按时间回放 6 个 episode，并逐行做人工判断",
        goal: "把 schema PASS 与“数据语义正确”分开；审计器不会看懂图像内容或动作方向。",
        actions: [
          "新建 replay-review.csv，先为 demo 的 6 个 episode 各写一行；没有真实图片时仍检查帧号、语言、image timestamp、decision timestamp 与 action timestamp。",
          "真实数据要同步显示 front/wrist 图像、state 和 action；从成功、失败、接管、恢复、最长与缺帧类别各抽样，而不是只看前 20 条。",
          "对每条记录回答五个问题：画面是否同一时刻、动作是否晚一帧、frame/unit 方向是否合理、夹爪边沿是否正确、episode 终止是否正确。",
          "发现异常时写 first_bad_frame 和 proposed_fix；不要在 review 表中直接改标签。",
        ],
        code: String.raw`episode_id,category,frames_checked,image_sync,action_alignment,language_valid,gripper_semantics,first_bad_frame,decision,proposed_fix
episode-000,train-demo,0-4,PASS,PASS,PASS,PASS,,KEEP,
episode-001,train-demo,0-4,UNKNOWN,UNKNOWN,PASS,UNKNOWN,,REVIEW,需要实际图像与控制日志
episode-002,train-demo,0-4,UNKNOWN,UNKNOWN,PASS,UNKNOWN,,REVIEW,需要实际图像与控制日志
episode-003,train-demo,0-4,UNKNOWN,UNKNOWN,PASS,UNKNOWN,,REVIEW,需要实际图像与控制日志
episode-004,val-demo,0-4,UNKNOWN,UNKNOWN,PASS,UNKNOWN,,REVIEW,需要实际图像与控制日志
episode-005,test-demo,0-4,UNKNOWN,UNKNOWN,PASS,UNKNOWN,,REVIEW,需要实际图像与控制日志`,
        expected: [
          "每个 episode 都有 KEEP/REVIEW/REJECT 决定，未知内容保持 UNKNOWN。",
          "demo 路径字符串存在不等于图片内容已验证；这一边界被明确记录。",
          "真实异常能定位到 episode_id + first_bad_frame。",
        ],
        checkpoint: "你能举出一个 schema 完全 PASS、但 replay 会发现的错误，例如夹爪语义反号或图像晚一帧。",
        troubleshooting: [
          "若没有 replay 工具，先用时间排序的截图/日志逐帧核对；不要因此把 image_sync 标 PASS。",
          "若多相机时间差大，先记录各自时间源和 stale age，再决定丢弃/对齐策略；不要复制上一帧掩盖。",
        ],
      },
      {
        title: "第 8 步：跑 BC 门禁，并做一次语言条件反例",
        goal: "看到小样本可拟合、checkpoint 可重载、闭环会分布偏移、均方误差会平均多峰这四个现象。",
        actions: [
          "运行 toy_behavior_cloning.py，把完整输出保存为 bc-gate.txt。",
          "逐段给 [1/4] 到 [4/4] 写解释：它分别检查监督条件、重载、闭环分布偏移和多峰均值失败。",
          "找到 permuted-language MSE=3.24；解释它比原 MSE 大说明该 Toy 确实使用语言条件，而不是证明真实 VLA 理解语言。",
          "找到 closed-loop 0/6→6/6；解释这是特制 1D DAgger 演示，不是 ACT 或真实机器人结果。",
          "在 dataset-card.md 中把这一步标为 pipeline rehearsal；真实 ACT/VLA 仍是暂无法验证。",
        ],
        code: String.raw`python public/labs/toy_behavior_cloning.py 2>&1 | Tee-Object work/data-adaptation/bc-gate.txt
Get-Content work/data-adaptation/bc-gate.txt`,
        expected: [
          "监督 MSE 从约 1.1321 降到 0，打乱语言后 MSE 约 3.24。",
          "checkpoint 前后 probe output 都约 -0.575。",
          "Toy 闭环从 0/6 变成 6/6，最后输出 ALL CHECKS PASSED。",
          "多峰 [-1,+1] 的 MSE 预测为 0，说明条件均值可能不是有效模式。",
        ],
        checkpoint: "你能分别说明过拟合门禁、语言消融、保存重载与闭环 rollout 回答的是四个不同问题。",
        troubleshooting: [
          "若 MSE 不下降，先确认基准脚本未改；真实训练中则查 mask、label shift、norm、head shape 和 optimizer。",
          "若重载不同，检查 eval 模式、随机增广、checkpoint 是否同时带 norm metadata。",
          "若你想把 6/6 写入项目成功率，停下：它只属于 deterministic Toy。",
        ],
      },
      {
        title: "第 9 步：写可执行的真实适配实验卡，再决定是否训练",
        goal: "把 LeRobot 的 record→replay→train→eval 或 openpi 的 convert→config/norm→train→serve 转成当前项目的一条可追踪路径。",
        actions: [
          "新建 experiment-card.md，先填写数据/action/norm revision，再选择 exactly one 路径：LeRobot/ACT、OpenVLA-OFT、openpi 或其他固定实现。",
          "从所选实现的官方文档复制真实命令，并逐个参数写 meaning；不得使用本教程臆造的通用 train.py 命令。",
          "按顺序设置门禁：dataset audit PASS→replay REVIEW 清零或有豁免→1 batch 过拟合→2–5 episode 起步的小集过拟合→checkpoint reload→固定 seed rollout。",
          "每过一关才进入下一关；若硬件/依赖不足，在 blocked_at 写具体门禁，并保留前面已完成产物。",
          "ACT、VLA 和 zero/mean baseline 必须共享相机、物理 action contract、norm、安全层、seed、最大步数与成功判据。",
        ],
        code: String.raw`# adaptation experiment card
checked_at: 2026-08-08
implementation:
official_source:
code_revision:
dataset_revision:
action_contract_revision:
norm_revision:
hardware:

## commands copied from this exact revision
1. command:
   parameter meanings:
2. command:
   parameter meanings:

## gates
- [ ] audit PASS
- [ ] replay reviewed
- [ ] one-batch overfit
- [ ] small-episode overfit
- [ ] save/reload identical
- [ ] fixed-seed rollout

blocked_at:
result_status: 暂无法验证`,
        expected: [
          "卡片先有版本与协议，再有训练命令。",
          "每条动态命令绑定 official_source、revision 和 checked_at。",
          "无法训练时明确停在某个门禁，而不是把计划写成结果。",
        ],
        checkpoint: "另一位工程师只看 experiment-card.md，就能知道你下一条该运行的命令、所需输入和通过条件。",
        troubleshooting: [
          "官方文档与当前代码参数不一致：以固定 revision 的 --help/源码为准，记录差异，不混用新版文档。",
          "ACT 也无法小集过拟合：回到数据/动作/时序，不要先责怪 VLA。",
          "ACT 成功、VLA 失败：固定一条 observation，比较图像预处理、语言、raw head、反归一化和 adapter。",
          "两者离线正常、rollout 都失败：用记录专家动作替换模型输出，优先定位执行器、frame/unit/dt、TTL 与 reset。",
        ],
      },
    ],
    finalArtifact: [
      "work/data-adaptation/action_contract.yaml 与 source_mapping.csv：动作物理语义和真实字段映射。",
      "demo.jsonl、target-manifest.jsonl、三份 PASS/FAIL 审计日志与 audit-history.csv。",
      "norm_metadata.json 和第一维手算：证明统计只来自 train 且可 round-trip。",
      "replay-review.csv：episode 级语义检查、UNKNOWN 与异常定位。",
      "bc-gate.txt：监督、语言消融、重载、闭环偏移和多峰失败的本地输出。",
      "experiment-card.md：绑定官方 revision、参数解释、门禁和当前阻塞点的真实适配路径。",
    ],
    verifiedBoundary:
      "本地已验证的是 audit_robot_dataset.py 生成的 6 episode/30 frame JSONL、split/NaN 拒绝、train-only Toy 统计，以及 toy_behavior_cloning.py 的特制线性门禁。脚本不读取真实图像内容，也不是 LeRobotDataset v3 原生 schema；它没有训练 ACT、LoRA、OFT 或任何真实 VLA。真实数据质量、显存、训练时间和 rollout 成功率只能由学习者固定 revision 后的实际记录确认。",
    knowledgeCheck: [
      {
        question: "为什么 frame 级随机切分会高估验证表现？",
        answer: "同一 episode 的相邻帧高度相似；若跨 train/val，验证集会含近重复的训练轨迹信息。以 episode 为最小边界才能先阻断这种直接泄漏；若测新场景/物体，还要进一步按 scene/object 分组。",
      },
      {
        question: "审计器 PASS 后为什么还必须 replay？",
        answer: "审计器能检查字段、维度、有限值、时间单调和 split，但看不懂图像是否晚一帧、夹爪方向是否反号、动作 frame 是否语义错误。同步 replay 检查的是内容与物理语义。",
      },
      {
        question: "1 batch 过拟合成功证明了什么？",
        answer: "它说明当前模型、标签、mask、优化器和部分数据通路至少能记住这批样本；不证明 held-out 泛化、闭环稳定、语言理解或真机成功。",
      },
      {
        question: "ACT 成功而 VLA 失败时，应该先比较哪些层？",
        answer: "固定同一 observation，依次比较图像 resize/crop、相机顺序、语言/tokenizer、state、raw action head、norm revision、反归一化和物理 adapter，再比较模型能力。",
      },
      {
        question: "为什么 LoRA 可训练参数少仍可能 OOM？",
        answer: "LoRA 减少了可训练权重和相关优化器状态，但冻结 backbone 的前向激活、输入分辨率/序列长度以及 action head 等仍占显存；不能按参数比例推断峰值显存。",
      },
    ],
  },

  "vla-families": {
    intro:
      "这一带练先用一个完全透明的 Toy 评分表教你“硬门禁→评分→敏感性分析”，再把同一方法迁移到 ACT、SmolVLA、OpenVLA/OFT、X-VLA、openpi 等真实候选。你不会得到一张脱离任务的排行榜，而会得到一份别人能复查、遇到新版本也知道怎样更新的选型结论。",
    beforeYouStart: [
      "准备一个明确的目标任务；若尚无项目，就使用教程提供的“单卡桌面放置任务”示例。",
      "真实模型的代码、权重、许可、显存和支持平台会变化；每个动态单元格必须写 official URL、revision/release 和 checked_at。",
      "UNKNOWN 是合法答案；不得用论文参数量、营销名称或印象填补接口与资源数据。",
      "步骤 1–6 只用文本和 Python 标准库；步骤 7 运行两个本地接口 Toy，不下载模型。",
    ],
    steps: [
      {
        title: "第 1 步：先冻结任务，不先列模型",
        goal: "让“哪个好”变成“谁满足这个任务的硬约束”。",
        actions: [
          "创建 work/vla-families/scenario.yaml，复制示例。",
          "逐项确认相机、state、action、控制频率、语言泛化、GPU 和截止日期；不是你的实际条件就改，未知写 UNKNOWN。",
          "把 must_have 与 nice_to_have 分开；例如许可、action adapter、推理可运行是硬门禁，参数量或社区热度通常不是。",
          "在文件底部写一句“不比较什么”：本案例不研究跨本体和人形，避免候选范围失控。",
        ],
        code: String.raw`New-Item -ItemType Directory -Force work/vla-families | Out-Null
@'
scenario: single-gpu-tabletop-placement
observations:
  cameras: [front, wrist]
  state_dim: 8
language_goal: "同一任务的有限同义改写"
action:
  shape: "H x 7"
  command_type: eef_delta_pose_plus_gripper
  frame: base
  units: [m, m, m, rad, rad, rad, binary]
  control_hz: 20
data_format: LeRobot-like episodes
hardware: "one local GPU; exact VRAM = UNKNOWN"
deadline: "two weeks"
must_have: [usable_license, available_weights_or_train_code, input_adapter, action_adapter, local_inference_smoke]
nice_to_have: [language_paraphrase_transfer, active_tooling, lower_latency]
out_of_scope: [cross_embodiment_research, humanoid_control]
'@ | Set-Content -Encoding utf8 work/vla-families/scenario.yaml`,
        expected: [
          "任务文件明确到两个相机、H×7、base frame、20Hz，而不是只写“桌面机器人”。",
          "至少五个硬门禁与三个偏好分开。",
          "UNKNOWN 没被伪造数字替换。",
        ],
        checkpoint: "拿掉模型名称后，你仍能用 scenario.yaml 判断一个新候选是否值得继续看。",
        troubleshooting: [
          "若 action 契约不清楚，先回数据章节补齐；无法定义输出就无法选模型。",
          "若 must_have 超过十项，把真正一票否决与可优化偏好重新分开。",
        ],
      },
      {
        title: "第 2 步：用同一个动作例子区分三类生成范式",
        goal: "理解模型名称背后的输出与部署差异，而不是按公司分类。",
        actions: [
          "新建 paradigms.md，用相同目标动作块 A∈R^(H×7) 填三行：离散自回归、连续并行 chunk、diffusion/flow action expert。",
          "离散行写清量化/token sequence 与串行解码；连续行写一次前向并行输出及单峰风险；生成式行写从噪声多步采样/积分与多峰潜力。",
          "为每行补一个会失败的任务条件，例如极高控制频率、两种同样合理抓法或精细连续量。",
          "把 FAST 单独写成时间序列压缩/tokenization 方法，不与“逐维独立 bins”画等号。",
        ],
        code: String.raw`| 范式 | 同一 H×7 动作如何产生 | 主要部署代价 | 一个反例/边界 |
|---|---|---|---|
| 离散自回归 | 连续动作→token sequence→逐 token 解码→反量化 | 串行长度与量化误差 | 高频长 chunk 可能过慢 |
| 连续并行 chunk | 一次前向直接输出 H×7 | 简单、快；普通 MSE 易学条件均值 | 两种相反抓法会被平均 |
| diffusion/flow expert | 从 H×7 噪声经多步去噪/ODE 到动作 | 多次网络/solver 调用 | 采样约定或延迟错误会破坏输出 |

FAST：面向动作序列的压缩 tokenization 路线；具体能力须绑定官方来源与版本。`,
        expected: [
          "三行都使用同一个 H×7 目标，因此差异来自生成方式而非任务不同。",
          "每行都有工程代价和至少一个边界。",
          "没有把所有离散头都写成维度独立；自回归 token 可建模前后依赖。",
        ],
        checkpoint: "你能解释为什么“连续 head”不自动等于 OFT，也能解释 flow/diffusion 为什么需要额外采样计算。",
        troubleshooting: [
          "若表中只剩优缺点形容词，补上输入 shape、输出 shape 与推理解码循环。",
          "若无法区分 diffusion 与 flow，先保留共同的生成式类别，但不要声称它们训练目标相同。",
        ],
      },
      {
        title: "第 3 步：逐个候选填证据矩阵，一次只核一个来源",
        goal: "把模型能力拆成七个可追踪字段，并把动态事实绑定日期。",
        actions: [
          "创建 evidence-matrix.csv，先填官方入口，不先填能力结论。",
          "依次打开 SmolVLA 官方文档、OpenVLA-OFT 项目页、X-VLA 官方文档、openpi 官方仓库；每看完一个来源只填对应一行。",
          "七个审计维度必须齐全：action paradigm、inputs、physical output contract、data/adapter、open assets/license、hardware/latency、reported boundary。",
          "每行写 checked_at=2026-08-08 和你实际看的 release/commit；若来源只报告论文实验，把 evidence_level 写 official-report，不写 locally-verified。",
          "ACT 作为 narrow baseline 单独保留，不因它不是 VLA 而删除。",
        ],
        code: String.raw`candidate,role,official_source,revision_or_release,checked_at,action_paradigm,inputs,physical_output_contract,data_adapter,open_assets_license,hardware_latency,reported_boundary,evidence_level
ACT,narrow-baseline,https://github.com/tonyzhaozh/act,VERIFY,2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,official-source-not-local-run
SmolVLA,primary-candidate,https://huggingface.co/docs/lerobot/smolvla,VERIFY,2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,official-source-not-local-run
OpenVLA-OFT,stretch-candidate,https://openvla-oft.github.io/,VERIFY,2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,official-report-not-local-run
X-VLA,cross-embodiment-index,https://huggingface.co/docs/lerobot/xvla,VERIFY,2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,official-source-not-local-run
openpi,continuous-expert-index,https://github.com/Physical-Intelligence/openpi,VERIFY,2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,VERIFY,official-source-not-local-run`,
        expected: [
          "每个动态结论都有官方 URL、revision/release 与日期。",
          "未知格保留 VERIFY/UNKNOWN，不用别的 release 数字拼接。",
          "论文报告、公开资产和本地运行是不同 evidence_level。",
        ],
        checkpoint: "随机点一格，你能打开对应固定来源解释它为何这样填；做不到就应改回 UNKNOWN。",
        troubleshooting: [
          "README 与论文冲突：增加两条证据分别记录 paper claim 与 public implementation，不选一条静默覆盖。",
          "显存数字冲突：补 precision、batch、train/infer、revision 与测量主体；条件不同不能直接比较。",
          "许可看不懂：标 UNKNOWN/BLOCKED 并请求法律或项目负责人确认，不自己推断商业可用。",
        ],
      },
      {
        title: "第 4 步：先跑硬门禁，让不可行候选直接停止",
        goal: "防止一个接口不兼容的模型靠论文分数补偿硬性失败。",
        actions: [
          "新建 gates.csv，为 scenario.yaml 的五个 must_have 建五列。",
          "每格只填 PASS、FAIL、UNKNOWN；PASS 必须附 evidence-matrix 的来源，UNKNOWN 按未通过处理。",
          "计算 eligible：只有五项全 PASS 才是 YES；其余写 NO 和第一个 blocking_reason。",
          "保留被淘汰候选，不删除行；这能让未来新 release 到来时只更新阻塞格。",
        ],
        code: String.raw`candidate,license,weights_or_train_code,input_adapter,action_adapter,local_inference_smoke,eligible,blocking_reason
ACT,PASS,PASS,UNKNOWN,UNKNOWN,UNKNOWN,NO,input/action adapter not yet verified
SmolVLA,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,NO,source audit incomplete
OpenVLA-OFT,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,NO,source audit incomplete
X-VLA,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,NO,source audit incomplete
openpi,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,UNKNOWN,NO,source audit incomplete`,
        expected: [
          "初始状态没有候选因“看起来很强”自动 eligible。",
          "UNKNOWN 不被当成 0.5 分绕过。",
          "每个 NO 都有一个下一步可调查的 blocking_reason。",
        ],
        checkpoint: "你能说明硬 Gate 和加权评分的逻辑区别：前者回答能不能做，后者只在可行者中回答更适合谁。",
        troubleshooting: [
          "若所有候选都 FAIL，先考虑调整项目/adapter 计划，而不是删除门禁。",
          "若 smoke 尚未运行，不得把“官方说支持”填成本机 smoke PASS；两者是不同证据。",
        ],
      },
      {
        title: "第 5 步：用透明 Toy 分数练一次加权计算",
        goal: "先掌握评分机制和输出解释，再把真实候选填进去；Toy 分数不代表任何模型事实。",
        actions: [
          "新建 score.py，复制下面的标准库脚本。三行分数是教学假设，不写入 evidence-matrix。",
          "运行脚本，手算 ACT-like 的 4.45，确认程序与公式一致。",
          "解释最高分只表示在这组假设权重下更合适，不表示论文性能最好。",
          "真实使用时只把 eligible=YES 的候选和有来源的项目内实测分数替换进去。",
        ],
        code: String.raw`# work/vla-families/score.py
weights = {"data": .30, "action": .25, "resources": .20, "maturity": .15, "openness": .10}
toy = {
    "ACT-like":          {"data": 4, "action": 4, "resources": 5, "maturity": 5, "openness": 5},
    "light-VLA-like":    {"data": 5, "action": 3, "resources": 4, "maturity": 4, "openness": 4},
    "large-flow-like":   {"data": 4, "action": 5, "resources": 1, "maturity": 3, "openness": 3},
}
assert abs(sum(weights.values()) - 1.0) < 1e-9
for name, row in toy.items():
    score = sum(weights[k] * row[k] for k in weights)
    print(f"{name:18s} {score:.2f}")

# 这些是 Toy 偏好分，不是实际模型 benchmark。

# 运行：python work/vla-families/score.py`,
        expected: [
          "ACT-like 4.45、light-VLA-like 4.05、large-flow-like 3.40。",
          "权重和为 1 的 assert 通过。",
          "你明确把这些数字标成 Toy，而不是给实际模型打分。",
        ],
        checkpoint: "你能从 0.30×4+0.25×4+0.20×5+0.15×5+0.10×5 手算出 4.45。",
        troubleshooting: [
          "若分数不同，检查小数点和权重是否加和为 1；不要先删 assert。",
          "若想给 UNKNOWN 填 3 分，停止；未知应留在 Gate/证据收集阶段。",
        ],
      },
      {
        title: "第 6 步：只改一组权重，观察决策是否稳定",
        goal: "用反例证明“精确到两位小数的排名”可能只是权重选择产物。",
        actions: [
          "复制 score.py 为 score_latency_relaxed.py。",
          "只改 weights：resources 从 .20 降到 .05，action 从 .25 升到 .40，其余不变；先预测 large-flow-like 会明显上升。",
          "运行并把前后两个输出贴进 sensitivity.md。",
          "若首选翻转或分差小于 0.2，不给唯一结论；写出下一项最值得实测的数据，例如 p99 或 adapter 开发量。",
        ],
        code: String.raw`Copy-Item work/vla-families/score.py work/vla-families/score_latency_relaxed.py
# 在复制文件中只改这一行：
weights = {"data": .30, "action": .40, "resources": .05, "maturity": .15, "openness": .10}
python work/vla-families/score_latency_relaxed.py`,
        expected: [
          "新分数约为 ACT-like 4.30、light-VLA-like 3.90、large-flow-like 4.00。",
          "large-flow-like 从 3.40 升到 4.00，说明资源权重会实质改变排序。",
          "sensitivity.md 写出哪个未知实测最可能改变决策。",
        ],
        checkpoint: "你能解释为什么敏感性分析不是为了找到“正确权重”，而是暴露结论依赖哪些偏好和未知事实。",
        troubleshooting: [
          "若所有分数同比例变化，检查是否真的把权重从 resources 转给 action，而不是整体缩放。",
          "若实际候选首选不稳定，保留两个 finalist 进入 smoke，不靠增加小数位强行排序。",
        ],
      },
      {
        title: "第 7 步：先跑模型无关的 action 与 chunk 接口 smoke",
        goal: "在下载候选模型前，验证目标系统至少能表达动作契约、量化边界、延迟队列和受控停止。",
        actions: [
          "运行 action_tokenizer.py，保存 token、round-trip error、clip count 和 NaN 拒绝输出。",
          "运行 chunked_controller.py，保存 p99、reserve、limited states、stale rejection 和 controlled stop。",
          "在 smoke-protocol.md 写每个真实候选都必须输出的共同字段：H×dₐ、finite、physical frame/unit、norm revision、latency p50/p99、reload consistency。",
          "解释这两个 Toy 不会证明任一 VLA 可运行；它们先固定候选必须接入的共同边界。",
        ],
        code: String.raw`python public/labs/action_tokenizer.py 2>&1 | Tee-Object work/vla-families/action-interface.txt
python public/labs/chunked_controller.py 2>&1 | Tee-Object work/vla-families/chunk-interface.txt`,
        expected: [
          "tokenizer 输出 7D tokens、最大 active round-trip error 约 0.006102、metadata/NaN PASS。",
          "controller 输出 latency p99=220ms、reserve=5、limited states [0.08,0.16,0.24]，并拒绝 stale chunk。",
          "两个脚本最后都显示 ALL CHECKS PASSED。",
        ],
        checkpoint: "你能把真实模型的 raw 输出和最终物理 action contract 分开，并说出候选 smoke 至少要跨过哪六项。",
        troubleshooting: [
          "tokenizer 报 shape：检查目标候选 action dimension，不要用 padding 假装 7D 兼容。",
          "chunk reserve 计算不符：确认 p99、margin、action_dt 单位一致并向上取整。",
          "真实候选输出 finite 但语义异常：先查 norm/frame/unit/gripper，不先调模型温度。",
        ],
      },
      {
        title: "第 8 步：写 baseline / primary / stretch 决策，并给出翻转条件",
        goal: "把矩阵变成可执行下一步，而不是“模型综述”结尾。",
        actions: [
          "新建 decision.md，分别指定 baseline、primary 和 stretch；任何角色可写 NONE/BLOCKED。",
          "每个选择写三段：为什么通过硬 Gate、当前证据、下一条 exact smoke；每个被淘汰候选只写最先阻塞它的事实。",
          "列三个 decision flip triggers，例如新 release 提供目标 adapter、实测 p99 超阈值、许可确认不可用。",
          "最后标四类结论：来源确认、项目内实测、合理推测、仍未知。没有运行真实模型时，不得出现成功率。",
        ],
        code: String.raw`# Model decision — checked 2026-08-08

## Baseline
candidate:
gate evidence:
next exact smoke:

## Primary
candidate:
gate evidence:
next exact smoke:

## Stretch
candidate / BLOCKED:
reason:

## Decision flip triggers
1.
2.
3.

## Evidence boundary
- official-source facts:
- locally measured:
- reasonable inference:
- unknown / not run:`,
        expected: [
          "三层角色与同一模型排行榜不同；baseline 可以是 ACT。",
          "primary 的下一步是一条可执行 smoke，不是“进一步研究”。",
          "至少三个新事实会触发重新决策。",
          "未运行真实模型时成功率保持未知。",
        ],
        checkpoint: "另一位工程师能根据 decision.md 直接执行下一次候选 smoke，并知道什么结果会让你改选。",
        troubleshooting: [
          "若 primary 仍是 UNKNOWN 门禁，先写 BLOCKED，不要用加权分越过。",
          "若 baseline 与 primary 使用不同 action/safety/eval，先统一协议，否则后续结果不可比较。",
          "若所有理由都引用论文分数，回到 scenario.yaml，补数据、动作、硬件和部署证据。",
        ],
      },
    ],
    finalArtifact: [
      "work/vla-families/scenario.yaml：明确输入、H×7 物理动作、硬件、硬门禁与范围。",
      "paradigms.md：用同一个动作块比较离散 AR、连续 chunk 与 diffusion/flow。",
      "evidence-matrix.csv 与 gates.csv：带官方 URL、revision/date、UNKNOWN 和阻塞理由。",
      "score.py、score_latency_relaxed.py 与 sensitivity.md：可手算的 Toy 评分及单变量反例。",
      "action-interface.txt、chunk-interface.txt 与 smoke-protocol.md：真实候选的共同接口门禁。",
      "decision.md：baseline/primary/stretch、下一条 smoke 和三项翻转触发器。",
    ],
    verifiedBoundary:
      "课程本地验证的是透明的 Toy 评分机制，以及 action_tokenizer.py/chunked_controller.py 的接口行为；Toy 分数不代表 ACT、SmolVLA、OpenVLA-OFT、X-VLA 或 openpi 的真实排名。真实候选的公开资产和动态资源必须绑定学习者查阅的官方 revision/date，本教程未在其 GPU、数据或机器人上完成对比 benchmark。",
    knowledgeCheck: [
      {
        question: "为什么要先 Gate，再做加权评分？",
        answer: "许可、权重/训练代码、输入输出 adapter 和可运行硬件是一票否决条件；加权高分不能补偿系统根本无法合法或正确运行。评分只比较已经可行的候选。",
      },
      {
        question: "离散 AR 动作是否一定忽略跨维和时间依赖？",
        answer: "不一定。独立 factorized bins 会忽略这些依赖，但自回归 action tokens 可通过先前 token 建模跨维/时间依赖，代价是串行解码和量化/序列长度。",
      },
      {
        question: "为什么 primary 不应默认选择参数最大的模型？",
        answer: "首个 primary 要优先闭合数据→训练/推理→动作 adapter→rollout 链路。更大模型若没有匹配 adapter、许可、资源或延迟能力，论文能力无法转化为项目证据。",
      },
      {
        question: "敏感性分析显示首选频繁翻转时，应怎么做？",
        answer: "停止给假精确排名，找出最影响排序的未知维度，并让两个 finalist 在同数据/接口下做对应实测，例如 p99、显存或小数据过拟合。",
      },
    ],
  },

  "world-models": {
    intro:
      "这一带练先把 policy、dynamics、reward、value 四种函数写成能执行的接口，再运行一个有限候选重排与 OOD 漏洞的确定性脚本。你会先预测输出、再运行、逐函数追踪、改一个不确定性权重观察数值，最后才把方法迁移到真实 VLA 数据。",
    beforeYouStart: [
      "在仓库根目录打开 PowerShell；Python 3.10+ 标准库即可，不需要 GPU。",
      "本章 Toy 的 world-model ensemble 是手工构造、未训练；它只用于暴露模型外推与优化器利用问题。",
      "准备纸笔或计算器。先完成每步的预测再运行代码，否则容易只记住输出。",
      "真实迁移必须有 held-out transition 与真实 rollout；低 one-step loss 和低 ensemble variance 都不是安全证明。",
    ],
    steps: [
      {
        title: "第 1 步：给四种对象写可调用契约",
        goal: "先用输入、输出和标签区分对象，再谈“世界模型”这个名字。",
        actions: [
          "创建 work/world-models/contracts.md，复制四行模板。",
          "对每行补出一个具体 shape：例如 z:[B,32]、A:[B,H,7]、reward:[B,1]。",
          "在 label/source 一列写监督从哪里来；value 必须注明对应 policy 与 horizon。",
          "在“不是它”一列写一个常见混淆，例如 policy 不是 future-state predictor。",
        ],
        code: String.raw`New-Item -ItemType Directory -Force work/world-models | Out-Null
@'
| object | function signature | output meaning | label/source | not this |
|---|---|---|---|---|
| policy | pi(o:[B,...], l:[B,T]) -> A:[B,H,7] | 候选动作分布/块 | demonstration 或 return optimization | 不必预测未来状态 |
| dynamics | f(z:[B,32], A:[B,H,7]) -> z_future:[B,H,32] | 动作条件未来 | 时间相邻 transition | 不是“动作好不好” |
| reward | r(z:[B,32], a:[B,7], l) -> [B,1] | 当前一步反馈 | 环境规则/偏好/学习标签 | 不是累计未来回报 |
| value | V_pi(z:[B,32], l, horizon=H) -> [B,1] | 给定策略/时域的期望回报 | return/bootstrapping | 不给出具体未来轨迹 |
'@ | Set-Content -Encoding utf8 work/world-models/contracts.md`,
        expected: [
          "四种函数的输入、输出和监督来源不同。",
          "value 行写出了 policy/horizon；reward 行没有被写成 future return。",
          "semantic action 若只输出文字步骤，被归到 policy/层级决策而不是自动归到 dynamics。",
        ],
        checkpoint: "给你任意模块说明，你能先问函数签名和训练标签，再判断它属于哪一类。",
        troubleshooting: [
          "若 reward 与 value 仍一样，检查 reward 是一步量，value 是在指定策略/时域下的累计回报期望。",
          "若 dynamics 只接 z 不接 action，它不能直接回答“执行某候选动作会怎样”，需明确其用途。",
        ],
      },
      {
        title: "第 2 步：手算 one-step 偏差如何累积",
        goal: "亲手看到 one-step error 小为什么不能推出长 imagined rollout 正确。",
        actions: [
          "新建 bias-table.md，设真实 dynamics xₜ₊₁=xₜ+aₜ，模型每一步额外加 δ=0.02。",
          "从 x₀=0、每步 a=0.1 开始，手填 H=1、5、10、25 的真实终点、预测终点和绝对误差。",
          "检查误差是否等于 Hδ；再写一句这只对线性固定偏差成立，非线性反馈可能放大或抵消。",
          "写出反例：one-step error=0.02 很小，但 H=25 时终点误差已 0.5。",
        ],
        code: String.raw`| H | true final = 0.1H | model final = 0.12H | abs error = 0.02H |
|---:|---:|---:|---:|
| 1 | 0.10 | 0.12 | 0.02 |
| 5 | 0.50 | 0.60 | 0.10 |
| 10 | 1.00 | 1.20 | 0.20 |
| 25 | 2.50 | 3.00 | 0.50 |`,
        expected: [
          "四行误差分别为 0.02、0.10、0.20、0.50。",
          "你明确区分 teacher-forced one-step 输入与 free rollout 中模型吃自己的预测。",
          "没有把 Hδ 当成所有神经世界模型的严格上界。",
        ],
        checkpoint: "你能用一句话说明为什么评估报告必须画 error-vs-horizon，而不能只报一步 MSE。",
        troubleshooting: [
          "若预测终点写成真实终点+0.02，说明你只加了一次偏差；这里每个 rollout step 都加 δ。",
          "若把例子外推为安全阈值，停下：δ 和线性公式只是教学设定。",
        ],
      },
      {
        title: "第 3 步：先预测四个候选，再运行完整 Toy",
        goal: "确认有限候选重排选择目标终点，并亲眼看到无约束优化钻模型漏洞。",
        actions: [
          "在纸上先把四个候选的动作求和；预测 (.2,.3,.5) 的真实终点是 1。",
          "运行 world_model_reranking.py，并保存全部输出。",
          "圈出 finite candidate ranking、chosen、unrestricted exploit 和最后的边界行。",
          "在 run-notes.md 写解释：有限候选最优与真实最优一致，是因为它们处在手工模型的支持区；不是因为任何 world model 天然可靠。",
        ],
        code: String.raw`python public/labs/world_model_reranking.py 2>&1 | Tee-Object work/world-models/baseline-output.txt
Get-Content work/world-models/baseline-output.txt`,
        expected: [
          "有限候选选择 (0.2, 0.3, 0.5)，predicted/true final 都为 1.000。",
          "无约束 exploit action 约 1.81，模型终点约 1、真实终点约 5.418（浮点网格会显示近似值）。",
          "exploit ensemble uncertainty 约 0.520。",
          "最后出现 finite candidate reranking + OOD exploitation: ALL CHECKS PASSED。",
        ],
        checkpoint: "你能解释“模型预测终点接近 1”为什么在 exploit 行反而是危险信号。",
        troubleshooting: [
          "若 chosen 不同，确认原脚本 candidates 和 task_cost 未改。",
          "若看不到 exploit 行，检查脚本是否完整执行到最后且未删除 assert。",
          "真实终点显示 5.43 等邻近值时，记录实际输出；教材数字来自网格近似，不应强制伪造一致。",
        ],
      },
      {
        title: "第 4 步：沿代码追踪一个候选的每层数值",
        goal: "把排序结果拆成 rollout、cost、ensemble mean 与 variance，而不是把 score 当黑箱。",
        actions: [
          "打开 public/labs/world_model_reranking.py，按顺序找到 true_rollout、learned_step、ensemble_rollout、task_cost、model_score。",
          "对安全候选 (.2,.3,.5) 手填 trace.md：三个 ensemble 预测都为 1，variance=0，action penalty=0.02×(.04+.09+.25)=0.0076。",
          "说明 score 越小越好，因为它是 cost+uncertainty penalty，不是 reward/value 置信度。",
          "找到脚本末尾 rewards、terminal_reward 和 value_estimate，写出三者为什么不能互换。",
        ],
        code: String.raw`# candidate trace: A=(0.2,0.3,0.5)
true_final: 1.0
ensemble_predictions: [1.0, 1.0, 1.0]
ensemble_mean: 1.0
ensemble_variance: 0.0
goal_cost: (1.0 - 1.0)^2 = 0.0
action_penalty: 0.02 * (0.2^2 + 0.3^2 + 0.5^2) = 0.0076
model_score: 0.0076

解释：score 是本例规划代价；step reward、terminal reward 与 value estimate 仍有不同时间语义。`,
        expected: [
          "手算 model_score=0.0076，与函数输出一致。",
          "能指出 learned_step 只在 |a|>0.6 时加入病态三次项。",
          "不会把低 variance 说成安全认证。",
        ],
        checkpoint: "不调用 model_score，你能从三个 ensemble 终点算出 mean、variance、task cost 和总 score。",
        troubleshooting: [
          "若 action penalty 算成 0.0152，检查公式系数是 0.02，平方和是 0.38。",
          "若把 ensemble 方差当 aleatoric noise，注意这里仅是三个手工模型的分歧，用来演示 epistemic proxy。",
        ],
      },
      {
        title: "第 5 步：添加 OOD 候选，比较有无 uncertainty penalty",
        goal: "只改一个权重，定量看到不确定性惩罚如何改变 OOD 候选分数。",
        actions: [
          "新建 compare_penalty.py，复制下面代码；它复用基准模块，不改 public/labs 原文件。",
          "运行前预测：safe 候选 variance=0；OOD 候选在 weight=2 时分数应比 weight=0 高约 2×0.527=1.054。",
          "运行并把三行输出存到 penalty-output.txt。",
          "解释即便 OOD 候选被惩罚，也不能宣称安全：ensemble 可能一致地错，候选来源也可能 OOD。",
        ],
        code: String.raw`# work/world-models/compare_penalty.py
import sys
sys.path.insert(0, "public/labs")
from world_model_reranking import model_score, true_rollout

safe = (0.2, 0.3, 0.5)
ood = (1.81, 1.81, 1.81)
for name, chunk in (("safe", safe), ("ood", ood)):
    with_penalty = model_score(chunk, uncertainty_weight=2.0)
    without_penalty = model_score(chunk, uncertainty_weight=0.0)
    print(name, "true=", round(true_rollout(0, chunk), 3),
          "score_w2=", round(with_penalty[0], 4),
          "score_w0=", round(without_penalty[0], 4),
          "variance=", round(with_penalty[2], 4))

# 运行：python work/world-models/compare_penalty.py`,
        expected: [
          "safe: true=1.0、score_w2=score_w0=0.0076、variance=0。",
          "ood: true≈5.43、score_w2≈1.2517、score_w0≈0.1969、variance≈0.5274。",
          "OOD 分数差约 1.0548，正好来自 2×variance。",
        ],
        checkpoint: "你能说清 uncertainty_weight 调的是规划器偏好，不会修复 dynamics 本身。",
        troubleshooting: [
          "ModuleNotFoundError：确认从仓库根目录运行，且 sys.path 指向 public/labs。",
          "OOD 真实终点与教材略有差异：这里固定 a=1.81，真实和为 5.43；基准网格选择值略不同。",
          "若把 weight 调大后仍想称安全，回看 ensemble 一致错误的可能性。",
        ],
      },
      {
        title: "第 6 步：构造“所有模型一致地错”的反例",
        goal: "理解低 ensemble variance 只能说明成员一致，不能证明预测正确。",
        actions: [
          "在 contracts.md 下增加一个手算反例：真实终点 5，三个模型都预测 1。",
          "计算 mean=1、variance=0、absolute model error=4。",
          "写出系统应同时参考的其他信号：动作范围/数据距离、真实 held-out error、硬约束和 fallback。",
          "把“variance=0 ⇒ safe”明确标为错误命题。",
        ],
        code: String.raw`true_final = 5.0
ensemble_predictions = [1.0, 1.0, 1.0]
mean = 1.0
variance = 0.0
absolute_error = 4.0

错误结论：variance == 0，所以动作安全。
正确解释：三个模型只是一致；它们可能共享数据盲区或建模偏差。`,
        expected: [
          "方差为 0 但误差为 4 的反例完整。",
          "回退条件不只使用 ensemble variance。",
          "你能区分 uncertainty proxy、动作约束与安全认证。",
        ],
        checkpoint: "看到低分歧时，你会问模型是否在训练支持范围、真实多步误差如何，而不是直接放行动作。",
        troubleshooting: [
          "若认为三个独立模型不可能同时错，考虑它们共享数据、特征和损失造成的共同偏差。",
          "若只用动作 clip 解决，注意 clip 不能保证未来碰撞、任务语义或接触动力学正确。",
        ],
      },
      {
        title: "第 7 步：把 Toy 迁移成真实 VLA 候选重排协议",
        goal: "具体定义需要导出哪些数据、训练什么、如何判断 world model 值得接入。",
        actions: [
          "新建 real-protocol.yaml，先选择 latent/state/pixel 中一种 prediction target；初学者优先选可直接验收的低维 state。",
          "指定 transition 样本 (zₜ,Aₜ,zₜ₊₁:ₜ₊H)、episode split、train-only normalization 和 candidate source=VLA K samples。",
          "填 evaluation_horizons=[1,5,10,20]，同时记录 teacher-forced 与 free-rollout error。",
          "定义有限候选重排 A/B：相同 VLA、相同 K 候选、相同安全层，只改变是否使用 world score；再记录 candidate oracle 上限。",
          "定义 fallback：高数据距离、高 disagreement、non-finite、预测越界或 server timeout 时回到原 VLA/安全停止。",
        ],
        code: String.raw`prediction_target: state
transition_shape: "(z_t:[32], A:[H,7], z_future:[H,32])"
split_unit: episode
normalization_source: train-only
candidate_source: "same VLA revision, K=8 stochastic chunks"
candidate_constraints: "physical action contract + training-support bounds"
evaluation_horizons: [1, 5, 10, 20]
metrics: [teacher_forced_mse, free_rollout_mse, task_cost, ensemble_disagreement]
ab_test:
  control: "VLA first candidate"
  treatment: "same K candidates reranked"
  shared: [seeds, observations, candidates, executor, safety_filter, success_rule]
fallback_on: [non_finite, high_data_distance, high_disagreement, predicted_constraint_violation, timeout]
status: "暂无法验证，等待真实 transition 与 rollout"`,
        expected: [
          "协议同时包含训练 transition、多 horizon 误差与真实 A/B rollout。",
          "control/treatment 共享候选集，避免把采样差异冒充重排收益。",
          "fallback 条件可机器检测，不只写“模型不确定时”。",
        ],
        checkpoint: "你能指出哪些数据训练 dynamics、哪些真实 rollout 验证重排、candidate oracle 上限回答什么。",
        troubleshooting: [
          "若 pixel prediction 太难验收，先缩到 state/latent，不要用漂亮视频代替 task-relevant error。",
          "若 treatment 重新采样候选，保存全部候选并固定 RNG；否则比较不公平。",
          "若 one-step 好、free rollout 差，先缩短 horizon/改训练数据，不直接增加优化搜索强度。",
        ],
      },
      {
        title: "第 8 步：写 go / no-go 结论，并保留负结果",
        goal: "用具体门禁决定是否让 world model 进入策略链路。",
        actions: [
          "新建 decision.md，列四个门禁：多步误差、OOD 检测、有限候选 A/B、fallback 故障测试。",
          "本地 Toy 只勾“机制理解”，真实四个门禁默认不勾。",
          "为 GO 写最低证据，而不是预写提升；为 NO-GO 写下一次最小实验，例如补特定 horizon 的 transition。",
          "最后按已确认/合理推测/个人观点/暂无法验证四栏总结。",
        ],
        code: String.raw`# World-model integration decision

- [x] Toy finite reranking and OOD exploit understood
- [ ] held-out free-rollout error acceptable at declared horizons
- [ ] OOD/disagreement rule calibrated on held-out data
- [ ] same-candidate A/B improves real rollout with N reported
- [ ] fallback and timeout fault injection pass

decision: NO-GO
next smallest experiment:

已确认事实：
合理推测：
个人观点：
暂无法验证：`,
        expected: [
          "没有真实数据时 decision 保持 NO-GO，但仍有明确下一实验。",
          "不会用 Toy 的 ALL CHECKS PASSED 替代真实多步误差和 rollout。",
          "负结果与未完成项被保留。",
        ],
        checkpoint: "你能清楚回答：world model 当前是研究原型、候选 evaluator，还是已进入部署链；证据对应哪一级。",
        troubleshooting: [
          "若想因离线 cost 下降直接 GO，补同候选真实 rollout 与 fallback 测试。",
          "若 A/B 无提升，先看 candidate oracle 是否有上限；候选全差时 evaluator 无法创造好动作。",
          "若不确定是模型还是 reward/cost 错，分开评测 future prediction 与 task cost。",
        ],
      },
    ],
    finalArtifact: [
      "work/world-models/contracts.md 与 bias-table.md：四类函数契约和多步误差手算。",
      "baseline-output.txt 与 run-notes.md：有限候选和 OOD exploit 的已验证输出。",
      "trace.md、compare_penalty.py、penalty-output.txt：score 分解与单参数反例。",
      "real-protocol.yaml：真实 transition、multi-step 评测、同候选 A/B 和 fallback。",
      "decision.md：不预写成功的 go/no-go 门禁。",
    ],
    verifiedBoundary:
      "world_model_reranking.py 已在本地标准库环境验证有限候选、手工 ensemble、reward/value 语义输出与 OOD optimizer exploitation。它的 dynamics 是人为设计且在 |a|≤0.6 内刻意精确，并非从机器人数据训练。候选重排是课程工程建议，不提供安全保证；真实世界模型误差、重排收益和安全性均需 held-out transition 与真实 rollout。",
    knowledgeCheck: [
      {
        question: "one-step MSE 很低，为什么 imagined rollout 仍可能失败？",
        answer: "训练常用真实 zₜ 作为输入，而自由 rollout 反复使用模型自己的预测；小偏差改变下一步输入并累积，甚至进入训练外区域，所以必须按 horizon 测 free-rollout error。",
      },
      {
        question: "ensemble disagreement 为 0 能推出预测正确吗？",
        answer: "不能。成员可能因共享数据、架构和损失而一致地错；低分歧只表示成员一致，不是与真实世界一致，更不是安全认证。",
      },
      {
        question: "为什么课程先推荐有限 VLA 候选重排，而不是直接优化任意动作？",
        answer: "有限候选通常更接近 policy proposal 分布，减少优化器主动寻找模型外推漏洞的空间，并便于保持动作接口和做 A/B；候选仍可能 OOD，所以仍需约束、不确定性和真实评测。",
      },
      {
        question: "candidate oracle 上限有什么用？",
        answer: "它用真实结果判断 K 个候选中是否本来就有好动作。若 oracle 也低，问题在 proposer/候选覆盖；若 oracle 高而 evaluator 低，才主要指向 world score/排序。",
      },
    ],
  },

  "frontier-and-deployment": {
    intro:
      "这一带练把“部署”落到 robot client 眼前会收到的一条消息：先写协议，再手算队列 reserve，运行 schema/乱序/TTL/watchdog 故障，新增两个错误用例，改一个 TTL 参数观察状态机变化，最后才建立真实服务迁移表。前沿论文放在选做索引，不能替代部署必修。",
    beforeYouStart: [
      "在仓库根目录打开 PowerShell；Python 3.10+ 标准库即可，不需要网络、GPU 或机器人。",
      "本章所有动作都是 2D Toy delta；脚本不含机器人动力学、IK、碰撞、硬件急停或安全认证。",
      "先不要连接真机。真实设备必须另有独立急停、人工接管、低层限速/限力和经批准的风险流程。",
      "p99 示例只有 10 个样本，用于验证算法，不是生产延迟估计。",
    ],
    steps: [
      {
        title: "第 1 步：画四段边界，指定谁有最终拒绝权",
        goal: "先明确 policy server、transport、robot client、servo/hardware 各自负责什么。",
        actions: [
          "创建 work/deployment/boundaries.md，复制四段图。",
          "在每条箭头上写可能故障：延迟、重复、乱序、断连、时钟偏差。",
          "在 robot client 下写 MUST：即使 server 声称已检查，client 仍验证 schema、time、finite、frame/unit、限幅。",
          "在 hardware 下分别写 controlled stop 与 E-stop；不得把软件 hold 叫硬件急停。",
        ],
        code: String.raw`New-Item -ItemType Directory -Force work/deployment | Out-Null
@'
observation -> [Policy server] -> response -> [Transport] -> [Robot client] -> safe command -> [Trajectory/Servo/Hardware]

Policy server: 产生候选动作；不是最终安全权威
Transport faults: delay / duplicate / reorder / loss / disconnect / clock mismatch
Robot client MUST: schema -> request/time -> finite -> revision -> frame/unit -> denorm -> limits -> fallback
Trajectory/Servo/Hardware: tracking + independent limits + operator takeover + hardware E-stop

术语：CONTROLLED_STOP = 软件受控停止/保持；E-STOP = 独立硬件急停，二者不可混称。
'@ | Set-Content -Encoding utf8 work/deployment/boundaries.md`,
        expected: [
          "robot client 明确保留最终软件拒绝权。",
          "transport 不被假定可靠、有序或零延迟。",
          "controlled stop 与硬件 E-stop 是两个不同框。",
        ],
        checkpoint: "你能指出 server 生成了“看起来合理”的动作后，client 仍必须独立检查的至少六项。",
        troubleshooting: [
          "若安全检查只画在 server，增加 client 侧重复验证；网络边界意味着不能信任上游状态。",
          "若想在 timeout 后沿用旧 chunk，先停下：必须有 TTL、前缀过期和 fallback 语义。",
        ],
      },
      {
        title: "第 2 步：写一条可被拒绝的 response contract",
        goal: "让版本、时间、物理语义和动作 shape 都成为显式字段。",
        actions: [
          "新建 response-example.json，复制脚本中的一条合法 response。",
          "逐字段解释 request_id、observation_time_ms、action_dt_ms、command_type、frame、unit 和 actions。",
          "在 contract-notes.md 补生产建议字段：model_revision、normalization_revision、rotation convention、valid mask、server_created_time。",
          "写拒绝策略：未知 schema/norm/action revision 默认 reject，不猜测兼容。",
        ],
        code: String.raw`{
  "schema_version": "v1",
  "request_id": 7,
  "observation_time_ms": 1000,
  "action_dt_ms": 50,
  "command_type": "eef_delta",
  "frame": "base",
  "linear_unit": "m",
  "actions": [[0.01,-0.01],[0.02,-0.02],[0.20,-0.20],[0.03,-0.03],[0.01,-0.01]]
}

生产补充（脚本未实现）：model_revision、normalization_revision、rotation_convention、valid、server_created_time。
默认规则：任何未知 revision => REJECT，不自动猜字段。`,
        expected: [
          "一条 response 可以被 request_id、观测年龄和 action_dt 唯一解释。",
          "动作明确为 base-frame EEF delta，线性单位 m。",
          "你能区分脚本已实现字段与生产建议字段。",
        ],
        checkpoint: "若只给 actions 数组不给 observation_time/frame/unit，你能解释 client 为什么不应执行。",
        troubleshooting: [
          "若真实系统使用秒而协议写毫秒，必须在 schema/version 层修正，不在执行器中凭数值大小猜。",
          "若 response 有混合平移/旋转/夹爪，给每类维度独立 unit/semantics 和 valid mask。",
        ],
      },
      {
        title: "第 3 步：先手算 p99 reserve，再运行代码",
        goal: "理解为什么 190+55+30ms、50ms/action 得到 6，而不是凭感觉设置队列。",
        actions: [
          "把脚本的 10 个 inference 与 network 样本分别排序；最近秩 p99 在 10 个样本中取第 ceil(.99×10)=10 个。",
          "得到 inference p99=190ms、network p99=55ms。加 margin=30ms，总计 275ms。",
          "计算 reserve=ceil(275/50)=ceil(5.5)=6，写入 latency-math.md。",
          "写边界：组件 p99 直接相加是保守工程启发式，不是 end-to-end p99 统计恒等式；生产应直接测端到端尾延迟。",
        ],
        code: String.raw`inference_p99_ms = 190
network_p99_ms = 55
margin_ms = 30
action_dt_ms = 50
total_ms = 190 + 55 + 30 = 275
reserve = ceil(275 / 50) = ceil(5.5) = 6 actions

边界：10 samples 只验证计算；不能据此设真实机器人阈值。`,
        expected: [
          "reserve=6，不是四舍五入为 5。",
          "知道最近秩 p99 在该 10 样本 Toy 中等于最大值。",
          "没有把分组件 p99 之和写成数学上等于端到端 p99。",
        ],
        checkpoint: "给定新 p99 和 action_dt，你能独立算 reserve，并说明何时触发新请求而不是等队列低于阈值。",
        troubleshooting: [
          "若算出 5，检查最后一步必须向上取整；5 个动作只覆盖 250ms。",
          "若单位混合秒/毫秒，先全部换成同一单位再除。",
        ],
      },
      {
        title: "第 4 步：运行基准故障注入，按事件顺序读日志",
        goal: "看到一个合法 chunk 如何跳过过期前缀、限幅，以及后续错误如何被拒绝/停止。",
        actions: [
          "运行 policy_service_fault_injection.py，把输出保存为 baseline-faults.txt。",
          "先看 ACCEPT:7:skip=2：now=1060、observation=1000、dt=50，所以 index 0 和 1 已过期。",
          "看 action=(0.05,-0.05)：原 index 2 是 ±0.20，被 max_abs_delta=0.05 截断。",
          "再按顺序标记 schema REJECT、stale request REJECT、watchdog STOP、TTL STOP。",
          "将 BOUNDARY 原样概括到 notes，不得删掉“not a certified safety controller”。",
        ],
        code: String.raw`python public/labs/policy_service_fault_injection.py 2>&1 | Tee-Object work/deployment/baseline-faults.txt
Get-Content work/deployment/baseline-faults.txt`,
        expected: [
          "首行 inference=190 ms、network=55 ms、reserve=6 actions。",
          "事件含 ACCEPT:7:skip=2:action=(0.05, -0.05)。",
          "随后出现 schema_version、stale request_id、watchdog timeout、chunk TTL expired。",
          "最后出现 PASS 和明确 BOUNDARY。",
        ],
        checkpoint: "你能逐项解释为何 schema/stale 只是拒绝该包，而 watchdog/TTL 会进入 CONTROLLED_STOP。",
        troubleshooting: [
          "若 skip 不是 2，检查 ceil((1060-1000)/50)，不能 floor。",
          "若 ±0.20 未截断，检查 max_abs_delta 和执行的是 safe_action 而非 raw_action。",
          "若输出顺序不同，确认基准文件未被编辑；实验一律复制或另建脚本。",
        ],
      },
      {
        title: "第 5 步：把日志还原成状态机表",
        goal: "从字符串输出恢复 client 状态、是否执行动作和最近有效消息是否更新。",
        actions: [
          "新建 event-trace.csv，复制下面五行。",
          "逐行查 SafePolicyClient.receive/watchdog 代码，确认 schema/stale 拒绝不会替换 last_valid_message_ms。",
          "在 executed_action 填唯一被执行的 (0.05,-0.05)，其他行填 NONE。",
          "给每行写恢复条件；例如 watchdog 后必须收到一条全合法且未过期的新 request，不能仅重放旧包。",
        ],
        code: String.raw`event,now_ms,input,state_after,executed_action,last_valid_updated,recovery
valid_request_7,1060,valid_v1,ACTIVE,"(0.05,-0.05)",YES,newer valid response
schema_v2,1070,bad_schema,ACTIVE,NONE,NO,fix schema and send newer request
request_6,1080,stale_id,ACTIVE,NONE,NO,send id greater than 7
watchdog,1181,no_valid_message,CONTROLLED_STOP,NONE,NO,receive fresh fully valid chunk
request_9,1300,age_300ms,CONTROLLED_STOP,NONE,NO,re-observe and request new chunk`,
        expected: [
          "只有第一行执行动作并更新 last_valid_message。",
          "坏包不能充当 heartbeat 延长运行。",
          "TTL 后恢复要求重新观测，而不是重新发送同一 chunk。",
        ],
        checkpoint: "你能从任意状态和输入预测 mode、event、是否动作以及 last_valid_message 是否变化。",
        troubleshooting: [
          "若把任何到达包都算 heartbeat，回看 watchdog 需要最近有效消息，而非最近网络流量。",
          "若 schema 错误令 ACTIVE 立即 stop，区分本 Toy 的策略与生产策略；生产可更保守，但必须显式测试。",
        ],
      },
      {
        title: "第 6 步：新增 wrong-frame、NaN 和 future-clock 三个用例",
        goal: "亲手扩展测试，而不是相信清单覆盖了所有故障。",
        actions: [
          "新建 extra_faults.py，复用模块的 SafePolicyClient 和 make_chunk。",
          "用 dataclasses.replace 一次只改一个字段：frame、actions、observation_time_ms。",
          "运行并确认三个输入都返回 None，events 顺序与预期一致。",
          "解释 future-clock 与 TTL 不同：前者 age<0，说明时钟/协议异常；后者 age 太大。",
        ],
        code: String.raw`# work/deployment/extra_faults.py
import sys
from dataclasses import replace
sys.path.insert(0, "public/labs")
from policy_service_fault_injection import SafePolicyClient, make_chunk

client = SafePolicyClient()
wrong_frame = replace(make_chunk(), frame="camera")
nan_action = replace(make_chunk(request_id=8), actions=((float("nan"), 0.0),))
future_clock = replace(make_chunk(request_id=9), observation_time_ms=1200)

assert client.receive(wrong_frame, now_ms=1000) is None
assert client.receive(nan_action, now_ms=1000) is None
assert client.receive(future_clock, now_ms=1100) is None
print(*client.events, sep="\n")
print("EXTRA FAULTS PASS")

# 运行：python work/deployment/extra_faults.py`,
        expected: [
          "依次输出 REJECT:command_type/frame、REJECT:non-finite action、REJECT:future observation clock。",
          "最后输出 EXTRA FAULTS PASS。",
          "client 没有执行动作，也没有进入 ACTIVE。",
        ],
        checkpoint: "你能自己再设计一个 wrong-unit 或空 actions 用例，并先写期望事件再运行。",
        troubleshooting: [
          "ImportError：确认从仓库根目录运行并保留 sys.path.insert。",
          "frozen dataclass 无法直接赋值：必须用 replace 返回新对象。",
          "NaN 没被拒绝：确认 actions 是 tuple of tuple，且改的是 value 不是字符串“nan”。",
        ],
      },
      {
        title: "第 7 步：只把 TTL 从 250ms 改成 50ms，观察同一包翻转",
        goal: "看到阈值是项目规格而非魔法常数，并学会用边界测试验证它。",
        actions: [
          "新建 ttl_counterexample.py；使用与基准相同的 request 和 now=1060，只把 client ttl_ms 设为 50。",
          "运行前预测：age=60ms>50ms，因此原先 ACCEPT 的包现在应 STOP。",
          "运行并记录输出；不要据此推断真实系统 TTL 应为 50 或 250。",
          "在 latency-math.md 写真实 TTL 的来源：端到端测量、控制动态、queue 设计与风险评审。",
        ],
        code: String.raw`# work/deployment/ttl_counterexample.py
import sys
sys.path.insert(0, "public/labs")
from policy_service_fault_injection import SafePolicyClient, make_chunk

client = SafePolicyClient(ttl_ms=50)
result = client.receive(make_chunk(), now_ms=1060)
assert result is None
assert client.mode == "CONTROLLED_STOP"
print(client.events[-1])
print("TTL COUNTEREXAMPLE PASS")

# 运行：python work/deployment/ttl_counterexample.py`,
        expected: [
          "输出 STOP:chunk TTL expired。",
          "同一 60ms age 的包从基准 ttl=250 的 ACCEPT 变为 ttl=50 的 STOP。",
          "结论只关于阈值机制，不宣称哪个阈值适合真机。",
        ],
        checkpoint: "你能说明 TTL 太宽与太窄的不同风险，并列出设定真实数值需要的测量。",
        troubleshooting: [
          "若仍 ACCEPT，确认实例化传入 ttl_ms=50，而不是修改 make_chunk 的 action_dt。",
          "若想用平均延迟设 TTL，先收集端到端尾延迟和控制任务容许新鲜度。",
        ],
      },
      {
        title: "第 8 步：把 Toy 迁移成真实服务的日志与故障矩阵",
        goal: "定义真服务必须记录什么、每种故障期望进入什么状态。",
        actions: [
          "新建 fault-matrix.csv，至少填写 schema、missing field、NaN、wrong frame/unit、extreme delta、duplicate、reorder、latency、TTL、watchdog、queue underrun、client restart。",
          "每行先写 expected_state 与 executed_action，再安排注入；禁止先运行后为结果改期望。",
          "新建 log-schema.md，用 request_id 串起 observation metadata、raw response、model/norm revision、skipped prefix、clipped action、actual execution time 与 stop event。",
          "真实迁移从录制/回放 transport 开始，先用仿真/空载环境；没有独立安全系统时保持 NO-GO。",
        ],
        code: String.raw`fault,inject_at,expected_state,expected_action,recovery,actual,evidence
schema_v2,client_validate,UNCHANGED,NONE,new valid schema,,
nan_action,client_validate,UNCHANGED,NONE,new finite action,,
wrong_frame,client_validate,UNCHANGED,NONE,correct explicit frame,,
stale_request_id,ordering,UNCHANGED,NONE,newer request,,
ttl_expired,freshness,CONTROLLED_STOP,NONE,re-observe and request,,
watchdog_timeout,liveness,CONTROLLED_STOP,NONE,fresh valid message after reset,,
queue_underrun,executor,CONTROLLED_STOP,NONE,refill under approved transition,,

日志最小键：request_id, observation_time, receive_time, schema/model/norm/action revisions,
raw_chunk, skipped_prefix, filtered_chunk, executed_action, execution_time, reject_or_stop_reason。`,
        expected: [
          "故障矩阵每行都有预期状态、预期动作和恢复条件。",
          "日志同时保留 raw 与 filtered/executed 动作。",
          "真机连接仍被独立安全门禁阻挡，Toy PASS 不会自动放行。",
        ],
        checkpoint: "只给你一个 request_id，你知道必须从日志中取出哪些记录才能重放 client 决策。",
        troubleshooting: [
          "若日志只存最终轨迹，无法区分 server、transport、client 与 controller；补原始 response 和过滤事件。",
          "若 client restart 后 request_id 可能回退，设计 session/epoch 或持久化单调序列，不能猜旧包新鲜。",
          "若 fault 注入会触及真机，先在纯软件/仿真验证并经过风险审批。",
        ],
      },
      {
        title: "第 9 步（选修）：用四问法阅读 OFT、FAST、RTC 与动态前沿",
        goal: "把前沿方法放回表示、训练、解码或 runtime 的具体层，不用 demo 名称替代证据。",
        actions: [
          "新建 frontier-index.csv，依次读取 OFT https://openvla-oft.github.io/、FAST https://www.pi.website/research/fast、RTC https://www.pi.website/research/real_time_chunking 的一手来源。",
          "每项只回答四问：旧系统的受控失败是什么、改了哪一层、证据在哪种任务/样本、引入什么代价。",
          "动态仓库条目必须固定 revision/date。例如课程索引的 GR00T N1.7 Early Access 快照为 https://github.com/NVIDIA/Isaac-GR00T/tree/b9955401d50c92a29258732e3ad6ccd579f1bdc0，checked 2026-08-08；它不是永久 release 状态声明。",
          "在 transfer_to_my_system 一列只写合理推测或待实验，不把官方报告直接写成本项目收益。",
        ],
        code: String.raw`method,official_source,revision_or_date,changed_layer,controlled_problem,evidence_scope,new_cost,transfer_to_my_system,status
OFT,https://openvla-oft.github.io/,checked-2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,UNKNOWN,official-report
FAST,https://www.pi.website/research/fast,checked-2026-08-08,action-tokenization,VERIFY,VERIFY,VERIFY,UNKNOWN,official-report
RTC,https://www.pi.website/research/real_time_chunking,checked-2026-08-08,runtime-chunk-continuity,VERIFY,VERIFY,VERIFY,UNKNOWN,official-report
GR00T-N1.7-EA,https://github.com/NVIDIA/Isaac-GR00T/tree/b9955401d50c92a29258732e3ad6ccd579f1bdc0,b995540-checked-2026-08-08,VERIFY,VERIFY,VERIFY,VERIFY,UNKNOWN,dynamic-snapshot`,
        expected: [
          "OFT 不被缩写成“任何连续 head”；FAST 与 RTC 分别落在表示压缩和 runtime 连续性。",
          "每个动态条目有 revision/date。",
          "本项目收益全部保持 UNKNOWN，直到同协议实验。",
        ],
        checkpoint: "给一个新前沿方法，你能先定位它改表示、目标、decoder、runtime 还是传感器，再决定需要哪种对照实验。",
        troubleshooting: [
          "若只找到二手总结，保留 UNKNOWN，继续找论文/官方仓库；不要把搜索摘要当证据。",
          "若版本状态变化，新增一行新 snapshot 并保留旧行，避免历史结论被悄悄改写。",
        ],
      },
    ],
    finalArtifact: [
      "work/deployment/boundaries.md、response-example.json 与 contract-notes.md：四段信任边界和版本化动作协议。",
      "latency-math.md、baseline-faults.txt 与 event-trace.csv：reserve 手算和完整状态机追踪。",
      "extra_faults.py 与 ttl_counterexample.py：三个新增拒绝用例和单参数反例。",
      "fault-matrix.csv 与 log-schema.md：真实服务故障预期、恢复条件和可重放日志。",
      "可选 frontier-index.csv：OFT/FAST/RTC/动态仓库的来源、日期、层级和未验证迁移。",
    ],
    verifiedBoundary:
      "policy_service_fault_injection.py 已本地验证 10 样本最近秩 p99 机制、reserve=6、过期前缀 skip=2、±0.05 clip、schema/乱序拒绝、TTL 与 watchdog CONTROLLED_STOP。它是无网络、无机器人、2D 动作的确定性模拟，不检查时钟同步、序列化、动力学、IK、碰撞或任何认证安全功能；真实阈值与前沿方法收益均暂无法验证。",
    knowledgeCheck: [
      {
        question: "TTL 与 watchdog 分别处理什么？",
        answer: "TTL 判断某条 chunk 相对其 observation_time 是否仍新鲜；watchdog 判断系统距离最近一次有效消息是否过久。一个是消息级新鲜度，一个是连接/系统级活性，不能互相替代。",
      },
      {
        question: "为什么 275ms / 50ms 得到 reserve=6？",
        answer: "5 个动作只覆盖 250ms，小于 275ms；队列动作数必须向上取整到 6 才覆盖这个保守预算。真实系统仍应直接测端到端 p99。",
      },
      {
        question: "为什么 response 到达时间不能代替 observation_time？",
        answer: "到达时间只说明网络包何时抵达，不能说明模型依据的感知数据何时采集；延迟大的旧观测可能刚刚到达却已不适合执行。",
      },
      {
        question: "本地 fault script PASS 为什么仍不能声称真机安全？",
        answer: "脚本只验证一个简化 client 控制流，没有真实网络、时钟、动力学、轨迹、碰撞、力限制、硬件急停和认证流程。安全结论需要独立系统与目标设备证据。",
      },
      {
        question: "OFT、FAST、RTC 分别主要改哪一层？",
        answer: "OFT 是包含并行解码、chunking、连续表示与训练目标的完整 fine-tuning recipe；FAST 主要改动作序列 tokenization/压缩；RTC 主要处理运行时新旧 chunk 连续拼接。具体实现与收益需绑定版本。",
      },
    ],
  },

  capstone: {
    intro:
      "毕业项目不从“训练一个大模型”开始。本带练先带你建立一个可在 CPU 上完成的工程彩排：冻结任务→生成并破坏数据→过审计→跑 BC 门禁→统一策略接口→计算评测区间→设计消融→打包证据。做到每一关后，你再把相同文件替换成真实 simulator、ACT 与一个固定 revision 的 VLA。没有算力或真机不会阻止你完成核心彩排，也不能成为伪造实际结果的理由。",
    beforeYouStart: [
      "在仓库根目录打开 PowerShell；步骤 1–8 使用现有 Python 标准库脚本即可。",
      "选择一个最小任务。默认示例是“根据语言把红色方块放进左侧托盘”，只含一个机器人、两个相机、一个目标物。",
      "建立两条状态：REHEARSAL（课程 Toy 彩排）和 REAL（真实仿真/机器人）。所有产物必须标明属于哪条，禁止把 REHEARSAL 数值放进真实结果。",
      "真机路线完全选做；没有独立急停、人工接管、限速/限力、碰撞保护和批准流程时必须停在仿真。",
    ],
    steps: [
      {
        title: "第 1 步：一条命令建立项目骨架，再填任务契约",
        goal: "把模糊的“做一个 VLA 项目”缩成机器可判断的任务。",
        actions: [
          "运行命令创建 spec、data、logs、reports、artifacts 五个目录。",
          "新建 spec/task_spec.yaml，先照抄示例；若换任务，只允许一次改一个区块并提升 revision。",
          "把 success 写成环境状态谓词，而不是“视频看起来成功”。",
          "把 timeout、wrong_target、out_of_workspace、collision 和 human_takeover 列为独立 termination_reason。",
        ],
        code: String.raw`$dirs = @("spec","data","logs","reports","artifacts")
$dirs | ForEach-Object { New-Item -ItemType Directory -Force "work/capstone/$_" | Out-Null }
@'
revision: task-red-block-left-tray-v1
track: REHEARSAL
task_id: place-red-block-left-tray
instruction: "put the red block in the left tray"
allowed_paraphrases: ["place the red cube in the left bin", "move the red block to the left tray"]
observations:
  cameras: [front, wrist]
  state_shape: [8]
action:
  shape: "H x 7"
  command_type: eef_delta_pose_plus_gripper
  frame: base
  control_hz: 20
max_steps: 300
success_predicate: "red_block center is inside left_tray AND gripper is open"
termination_reasons: [success, timeout, wrong_target, out_of_workspace, collision, human_takeover, system_fault]
fixed_seeds: [11, 22, 33, 44]
'@ | Set-Content -Encoding utf8 work/capstone/spec/task_spec.yaml`,
        expected: [
          "work/capstone 下有五个子目录和 task_spec.yaml。",
          "成功条件包含物体、目标区域和夹爪状态。",
          "失败原因不是一个笼统 failed 字段。",
        ],
        checkpoint: "给一段 rollout 末状态，你能只根据 task_spec 判 success/termination，而不看精选视频。",
        troubleshooting: [
          "若 simulator 无法提供成功谓词所需状态，先修改任务/传感器或标为人工标注协议；不要暗中目测。",
          "若任务需要十几个物体和长规划，先缩成单物体单容器；毕业项目先验证完整链路。",
        ],
      },
      {
        title: "第 2 步：写安全与证据契约，先完成 NO-GO 表",
        goal: "在产生动作前定义哪些事件必须停止，以及哪些说法需要什么证据。",
        actions: [
          "新建 spec/safety_spec.md，复制模板；REHEARSAL 的限制用于软件验证，不代表真机安全。",
          "把 simulator reset、工作空间、最大 delta、TTL、watchdog 与人工接管分别写一行。",
          "新建 reports/claims.md，提前放四类标题：已确认事实、合理推测、个人观点、暂无法验证。",
          "真机门禁全部默认 NO；只有实际独立测试记录存在时才可改 YES。",
        ],
        code: String.raw`# safety_spec.md

track: REHEARSAL
- workspace: simulator-defined; exact bounds = UNKNOWN
- max_action_delta: use executor configuration; revision required
- chunk_TTL: UNKNOWN until end-to-end latency is measured
- watchdog: required before any real-device connection
- collision/force limits: simulator or independent low-level layer
- operator_takeover: required for REAL
- hardware_E_stop_tested: NO
- dry_run_passed: NO
- real_device_decision: NO-GO

# 证据升级规则
- 计划/期望输出 != 已运行结果
- 官方报告 != 本项目复现
- Toy PASS != ACT/VLA rollout
- 仿真成功 != 真机安全`,
        expected: [
          "REAL 门禁保持 NO-GO。",
          "TTL 等动态阈值保持 UNKNOWN，而不是复制 Toy 数字。",
          "claims.md 有四类空白区域，供后续逐步填证据。",
        ],
        checkpoint: "你能说出让 real_device_decision 从 NO-GO 变化所需的独立证据，而不是模型置信度。",
        troubleshooting: [
          "若项目没有低层安全层，把真机路线删掉/冻结，不让 VLA 直接发硬件命令。",
          "若团队用 controlled stop 指 E-stop，立即改名并标明两者触发链路。",
        ],
      },
      {
        title: "第 3 步：生成项目第一版数据，并让它先通过审计",
        goal: "用确定性 demo 完成 convert→manifest→audit 的第一次闭环。",
        actions: [
          "运行 --write-demo，把 6 个 episode/30 帧写入 capstone/data。",
          "把输出保存到 logs/data-audit-v1.txt，并把 records、episodes、split、state/action dim 抄到 reports/dataset-card.md。",
          "打开 JSONL 第一行，给 task_spec 中 observation/action 字段建立映射。",
          "把 track 明确写 REHEARSAL；路径里的 jpg 并不存在真实图像内容，因此 image-content 写 NOT VERIFIED。",
        ],
        code: String.raw`python public/labs/audit_robot_dataset.py --write-demo work/capstone/data/manifest-v1.jsonl 2>&1 | Tee-Object work/capstone/logs/data-audit-v1.txt
Get-Content work/capstone/data/manifest-v1.jsonl -TotalCount 1

# dataset-card.md 最少填写：
# track, manifest revision, records, episodes, split episodes,
# camera keys, state_dim, action_dim, action contract, image-content boundary`,
        expected: [
          "WROTE manifest-v1.jsonl，records=30、episodes=6、split=4/1/1。",
          "state_dim=4、action_dim=3，最后 AUDIT PASS。",
          "dataset card 明确这与 task_spec 的 8D/H×7 真实目标尚不一致，因此只能做审计彩排。",
        ],
        checkpoint: "你能指出 Toy manifest 与目标 task_spec 的至少三个差异，并知道这些差异必须在真实转换器中解决。",
        troubleshooting: [
          "若想直接把 3D Toy action padding 成 7D，停下；必须定义每一维物理语义和 valid/fixed 规则。",
          "若审计 PASS 就写图像已验证，回看脚本只检查路径和时间字段，不读取 jpg。",
        ],
      },
      {
        title: "第 4 步：破坏数据、记录门禁，再做 episode replay 表",
        goal: "证明项目会拒绝 split 泄漏和 NaN，并把机器审计与语义 replay 分开。",
        actions: [
          "分别运行 split 与 NaN 注入，把两个 FAIL 日志保存到 logs。",
          "新建 reports/data-gates.csv，写 expected=FAIL、actual exit code 和第一条 error。",
          "新建 reports/replay.csv，为 6 个 demo episode 各建一行；机器可确认帧/时间/语言，图像和动作物理语义保持 NOT_VERIFIED。",
          "真实数据到来后，替换 manifest 并覆盖成功、失败、接管、恢复、最长和缺帧 episode；任何 REJECT 都回转换器修复。",
        ],
        code: String.raw`python public/labs/audit_robot_dataset.py --demo --inject-error split 2>&1 | Tee-Object work/capstone/logs/audit-split-fail.txt
python public/labs/audit_robot_dataset.py --demo --inject-error nan 2>&1 | Tee-Object work/capstone/logs/audit-nan-fail.txt

# data-gates.csv
gate,expected,actual,first_error,decision
valid_demo,PASS,PASS,,PROCEED_REHEARSAL
split_injection,FAIL,FAIL,episode crosses splits,BLOCK_TRAINING
nan_injection,FAIL,FAIL,non-finite action,BLOCK_TRAINING`,
        expected: [
          "两个注入命令都输出 AUDIT FAIL。",
          "数据门禁明确 BLOCK_TRAINING，而不是 warning 后继续。",
          "replay 中未读取的图像内容保持 NOT_VERIFIED。",
        ],
        checkpoint: "你能解释 audit、replay 和小样本过拟合三道门分别阻止哪类错误。",
        troubleshooting: [
          "若注入 FAIL 被 CI/PowerShell 当成任务失败，单独执行并记录 exit code；这里非零是预期测试。",
          "若真实 replay 发现 action 晚一帧，不在 CSV 中手改结论；回源转换器修 alignment 后生成新 revision。",
        ],
      },
      {
        title: "第 5 步：用 BC 脚本彩排 baseline 的四道训练门",
        goal: "在接 ACT 前亲眼看到监督拟合、condition 消融、checkpoint 重载和闭环分布偏移。",
        actions: [
          "运行 toy_behavior_cloning.py，把输出保存到 logs/bc-rehearsal.txt。",
          "新建 reports/baseline-gates.csv，为 supervised_fit、condition_ablation、reload、closed_loop、multimodal_failure 各写一行。",
          "把 exact 数值填入：MSE 1.1321→0、permuted-language 3.24、reload -0.575/-0.575、closed-loop 0/6→6/6。",
          "将 model 列写 Toy linear BC；禁止写 ACT。真实 ACT 必须重新经历相同门禁并生成独立日志。",
          "为多峰行写结论：MSE optimum=0 位于两个有效动作 -1/+1 中间，所以需要重新考虑分布表达/条件信息。",
        ],
        code: String.raw`python public/labs/toy_behavior_cloning.py 2>&1 | Tee-Object work/capstone/logs/bc-rehearsal.txt

# baseline-gates.csv 表头
track,model,gate,input_scope,metric_before,metric_after,result,what_it_proves,what_it_does_not_prove`,
        expected: [
          "四段 PASS 与最后 ALL CHECKS PASSED。",
          "每个数值都出现在独立日志，不由手工想象。",
          "what_it_does_not_prove 包含 held-out、真实 ACT/VLA 和真机。",
        ],
        checkpoint: "真实 ACT 训练时，你知道要依次收集哪四类门禁证据，而不是直接等最终 rollout。",
        troubleshooting: [
          "真实 ACT 不能过拟合 1 batch：查 mask、时间对齐、action scale/head、optimizer；不要先扩数据。",
          "reload 不一致：检查 eval mode、增广 RNG、norm metadata、head 与 adapter 是否都进 checkpoint。",
        ],
      },
      {
        title: "第 6 步：锁定真实实现，并把官方流水线逐参数抄入运行卡",
        goal: "从“我要跑 SmolVLA/openpi”变成 revision、硬件、命令、参数和门禁都可追踪的一条路径。",
        actions: [
          "新建 spec/model-run-card.md，只选一个 VLA 实现；从 vla-families 的 primary 结论复制 official source 与固定 revision。",
          "若选 LeRobot 路线，按该 revision 官方文档逐项抄 record→replay→train→eval 命令，并在下一行解释 repo/dataset/policy/device/batch/steps/eval 参数。",
          "若选 openpi 路线，按固定 revision 逐项抄 convert→config→norm→train→serve；先核官方环境/GPU/磁盘，再运行 random inference，最后才 train。",
          "每条命令预先写 expected artifact 与 pass condition。只复制命令未运行时 status=PLANNED；有实际 exit code/log 才可改 RUN。",
          "如果没有满足硬件或环境，blocked_at 写在第一条不能执行的命令；保留 CPU 彩排为已完成，不伪造真实模型日志。",
        ],
        code: String.raw`# model-run-card.md
track: REAL-SIM
checked_at: 2026-08-08
implementation:
official_source:
code_revision:
base_checkpoint_revision:
dataset_revision:
norm_revision:
hardware_os_cuda:
resource_check: UNKNOWN

| stage | exact command copied from fixed revision | parameter-by-parameter meaning | expected artifact/output | pass condition | status/log |
|---|---|---|---|---|---|
| convert_or_record |  |  | versioned dataset | audit+replay pass | PLANNED |
| config |  |  | input/action adapter config | shapes/revisions explicit | PLANNED |
| norm |  |  | train-only norm stats | round-trip+revision | PLANNED |
| smoke |  |  | finite Hxd_a | shape/finite/reload | PLANNED |
| train |  |  | checkpoint/adapter | small-set gate first | PLANNED |
| serve |  |  | versioned policy endpoint | fault tests pass | PLANNED |
| eval |  |  | per-rollout ledger | N+termination+latency | PLANNED |

blocked_at:
result_status: 暂无法验证`,
        expected: [
          "卡片绑定 official source、code revision、checkpoint/data/norm revision。",
          "每条命令有逐参数解释、产物和 pass condition，而不只是复制一串 CLI。",
          "未实际运行的 stage 保持 PLANNED/暂无法验证。",
        ],
        checkpoint: "别人拿到 model-run-card 能知道下一条确切命令、每个参数为何存在、成功后文件在哪里、失败停在哪。",
        troubleshooting: [
          "官方文档与 CLI --help 不一致：以固定 revision 的代码/--help 为准，并在卡片记录文档差异。",
          "openpi random inference OOM：停止 train，先核精度、预分配、模型/config 和该 revision 资源边界。",
          "LeRobot record/replay 字段不匹配：补显式 mapping，不把课程 JSONL 冒充原生 LeRobot schema。",
          "action shape finite 但方向异常：停在 smoke，查 norm、frame、unit、rotation/gripper 和 adapter。",
        ],
      },
      {
        title: "第 7 步：冻结唯一 PolicyRequest/Response，并运行断连故障彩排",
        goal: "让 ACT、VLA 和 baseline 在相同物理动作接口与安全客户端后比较。",
        actions: [
          "新建 spec/policy-interface.json，复制 Request/Response 示例；模型特有 resize/tokenizer/norm 放 adapter 内，不暴露给 evaluator。",
          "为 ACT/VLA 都要求相同 images/state/language/request_id/observation_time 输入和 H×7 physical action 输出。",
          "运行 policy_service_fault_injection.py，把输出保存到 capstone logs。",
          "把 schema、stale、prefix expiry、clip、TTL、watchdog 六项结果填入 reports/deployment-gates.csv。",
          "说明 2D Toy client PASS 只是接口彩排；真实 H×7 client 仍需独立实现和测试。",
        ],
        code: String.raw`{
  "PolicyRequest": {
    "schema_version": "v1",
    "request_id": 101,
    "observation_time": "monotonic-or-specified-clock",
    "images": {"front": "tensor-ref", "wrist": "tensor-ref"},
    "state": "float[8]",
    "language": "put the red block in the left tray"
  },
  "PolicyResponse": {
    "schema_version": "v1",
    "request_id": 101,
    "model_revision": "REQUIRED",
    "normalization_revision": "REQUIRED",
    "action_contract_revision": "REQUIRED",
    "action_dt_ms": 50,
    "action_chunk": "float[H,7]"
  }
}

# 接着运行：
python public/labs/policy_service_fault_injection.py 2>&1 | Tee-Object work/capstone/logs/deployment-rehearsal.txt`,
        expected: [
          "接口中 request_id 与 observation_time 从请求贯穿响应。",
          "模型/norm/action revision 是必需字段。",
          "故障彩排输出 reserve=6、skip=2、PASS 与 BOUNDARY。",
        ],
        checkpoint: "ACT 和 VLA 交换实现后，evaluator/safety client 不应需要改变成功规则或物理动作语义。",
        troubleshooting: [
          "若 ACT/VLA 输出 horizon 不同，adapter 可形成统一执行 horizon，但必须记录裁剪/重采样，且比较保持一致。",
          "若某模型绕过安全 client 直接控制环境，比较无效；所有 policy 必须经过同一接口。",
        ],
      },
      {
        title: "第 8 步：先用 12 条示范 rollout 学会报告 N 与 Wilson 区间",
        goal: "不再只写“成功率 58%”，而是保留逐次记录、样本数和小样本不确定性。",
        actions: [
          "新建 data/worked-rollouts.csv，复制 12 个 0/1 结果；明确它是统计练习，不是真实模型。",
          "新建 summarize_rollouts.py 并运行；核对 7/12=0.583，95% Wilson 区间约 [0.320,0.807]。",
          "把区间很宽的原因写入 reports/evaluation-notes.md：N=12 很小，不应宣称模型稳定胜出。",
          "真实 eval 时每行还要存 policy/checkpoint、seed、task/scene、paraphrase、latency、filters、termination_reason 与日志路径。",
        ],
        code: String.raw`# work/capstone/data/worked-rollouts.csv
success
1
0
1
1
0
1
0
1
1
0
1
0

# work/capstone/summarize_rollouts.py
import csv, math
rows = list(csv.DictReader(open("work/capstone/data/worked-rollouts.csv", encoding="utf-8")))
n = len(rows); k = sum(int(r["success"]) for r in rows); p = k / n; z = 1.96
den = 1 + z*z/n
center = (p + z*z/(2*n)) / den
half = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / den
print(f"success={k}/{n}={p:.3f}; Wilson95=[{center-half:.3f},{center+half:.3f}]")

# 运行：python work/capstone/summarize_rollouts.py`,
        expected: [
          "输出 success=7/12=0.583; Wilson95=[0.320,0.807]。",
          "worked-rollouts 被标为 REHEARSAL/statistics example。",
          "真实 ledger 的每次失败都保留，不挑最好 seed。",
        ],
        checkpoint: "你能解释 7/12 与 70/120 即使点估计接近，结论置信程度也不同。",
        troubleshooting: [
          "若得到 6/12，检查 CSV 是否完整复制了 7 个 1。",
          "若 Excel 保存成带 BOM/其他列，Python utf-8 一般可读；报表头错误时检查第一行严格为 success。",
          "跨任务/场景时不要只汇总一个区间；先分层报告 N，再决定是否汇总。",
        ],
      },
      {
        title: "第 9 步：设计三项一次只改一个变量的消融，并建失败树",
        goal: "让最终报告回答“为什么”，而不是只列两个总成功率。",
        actions: [
          "新建 reports/ablations.csv，先填三项：language permutation、remove wrist camera、change execution horizon；每项只改一列，其余引用 frozen protocol revision。",
          "language 项以 BC Toy 的 permuted MSE 3.24 作为 REHEARSAL 示例；真实 rollout 结果保持 UNKNOWN。",
          "新建 reports/failure-tree.md，从观察到的现象开始：目标识别错、动作方向错、开环对但闭环漂移、执行器错误、evaluator/reset 错。",
          "每个叶节点绑定一个最小实验，例如固定同一观测比 raw/denorm action、用专家动作替换 policy、移除一个 camera。",
          "规定一次实验只允许一个 changed_variable；若同时改数据和模型，标 INVALID_COMPARISON。",
        ],
        code: String.raw`ablation_id,track,base_protocol,changed_variable,control,treatment,shared_seeds,expected_question,result,status
lang_perm,REHEARSAL,bc-toy-v1,language pairing,correct,permuted,same,"policy uses language?",MSE 0 vs 3.24,TOY_VERIFIED
remove_wrist,REAL-SIM,eval-v1,wrist camera,present,masked,same,"does wrist view add task evidence?",UNKNOWN,PLANNED
exec_horizon,REAL-SIM,eval-v1,execution horizon,4,8,same,"latency vs drift tradeoff?",UNKNOWN,PLANNED

# failure-tree 最小叶节点例：
动作方向错 -> 固定同一 observation -> 比较 raw head -> denorm -> frame transform -> safety-filtered action
专家动作也失败 -> policy 暂时无罪 -> 检查 executor / dt / frame / reset
开环正确闭环漂移 -> 检查 latency / covariate shift / recovery data`,
        expected: [
          "三项消融每行只有一个 changed_variable。",
          "Toy language 结果与真实 camera/horizon 计划没有混在同一证据级别。",
          "至少三个失败叶节点各绑定一个可执行最小实验。",
        ],
        checkpoint: "看到 VLA 0% 时，你能沿失败树先区分 observation、adapter、policy、executor 和 evaluator，而不是直接换大模型。",
        troubleshooting: [
          "消融训练预算不同：先固定 steps/samples/seed 或明确成本差异，不能只比最好 checkpoint。",
          "语言替换产生不可能任务：使用同场景有效但不同目标/改写，区分条件敏感性与输入无效。",
          "专家 replay 也失败：冻结模型调参，优先修执行器与评测。",
        ],
      },
      {
        title: "第 10 步：从空目录复跑彩排，再做 REAL 与真机 go/no-go",
        goal: "把零散日志变成另一人可复现、负结果也能审查的最终交付。",
        actions: [
          "新建 reports/final-report.md，按背景→协议→数据→baseline→VLA→rollout→消融→失败→边界顺序写；没有真实 VLA 时该节写 NOT RUN。",
          "新建 reports/reproduce.md，依次列 Python 版本、四条本地命令、预期关键行和产物路径。",
          "在不删除现有成果的前提下，另建一个干净临时目录或让另一人从仓库重新运行 audit、BC、policy faults、Wilson summary；记录实际差异。",
          "检查每个数字能回到原始日志/ledger，每个动态模型信息能回到 official source+revision+date。",
          "REAL-SIM 只有在真实 dataset/model card、同协议 rollout 与失败日志存在时才可 GO；REAL-ROBOT 还需独立安全门禁和实际 dry-run，任一缺失保持 NO-GO。",
        ],
        code: String.raw`# 最小复现命令（REHEARSAL）
python public/labs/audit_robot_dataset.py --input work/capstone/data/manifest-v1.jsonl
python public/labs/toy_behavior_cloning.py
python public/labs/policy_service_fault_injection.py
python work/capstone/summarize_rollouts.py

# final-report 每个结论后附：
# evidence = 文件路径/URL；revision；run_at；track=REHEARSAL 或 REAL

REAL_SIM_DECISION: NO-GO until actual dataset + model + rollout logs exist
REAL_ROBOT_DECISION: NO-GO until independent safety review + dry-run evidence exist`,
        expected: [
          "四条彩排命令可由另一人运行并看到各自 PASS/统计输出。",
          "最终报告不会把 Toy 7/12、0/6→6/6 或 reserve=6 当成真实项目数据。",
          "每个未运行项、失败项和 UNKNOWN 被保留。",
          "真机默认 NO-GO，只有独立安全证据才能改变。",
        ],
        checkpoint: "别人能从报告任意一个数字追到原始日志，并能说出它属于 Toy、仿真还是实际机器人。",
        troubleshooting: [
          "干净环境失败：记录首个失败、Python/OS/revision，不在原环境手工拷缓存伪装复现。",
          "报告只能展示最好视频：回 rollout ledger 补全部 episode、N、终止原因和失败样本。",
          "REAL VLA 结果为 0%：只要协议公平、对照完整、失败可定位，这仍可作为合格负结果。",
          "出现真机 near-miss/接管：立即停止、冻结日志、完成事件复盘；不为了补 N 继续运行。",
        ],
      },
    ],
    finalArtifact: [
      "work/capstone/spec/task_spec.yaml、safety_spec.md、policy-interface.json 与 model-run-card.md：任务、安全、接口和固定 revision 运行规格。",
      "data/manifest-v1.jsonl、dataset-card.md、data-gates.csv 与 replay.csv：已审计的 Toy 彩排和真实数据迁移位置。",
      "logs/bc-rehearsal.txt、deployment-rehearsal.txt 与 baseline/deployment gate 表：训练与服务门禁的确切输出。",
      "worked-rollouts.csv、summarize_rollouts.py 与 evaluation-notes.md：7/12 统计练习及 Wilson 区间解释。",
      "ablations.csv、failure-tree.md、claims.md：单变量实验、可执行失败定位和四类证据边界。",
      "final-report.md 与 reproduce.md：能从空环境复跑且保留负结果/未完成项的交付。",
    ],
    verifiedBoundary:
      "毕业项目带练在本地实际可验证的是课程 JSONL 审计、split/NaN 拒绝、线性 BC/DAgger/多峰 Toy、2D policy client 故障和示范 Wilson 计算。这些产物是 REHEARSAL，不是 ACT、SmolVLA、OpenVLA/OFT、openpi、LIBERO 或真机实验。真实路径必须绑定具体官方 revision、数据与硬件并产生个人日志；真机安全与性能在独立门禁完成前均暂无法验证。",
    knowledgeCheck: [
      {
        question: "为什么毕业项目最低交付不是“ACT 和 VLA 都成功”？",
        answer: "研究交付的核心是任务/数据/接口/评测公平且可复现。VLA 0% 仍可成为有价值负结果，只要 baseline、专家动作/执行器对照、逐次日志和失败定位完整；伪造成功或缺失对照才是不合格。",
      },
      {
        question: "REHEARSAL 与 REAL 两条轨道为什么必须分开？",
        answer: "Toy 数值用于验证机制和工程流程，输入、动作、环境与模型都不等同真实任务。分轨能保留已完成学习成果，同时阻止把 Toy PASS 外推为真实 VLA/真机结论。",
      },
      {
        question: "ACT 与 VLA 公平比较至少要冻结什么？",
        answer: "相机/状态/语言输入、物理 action contract、normalization、adapter 输出、执行器、安全过滤、seed/初始化、最大步数、成功/终止规则与评测预算；模型特有预处理需版本化。",
      },
      {
        question: "为什么成功率必须同时给 N 与区间？",
        answer: "点估计不表达小样本不确定性；7/12 的 58.3% Wilson 95% 区间约 32.0%–80.7%，说明证据仍很宽。还应按任务/场景/扰动分层，避免混合非独立轨迹。",
      },
      {
        question: "什么时候允许从仿真进入真机灰度？",
        answer: "只有独立急停/接管、低层限速限力/工作空间/碰撞门禁、frame/unit/标定、TTL/watchdog、空载 dry-run 和批准的风险流程都有实际证据时；模型置信度、仿真成功或精选视频都不能替代这些门禁。",
      },
    ],
  },
} satisfies Record<string, LessonWalkthrough>;
