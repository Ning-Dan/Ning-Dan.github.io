import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VLA 实操工坊",
  description: "VLA 课程中已在本机执行验证的最小实验、对应章节、运行命令与验证边界。",
};

const verifiedLabs = [
  {
    id: "L0-1",
    title: "Behavior Cloning 与 DAgger",
    lesson: "模仿学习与 Behavior Cloning",
    lessonHref: "/learning/vla/behavior-cloning/",
    file: "toy_behavior_cloning.py",
    command: "python public/labs/toy_behavior_cloning.py",
    goal: "完成监督 BC、语言条件消融、checkpoint 重载、闭环 covariate shift、一次 Toy DAgger 与多峰均值实验。",
    expected: "四组检查全部 PASS；默认 Toy 中闭环成功为 0/6→6/6，且明确该数字不能外推真机。",
    boundary: "线性策略与一维闭环，不包含图像网络、真实专家标注成本或机器人安全验证。",
  },
  {
    id: "L0-2",
    title: "Attention Mask 泄漏",
    lesson: "多模态 Transformer",
    lessonHref: "/learning/vla/multimodal-transformer/",
    file: "attention_mask_leakage.py",
    command: "python public/labs/attention_mask_leakage.py",
    goal: "比较 prefix-causal、无 mask 和 bidirectional action suffix，验证干净未来动作标签不能泄漏给自回归 token。",
    expected: "future-label perturbation 在 causal 路径为 0；无 mask/suffix 路径会响应未来标签，并打印 PASS。",
    boundary: "手写小矩阵只验证信息流；合法的 noisy/latent suffix 不等于泄漏干净标签。",
  },
  {
    id: "L0-3",
    title: "7D Action Tokenizer",
    lesson: "动作表示与跨本体归一化",
    lessonHref: "/learning/vla/action-representations/",
    file: "action_tokenizer.py",
    command: "python public/labs/action_tokenizer.py",
    goal: "验证 7D action contract、q01/q99 分箱、active/inactive 维、中心解码、clip 计数、metadata 和 NaN 拒绝。",
    expected: "默认 token 最后一维为 -1，最大 active round-trip 误差约 0.006102，全部检查 PASS。",
    boundary: "统计来自合成动作；真实 frame、unit、gripper polarity 与控制器兼容性仍需机器人端核验。",
  },
  {
    id: "L0-4",
    title: "带 TTL 的 Chunk Controller",
    lesson: "Action Chunking 与闭环执行",
    lessonHref: "/learning/vla/action-chunking/",
    file: "chunked_controller.py",
    command: "python public/labs/chunked_controller.py",
    goal: "模拟 observation_time、网络延迟、p99 reserve、乱序拒绝、TTL、动作限幅与 controlled stop。",
    expected: "默认 p99=220ms、reserve=5；过期后 hold，旧 chunk 被拒绝，NaN 检查 PASS。",
    boundary: "确定性一维模拟，不代表真实时钟同步、伺服器、碰撞保护或急停已经通过认证。",
  },
  {
    id: "L0-5",
    title: "Diffusion 多峰动作",
    lesson: "Diffusion Policy",
    lessonHref: "/learning/vla/diffusion-policy/",
    file: "diffusion_multimodal_1d.py",
    command: "python public/labs/diffusion_multimodal_1d.py",
    goal: "训练最小一维 denoiser，对比单峰 MSE 条件均值与 diffusion 双模式采样。",
    expected: "采样同时覆盖正负模式、中央模式计数为 0，并打印多峰检查 PASS。",
    boundary: "只证明一维合成分布的多峰采样，不证明图像条件、轨迹质量或机器人成功率。",
  },
  {
    id: "L0-6",
    title: "Conditional Flow Matching",
    lesson: "Flow Matching 与 π₀",
    lessonHref: "/learning/vla/flow-matching/",
    file: "flow_matching_1d.py",
    command: "python public/labs/flow_matching_1d.py",
    goal: "训练 vθ(x,τ,condition)，再用正时间与 openpi-style 反时间 Euler solver 完成条件 transport。",
    expected: "held-out velocity MSE 从 4 降至约 0；正反约定到同一终点，错误符号被单测抓住。",
    boundary: "条件平移 Toy 的真速度非常简单，不代表 π₀ action expert、视觉 backbone 或真机表现。",
  },
  {
    id: "L0-7",
    title: "Robot Dataset Audit",
    lesson: "数据工程、微调与后训练",
    lessonHref: "/learning/vla/data-and-adaptation/",
    file: "audit_robot_dataset.py",
    command: "python public/labs/audit_robot_dataset.py --demo",
    goal: "审计 episode split、state/action shape、finite、训练集统计和 normalization round-trip；可注入 split/NaN 错误。",
    expected: "默认 demo 报告 6 个 episodes、train/val/test=4/1/1、round-trip 误差接近 0，并打印 AUDIT PASS。",
    boundary: "demo 是合成 schema；用于真实数据时必须通过 --input 指向导出的审计文件并检查 action contract。",
  },
  {
    id: "L0-8",
    title: "World Model Candidate Reranking",
    lesson: "World Models 与 VLA 组合",
    lessonHref: "/learning/vla/world-models/",
    file: "world_model_reranking.py",
    command: "python public/labs/world_model_reranking.py",
    goal: "在有限 VLA 候选集内按预测 cost/uncertainty 重排，并复现无约束优化利用 OOD world-model 漏洞。",
    expected: "有限候选预测/真实终点均为 1；无约束搜索中模型预测约 1、真实约 5.418，检查 PASS。",
    boundary: "world-model ensemble 是手工构造而非训练；实验只解释机制，不证明真实重排收益。",
  },
  {
    id: "L0-9",
    title: "Policy Service 故障注入",
    lesson: "前沿方向与实时部署",
    lessonHref: "/learning/vla/frontier-and-deployment/",
    file: "policy_service_fault_injection.py",
    command: "python public/labs/policy_service_fault_injection.py",
    goal: "验证策略服务 schema、p99 reserve、限幅、旧请求拒绝、watchdog 和动作 TTL 降级路径。",
    expected: "默认 inference p99=190ms、network p99=55ms、reserve=6；schema/stale/watchdog/TTL 故障均被捕获。",
    boundary: "离散事件 Toy 只验证协议与降级逻辑，不是实时控制器、碰撞检测器或功能安全认证。",
  },
  { id: "L0-10", title: "VLA 数学地基", lesson: "VLA 数学地基", lessonHref: "/learning/vla/math-foundations/", file: "vla_math_foundations.py", command: "python public/labs/vla_math_foundations.py", goal: "核对高斯 NLL、KL、return/advantage、数值差分与 flow Euler 方向。", expected: "打印五组确定性检查并以 MATH CHECKS PASS 结束。", boundary: "只验证算术与符号方向，不验证神经网络训练或真实策略效果。" },
  { id: "L0-11", title: "ACT CVAE 与 Temporal Ensemble", lesson: "ACT 与 CVAE", lessonHref: "/learning/vla/act-cvae/", file: "act_cvae_mechanics.py", command: "python public/labs/act_cvae_mechanics.py", goal: "手算重参数化/KL，按物理执行时刻融合重叠动作块，并对照官方候选顺序与年龄衰减两种权重 convention。", expected: "输出三个候选、两组指数权重/融合动作，以及 valid/full-mean L1 和 masked MSE，最后 ACT MECHANICS PASS。", boundary: "只核对 CVAE、mask 与融合算术；没有训练图像 Transformer，也不声明真实任务成功率。" },
  { id: "L0-12", title: "Group-relative 后训练", lesson: "VLA 后训练与数据闭环", lessonHref: "/learning/vla/post-training/", file: "post_training_group_rl.py", command: "python public/labs/post_training_group_rl.py", goal: "比较混合成功组与全失败组的相对 advantage，并核对 clipped objective。", expected: "混合组产生正负 advantage，全失败组为零信号，最后 POST-TRAINING TOY PASS。", boundary: "二元 reward 算术示例，不声明可直接用于任意 flow/diffusion VLA。" },
  { id: "L0-13", title: "Whole-body Action Contract", lesson: "π₀.₅ × Thor 双臂移动机器人部署", lessonHref: "/learning/vla/mobile-dual-arm-pi-deployment/", file: "whole_body_action_contract.py", command: "python public/labs/whole_body_action_contract.py", goal: "验证双臂、夹爪、2-DOF 腰部与底盘的命名 slice、mode mask、pad-to-32、round-trip 和 NaN 拒绝。", expected: "默认示例 active_dim=20、pad_dim=32，base 在 manipulate mode 关闭，并打印 WHOLE-BODY CONTRACT PASS。", boundary: "DOF、底盘语义、limits 和统计全是教学示例；必须由实际 robot_io.csv 替换。" },
];

