import Link from "next/link";
import type { LessonWalkthrough } from "@/lib/lessonWalkthroughTypes";

type GuidedWalkthroughProps = {
  walkthrough: LessonWalkthrough;
  status: string;
};

export function GuidedWalkthrough({ walkthrough, status }: GuidedWalkthroughProps) {
  return (
    <div className="guided-walkthrough">
      <div className="walkthrough-intro">
        <div>
          <span className="walkthrough-kicker">跟做模式</span>
          <h3>不要先读完再动手：从第 1 步开始</h3>
        </div>
        <span className={`status-pill status-${status}`}>
          {status === "已验证" ? "本地 Toy 脚本已验证" : status}
        </span>
        <p>{walkthrough.intro}</p>
      </div>

      <div className="walkthrough-preflight">
        <strong>开始前，把下面几项逐一确认</strong>
        <ul>
          {walkthrough.beforeYouStart.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="walkthrough-materials">还没有本地脚本？前往 <Link href="/learning/vla/labs">实操工坊</Link> 查看对应章节、下载文件和基准输出。</p>
      </div>

      <div className="walkthrough-steps">
        {walkthrough.steps.map((step, index) => (
          <article className="walkthrough-step" id={`practice-step-${index + 1}`} key={step.title}>
            <header>
              <span className="walkthrough-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="walkthrough-label">第 {index + 1} 步</span>
                <h3>{step.title}</h3>
              </div>
            </header>

            <div className="walkthrough-goal">
              <strong>为什么先做这一步</strong>
              <p>{step.goal}</p>
            </div>

            <div className="walkthrough-actions">
              <h4>现在照着做</h4>
              <ol>
                {step.actions.map((action) => <li key={action}>{action}</li>)}
              </ol>
            </div>

            {step.code && (
              <div className="code-card walkthrough-code">
                <div className="code-head"><span>复制或对照输入</span><span>step {index + 1}</span></div>
                <pre><code>{step.code}</code></pre>
              </div>
            )}

            <div className="walkthrough-result">
              <h4>你应该看到什么，以及它说明什么</h4>
              <ul>
                {step.expected.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="walkthrough-checkpoint">
              <span>通过后再继续</span>
              <p>{step.checkpoint}</p>
            </div>

            <details className="walkthrough-help">
              <summary>如果结果不同，按这里排查</summary>
              <ul>
                {step.troubleshooting.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </details>
          </article>
        ))}
      </div>

      <div className="walkthrough-finish">
        <div>
          <span className="walkthrough-kicker">本章交付物</span>
          <h3>做到这里，你手里应该真正留下这些东西</h3>
        </div>
        <ul>
          {walkthrough.finalArtifact.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p><strong>验证边界：</strong>{walkthrough.verifiedBoundary}</p>
      </div>
    </div>
  );
}
