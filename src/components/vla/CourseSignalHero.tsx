import Link from "next/link";
import { runningExample } from "@/lib/courseSpine";

const signalNodes = [
  { code: "Oₜ", title: "双相机观测", detail: "K = 2" },
  { code: "πθ", title: "语言条件策略", detail: "RGB + qₜ + ℓ" },
  { code: "A", title: "动作块", detail: "16 × 7" },
  { code: "uₜ", title: "安全执行", detail: "20 Hz" },
] as const;

export function CourseSignalHero() {
  return (
    <section className="container vla-signal-hero" aria-labelledby="vla-course-title">
      <div className="vla-signal-copy">
        <p className="eyebrow">VLA field manual · 18 modules</p>
        <h1 id="vla-course-title">把模型原理，接成一条可执行的机器人链路。</h1>
        <p>
          以同一个语言驱动抓取任务贯穿全课程。每一章先解释机制和推导，再用最小实验制造反例，最后把可验收产物交给下一章。
        </p>
        <div className="cta-row">
          <Link className="button" href="/learning/vla/control-to-vla">从第 0 章开始 <span aria-hidden="true">→</span></Link>
          <Link className="button secondary" href="/learning/vla/labs">打开 13 个实验</Link>
          <Link className="text-link" href="/learning/vla/guide">先看学习合同</Link>
        </div>
      </div>

      <figure className="signal-console" aria-label="贯穿课程的观测、策略、动作块与安全执行信号链">
        <figcaption>
          <span>RUNNING CONTRACT / VLA–CTRL–01</span>
          <i>TEACHING TRACE</i>
        </figcaption>
        <div className="signal-scope" aria-hidden="true">
          <svg viewBox="0 0 640 124" role="presentation">
            <path className="signal-gridline" d="M0 62H640" />
            <path className="signal-trace" pathLength="1" d="M0 82H74L108 38L142 82H214L245 52L278 82H357L390 29L425 82H502L535 55L570 82H640" />
            <circle className="signal-pulse" cx="0" cy="82" r="6" />
          </svg>
        </div>
        <div className="signal-nodes">
          {signalNodes.map((node, index) => (
            <div className="signal-node" key={node.title}>
              <span>{node.code}</span>
              <strong>{node.title}</strong>
              <small>{node.detail}</small>
              {index < signalNodes.length - 1 && <i aria-hidden="true">→</i>}
            </div>
          ))}
        </div>
        <div className="signal-contract">
          <span>任务</span>
          <p>{runningExample.task}</p>
        </div>
        <div className="signal-readout">
          <span><b>K = 2</b> 观测窗口</span>
          <span><b>H = 16</b> 预测时域</span>
          <span><b>E = 4</b> 重规划步长</span>
          <span><b>Δt = 50 ms</b> 动作周期</span>
        </div>
      </figure>
    </section>
  );
}