export default function LabsPage() {
  return (
    <div className="site-shell container">
      <section className="page-hero">
        <p className="eyebrow">Verified local labs</p>
        <h1 className="page-title">每个核心机制，都要有可运行的反例与验收</h1>
        <p className="page-intro">
          下列 13 个实验已在当前项目中实际执行。点击章节先读原理，复制命令在项目根目录运行，下载按钮用于单独查看脚本。所有结果都只证明对应 Toy 机制，不代表真实机器人成功率。
        </p>
      </section>

      <section className="lesson-section" style={{ paddingBottom: 24 }}>
        <div className="insight">
          <strong>统一运行环境</strong>
          <span>Python 3.10+；脚本仅使用标准库。建议先完整运行默认配置，再按对应章节的步骤故意注入错误。命令中的路径以项目根目录为起点。</span>
        </div>
      </section>

      <section className="track-grid" style={{ paddingBottom: 56 }}>
        {verifiedLabs.map((lab) => (
          <article className="track-card" key={lab.id}>
            <span className="track-number">{lab.id} · 本地已验证</span>
            <h3>{lab.title}</h3>
            <p><strong>目标：</strong>{lab.goal}</p>
            <p><strong>预期：</strong>{lab.expected}</p>
            <p><strong>Toy 边界：</strong>{lab.boundary}</p>
            <p style={{ marginTop: 14 }}>
              <code style={{ overflowWrap: "anywhere" }}>{lab.command}</code>
            </p>
            <div className="cta-row" style={{ marginTop: 16 }}>
              <a className="button secondary" href={lab.lessonHref}>对应章节：{lab.lesson}</a>
              <a className="button secondary" href={`/labs/${lab.file}`} download>下载脚本</a>
            </div>
          </article>
        ))}
      </section>

      <section className="lesson-section" style={{ maxWidth: 860, paddingBottom: 96 }}>
        <h2>“脚本通过”具体意味着什么？</h2>
        <p>
          它意味着公式方向、数据 shape、边界检查或失败机制在这个最小环境中可复现；不意味着模型已经处理真实图像、适配你的机器人、达到论文成功率或满足功能安全。进入 LeRobot、SmolVLA、openpi 或真机之前，仍需固定版本、审计数据、核对 action contract，并使用同协议 rollout。
        </p>
        <div className="insight">
          <strong>结果报告规则</strong>
          <span>保留完整命令和输出；把“本地 Toy 已验证”“官方报告”“合理推测”“真实系统暂未验证”分开书写。只截最后一行 PASS 不算完成实验。</span>
        </div>
      </section>
    </div>
  );
}
