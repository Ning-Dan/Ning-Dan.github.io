function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="diagram-caption">{children}</figcaption>;
}

type VisualType = "pipeline" | "history" | "bc" | "transformer" | "action" | "act" | "diffusion" | "flow" | "pi05" | "data" | "families" | "world" | "latency" | "math" | "post-training" | "whole-body" | "capstone";

function ConceptFlow({ items }: { items: { kicker: string; title: string; note: string }[] }) {
  return <div className="concept-flow">{items.map((item) => <div key={item.title}><span>{item.kicker}</span><strong>{item.title}</strong><small>{item.note}</small></div>)}</div>;
}

export function LessonVisual({ type }: { type?: VisualType }) {
  if (!type) return null;

  if (type === "history") {
    const events = [
      ["2022", "RT-1", "多任务机器人 Transformer"], ["2023", "RT-2", "VLM 知识 → 动作 token"],
      ["2023", "RT-X", "100万+ 跨本体轨迹"], ["2024", "OpenVLA / π₀", "开源 / 连续 flow 动作"],
      ["2025", "π₀.₅ / OFT / RTC", "开放场景、精度与实时"], ["2026", "RL + World Model", "失败数据、未来预测、自改进"],
    ];
    return <figure className="diagram"><div className="timeline">{events.map(([year, title, note]) => <div className="timeline-event" key={`${year}-${title}`}><span>{year}</span><strong>{title}</strong><small>{note}</small></div>)}</div><Caption>图 1-1 · VLA 主线转折。ACT、Diffusion Policy 是重要前史，但通常没有语言/VLM，不应全部回溯命名为 VLA。</Caption></figure>;
  }

  if (type === "math") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "SUPERVISED", title: "Likelihood → NLL", note: "高斯得到 MSE；分类得到 CE" }, { kicker: "LATENT", title: "ELBO = recon + KL", note: "ACT/CVAE 的训练—推理桥梁" }, { kicker: "DECISION", title: "Reward → Advantage", note: "后训练的相对改进信号" }, { kicker: "GENERATION", title: "Noise → ODE / denoise", note: "Diffusion 与 flow 的时间约定" }]} /><Caption>数学不是四套孤立公式：同一个条件 x 先决定监督似然，再扩展潜变量、决策反馈和连续生成。每个箭头都要附 shape、unit 与假设。</Caption></figure>;
  }

  if (type === "act") {
    return <figure className="diagram"><div className="train-infer"><div><span>TRAIN ONLY</span><strong>真实动作块 + q → style encoder → z</strong><small>近似后验 qφ(z|q,A)，参与 reconstruction + KL</small></div><div><span>TRAIN + INFER</span><strong>图像 + q + z → Transformer → H×dₐ</strong><small>推理没有未来真实动作；按 checkpoint 约定使用 z</small></div><div><span>EXECUTION</span><strong>时间对齐 → temporal ensemble → safety</strong><small>融合的是指向同一物理执行时刻的重叠预测</small></div></div><Caption>ACT 的三段信息边界。把训练期真实动作带到推理，或按数组索引融合晚到 chunk，都会产生不可部署的数据泄漏/时序错误。</Caption></figure>;
  }

  if (type === "bc") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "DEMO", title: "专家轨迹 D₀", note: "只覆盖专家访问的状态" }, { kicker: "TRAIN", title: "NLL / MSE / CE", note: "拟合 πθ(a|o,ℓ)，不等于闭环成功" }, { kicker: "ROLLOUT", title: "策略访问新状态", note: "小误差累积形成 covariate shift" }, { kicker: "AGGREGATE", title: "纠错 / DAgger", note: "标注失败状态并聚合旧数据" }]} /><Caption>BC 的闭环问题：训练分布由专家产生，部署分布由策略自己产生。验证 loss 只能检查专家状态上的拟合，rollout 才暴露累积偏移。</Caption></figure>;
  }

  if (type === "transformer") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "VISION", title: "Patch tokens", note: "相机、时间和位置身份" }, { kicker: "LANGUAGE", title: "Instruction tokens", note: "目标与语义条件" }, { kicker: "PROPRIO", title: "State tokens", note: "q、gripper、base 与历史" }, { kicker: "MASK", title: "Action queries / suffix", note: "信息流由 attention mask 决定" }]} /><Caption>“把模态拼起来”还不够：token 身份、位置编码、时间和注意力 mask 决定谁能看到谁。训练期 action 泄漏通常不会造成 shape 报错。</Caption></figure>;
  }

  if (type === "diffusion") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "DATA", title: "动作块 A⁰", note: "条件于视觉、语言与状态" }, { kicker: "FORWARD", title: "逐步加噪 Aᵗ", note: "训练可直接采任意噪声步" }, { kicker: "LEARN", title: "预测 ε / x₀ / v", note: "参数化必须与 scheduler 配套" }, { kicker: "SAMPLE", title: "噪声 → 动作", note: "多步反向生成并过 safety" }]} /><Caption>训练和采样不是同一循环：训练随机抽噪声步拟合目标，部署从噪声反复更新到动作。scheduler、目标参数化和时间索引必须成套。</Caption></figure>;
  }

  if (type === "flow") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "t=0", title: "Noise x₀", note: "先声明正/反时间约定" }, { kicker: "PATH", title: "xₜ=(1−t)x₀+tx₁", note: "条件路径给出监督速度" }, { kicker: "FIELD", title: "vθ(xₜ,t,c)", note: "学习条件速度场" }, { kicker: "t=1", title: "Action x₁", note: "Euler/ODE solver 积分终点" }]} /><Caption>Flow matching 学的是路径上的速度，而不是直接回归终点。训练路径、速度符号与推理积分方向不一致时，loss 仍可能下降但采样会反向。</Caption></figure>;
  }

  if (type === "data") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "RECORD", title: "Episode + timestamps", note: "观测、动作、语言和终止原因" }, { kicker: "AUDIT", title: "Split / schema / replay", note: "episode 级隔离，train-only stats" }, { kicker: "ADAPT", title: "ACT / LoRA / OFT", note: "同一物理 action contract" }, { kicker: "EVAL", title: "Rollout failure tree", note: "成功率、区间、延迟和失败归因" }]} /><Caption>数据工程不是“转成某个格式”就结束。每个箭头都要留下 revision 和可重放产物，才能区分模型、adapter、执行器和 evaluator。</Caption></figure>;
  }

  if (type === "families") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "GATE", title: "硬约束", note: "开源、显存、OS、频率与本体" }, { kicker: "REPRESENT", title: "动作范式", note: "离散 AR / chunk / diffusion / flow" }, { kicker: "ADAPT", title: "数据与微调", note: "真实可运行的版本和预算" }, { kicker: "SMOKE", title: "同协议比较", note: "固定输入、延迟和 rollout" }]} /><Caption>模型选型不是排行榜：先用硬约束淘汰不可运行候选，再在统一数据、动作接口、安全层和评测协议下比较。</Caption></figure>;
  }

  if (type === "capstone") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "M0–M1", title: "Spec + data gate", note: "任务、schema、split、norm、replay" }, { kicker: "M2–M3", title: "ACT + VLA", note: "同一接口、保存重载、小样本检查" }, { kicker: "M4–M5", title: "Rollout + ablation", note: "分层统计和单变量因果检查" }, { kicker: "M6 / R", title: "Reproduce + real gate", note: "失败树、复现、可选真机安全灰度" }]} /><Caption>毕业项目按产出和门禁推进。某个模型成功率高不是完整交付；缺少数据审计、统一接口、失败日志或复现都不合格。</Caption></figure>;
  }

  if (type === "post-training") {
    return <figure className="diagram"><ConceptFlow items={[{ kicker: "GATE 1", title: "修 pipeline + SFT", note: "先让基础策略产生非零能力" }, { kicker: "GATE 2", title: "Correction / DAgger", note: "访问失败状态，记录人工接管" }, { kicker: "GATE 3", title: "Reward audit", note: "终局、进度或偏好都可能误判" }, { kicker: "GATE 4", title: "Offline / Online RL", note: "只有安全 rollout 与回退齐备才开放" }]} /><Caption>后训练按风险逐级开门，而不是按算法新旧排序。任一 Gate 没有证据时，停在前一层就是正确工程结论。</Caption></figure>;
  }

  if (type === "whole-body") {
    return <figure className="diagram"><div className="whole-body-stack"><div className="whole-sensors"><span>多相机 + state + 语言</span><small>每源 measurement_time / valid mask</small></div><div className="whole-policy"><strong>π₀.₅ policy</strong><small>Thor 原生 / TensorRT / 远端 server 三选一</small></div><div className="whole-contract"><span>left arm</span><span>right arm</span><span>waist ×2</span><span>base</span><span>grippers</span></div><div className="whole-safety"><strong>独立安全与 mode gate</strong><small>navigate · stabilize · manipulate · recover</small></div></div><Caption>全身部署的关键不是把向量加长，而是用命名 slice、mode、frame、unit、dt、mask 和时间戳把异构子系统接到同一策略接口；模型输出永远先过独立安全层。</Caption></figure>;
  }

  if (type === "action") {
    return <figure className="diagram"><div className="compare-flow"><div><span className="visual-kicker">DISCRETE</span><strong>分位数 → Bins</strong><small>简单；量化误差与长 token 序列</small></div><div><span className="visual-kicker">COMPRESSED</span><strong>DCT → FAST → BPE</strong><small>利用时间稀疏；训练更快</small></div><div><span className="visual-kicker">CONTINUOUS</span><strong>Noise → Diffusion / Flow</strong><small>精细、多峰；需要多步生成</small></div></div><Caption>图 4-1 · 三类动作表示不是“版本高低”，而是训练简洁、序列长度、连续精度与推理成本的不同折中。</Caption></figure>;
  }

  if (type === "pi05") {
    return <figure className="diagram"><div className="pi05-flow"><div className="pi-input"><span>视觉 + 状态</span><span>“整理卧室”</span></div><div className="pi-core"><strong>π₀.₅</strong><small>共享预训练 VLA</small></div><div className="pi-branches"><div><span>离散语言路径</span><strong>“拿起枕头”</strong></div><div><span>连续 Flow Expert</span><strong>50-step action chunk</strong></div></div></div><Caption>图 8-1 · 论文中的高层/低层同模路径。注意：当前 openpi 公开实现仅支持 π₀.₅ 的 flow-matching head，不能宣称完整复现混合高层路径。</Caption></figure>;
  }

  if (type === "world") {
    return <figure className="diagram"><div className="world-loop"><div><span className="visual-kicker">PROPOSER</span><strong>VLA</strong><small>采样候选动作块</small></div><div><span className="visual-kicker">PREDICTOR</span><strong>World Model</strong><small>想象未来 zₜ₊₁:ₜ₊H</small></div><div><span className="visual-kicker">EVALUATOR</span><strong>Value / Cost</strong><small>目标、碰撞、不确定性</small></div><div><span className="visual-kicker">EXECUTOR</span><strong>MPC / Controller</strong><small>执行前 E 步并重规划</small></div></div><Caption>图 11-1 · VLA 回答“做什么”，世界模型回答“会怎样”。这是 sampling-based MPC 风格组合；world-model bias 必须用不确定性和真实反馈约束。</Caption></figure>;
  }

  if (type === "latency") {
    return <figure className="diagram"><div className="latency-stack"><div><span>Sensor</span><i style={{ width: "18%" }} /></div><div><span>Network</span><i style={{ width: "31%" }} /></div><div><span>GPU inference</span><i style={{ width: "58%" }} /></div><div><span>Action queue</span><i style={{ width: "82%" }} /></div><div><span>Servo loop</span><i style={{ width: "96%" }} /></div></div><Caption>图 · 异步执行瀑布。新 chunk 到达时前缀可能已经过期；按 observation_time、dt 与当前时刻跳过，而不是从索引 0 重放。</Caption></figure>;
  }

  return <figure className="diagram"><div className="pipeline"><div className="pipeline-block"><strong>观测 + 指令</strong><span>images, q, language</span></div><div className="pipeline-block"><strong>VLA 策略</strong><span>condition → action chunk</span></div><div className="pipeline-block"><strong>安全与执行层</strong><span>frame, IK, limits, guard</span></div><div className="pipeline-block"><strong>低层闭环</strong><span>position / velocity / torque</span></div></div><Caption>图 0-1 · 推荐工程边界。VLA 生成任务相关参考，不绕过碰撞、关节限制和高频反馈控制。</Caption></figure>;
}
