function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="diagram-caption">{children}</figcaption>;
}

export function LessonVisual({ type }: { type?: "pipeline" | "history" | "action" | "pi05" | "world" | "latency" }) {
  if (!type) return null;

  if (type === "history") {
    const events = [
      ["2022", "RT-1", "多任务机器人 Transformer"], ["2023", "RT-2", "VLM 知识 → 动作 token"],
      ["2023", "RT-X", "100万+ 跨本体轨迹"], ["2024", "OpenVLA / π₀", "开源 / 连续 flow 动作"],
      ["2025", "π₀.₅ / OFT / RTC", "开放场景、精度与实时"], ["2026", "RL + World Model", "失败数据、未来预测、自改进"],
    ];
    return <figure className="diagram"><div className="timeline">{events.map(([year, title, note]) => <div className="timeline-event" key={`${year}-${title}`}><span>{year}</span><strong>{title}</strong><small>{note}</small></div>)}</div><Caption>图 1-1 · VLA 主线转折。ACT、Diffusion Policy 是重要前史，但通常没有语言/VLM，不应全部回溯命名为 VLA。</Caption></figure>;
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
