import type { LessonWalkthrough } from "../lessonWalkthroughTypes";

export const foundationWalkthroughs = {
  "control-to-vla": {
    intro:
      "用一个桌面抓杯任务，从经典反馈控制逐层搭出 VLA 所在的完整系统。先分清真实状态、可用观测和动作契约，再手算动作块的时间预算，随后逐段阅读并破坏本地执行器。最终产物是一份可交给另一位工程师实现的闭环接口说明。",
    beforeYouStart: [
      "在项目根目录打开终端；后续命令都从包含 package.json 与 public 文件夹的目录运行。",
      "准备一个文本编辑器。先执行 New-Item -ItemType Directory -Force learning-notes，再新建 learning-notes/control-to-vla.md。",
      "确认 python --version 能运行；本章脚本只用 Python 标准库，不需要 GPU 或机器人。",
      "约定练习任务：固定桌面上的机械臂，根据‘拿起红杯’指令抓取红杯。先不要替换成自己的任务，以免同时引入太多未知量。",
      "安全提醒：本章的 controlled stop 只是数字仿真里的 hold，不是任何真实机械臂的安全停机方案。不要把脚本输出直接发送给真机。",
    ],
    steps: [
      {
        title: "第 1 步：把控制律里的每个符号落到抓杯任务",
        goal:
          "先理解经典反馈控制到底假设自己拿到了什么。这样后面引入图像、语言和历史时，你能指出新增信息解决了哪个缺口，而不是把 VLA 当成一个神秘的端到端黑箱。",
        actions: [
          "打开 learning-notes/control-to-vla.md，抄下下面的四列表格。",
          "在‘抓杯实例’一列填入：x_t=末端位姿与速度，x*=抓取预备位姿，u_t=关节位置或速度参考。不要把 RGB 图像直接写成 x_t；经典状态反馈公式假设 x_t 已是控制器所需状态。",
          "在‘能否直接测得’一列逐项写是/否：编码器关节角通常可测；杯子被遮挡后的真实 6D 位姿、接触状态通常不能由单帧 RGB 直接得到。这里的‘通常’是工程概括，不是对所有传感器配置的事实断言。",
          "在表格下用一句话补全：如果控制器只看到相机和编码器，它拿到的是 observation o_t，而不是完整环境 state s_t。",
        ],
        code: String.raw`| 符号 | 一般含义 | 抓杯实例 | 能否直接测得 |
|---|---|---|---|
| x_t | 控制器使用的状态 | 末端位姿与速度 | 部分可测 |
| x* | 目标状态 | ______ | ______ |
| e_t=x*-x_t | 跟踪误差 | ______ | 由前两者计算 |
| u_t=K e_t | 控制命令 | ______ | 计算得到 |

我的第一句结论：________________________________。`,
        expected: [
          "你会发现‘杯子在哪里、抓住没有、指令指哪个杯子’并不天然包含在关节状态 x_t 中。",
          "你应能说出：反馈控制负责把已定义的参考变成稳定执行；感知/策略负责根据不完整观测决定参考或短时动作候选。两者可以组合，并非二选一。",
          "【已确认】state 与 observation 在 POMDP 中是不同对象；【个人观点】用抓杯例子作为第一章入口是本教程的教学选择。",
        ],
        checkpoint:
          "合上网页，用不超过三句话回答：为什么 u_t=K(x*-x_t) 不能单独理解‘拿起红杯’？你的回答必须分别提到语言目标、物体状态和低层执行。",
        troubleshooting: [
          "如果你把 x_t 写成‘所有传感器原始值’，先问控制律如何直接对百万像素做减法；应先有状态估计或策略编码。",
          "如果你觉得 RGB 就是完整状态，列出遮挡后杯子背面的位姿、接触力和速度方向；看不见的变量正是部分可观测性的来源。",
          "如果不清楚 command 是位置还是速度，先留空并标 unknown；动作类型不明确时不能继续讨论单位和限幅。",
        ],
      },
      {
        title: "第 2 步：亲手拆出 s、o、h、语言与动作",
        goal:
          "VLA 常在 POMDP 下工作。你要通过一次遮挡场景练习，判断哪些信息来自当前观测、哪些必须从历史推断，以及语言究竟提供任务目标还是物理状态。",
        actions: [
          "继续在笔记中建立下面的‘时刻 t 信息清单’，先完整照抄示范行，再填另外五行。",
          "设想夹爪在杯子前方遮住了相机：分别填杯子真实位姿、当前 RGB、关节角 q_t、上一帧 RGB、指令‘拿起红杯’、下一步末端增量。",
          "对每行只允许选择一个主要类别：隐藏状态 s_t、当前观测 o_t、历史 h_t、任务条件 ℓ、动作 a_t。若一个量同时与多类有关，在备注解释，不要重复塞进所有格。",
          "最后先写完整动作—观测历史 h_t=(o_0,a_0,o_1,a_1,...,a_{t-1},o_t)，再写模型实际使用的有限窗口近似 h̃_t^(K)=(o_{t-K+1:t},a_{t-K+1:t-1})。若实现只输入 K 帧图像，它只是 observation-window 近似，不等于完整 POMDP history。",
          "在 K=4、相机 20 Hz 下分别计算：4 个观测槽的窗口长度按 K/f 记为 0.20 s，而最早与最晚两帧时间戳之差按 (K-1)/f 为 0.15 s；工程协议必须声明采用哪一种口径，并用真实 timestamp 对齐动作。",
        ],
        code: String.raw`| 信息 | 主要类别 | 决策时是否可用 | 为什么 |
|---|---|---|---|
| 杯子被遮挡后的真实 6D 位姿 | s_t | 否 | 环境存在，但当前传感器未完整观测 |
| 当前 RGB | ______ | ______ | ______ |
| 关节角 q_t | ______ | ______ | ______ |
| 上一帧 RGB | ______ | ______ | ______ |
| “拿起红杯” | ______ | ______ | ______ |
| 下一步末端增量 | ______ | ______ | ______ |

h_t = (o_0,a_0,o_1,a_1,...,a_{t-1},o_t)
h̃_t^(K) = ______________________________
4 帧、20 Hz：窗口长度 K/f = ______ s；首尾 timestamp 跨度 (K-1)/f = ______ s`,
        expected: [
          "当前 RGB 与关节角属于 o_t；上一帧观测和已执行动作共同进入 h_t；语言属于任务条件 ℓ；待生成的末端增量属于 a_t。",
          "完整 POMDP history 包含过去动作与观测；K 帧输入只是在固定窗口内近似这段历史。4 个 20 Hz 观测槽对应 0.20 s，四个采样点的首尾 timestamp 跨度是 0.15 s。",
          "语言告诉策略‘做什么’，但不会自动补齐杯子被遮挡后的位姿或接触力。",
          "【合理推测】增加合适历史可能帮助判断运动与遮挡；它是否改善某个真实任务，需要数据和 rollout 验证。",
        ],
        checkpoint:
          "写下一个仅靠单帧会产生歧义、但结合上一动作与下一观测可能消歧的例子；再写一个即使增加 RGB observation window 也未必能消歧、可能需要力觉或深度的例子。",
        troubleshooting: [
          "若把语言写成 state，检查它是否描述了环境的完整物理配置；多数任务指令只提供目标条件。",
          "若把 history 只写成图像帧，补上这些帧之间已执行的动作；否则相同观测变化可能对应不同控制输入。",
          "若认为窗口越长越好，补算 K 增加后的 token、显存和时间覆盖；history window 也会带来延迟与时间对齐问题。",
          "若把 0.20 s 与 0.15 s 当成矛盾，检查端点定义：前者是 4 个采样槽，后者是 4 个采样点的首尾差；协议必须选择并记录。",
        ],
      },
      {
        title: "第 3 步：画出五层闭环，并为每层写输入输出",
        goal:
          "把 VLA 放回机器人系统，而不是让它吞掉整个控制栈。只有责任边界明确，后续出现动作方向错误、超时或碰撞风险时，才知道应该查模型、适配器还是低层控制。",
        actions: [
          "在笔记中照抄五层表格；使用第 1、2 步的抓杯信息逐格填写。",
          "VLA 层输出先固定为 H×7 的末端增量候选：3 维平移、3 维旋转表示、1 维夹爪命令。把‘7D’标为本练习约定，不要写成所有 VLA 的统一事实。",
          "动作适配/安全层至少写入反归一化、base/tool frame 变换、有限值检查、限幅、TTL 和工作空间检查。",
          "低层控制层写入轨迹插值、IK/OSC 或关节伺服中的一种；机器人层写执行器、编码器和相机产生下一次观测。",
          "沿箭头口述一圈：指令→条件策略→候选动作→验证和变换→高频跟踪→新观测→再次查询策略。",
        ],
        code: String.raw`| 层 | 输入 | 输出 | 这一层必须保证什么 | 不应假装保证什么 |
|---|---|---|---|---|
| 任务/语言 | 用户目标 | 指令 ℓ | 目标表达 | 物理可达性 |
| VLA 策略 | I,q,ℓ,history | H×7 候选动作 | 条件生成协议 | 功能安全 |
| 动作适配/安全 | 原始动作+metadata | 合法参考 | frame/unit/finite/TTL/限幅 | 语义任务成功 |
| 轨迹与低层控制 | 合法参考+反馈 | 高频命令 | 跟踪与稳定化 | 看懂语言 |
| 机器人与传感器 | 电机命令+环境 | 新观测 | 真实执行/采样 | 模型泛化 |`,
        expected: [
          "每层都有可检查的输入输出，而不是一条‘VLA→机器人’箭头。",
          "VLA 输出被称为候选命令，因为下游仍须验证协议和约束；模型置信度不是安全许可。",
          "你能指出坐标系反了属于接口/适配问题，跟踪震荡可能属于低层控制问题，选错杯子可能属于条件策略或感知问题。",
        ],
        checkpoint:
          "在表格下面写三条故障，并分别指定唯一的第一排查层：动作含 NaN、base-frame delta 被当成 tool-frame delta、关节伺服振荡。说明为什么。",
        troubleshooting: [
          "如果所有职责都写在 VLA 层，强制把‘语义决策’和‘实时约束’分开，再逐项移动。",
          "如果不知道旋转的 3 维表示是什么，明确写‘暂未定义’；欧拉角、轴角和旋转向量不能靠 shape 自动区分。",
          "如果低层控制器类型未知，不要编造；写 interface required，并列出需要向机器人平台确认的命令类型与频率。",
        ],
      },
      {
        title: "第 4 步：手算 H、E、动作频率与延迟储备",
        goal:
          "把‘低频模型控制高频机器人’变成带单位的时间预算。你要知道动作块覆盖多长、多久重新观测一次，以及推理尾延迟需要多少尚未执行的动作作为缓冲。",
        actions: [
          "在笔记抄下给定值：动作周期 Δt=0.05 s、预测长度 H=16、每次执行 E=4、伺服频率 1000 Hz。",
          "逐行计算：f_action=1/Δt；T_chunk=HΔt；T_refresh=EΔt；f_policy=1/T_refresh；每个动作参考对应的伺服 tick 数=f_servoΔt。再画时间轴：20 Hz action reference 每 50 ms 更新一次，理想 5 Hz policy 每 200 ms 取得新观测并发起下一次查询，1 kHz servo 在每个 action reference 内执行 50 个反馈 tick。",
          "再抄下示例尾延迟：推理 p99=0.14 s、网络 p99=0.03 s、工程余量=0.03 s。先相加得到 0.20 s，再算 reserve=ceil(0.20/0.05)=4 个动作。",
          "在 t_0 收到一个 H=16 的 chunk 后执行前 E=4 项，并在 t_0+0.20 s 用新观测发起查询；等待期间旧 chunk 还剩 H-E=12 个动作槽。写出可行性门禁 H-E≥R，本例 12≥4。若不满足，chunk 在估计响应到达前就会耗尽。",
          "在结果旁标注：分项 p99 相加只是启发式，不是端到端 p99 的统计恒等式。若各阶段尾部不同时发生或存在流水线重叠，它可能高估；若漏掉排队、序列化、调度抖动、时钟误差或共享资源竞争，它也可能低估。真实部署必须测同一请求边界的端到端分布。",
        ],
        code: String.raw`Δt = 0.05 s
H = 16
E = 4
f_servo = 1000 Hz

f_action = 1/Δt = ______ Hz
T_chunk = H×Δt = ______ s
T_refresh = E×Δt = ______ s
f_policy(理想) = 1/T_refresh = ______ Hz
servo ticks/action = f_servo×Δt = ______

时间轴：
- action reference: t_0, t_0+0.05, t_0+0.10, ...（20 Hz）
- next observation/query: t_0+EΔt = ______ s（理想 5 Hz）
- servo ticks in each action slot: ______（1 kHz）

reserve R = ceil((0.14+0.03+0.03)/0.05) = ______ actions
remaining suffix = H-E = ______ actions
feasibility gate: H-E >= R ? ______`,
        expected: [
          "答案依次为 20 Hz、0.8 s、0.2 s、5 Hz、50 ticks/action、R=4、H-E=12，且 12≥4。",
          "H 决定预测覆盖，E 决定理想重查询时刻；在 t_0+EΔt 发起新查询后，旧 chunk 的 H-E 后缀为响应延迟提供动作储备。预测 16 步不等于必须开环执行 16 步。",
          "若新 chunk 在队列耗尽前没有到达，执行层必须进入预先定义的 fallback，而不能重放旧动作。",
        ],
        checkpoint:
          "不看公式，重新计算 H=10、E=2、Δt=0.1 s 时的覆盖时间、理想查询频率和 H-E；若端到端延迟预算为 0.9 s，再算 R 并判断 H-E≥R 是否成立。",
        troubleshooting: [
          "若得到 0.05 Hz，检查频率与周期是否取了倒数。",
          "若 reserve 得到 0.04，检查延迟与动作周期是否都以秒为单位，并记得向上取整。",
          "若只比较 H 与 R，补上已经执行的 E 项；真正可用于等待下一响应的是 H-E。",
          "若把 p99 当平均值，回到定义：p99 是样本分布的高分位尾部指标；还应同时记录样本数和测量边界。",
        ],
      },
      {
        title: "第 5 步：逐段读懂 ActionChunk 与延迟网络",
        goal:
          "运行前先读代码，建立字段—时间—队列的对应关系。这样 PASS 才是一组你理解的断言，而不是终端里的绿色装饰。",
        actions: [
          "打开 public/labs/chunked_controller.py，从 ActionChunk 开始读到 DelayedNetwork.ready 结束。",
          "在笔记抄下 ActionChunk 的四个字段，并逐个解释：request_id 用于关联请求，observation_time 表示生成依据的观测时刻，dt 是动作间隔，targets 是动作序列。",
          "找到 ActionChunk.validate；圈出三个门禁：dt>0、targets 非空、所有 target 都是 finite。写下它尚未检查的内容：shape、frame、unit 和机器人工作空间。",
          "找到 DelayedNetwork.send；把 arrival_time=observation_time+latency 手算一次：观测时刻 0.00 s、网络延迟 0.04 s，应在 0.04 s 才 ready。",
          "阅读 ready 的 while 循环，解释 heap 为什么按 arrival_time 弹出，而不是按 request_id。",
        ],
        code: String.raw`ActionChunk 字段审计
- request_id: __________________
- observation_time: ____________
- dt: __________________________
- targets: _____________________

validate 已检查: ______________________________
validate 未检查: shape / frame / unit / workspace / __________

arrival_time = 0.00 s + 0.04 s = ______ s`,
        expected: [
          "你能预测 network.ready(.03) 返回空列表，network.ready(.04) 返回一个 chunk。",
          "你会发现网络只模拟延迟到达，不模拟丢包、时钟漂移、序列化或真正并发。",
          "【已确认】以上行为可从当前脚本代码直接核对；这并不验证真实网络。",
        ],
        checkpoint:
          "回答：为什么只保留 request_id 而没有 observation_time，仍不足以判断一个晚到结果是否适用于当前物理状态？",
        troubleshooting: [
          "找不到类定义时，在编辑器中搜索 class ActionChunk、class DelayedNetwork，不依赖网页行号，因为行号会随版本改变。",
          "如果把 arrival_time 理解为服务器创建时间，重新看 send：这个 Toy 直接用 observation_time 加注入延迟，真实协议通常还需要更多时间戳。",
          "若不理解 heapq，暂时把它当成‘每次先取最早到达项’；然后用两个不同 latency 的 chunk 在纸上排序。",
        ],
      },
      {
        title: "第 6 步：逐段读懂 SafeExecutor 的接收与执行",
        goal:
          "理解真正决定‘接收、拒绝、限幅、过期保持’的代码路径，并把每一个安全相关判断映射成具体状态变量。",
        actions: [
          "继续打开同一文件，阅读 SafeExecutor.__init__、receive 和 tick。",
          "在 receive 中标记 age=now-observation_time；写下两种拒绝条件：age>ttl，以及 observation_time 不比 latest_observation_time 新。",
          "在 tick 中从 target-self.position 开始手算第一次动作：目标约为 0.125，当前位置 0，max_step=0.08，因此 delta 被裁成 0.08，位置变为 0.08。",
          "继续手算第二、三次 tick，得到 0.16 与 0.24；再检查 now=0.20 时 age=0.20>ttl=0.18，所以 active 清空并保持 0.24。",
          "在笔记注明：hold 是本 Toy 的 controlled stop 定义；重力机械臂、移动底盘、力控任务可能需要完全不同的受控停止。",
        ],
        code: String.raw`第一次 tick
target = 1/8 = 0.125
raw delta = 0.125 - 0 = 0.125
limited delta = min(0.08, 0.125) = ______
new position = ______

过期判断
age at now=0.20 = 0.20 - 0.00 = ______ s
ttl = 0.18 s
age > ttl ? ______
fallback output = ______`,
        expected: [
          "前三次位置是 [0.08, 0.16, 0.24]，不是原始目标 [0.125, 0.25, 0.375]，因为每次都受 max_step 限制。",
          "0.20 s 时输出仍是 0.24，但含义是停止更新并保持，不是继续执行 action chunk。",
          "较旧 observation_time 的结果即使 request_id 看起来合理，也不能覆盖已接受的新结果。",
        ],
        checkpoint:
          "在纸上计算 max_step=0.05 时前三次位置，并说明限幅为什么只能约束单步跳变，不能独立保证碰撞安全。",
        troubleshooting: [
          "如果第二次算成 0.125，注意 target 是 chunk 的第二项 0.25，而限幅基于当前 position=0.08。",
          "如果过期后仍认为应该追到 1.0，区分目标任务与数据有效期；旧计划失效后不能凭旧观测继续开环。",
          "如果觉得 hold 必然安全，请列出移动底盘下坡或力控接触场景作为反例。",
        ],
      },
      {
        title: "第 7 步：运行基线，再主动制造两个故障",
        goal:
          "先验证你对输出的预测，再通过只改一个变量的方式观察 TTL 与限幅怎样改变行为。故意失败是为了学习断言保护了什么。",
        actions: [
          "在项目根目录运行 python public/labs/chunked_controller.py，把完整输出粘到笔记。",
          "逐行对照第 4、6 步的手算：p99、reserve、limited states、hold、stale reject 与最终 PASS 都必须能解释。",
          "执行 Copy-Item public/labs/chunked_controller.py learning-notes/chunked_controller_work.py，之后只改工作副本。",
          "故障 A：把 SafeExecutor(ttl=.18, max_step=.08) 中的 .08 改成 .20，运行 python learning-notes/chunked_controller_work.py。预期 states 断言失败，因为脚本不再得到 [0.08,0.16,0.24]。记录 traceback 指向的断言。",
          "重新复制原脚本覆盖工作副本。故障 B：把 ttl=.18 改成 ttl=.30 再运行。预期 held==.24 断言失败，因为 .20 s 时 chunk 尚未过期，会继续向目标移动。",
          "再次从原脚本恢复工作副本，并确认 ALL CHECKS PASSED。不要为了让测试变绿而删除断言。",
        ],
        code: String.raw`python public/labs/chunked_controller.py
Copy-Item public/labs/chunked_controller.py learning-notes/chunked_controller_work.py
python learning-notes/chunked_controller_work.py`,
        expected: [
          "默认输出包含 latency p99=220 ms、reserve=5、limited states [0.08, 0.16, 0.24] 和 controlled-stop hold 0.24。",
          "改 max_step 后，失败说明预期状态轨迹与限幅参数绑定；改 ttl 后，失败说明过期时刻与 TTL 绑定。",
          "【本地 Toy 已验证】默认脚本断言通过；【暂无法验证】这些阈值对你的真机是否合适。",
        ],
        checkpoint:
          "写一份两行故障记录：改动→最先失败的断言→机制解释→如何恢复。若你只写‘程序报错’，本步尚未通过。",
        troubleshooting: [
          "若 python 找不到文件，先运行 Get-Location 与 Get-ChildItem public/labs，确认终端位于项目根目录。",
          "若改动默认脚本而不是副本，用 Git diff 检查并手动恢复你改的两处；不要重置其他人的工作。",
          "若修改后仍 PASS，确认运行的是 learning-notes 下的副本，并搜索实际参数是否还有另一处调用。",
        ],
      },
      {
        title: "第 8 步：写出一份最小 action contract 并完成闭环验收",
        goal:
          "把前七步整理成可实施的接口，而不是停在概念图。action contract 是模型、适配器和控制器共同遵守的协议。",
        actions: [
          "在笔记末尾复制下面的请求/响应模板，并用本章练习值填满所有 TODO。",
          "将 action_dt 填 0.05 s、horizon 填 16；command_type 写 eef_delta_pose；frame 先选 base，并明确 rotation 表示与单位。若你的真实平台未知，就把平台专属项标为待确认，不能猜。",
          "为请求和响应填写同一个 clock_id；只有同一时钟域或经过明确换算的时间戳才能直接相减。用 based_on_observation_time_s 检查观测新鲜度，用 action_start_time_s+h×action_dt_s 排程第 h 个动作；两者不能混成一个 timestamp。",
          "在 client_checks 中按顺序写 schema→shape→finite→clock domain→observation freshness/TTL→action schedule→frame/unit→反归一化→限幅/工作空间→执行。",
          "最后从任务指令开始，用五层闭环口述一次请求如何产生、验证、执行和反馈；把口述中卡住的字段补回模板。",
        ],
        code: String.raw`request:
  schema_version: "v1"
  request_id: 42
  clock_id: "robot_monotonic_v1"
  observation_time_s: TODO
  camera_names: [base, wrist]
  joint_order: TODO
  instruction: "拿起红杯"
  requested_horizon: 16
  checkpoint_id: TODO
  normalization_revision: TODO

response:
  request_id: 42
  clock_id: "robot_monotonic_v1"
  based_on_observation_time_s: TODO
  action_start_time_s: TODO
  command_type: eef_delta_pose
  frame: base
  translation_unit: m
  rotation_representation: TODO
  rotation_unit: TODO
  action_dt_s: 0.05
  actions_shape: [16, 7]
  valid_mask_shape: [16, 7]
  expires_at_s: TODO

client_checks:
  - schema / shape / finite
  - clock_id matches an agreed clock domain
  - observation freshness: now - based_on_observation_time_s <= TTL
  - schedule action h at action_start_time_s + h*action_dt_s
  - frame / unit / normalization revision
  - step, speed, workspace and collision constraints
  - execute or deterministic fallback`,
        expected: [
          "你最终得到一张五层闭环表、一页时间预算、两条故障记录和一份可版本化 action contract。",
          "contract 同时声明 shape、clock_id、观测依据时间、动作起始时间、frame、unit、归一化版本与有效期，而不是只有一个 actions 数组。",
          "你能明确说出 VLA 负责条件动作候选，独立执行层负责协议校验、实时保护和 fallback。",
        ],
        checkpoint:
          "让自己在不看页面的情况下回答：H、E、Δt、clock_id、observation_time、action_start_time、TTL、frame 各解决什么问题？任意一个答不出，就回到对应步骤补笔记。",
        troubleshooting: [
          "如果 rotation_representation 不知道填什么，保留 TODO 并列出需要平台文档确认的问题；未知比错误默认值安全。",
          "如果 expires_at 只写‘180ms’，补上它属于哪个 clock_id、相对哪个时间戳；本章脚本相对 observation_time 判断 freshness，而 action_start_time 单独决定排程。",
          "如果 contract 没有反归一化版本，模型输出即使 shape 正确也可能被错误缩放。",
        ],
      },
    ],
    finalArtifact: [
      "learning-notes/control-to-vla.md：包含符号落地表、POMDP 信息清单和五层闭环责任表。",
      "一份带单位的 H/E/Δt/servo/p99 时间轴，包含 H-E≥R 门禁，且注明分项 p99 相加可能高估或低估端到端尾延迟。",
      "默认执行器完整输出，以及 max_step、TTL 两次受控破坏的故障记录。",
      "一份含 clock_id、observation/action_start 时间戳、frame、unit、shape、normalization revision、TTL 与 fallback 的 action contract。",
    ],
    verifiedBoundary:
      "【已确认】公式计算和 public/labs/chunked_controller.py 的默认输出可在本机复现；【合理推测】真实 VLA 同样需要动作契约、尾延迟和过期保护；【个人观点】先系统边界、后模型细节是本教程建议的学习顺序；【暂无法验证】Toy 没有真实相机、网络时钟、动力学、碰撞或急停，不能证明任何真机安全性，也不能给出你的平台应使用的 TTL、限幅或停止策略。",
    knowledgeCheck: [
      {
        question: "为什么‘VLA 每 200 ms 查询一次’与‘低层控制器 1 kHz 运行’并不矛盾？",
        answer:
          "两者是不同层级的频率。VLA 可生成一段较低频动作参考或短轨迹；低层控制器在每个参考之间以更高频率做插值、反馈跟踪和稳定化。必须同时声明 action dt、策略查询周期和 servo 周期。",
      },
      {
        question: "H=16、E=4、Δt=0.05 s 各自意味着什么？",
        answer:
          "H=16 表示一次预测 16 个动作，覆盖 0.8 s；E=4 表示理想情况下只执行前 4 个、0.2 s 后重新观测并查询；Δt=0.05 s 是相邻动作参考的物理时间间隔。",
      },
      {
        question: "为什么 observation_time 比只用 request_id 更关键？",
        answer:
          "request_id 只能关联逻辑请求，不能说明生成动作依据的物理观测有多旧。observation_time 在共同 clock_id 下允许客户端计算 freshness、拒绝乱序/过期结果；它不等于动作排程时间，首个参考何时生效应由 action_start_time 单独声明。",
      },
      {
        question: "脚本的 hold position 为什么不能被称作通用安全停止？",
        answer:
          "不同平台的动力学和制动方式不同。保持位置对静态位置控制玩具可作为确定性 fallback，但移动底盘、重力臂、力控接触等场景可能需要减速、卸力或硬件制动；真机策略必须结合厂商接口与风险分析验证。",
      },
    ],
  },

  history: {
    intro:
      "本章的产物是一张‘问题如何变化’的证据地图：从动作学习基础、RT-1/RT-2，一直梳理到跨本体数据和连续动作路线。每条结论都要标成事实、推测、观点或未验证。页面已给出模板和示范行；原始论文与项目页用于核对来源。",
    beforeYouStart: [
      "在项目根目录的 learning-notes 文件夹中新建 vla-history-audit.md；没有该文件夹时先执行 New-Item -ItemType Directory -Force learning-notes。",
      "准备四种证据标签：A=论文方法/表格或官方代码可直接核对，B=官方项目页演示/作者说明，C=基于 A/B 的合理推测，D=你自己实际复现。",
      "注意：A/B 都不等于 D。‘官方报告’可以是事实，但只能写成‘官方在其设定中报告’，不能写成‘我已经验证’。",
      "本章刻意不要求抄参数量、机器人数量或排行榜数字；这些值可能随版本和口径变化，若将来要用，必须附具体来源与访问日期。",
    ],
    steps: [
      {
        title: "第 1 步：先建立问题轴，不写模型名单",
        goal:
          "历史的主线是研究问题发生了什么变化，而不是品牌名越来越多。先建四个问题阶段，可以避免把后来的 VLA 术语强行套到所有早期视觉策略上。",
        actions: [
          "打开 learning-notes/vla-history-audit.md，复制下面的四阶段表。",
          "完整照抄第一行示范：单任务 BC 的直接问题是如何从示范复现动作，它的局限包括闭环分布偏移与单任务数据范围。",
          "依次补上阶段 2、3、4：多任务与语义迁移；跨机器人共享数据；连续动作、开放环境与长任务。",
          "在每行‘成功标准’中只写可观察产物，例如同一协议下的 held-out/rollout 评测、跨任务或跨本体实验；不要写‘更智能’。",
        ],
        code: String.raw`| 阶段 | 先要解决的问题 | 输入/输出发生什么变化 | 应看什么证据 | 仍然缺什么 |
|---|---|---|---|---|
| 1 动作学习基础 | 怎样从示范复现单任务动作 | o→a 或 o→action chunk | held-out 动作误差 + 闭环 rollout | covariate shift、多峰与数据覆盖 |
| 2 多任务与语义 | ______ | ______ | ______ | ______ |
| 3 跨机器人数据 | ______ | ______ | ______ | ______ |
| 4 连续动作与开放任务 | ______ | ______ | ______ | ______ |`,
        expected: [
          "阶段 2 会出现语言/任务条件与预训练视觉语言表征；阶段 3 会出现 embodiment 与动作契约；阶段 4 会出现连续动作 expert、层级子任务或更开放场景。",
          "表格允许多条路线并行，不暗示每个新模型在所有维度都优于旧模型。",
          "【个人观点】四阶段是本站为了教学组织材料的方式，不是论文界唯一认可的历史分期。",
        ],
        checkpoint:
          "用一句话解释：为什么 ACT 或 Diffusion Policy 可以是 VLA 的动作学习基础，但不能仅凭视觉条件策略就自动称为完整 VLA？",
        troubleshooting: [
          "如果表格只剩模型名，把每个名字删掉，再用‘它解决哪个旧问题’重写。",
          "如果‘证据’一栏写了 demo 很酷，改成可核对的实验对象、baseline、协议与指标。",
          "如果阶段互相重叠，这是正常的；在备注写‘并行推进’，不要为了整齐编造单线演化。",
        ],
      },
      {
        title: "第 2 步：填动作学习基础分支——BC、ACT、Diffusion",
        goal:
          "先理解 VLA 之前已经存在的动作建模积木。你要把‘做了什么’和‘没有提供什么’同时写下，避免事后把所有视觉控制都回溯命名为 VLA。",
        actions: [
          "复制三行能力表；第一行 BC 已给出完整示范，按同样句式补 ACT 和 Diffusion Policy。",
          "ACT 行写 action chunk 与短时序列建模；不要把它写成语言模型。",
          "Diffusion Policy 行写条件生成连续动作分布与多峰表达；不要写成‘一定解决所有多峰’。",
          "在三行末尾都加证据标签：方法机制来自原始论文可标 A；‘可能成为后续 VLA 的 action head 基础’是课程组织判断，标 C 或个人观点。",
        ],
        code: String.raw`| 方法 | 解决的问题 | 关键改动 | 可直接支持的结论 | 不能据此推出 | 标签 |
|---|---|---|---|---|---|
| Behavior Cloning | 从专家示范复现动作 | 条件策略最大化专家动作似然 | 在专家数据分布上做监督学习 | 任意语言泛化、闭环必然成功 | A |
| ACT | ______ | ______ | ______ | ______ | A/C |
| Diffusion Policy | ______ | ______ | ______ | ______ | A/C |`,
        expected: [
          "ACT 的重点应落在动作块/序列和短时控制，而非互联网语义知识。",
          "Diffusion Policy 的重点应落在连续条件动作分布，而非天然拥有语言接口或开放世界能力。",
          "你会得到一个分支而非一条排名：BC、chunking、生成式动作建模可以被后续系统组合。",
        ],
        checkpoint:
          "任选 ACT 或 Diffusion，用‘输入—输出—训练目标—仍缺什么’四句复述。若其中一句只能写模型宣传词，回表格重写。",
        troubleshooting: [
          "如果不知道 ACT 全部架构细节，本章只要求写它在问题轴上的角色；未知字段标 unknown，不补数字。",
          "如果把多峰表达写成保证，改成‘模型族具备表达多峰的机制；实际覆盖依赖条件、数据和训练’。",
          "如果把‘视觉+动作’直接等同 VLA，检查是否真正存在语言条件或视觉语言预训练接口。",
        ],
      },
      {
        title: "第 3 步：用同一张表比较 RT-1 与 RT-2",
        goal:
          "理解关键变化不是名字从 1 变 2，而是预训练视觉语言知识如何进入动作预测。统一字段比较能阻止你只记住‘RT-2 更强’这一空结论。",
        actions: [
          "复制下面对比表，先照抄 RT-1 示范行。",
          "在 RT-2 行写：输入含视觉与语言；将动作表示纳入与视觉语言模型共同训练/表示的框架；研究问题是让视觉语言知识参与机器人动作选择。",
          "在‘证据边界’列写固定句式：官方论文/项目页在其设定中报告能力；本站本章未复现。",
          "再写一个反例：即使模型能识别‘红杯’，若 action frame、相机标定或抓取数据不匹配，仍可能抓取失败。",
        ],
        code: String.raw`| 节点 | 主要输入 | 动作输出/表示 | 主要问题 | 证据边界 | 未解决项 |
|---|---|---|---|---|---|
| RT-1 | 机器人图像与任务条件 | 机器人动作 token/序列 | 多任务机器人策略 | 官方实验可核对；本站未复现 | 数据覆盖、跨本体、精细控制等 |
| RT-2 | ______ | ______ | ______ | ______ | ______ |

反例：模型能识别红杯，但仍失败，因为 __________________________。`,
        expected: [
          "你应能说出：RT-1 主线是多任务机器人 Transformer；RT-2 的转折是把预训练 VLM 能力与动作表示/训练连接起来。",
          "这不等于 RT-2 在任意机器人、任意物体或任意场景都泛化。",
          "【官方可核对】方法与公开实验主张；【暂无法验证】本站没有重现实机实验。",
        ],
        checkpoint:
          "不用‘规模更大’四个字，解释 RT-2 相对 RT-1 的问题变化；必须提到预训练视觉语言知识和动作。",
        troubleshooting: [
          "如果写成‘RT-2 会思考’，换成可操作机制：哪些输入进入、动作如何表示、训练目标如何连接。",
          "如果不确定某个精确架构字段，写‘以固定版本论文为准’，不要根据模型名猜。",
          "如果把官方 demo 当作你已验证的数据，把标签从 D 改成 B，并注明展示条件。",
        ],
      },
      {
        title: "第 4 步：做一次跨 embodiment 动作契约转换",
        goal:
          "理解 Open X-Embodiment 一类工作的难点不只是数据量。两个机器人即使动作数组都是 7 维，也可能在坐标系、单位、控制周期和夹爪语义上完全不同。",
        actions: [
          "复制机器人 A/B 契约表。A 行是完整示范：base frame、米、旋转向量、50 ms、1=闭合。",
          "为机器人 B 填入假设：tool frame、毫米、欧拉角、100 ms、1=打开。把这些值明确标为教学假设，不是某真实机器人的规格。",
          "写出把 B 统一到 A 前至少需要的四步：坐标变换、mm→m、旋转表示转换、gripper 极性翻转；再指出 Δt 不同会改变 delta/velocity 的物理语义。",
          "回答：为什么把 B padding 成相同 7 维仍不够？因为相同 shape 不代表相同语义。",
        ],
        code: String.raw`| 字段 | 机器人 A（教学示范） | 机器人 B（教学假设） | 统一动作前的处理 |
|---|---|---|---|
| command_type | eef_delta_pose | eef_delta_pose | 核对 delta 定义 |
| frame | base | tool | ______ |
| translation unit | m | mm | ______ |
| rotation | rotation vector | Euler XYZ | ______ |
| Δt | 0.05 s | 0.10 s | ______ |
| gripper | 1=close | 1=open | ______ |

为什么 padding 不够：________________________________________`,
        expected: [
          "你会得到一份 canonicalization 清单，而不是一句‘把数据拼起来训练’。",
          "frame/unit/dt/gripper 任一项错配，都可能在数值 shape 正常的情况下系统性地产生错误动作。",
          "【合理推测】跨本体数据增加迁移机会；是否提升某个目标机器人仍取决于契约、覆盖与评测。",
        ],
        checkpoint:
          "给出一个‘相同 7D shape 但执行方向相反’的具体例子，并说出应在哪一层修复。",
        troubleshooting: [
          "若觉得单位转换只需乘 1000，别忘了模型归一化统计也绑定原单位。",
          "若将 Euler 和 rotation vector 当成同一三元组，回顾：维数相同不代表组合规则相同。",
          "若 Δt 差异被忽略，用相同 delta 在 20 Hz 与 10 Hz 下计算每秒累计位移。",
        ],
      },
      {
        title: "第 5 步：为 Open X、OpenVLA 与连续动作路线写证据卡",
        goal:
          "把代表节点压缩成可审计的六格卡片：它解决什么、改了什么、公开证据是什么、仍不能说明什么。教程先给完整示范句，读者再按同一模板填余下节点。",
        actions: [
          "复制三张证据卡模板；先完整照抄 Open X-Embodiment 示例卡。",
          "OpenVLA 卡写开放研究路线、视觉语言条件与动作输出；具体开放资产和版本状态必须以你查看的官方页面为准，不在本章填动态数字。",
          "连续动作 VLA/π 系列卡写连续 action expert 或生成式动作头，以及开放环境/层级任务等研究目标；不要把某个项目页主张改写成所有任务的事实。",
          "每张卡至少填一项‘仍未解决’：跨本体契约、真实控制精度、长时程误差、延迟、评测或安全。",
        ],
        code: String.raw`### Open X-Embodiment（完整示范）
- 问题：怎样利用多个 embodiment 的机器人数据。
- 输入/输出变化：混合来自不同机器人的观测、语言与动作。
- 机制事实（A）：公开工作提供跨 embodiment 数据与相应训练研究。
- 可支持结论：官方设定中的跨机器人数据实验可由原始材料核对。
- 不能支持：仅凭“数据更多”断言任意新机器人都会提升。
- 未解决：frame/unit/dt/action dimension 与评测协议仍需统一。

### OpenVLA
- 问题：______
- 输入/输出变化：______
- 机制事实（A）：______
- 可支持结论：______
- 不能支持：______
- 未解决：______

### 连续动作 VLA / π 系列
- 问题：______
- 输入/输出变化：______
- 机制事实（A）：______
- 官方主张（A/B，注明来源语境）：______
- 本站推测（C）：______
- 本站未复现：______`,
        expected: [
          "每张卡都同时存在正向改进和未解决项，没有‘全面领先’这种无法审计的词。",
          "OpenVLA 卡的重点是开放研究可访问性和其具体动作路线，不是开放权重自动等于适合你的硬件。",
          "连续动作路线的改进要绑定 action expert/训练目标与实验设定，不能只用‘更丝滑’描述。",
        ],
        checkpoint:
          "任选一张卡，把其中每句话念出来并报 A/B/C/D。凡是报不出标签的句子，删掉或重写。",
        troubleshooting: [
          "如果卡片越来越长，每格最多两句，细节留给对应核心章节。",
          "如果找不到某个动态数字，直接删掉；本练习不依赖参数量或排行榜完成。",
          "如果开源状态不确定，写‘当前版本待核对’，不要把曾经的发布状态当永久事实。",
        ],
      },
      {
        title: "第 6 步：把 demo、论文结果、推测和个人复现分开",
        goal:
          "练习证据审计。很多错误不是机制不懂，而是把官方报告、漂亮 demo、合理推测和自己跑过混成一句‘已经证明’。",
        actions: [
          "复制下面四句话，逐句判断标签；参考答案已写在句尾，先遮住标签自己作答。",
          "把你前五步表格中的每条主张加上 [A]、[B]、[C] 或 [D]。一条句子若含两种证据，拆成两句。",
          "用固定句式重写至少一条：‘论文在其设定中报告 X [A]；这可能意味着 Y [C]；本站尚未在 Z 上复现 [非 D]。’",
          "检查所有‘证明、通用、任意、一定’；若没有明确受控证据和边界，换成更窄的表述。",
        ],
        code: String.raw`1. “论文方法部分明确给出动作 token 化方式。” → A
2. “官方项目页展示机器人完成一个长任务。” → B
3. “因此该方法可能更适合我的厨房任务。” → C
4. “我在固定代码版本和 seed 下复现了脚本输出。” → D

改写模板：
官方材料在 __________ 设定中报告 __________ [A/B]；
我据此推测 __________ [C]；
本站/我尚未在 __________ 上复现 [非D]。`,
        expected: [
          "同一主题可以同时有 A、B、C 和非 D 陈述，但它们不能合并成一个无边界结论。",
          "demo 是展示证据，除非同时提供受控协议，否则不能自动替代 benchmark。",
          "读者自己运行本章的本地 Toy 可产生 D 级复现，但不能把 D 扩大到论文真实机器人结论。",
        ],
        checkpoint:
          "写出一对最容易混淆的句子：‘官方报告了什么’与‘我亲自验证了什么’。两句必须使用不同主语。",
        troubleshooting: [
          "如果一句话同时有‘论文表明’和‘所以我的机器人’，在分号处拆开，后半通常是 C 或待验证。",
          "如果个人复现没有固定代码/数据/seed，仍可记录为 D，但要注明复现条件与可重复性不足。",
          "如果项目页和论文口径不同，分别记录，不自行合并成更强结论。",
        ],
      },
      {
        title: "第 7 步：完成一页问题地图和十分钟复述",
        goal:
          "把零散卡片压缩成可记忆的因果链。最终验收不是背诵模型名，而是能解释旧瓶颈、新机制、支持证据和剩余风险。",
        actions: [
          "在笔记末尾画四个横向阶段，并把 BC/ACT/Diffusion 放在动作基础分支，RT-1/RT-2 放多任务与语义分支，Open X/OpenVLA 放跨数据与开放研究分支，连续 action expert/开放任务放后续分支。允许一个节点连到多条线。",
          "在图下抄写七类持续瓶颈：数据成本与偏斜、跨本体契约、语义到精细控制、长时程误差、延迟/算力、评测泄漏/小样本、安全。",
          "打开计时器做十分钟复述。每个阶段只用四句：旧问题→新机制→证据→仍未解决。",
          "录下或写下卡住之处；凡是只能说‘更大更强’的节点，回到相应证据卡补具体输入、动作表示或训练目标。",
        ],
        code: String.raw`复述脚本（每阶段四句）
1. 旧方法卡在：________________________
2. 新路线具体改了：____________________
3. 支持它的证据类型是：________________
4. 它仍未解决：________________________

七类瓶颈勾选：
[ ] 数据成本/偏斜  [ ] 跨本体契约  [ ] 精细控制
[ ] 长时程误差    [ ] 延迟/算力    [ ] 评测
[ ] 安全`,
        expected: [
          "最终地图不超过一页，但每个节点都能回链到一张证据卡。",
          "你能解释 RT-2 相对 RT-1 的问题变化、跨 embodiment 为什么需要 action contract，以及连续动作路线为什么不自动解决开放世界。",
          "你不需要背发布日期或动态规模数字，也能讲清主要演化。",
        ],
        checkpoint:
          "关掉笔记，完整说出四次问题演化和七类瓶颈。如果漏掉两项以上，重新打开地图只看关键词再复述一次。",
        troubleshooting: [
          "若十分钟不够，删模型细节，只保留问题—机制—证据—瓶颈。",
          "若两分钟就讲完，检查是否漏了动作契约、评测边界或安全，而不是机械增加模型名单。",
          "若无法连接分支，允许画并行箭头；研究历史本来就不是严格单链。",
        ],
      },
    ],
    finalArtifact: [
      "learning-notes/vla-history-audit.md：四阶段问题表和 BC/ACT/Diffusion 基础分支。",
      "RT-1/RT-2 同字段对比表，以及一次跨 embodiment action contract 转换。",
      "Open X-Embodiment、OpenVLA、连续动作路线的六格证据卡。",
      "所有主张带 A/B/C/D 标签的一页问题地图，以及一次十分钟复述记录。",
    ],
    verifiedBoundary:
      "【官方可核对】代表工作的架构与公开实验主张应回到原始论文、项目页和固定版本代码；【合理推测】跨任务/跨本体数据可能增加迁移机会，但效果依赖协议和覆盖；【个人观点】本章四阶段与两小时节奏是教学组织，不是唯一历史分期；【暂无法验证】本站没有复现这些代表模型的真实机器人实验，卡片也刻意不提供可能随版本变化的规模、硬件或排行榜数字。",
    knowledgeCheck: [
      {
        question: "为什么不能把 ACT 和 Diffusion Policy 直接回溯称为完整 VLA？",
        answer:
          "它们提供动作学习机制：ACT 强调动作块/序列，Diffusion Policy 强调条件连续动作分布。若一个系统没有语言条件或视觉语言预训练接口，仅有视觉条件动作策略并不足以满足本教程对 VLA 的使用语境。",
      },
      {
        question: "RT-2 相对 RT-1 的核心问题变化是什么？",
        answer:
          "主线从多任务机器人策略进一步转向把预训练视觉语言知识与动作表示/训练连接，使网页视觉语言知识有机会参与机器人动作选择；这仍不保证任意场景泛化。",
      },
      {
        question: "为什么跨 embodiment 不能只靠 padding 到相同 action dimension？",
        answer:
          "shape 相同不代表语义相同。command type、base/tool frame、米/毫米、旋转表示、控制周期、夹爪极性和归一化都可能不同，必须显式 canonicalize 并保留可逆契约。",
      },
      {
        question: "A/B/C/D 中，官方 demo 和你本地复现分别属于什么？",
        answer:
          "官方项目页 demo 属于 B；自己在明确代码、数据和配置下实际运行属于 D。A/B 不能写成 D，D 也只能覆盖实际复现的边界。",
      },
    ],
  },

  "behavior-cloning": {
    intro:
      "从脚本第一条数据开始完成 Behavior Cloning：手算标签和一次梯度，逐函数跟踪训练与 rollout，再在副本上做两次有目的的破坏。最后用访问状态分布的变化解释 DAgger。所有实验只用 Python 标准库。",
    beforeYouStart: [
      "在项目根目录运行 python --version；建议 Python 3.10+，本章不需要 PyTorch、GPU 或下载数据。",
      "新建 learning-notes/behavior-cloning.md；没有 learning-notes 时先执行 New-Item -ItemType Directory -Force learning-notes。",
      "运行 Copy-Item public/labs/toy_behavior_cloning.py learning-notes/toy_behavior_cloning_work.py。所有故意修改只在 work 副本进行。",
      "打开 public/labs/toy_behavior_cloning.py 与工作副本并排查看。原文件作为可随时对照的干净基线。",
      "本章数字只属于一维、线性、无噪声 Toy；不要把 0/6→6/6 写成真实机器人预期。",
    ],
    steps: [
      {
        title: "第 1 步：从三列特征亲手生成监督标签",
        goal:
          "先知道数据集里每一列是什么。BC 的训练对象不是抽象的‘轨迹’，而是对齐好的条件特征和专家动作标签。",
        actions: [
          "打开 public/labs/toy_behavior_cloning.py，搜索 Row、predict 和 make_supervised_data。",
          "抄下 Row = tuple[list[float], float]：前者是 features，后者是 target action。",
          "脚本把 features 定义为 [visual, language, 1.0]；最后的 1.0 是显式 bias 特征，不是第三个传感器。",
          "用下面三个固定样本替代随机数，逐项计算 action=0.7×visual+0.9×language+0.15。",
          "检查两个 visual 相同但 language 相反的样本；它们的动作相差 1.8，说明这个教学数据不能忽略语言。",
        ],
        code: String.raw`| visual | language | bias | target action 计算 | target |
|---:|---:|---:|---|---:|
| 0.0 | +1.0 | 1.0 | 0.7×0 + 0.9×1 + 0.15 | 1.05 |
| 0.0 | -1.0 | 1.0 | _______________________ | _____ |
| 0.5 | +1.0 | 1.0 | _______________________ | _____ |

同 visual、语言翻转后的 action 差 = ______`,
        expected: [
          "第二行 target=-0.75，第三行 target=1.40，语言翻转导致差值 1.80。",
          "目标策略的真实权重是 [0.7, 0.9, 0.15]；训练的任务就是从样本恢复这三个系数。",
          "【已确认】这是当前脚本的数据生成式；【暂无法验证】真实 VLA 特征当然不会是这三个标量。",
        ],
        checkpoint:
          "不看代码回答：为什么 bias 特征必须固定为 1.0？如果删掉它，模型无法精确表示当前标签里的哪一项？",
        troubleshooting: [
          "若第二行算成 +0.75，检查 language=-1 时 0.9×(-1) 的符号。",
          "若把 bias 当动作维，回到 Row 类型：features 的三个值共同预测一个标量 target。",
          "若不知道真实数据怎样对应，可类比 visual=视觉编码特征、language=语言编码特征、target=专家动作的一维简化。",
        ],
      },
      {
        title: "第 2 步：手算 predict、MSE 和第一步梯度",
        goal:
          "把公式和循环逐行对应。你不必一次推完整个优化理论，但必须知道 error 的符号如何决定权重更新方向。",
        actions: [
          "阅读 predict：它把 weights 与 features 成对相乘求和。用初始 weights=[0,0,0] 计算第 1 步三个样本的预测，全为 0。",
          "阅读 mse：对每行计算 (prediction-target)^2 后取平均。用上一步三个 target 计算初始 MSE。",
          "阅读 train_linear_policy 的内层循环。只对第一条样本 [0,1,1]、target=1.05 手算 error=-1.05。",
          "按 gradient_j=2×error×feature_j/n；先取 n=1，得到 visual 梯度 0、language 梯度 -2.1、bias 梯度 -2.1。",
          "学习率 0.08 时用 w_new=w_old-0.08×gradient，得到 [0,0.168,0.168]。解释负梯度为何使权重增加。",
        ],
        code: String.raw`三个样本的初始 MSE：
(1.05² + (-0.75)² + 1.40²) / 3
= (______ + ______ + ______) / 3
= ______

仅第一条样本：
prediction = 0
error = prediction-target = ______
gradient = 2×error×[0,1,1] = [______, ______, ______]
w_new = [0,0,0] - 0.08×gradient = [______, ______, ______]`,
        expected: [
          "三个教学样本的初始 MSE 为 (1.1025+0.5625+1.96)/3≈1.2083。",
          "单样本第一步更新得到 [0,0.168,0.168]；visual 为 0，所以该样本不给 visual weight 梯度。",
          "脚本对全部 rows 做 full-batch 平均，真实第一步数值会不同，但更新公式完全对应。",
        ],
        checkpoint:
          "如果 prediction 比 target 大，error 为正；在正 feature 上梯度为正，梯度下降会让对应权重增大还是减小？写出一行代数。",
        troubleshooting: [
          "若 MSE 把平方前的负号保留，记住平方误差永远非负。",
          "若更新写成 w+lr×gradient，回到函数末行 weight - learning_rate * grad。",
          "若多个样本算乱，先只保留 n=1 的示范，再理解脚本除以 len(rows) 是求平均。",
        ],
      },
      {
        title: "第 3 步：先预测终端输出，再运行监督训练和重载",
        goal:
          "运行不是第一步，而是对你的代码阅读做检验。你要能把每一行输出追溯到函数和断言。",
        actions: [
          "运行前在笔记写预测：训练后 weights 接近 [0.7,0.9,0.15]；trained MSE 接近 0；语言翻转后 MSE 明显增大。",
          "从项目根目录运行 python public/labs/toy_behavior_cloning.py，保存完整输出。",
          "找到 supervised_and_condition_experiment，逐行对应 initial_loss、trained_loss、language_permuted、permuted_loss 与三条 assert。",
          "找到 checkpoint_experiment；手算 probe=[0.25,-1,1] 的输出 0.7×0.25-0.9+0.15=-0.575。",
          "解释 TemporaryDirectory 为什么只验证序列化 round-trip，而不是产生一个永久模型文件。",
        ],
        code: String.raw`python public/labs/toy_behavior_cloning.py

输出核对：
- learned weights = __________________
- train MSE = __________ → __________
- permuted-language MSE = __________
- probe before/after = __________ / __________`,
        expected: [
          "默认输出的权重为 [0.7, 0.9, 0.15]，训练 MSE 从约 1.1321 降到接近 0，语言翻转 MSE 为 3.2400。",
          "probe 保存前后都为 -0.575000，说明当前 JSON 权重重载对同一输入输出一致。",
          "这些结果验证脚本实现与无噪声线性生成式一致，不说明真实视觉模型泛化。",
        ],
        checkpoint:
          "指出监督实验中三条 assert 各保护什么：loss 下降、条件消融、权重恢复。不要只复述 assert 表面比较符号。",
        troubleshooting: [
          "若输出不同，先确认运行的是 public/labs 原文件，而非已修改的 work 副本。",
          "若训练发散，检查是否改了 learning_rate 或更新符号；原脚本默认参数应稳定。",
          "若权重接近但不完全一致，检查 Python 版本与是否改过 steps；验收关注脚本断言而非手抄小数位。",
        ],
      },
      {
        title: "第 4 步：破坏语言消融，理解‘模型是否使用条件’",
        goal:
          "消融不是删除一个字段看程序会不会跑，而是在目标保持不变时破坏条件—标签对应关系，观察性能是否下降。",
        actions: [
          "打开 learning-notes/toy_behavior_cloning_work.py，搜索 language_permuted。",
          "先把紧随其后的 assert permuted_loss > trained_loss + 1.0 临时改成注释，保留后面的 print。",
          "将 language_permuted 中的 -x[1] 改成 x[1]。这不再是置换，而是把原输入原样交回；运行 python learning-notes/toy_behavior_cloning_work.py。",
          "观察 permuted-language MSE 变得接近 trained MSE。写下：因为条件实际没有被破坏，所以这个‘消融’无效。",
          "把 x[1] 恢复为 -x[1]，恢复 assert，再运行确认全部 PASS。",
          "进一步思考真实数据：若 visual 本身唯一决定动作，即便语言被打乱也可能不变差；这时要构造同图像、不同指令的成对样本。",
        ],
        code: String.raw`# 原版：真正翻转语言条件
language_permuted = [([x[0], -x[1], 1.0], target) for x, target in rows]

# 故意做错：输入未改变
language_permuted = [([x[0], x[1], 1.0], target) for x, target in rows]`,
        expected: [
          "故意做错时，所谓 permuted loss 接近 0，因为输入和训练集相同；恢复 -x[1] 后回到 3.2400。",
          "你应理解：消融结果依赖数据是否存在必须使用该条件的对照样本。",
          "断言被临时注释只用于观察故障；最终必须恢复，不能用删测试的方式宣称通过。",
        ],
        checkpoint:
          "设计一对最小样本，让图像特征相同、语言相反、目标动作相反。说明它为什么能检测语言是否被使用。",
        troubleshooting: [
          "若改动后程序在 print 前报错，确认你临时注释的是 permuted_loss 那条 assert，而不是其他检查。",
          "若恢复后仍不 PASS，直接从 public/labs 再复制一份覆盖 work 副本，然后重做一次。",
          "若把 target 也一起翻转，那是在创建新数据，不再是固定标签下的条件消融。",
        ],
      },
      {
        title: "第 5 步：沿 rollout 手算 covariate shift",
        goal:
          "理解开环 MSE 小为何闭环仍失败。关键不是口号，而是动作改变下一状态，使策略逐步进入专家数据没有覆盖的区域。",
        actions: [
          "打开原脚本，按顺序阅读 expert_action、recovery_features、initial_expert_rows、rollout。",
          "确认 initial_expert_rows 只包含 state 从 -0.25 到 0.25 的 51 个点；因此 outside 特征在训练数据上始终为 0。",
          "用 BC weights 约 [-0.799,0,0] 和 start=1.2 手算：recovery_features(1.2)=[1.2,0.95,1]，但 outside 权重为 0，所以预测 action≈-0.959。",
          "对照 rollout 的安全界 |action|≤0.65：第一步就越界，success=False。这解释了默认 BC 为 0/6。",
          "再算 expert_action(1.2)=clip(-0.96,-0.45,0.45)=-0.45；专家会给出受限恢复动作，而初始 BC 从没见过这种远离轨迹的状态。",
        ],
        code: String.raw`训练范围：state ∈ [-0.25, 0.25]
部署起点：state = 1.2
outside = sign(1.2)×max(|1.2|-0.25, 0) = ______

BC action ≈ -0.799×1.2 + 0×outside = ______
safety limit = 0.65
是否第一步越界：______

expert action = clip(-0.8×1.2, -0.45, 0.45) = ______`,
        expected: [
          "outside=0.95，BC action≈-0.959，超过 0.65；expert action=-0.45。",
          "开环训练能恢复训练区域的专家映射，但没有约束训练区域外的恢复行为。",
          "covariate shift 在这里通过训练状态范围与策略访问状态范围的差异被具体展示。",
        ],
        checkpoint:
          "用自己的话区分：训练数据分布 d_{π*} 与部署访问分布 d_{πθ}。必须提到动作会改变下一状态。",
        troubleshooting: [
          "若 outside 算成 1.2，注意它只表示超出 0.25 区域的部分，所以是 1.2-0.25。",
          "若认为 action=-0.959 会很快回到原点所以安全，脚本明确先检查单步动作界；越界动作不会被执行。",
          "若把这个例子理解成所有 BC 都 0% 成功，回到边界：这只是故意构造的 Toy。",
        ],
      },
      {
        title: "第 6 步：逐行跟踪一次 DAgger 数据聚合",
        goal:
          "理解 DAgger 不是普通随机增强，而是‘当前策略决定访问哪里，专家在那里给标签，再合并回旧数据’。",
        actions: [
          "阅读 covariate_shift_and_dagger_experiment，从 recovery_states 初始化开始逐行标注 sampler、labeler、aggregator。",
          "sampler：当前 bc_weights 在六个 start 上决定会访问哪些 state；若它的动作超过安全界，Toy 安全监督器改为执行 expert_action。",
          "labeler：无论状态怎样到达，新标签都由 expert_action(state) 提供，不是旧模型自己给自己标。",
          "aggregator：dagger_rows=expert_rows+恢复状态新样本，旧数据没有被丢弃。",
          "运行默认脚本，对照输出记录成功率 0/6→6/6、最大初始动作约 0.96→0.56、BC/DAgger weights。",
          "解释新 outside 权重约 0.347 的作用：模型终于能利用‘离开初始专家区域多远’这一恢复特征。",
        ],
        code: String.raw`DAgger 三角色
- sampler（谁决定访问状态）: __________________
- labeler（谁给正确动作）: ____________________
- aggregator（新旧数据如何处理）: ______________

默认 Toy 前后对照
- closed-loop success: ______ /6 → ______ /6
- max initial |action|: ______ → ______
- outside-feature weight: ______ → ______`,
        expected: [
          "sampler 是当前 BC 策略参与的 rollout，labeler 是安全 expert，aggregator 合并 expert_rows 与 recovery rows。",
          "默认 Toy 输出 0/6→6/6、约 0.96→0.56，outside 权重从约 0 变为约 0.347。",
          "【已确认】是当前脚本结果；【合理推测】真实系统也需要恢复/接管数据，但采集策略和提升幅度不能外推。",
        ],
        checkpoint:
          "回答 DAgger 三问：谁访问状态、谁提供标签、为什么保留旧数据？少一个要素都不能只写‘又训练一遍’。",
        troubleshooting: [
          "若以为 expert 全程决定状态，注意 Toy 先计算 unsafe_action，只有越界时安全监督器接管；这是一种教学近似。",
          "若以为新标签来自 bc_weights，找到 dagger_rows 中 expert_action(state)。",
          "若真实机器人没有可随时查询的专家，记录这是落地障碍；可考虑人类接管/纠错片段，但风险和协议要另设计。",
        ],
      },
      {
        title: "第 7 步：故意删掉状态表达，看 DAgger 为什么会失效",
        goal:
          "数据覆盖和模型输入能力缺一不可。即使收到了恢复状态，如果特征无法表达状态差异，聚合数据也未必修复闭环。",
        actions: [
          "重新从 public/labs 复制干净脚本到 work 副本。",
          "在 work 副本中找到 recovery_features，把 return [state, outside, 1.0] 改成 return [0.0, 0.0, 1.0]；这里只保留常量 bias，故意同时清零 state 与 outside。",
          "运行 python learning-notes/toy_behavior_cloning_work.py。当前固定脚本会在 DAgger 段的 after_successes==6 断言失败，实际 after_successes 为 0。",
          "记录第一条失败断言，并解释：新样本虽加入，但策略只看到常量输入，无法区分正负状态或恢复幅度；这证明的是这个特定 Toy 中数据覆盖仍需要足够的状态表示。",
          "从原脚本再次覆盖工作副本，运行确认 ALL CHECKS PASSED。",
        ],
        code: String.raw`# 原版
return [state, outside, 1.0]

# 故意破坏表示能力：同时移除 state 与 outside
return [0.0, 0.0, 1.0]`,
        expected: [
          "故意破坏后 after_successes==6 断言以实际值 0 失败；恢复特征后重新通过。",
          "你应得出更窄的结论：DAgger 改善训练状态覆盖，但模型表示、优化和专家标签仍要足够。",
          "失败记录包含改动、断言、机制和恢复，不是只有一张 traceback 截图。",
        ],
        checkpoint:
          "完成句子：只增加数据仍不够，因为 ______；只增加模型能力仍不够，因为 ______。",
        troubleshooting: [
          "若错误出现在更早位置，确认只改 recovery_features，没有误改 make_supervised_data。",
          "若仍然意外 PASS，检查运行路径；用 Select-String -Path learning-notes/toy_behavior_cloning_work.py -Pattern 'return \[' 确认实际返回 [0.0,0.0,1.0]。只清零 outside 仍保留 state，当前 Toy 依然可能达到 6/6，因此不是本步的故障注入。",
          "若想探索别的破坏，一次只改一个变量，并在实验后从原文件恢复。",
        ],
      },
      {
        title: "第 8 步：手算多峰 MSE，并整理最终验收",
        goal:
          "理解训练 loss 正常却给出危险动作的另一来源：目标分布本身多峰，而单峰 MSE 学习条件均值。",
        actions: [
          "打开 multimodal_mse_experiment，确认同一条件对应 [-1,+1] 各 50 次。",
          "手算常数预测 μ 的 MSE：L(μ)=0.5(μ+1)^2+0.5(μ-1)^2=μ²+1；求导 2μ=0，所以 μ*=0。",
          "写下为什么 0 可能危险：若 -1/+1 代表向左/向右绕障，0 代表直行，恰好可能撞向障碍。",
          "列出两类处理方案：先增加能消歧的条件（目标身份、历史、地图），或使用能表达多峰的离散/混合密度/diffusion/flow action head。",
          "最后运行原脚本一次，把四段 PASS、关键数字和所有章节检查点汇总到 behavior-cloning.md。",
        ],
        code: String.raw`L(μ) = 0.5(μ+1)² + 0.5(μ-1)²
     = __________________
dL/dμ = _______________
μ* = __________________

先补条件，适用情形：________________________________
改多峰 action head，适用情形：_______________________`,
        expected: [
          "L(μ)=μ²+1，导数为 2μ，最优 μ=0，最小 MSE=1。",
          "均值失败不是简单的‘模型太小’；在这个构造中它正是 MSE 目标的最优解。",
          "最终产物同时包含数据、梯度、开环训练、条件消融、闭环偏移、DAgger、多峰与重载，而不只是运行命令。",
        ],
        checkpoint:
          "给出选择顺序：先判断多峰来自真实多解还是缺失条件，再决定补条件还是换 head；解释为什么不应看到平均问题就立即上 diffusion。",
        troubleshooting: [
          "若展开平方后一次项没消掉，分别展开 (μ+1)^2 与 (μ-1)^2 再相加。",
          "若认为 μ=0 的 MSE 更小就一定更安全，区分统计损失与任务几何/碰撞代价。",
          "若所有检查点都能背却无法对应代码函数，回到脚本搜索同名 experiment，并给每段写输入、处理、断言、输出。",
        ],
      },
    ],
    finalArtifact: [
      "learning-notes/behavior-cloning.md：三条样本、初始 MSE 和一次梯度更新的手算。",
      "默认脚本四段完整输出，以及每段输出对应函数/断言的解释。",
      "一次无效语言消融和一次删除恢复特征的主动失败记录，均已恢复为干净脚本。",
      "covariate shift 与 DAgger 的 sampler/labeler/aggregator 图，以及多峰 MSE 推导。",
    ],
    verifiedBoundary:
      "【已确认】BC 最大似然、高斯固定方差下的 MSE 特例、DAgger 数据聚合思想和多峰均值推导可由公式核对；当前 Toy 脚本默认输出已在本机复现。【合理推测】真实 VLA 也会受时间错位、条件捷径与分布偏移影响，但程度依任务而异。【个人观点】先手算、再读代码、后破坏实验是本教程的学习节奏建议。【暂无法验证】本章没有真实图像网络、机器人动力学或人类接管，0/6→6/6 不能外推为任何真机提升或安全保证。",
    knowledgeCheck: [
      {
        question: "普通 MSE 何时可以从 BC 的负对数似然得到？",
        answer:
          "当连续动作条件分布被假设为均值由网络给出、方差固定且各向同性的单峰高斯时，NLL 去掉与参数无关的常数和固定比例后等价于 MSE。若学习方差、各维尺度不同或分布多峰，目标不再只是普通 MSE。",
      },
      {
        question: "为什么 expert-state validation MSE 不能代替闭环 rollout？",
        answer:
          "验证样本仍来自专家访问分布；部署时模型动作会改变下一状态，小误差可能把系统带入训练未覆盖区域，后续预测继续在分布外进行。静态 MSE 看不到这条反馈链。",
      },
      {
        question: "DAgger 一轮包含哪三个关键动作？",
        answer:
          "让当前/混合策略访问状态，由专家在这些访问状态给正确标签，再把新样本与旧数据聚合并重新训练。新标签不能由旧模型自标，也不应简单丢掉旧数据。",
      },
      {
        question: "左右两种动作等概率时，为什么 MSE 输出 0 不是实现 bug？",
        answer:
          "平方损失的最优常数预测是条件均值；-1 和 +1 等概率的均值就是 0。若 0 在任务几何上危险，需要补消歧条件或换能表示多峰的动作分布，而不是只继续压低 MSE。",
      },
    ],
  },

  "multimodal-transformer": {
    intro:
      "从五个可见的 toy token 出发，建立图像、语言、状态和动作的 tensor contract。随后手算 action_0 对每个 key 的注意力分数，画三种 mask，并故意触发未来标签泄漏断言。完成后应能从模型图还原输入顺序、信息流和动作接口。",
    beforeYouStart: [
      "确认项目根目录下存在 public/labs/attention_mask_leakage.py，并准备 learning-notes/multimodal-transformer.md。",
      "执行 Copy-Item public/labs/attention_mask_leakage.py learning-notes/attention_mask_leakage_work.py；主动破坏只改副本。",
      "准备计算器或纸笔；本章手算只涉及 3 维向量、点积、平方根和 softmax。",
      "脚本只有单头、identity Q/K/V、五个 token；它是信息流单测，不是完整 VLA 或性能 benchmark。",
    ],
    steps: [
      {
        title: "第 1 步：先写完整 tensor contract",
        goal:
          "把物理时间、相机顺序和张量轴命名。共享 hidden width 只表示张量能进入同一 Transformer，不代表图像、语言和动作语义相同。",
        actions: [
          "在笔记抄下教学配置：B=2、历史 K=2、相机 C=2、每图 P=196 patches、语言 L=12、状态 S=1、动作 H=16、隐藏宽度 d。",
          "逐项算视觉 token 数 K×C×P=784；条件 prefix 数 784+12+1=797；加 16 个动作 slot 后 N=813。",
          "把 images 原始 shape 写成 [B,K,C,3,H_img,W_img]，编码后视觉写 [B,784,d]，整段隐藏序列写 [2,813,d]。",
          "在 contract 补 camera_names=[base,wrist]、timestamps、history_offsets、modality_ids、padding mask 和 action valid mask。",
          "注明这些数值是教学示例；真实模型可能压缩图像、用 cross-attention 或不同 token 顺序。",
        ],
        code: String.raw`B=2, K=2, C=2, P=196, L=12, S=1, H_action=16

visual tokens = K×C×P = ______
prefix tokens = visual+language+state = ______
total N = prefix+action = ______

raw images: [B, K, C, 3, H_img, W_img]
encoded vision: [______, ______, d]
language: [______, ______, d]
state: [______, ______, d]
action slots: [______, ______, d]
full X: [______, ______, d]

protocol metadata: camera_names / timestamps / history_offsets /
modality_ids / padding_mask / action_valid_mask`,
        expected: [
          "答案为视觉 784、prefix 797、总序列 813；full X=[2,813,d]。",
          "相机身份和时间戳没有因为 reshape 而消失；部署端必须使用同一顺序和预处理。",
          "position id 表示序列位置，不自动等价于真实曝光时间。",
        ],
        checkpoint:
          "如果 base 与 wrist 相机张量 shape 完全相同但顺序互换，为什么模型仍可能失败？回答必须提到 camera identity 和训练/推理协议一致性。",
        troubleshooting: [
          "若把 K×C×P 算成 392，检查是否漏乘两路相机或两帧历史。",
          "若动作 H 与图像高 H_img 混淆，在变量名上分别写 H_action 与 H_img。",
          "若认为 modality id 可省略，至少说明模型通过什么其他稳定机制区分 token 来源；未知就不要假设。",
        ],
      },
      {
        title: "第 2 步：把脚本里的五个 token 和向量抄出来",
        goal:
          "把抽象多模态序列缩小到可手算对象。脚本使用 identity Q/K/V，所以每个 token 向量同时充当 query、key 和 value。",
        actions: [
          "打开 public/labs/attention_mask_leakage.py，搜索 smoke_test。",
          "把 names 顺序抄到笔记：[image, language, state, action_0, action_1]。索引分别为 0 到 4。",
          "抄下 base 中五个三维向量，确认所有 token hidden width=3。",
          "找到 changed[-1]=(8,-9,7)：只有未来 action_1 被替换，其他 token 不变。这是干预测试的唯一自变量。",
          "写下研究问题：当 action_1 的 clean label 被改动时，较早的 action_0 输出是否改变？",
        ],
        code: String.raw`index 0 image    = ( 1.0,  0.0,  0.2)
index 1 language = ( 0.0,  1.0,  0.1)
index 2 state    = ( 0.5,  0.5,  1.0)
index 3 action_0 = ( 0.8, -0.2,  0.3)  ← query
index 4 action_1 = (-0.4,  0.9, -0.6)  ← future clean label

干预后 action_1 = (8.0, -9.0, 7.0)
其余 token 是否改变：______`,
        expected: [
          "其余 token 都不变，因此 action_0 输出差异只能通过它是否读取 action_1 传播。",
          "prefix_length=3 表示前三个 token 是条件 prefix，后两个是动作位置。",
          "Toy 的 token 值没有物理含义，只为构造可检查的注意力信息流。",
        ],
        checkpoint:
          "写出 action_0 的 query index 和 future_action 的 key index；解释为什么 index 4 对自回归位置 3 属于未来。",
        troubleshooting: [
          "如果把 action_0 当输出标签而非输入位置，先区分 Transformer 序列位置与该位置要预测的目标；本 Toy 只隔离注意力读权限。",
          "若不知道 identity projection 含义：正常模型会乘 W_Q/W_K/W_V，本脚本等价于这些投影暂取单位映射。",
          "若误改多个 token，重新从 public 原文件复制工作副本。",
        ],
      },
      {
        title: "第 3 步：为 action_0 手算五个缩放点积分数",
        goal:
          "真正走一遍 q·k/√d_k。手算能暴露 softmax 是沿 key 维归一化、mask 在 softmax 前生效这些常被一句公式掩盖的细节。",
        actions: [
          "取 q=action_0=(0.8,-0.2,0.3)，d_k=3，所以缩放因子 √3≈1.732。",
          "逐个与五个 key 点乘。image 行示范为 0.8×1+(-0.2)×0+0.3×0.2=0.86，再除 √3 得约 0.4965。",
          "补完 language、state、self、future 四行；未 mask 前的近似分数应为 -0.0981、0.3464、0.4446、-0.3926。",
          "在 prefix-causal 下把 future 分数替换为 -∞；对前四个有限分数减最大值、取 exp、归一化。",
          "将权重与脚本预期 [0.2975,0.1641,0.2560,0.2824,0] 对照；允许手算四舍五入误差。",
        ],
        code: String.raw`q = (0.8,-0.2,0.3), √d_k = √3 ≈ 1.732

| key | dot(q,k) | scaled score | causal 是否允许 |
|---|---:|---:|---|
| image | 0.86 | 0.4965 | 是 |
| language | ______ | -0.0981 | 是 |
| state | ______ | 0.3464 | 是 |
| action_0 | ______ | 0.4446 | 是 |
| action_1 | ______ | -0.3926 → -∞ | 否 |

causal softmax weights ≈ [0.2975, 0.1641, 0.2560, 0.2824, 0]`,
        expected: [
          "点积依次约 0.86、-0.17、0.60、0.77、-0.68。",
          "mask 后 future 权重严格按构造为 0，其余四个权重和约为 1。",
          "除以 √d_k 控制点积尺度；softmax 必须沿 action_0 这个 query 所对应的全部 keys 归一化。",
        ],
        checkpoint:
          "不看代码回答 QK^T 的两个序列轴分别是什么；给定 Q:[B,h,Nq,d_k]、K:[B,h,Nk,d_k]，logits shape 是什么？",
        troubleshooting: [
          "若 language 点积是 +0.17，检查 q 第二维是 -0.2。",
          "若 softmax 权重和不为 1，确认只对有限分数归一化，禁止位置分子为 0。",
          "若先 softmax 再把 future 权重设 0，剩余权重和会小于 1；mask 应在 softmax 前加入分数。",
        ],
      },
      {
        title: "第 4 步：画出 prefix-causal、无 mask 与 action suffix 三张矩阵",
        goal:
          "理解‘谁能看谁’必须结合输入语义。双向 suffix 并非天然泄漏；只有把未来 clean target 暴露给早期预测时才是泄漏。",
        actions: [
          "在笔记建立 5×5 表格，行是 query、列是 key，允许写 1、禁止写 0。",
          "prefix-causal：前三个 prefix query 只能看前三个 prefix；action_0 看 prefix+自身；action_1 看 prefix+action_0+自身。",
          "no_mask：所有 25 格都为 1。",
          "action_suffix：prefix query 仍只看 prefix；两个 action slot 可以看所有 token。",
          "在第三张矩阵下写合法前提：action slots 的输入必须是噪声/潜变量等推理时也可得内容，而不是未来 clean action labels。",
        ],
        code: String.raw`prefix-causal（行=query，列=key；顺序 I,L,S,A0,A1）
      I L S A0 A1
I     1 1 1 0  0
L     1 1 1 0  0
S     1 1 1 0  0
A0    1 1 1 1  0
A1    1 1 1 1  1

请另画：
1. no_mask：________________
2. action_suffix：prefix 三行同上，A0/A1 两行应为 __________`,
        expected: [
          "no_mask 全为 1；action_suffix 的 A0 与 A1 两行都是 [1,1,1,1,1]。",
          "自回归 clean action token 要防未来标签；带噪联合 action suffix 可以双向交互，因为推理时同样从噪声/潜变量开始。",
          "仅看矩阵形状仍不够，必须问每个位置装的是 clean target、shifted token、noise 还是 latent slot。",
        ],
        checkpoint:
          "分别用一句话回答：什么时候 bidirectional suffix 合法？什么时候同一张 mask 会造成泄漏？",
        troubleshooting: [
          "如果 prefix 也能看 action suffix，回到脚本 action_suffix_mask：prefix query 的 key_index 必须小于 prefix_length。",
          "如果认为 causal 行不含自身，注意本脚本允许 key_index<=query_index；真实 next-token 训练还涉及标签 shift，需结合输入构造理解。",
          "如果三张图看起来一样，重点检查 A0→A1 这一格，它在 causal 为 0，在后两种为 1。",
        ],
      },
      {
        title: "第 5 步：逐函数阅读脚本，并预测干预结果",
        goal:
          "把手算映射回实现：dot、softmax、attend 和三种 mask 分别承担哪一步，测试又如何比较干预前后。",
        actions: [
          "按顺序阅读 dot、softmax、attend；为每个函数在笔记写输入、输出和一个错误门禁。",
          "在 softmax 中找到 subtract maximum 的数值稳定处理，以及 -inf 对应 numerator=0 的逻辑。",
          "在 attend 中找到 scores→weights→output；确认 output 是对 value token 每个维度加权求和。",
          "阅读 max_difference；它取两个输出向量各维绝对差的最大值。",
          "运行前预测：causal_delta=0；open_delta>0.1；suffix_delta>0.1。因为后两者允许 action_0 读取被改动的 action_1。",
        ],
        code: String.raw`| 函数 | 输入 | 输出 | 它防的错误 |
|---|---|---|---|
| dot | 两个同宽向量 | 标量点积 | width mismatch |
| softmax | 一行 scores | 权重列表 | 无可见 key / exp 溢出 |
| attend | tokens, query index, mask | output, weights | 空 hidden / width mismatch |
| max_difference | 两个输出向量 | 最大绝对差 | 用于干预比较 |

我的预测：causal_delta____；open_delta____；suffix_delta____。`,
        expected: [
          "你能指出 mask 在 attend 生成 score 时生效，而不是输出后补零。",
          "causal 对 future key 的 weight 为 0，因此 future value 无法贡献 action_0 输出。",
          "suffix 在当前 Toy 中会变化，因为它读到的是被当作 clean future label 的 action_1；NOTE 会说明这种输入语义不合法。",
        ],
        checkpoint:
          "解释为什么只检查 attention weights 不如‘改动 future clean label 后比较 earlier output’直接；后者验证了实际信息传播路径。",
        troubleshooting: [
          "若不理解 subtract maximum，任选 scores=[1000,1001]，比较直接 exp 与先减 1001 的数值范围。",
          "若认为 V 与 K 总是相同，记住只是本 Toy 的 identity projection；真实注意力用不同 W_K、W_V。",
          "若 max_difference 很大就一定性能差，这是错误外推；它只说明存在信息路径。",
        ],
      },
      {
        title: "第 6 步：运行基线，并逐行解释权重与 delta",
        goal:
          "用真实输出校验手算和信息流预测。只有每一行都能解释，PASS 才算完成。",
        actions: [
          "从项目根目录运行 python public/labs/attention_mask_leakage.py，并把全部输出粘到笔记。",
          "对照 causal weights 与第 3 步手算；action_1 权重必须为 0。",
          "观察 unmasked 和 action-suffix 的原始权重相同，因为对 action_0 query，这两种 mask 此时都允许五个 key。",
          "记录 future-label perturbation：causal=0.000000，unmasked 与 suffix 默认约 9.176557。",
          "用一句话解释最后 NOTE：suffix 双向只在 suffix 输入是 noisy/latent slots 时合法，不能把 future clean labels 偷塞进去。",
        ],
        code: String.raw`python public/labs/attention_mask_leakage.py

记录：
- causal weights: ______________________________
- unmasked action_1 weight: ____________________
- causal/open/suffix delta: ____________________
- PASS 的准确含义: ___________________________`,
        expected: [
          "默认输出 causal weights=[0.2975,0.1641,0.256,0.2824,0.0]。",
          "unmasked 与 suffix 的 future-label delta 默认约 9.176557，而 causal 为 0。",
          "准确结论是‘自回归 action_0 在该 mask 下不能读取 future clean action_1’，不是‘某 VLA 性能更好’。",
        ],
        checkpoint:
          "指出为什么 unmasked weights 和 suffix weights 在 action_0 这一行相同，但两种完整 mask 仍不是同一协议。",
        troubleshooting: [
          "若输出数值不同，确认原文件未被修改，并检查运行命令路径。",
          "若只看到最后 PASS，向上滚动保存完整权重；本章验收需要解释中间值。",
          "若 causal delta 显示 -0.0 或极小浮点值，关注断言阈值 <1e-12；当前默认应打印 0.000000。",
        ],
      },
      {
        title: "第 7 步：故意让 causal mask 泄漏，再由断言定位",
        goal:
          "亲手制造一个最常见的信息流 bug：较早动作位置读取未来 clean label。然后用测试失败位置确认自动化干预测试确实能抓住它。",
        actions: [
          "打开 learning-notes/attention_mask_leakage_work.py，找到 prefix_causal_mask 内 action query 的 return。",
          "把 return key_index < prefix_length or key_index <= query_index 临时改为 return True。不要改其他函数。",
          "运行 python learning-notes/attention_mask_leakage_work.py。预期在 causal_weights[future_action] < 1e-12 或 causal_delta < 1e-12 的断言处失败。",
          "记录：改动允许 A0→A1；因此 future token 权重非零，改变 clean future label 会改变 earlier output。",
          "从 public/labs 再复制干净脚本覆盖 work 副本，重新运行并确认 PASS。",
        ],
        code: String.raw`# 正确
return key_index < prefix_length or key_index <= query_index

# 故意制造泄漏
return True

python learning-notes/attention_mask_leakage_work.py`,
        expected: [
          "破坏后脚本不会打印最终 PASS，断言会定位未来 key 权重或输出 delta。",
          "恢复后 causal action_1 权重回到 0，causal delta 回到 0。",
          "你获得一条完整 bug 记录：mask 改动→信息路径→干预测试失败→恢复。",
        ],
        checkpoint:
          "不用‘因为 mask 错了’这种循环解释，写清 query=A0、key=A1、训练输入=future clean label、输出=A0 representation 四个角色。",
        troubleshooting: [
          "若破坏后仍 PASS，确认运行的是 work 副本，并搜索 prefix_causal_mask 是否真的返回 True。",
          "若语法错误，保证函数体仍有合法缩进；最安全是只替换 return 那一行。",
          "若恢复时担心覆盖笔记，只覆盖 .py 工作副本，不要覆盖 multimodal-transformer.md。",
        ],
      },
      {
        title: "第 8 步：从模型图还原一张实现审计卡",
        goal:
          "把 Toy 学到的检查方法迁移到真实 VLA 阅读：不追参数量，按输入编码、token 顺序、信息流、动作头、损失和部署解码逐项追踪。",
        actions: [
          "在笔记复制下面审计卡；先用本章 Toy 填一遍，确保每格都知道是什么意思。",
          "Toy 输入编码写 identity 3D vectors；顺序写 image→language→state→A0→A1；信息流分别记录三种 mask；动作接口标‘仅 attention 输出，无真实动作解码’。",
          "再选择课程正文中的 OpenVLA 或 π₀ 架构图填第二张卡。只填写正文或固定版本原始材料明确给出的字段；未知写 unknown。",
          "对自回归离散动作，检查 clean token 是否 shift 后因果可见；对连续生成式 suffix，检查输入是否 noisy/latent、目标是去噪还是 velocity。",
          "最后写一条不可推断项：仅凭 backbone 名称或 attention 图，不能推出闭环控制质量。",
        ],
        code: String.raw`### 架构实现审计卡
- 原始输入及物理时间：
- 每种输入如何编码/投影：
- token/slot 顺序与 modality/camera identity：
- padding mask 与信息流 mask：
- action position 的训练输入是什么：
- 预测目标与 loss：
- 动作输出类型、shape、frame、unit、dt：
- 推理时如何 decode / 反归一化 / 执行：
- 证据来源与固定版本：
- unknown / 暂无法验证：`,
        expected: [
          "Toy 卡能完整填写，同时明确它没有视觉编码器、训练或真实动作 head。",
          "真实模型卡不会用‘Transformer’三个字替代 token 顺序、mask 与动作接口。",
          "你能区分自回归 clean action token 和 noisy/latent continuous action suffix 的信息流要求。",
        ],
        checkpoint:
          "合上页面，按‘编码→顺序→mask→目标→decode→执行’六个词复述一个 VLA 数据流；任一环节 unknown 就明确说 unknown。",
        troubleshooting: [
          "如果架构图没有 mask，去方法/代码核对或写 unknown，不根据箭头方向猜。",
          "如果只找到模型输入输出而找不到动作 frame/unit/dt，说明论文模型接口与部署协议之间仍有缺口，不能自行补全。",
          "如果把 attention 可视化当因果证明，回到本章干预：权重图只显示内部相关，标签干预才直接检测这条泄漏路径。",
        ],
      },
    ],
    finalArtifact: [
      "learning-notes/multimodal-transformer.md：完整 tensor contract、token 顺序和三张 5×5 mask。",
      "action_0 对五个 keys 的点积、缩放分数与 causal softmax 手算。",
      "默认脚本完整输出，以及一次 causal 泄漏的主动破坏—断言—恢复记录。",
      "一张 Toy 与一张真实 VLA 的架构实现审计卡，unknown 字段明确保留。",
    ],
    verifiedBoundary:
      "【已确认】缩放点积注意力、softmax 前 mask 和当前脚本的干预测试可直接核对；默认 Toy 输出已在本机复现。【合理推测】真实 VLA 的错误相机身份、时间顺序或 mask 也会导致条件混淆和泄漏，但影响大小依系统而异。【个人观点】先 contract、再手算、后破坏是本教程建议的学习节奏。【暂无法验证】该五-token、单头、identity-projection 脚本没有训练视觉编码器或机器人策略，不能比较真实架构性能，也不能证明某种 mask 会提高你的任务成功率。",
    knowledgeCheck: [
      {
        question: "为什么 attention logits 要除以 √d_k，softmax 又沿哪个维度？",
        answer:
          "当各维点积累加时，分数尺度会随 d_k 增大；除以 √d_k 有助于控制尺度、避免 softmax 过早饱和。对每个 query，softmax 沿所有 key 的维度归一化，因此该行权重和为 1。",
      },
      {
        question: "prefix-causal 中 action_0 可以读取哪些 token？",
        answer:
          "在本章顺序中，它可读 image、language、state 三个 prefix token 和自身 action_0，不能读未来 action_1。具体 next-token 训练还要结合标签 shift 检查。",
      },
      {
        question: "为什么 bidirectional action suffix 有时合法、有时泄漏？",
        answer:
          "如果 suffix 输入是推理时同样可得的噪声或潜变量，slot 间双向通信可用于联合去噪/velocity 预测；若 suffix 直接包含未来 clean action label，较早位置就能偷看训练答案，造成泄漏。",
      },
      {
        question: "为什么交换 base 与 wrist 相机顺序可能 shape 完全正确却语义错误？",
        answer:
          "两路图像可能具有相同 shape，但训练时 token 位置、camera identity 和视角语义已绑定固定顺序。推理时互换而不更新身份会违反输入协议，模型可能把腕部视角当基座视角。",
      },
      {
        question: "本章 future-label 干预测试究竟证明了什么？",
        answer:
          "它证明在当前 Toy 中，prefix-causal 阻断了 action_0 对 future clean action_1 的信息路径，而 unmasked/suffix 允许该路径。它不证明任何真实 VLA 的任务性能或训练质量。",
      },
    ],
  },
} satisfies Record<string, LessonWalkthrough>;
