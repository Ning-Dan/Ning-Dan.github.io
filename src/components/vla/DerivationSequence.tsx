import katex from "katex";
import type { LessonDerivation } from "@/lib/lessonContent";

function DerivationFormula({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, { displayMode: true, throwOnError: true, strict: "warn" });
  return <div className="derivation-formula" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function DerivationSequence({ derivations }: { derivations: LessonDerivation[] }) {
  return (
    <div className="derivation-list">
      {derivations.map((derivation, derivationIndex) => (
        <article className="derivation-card" key={derivation.title}>
          <header>
            <span>必须推导 {String(derivationIndex + 1).padStart(2, "0")}</span>
            <h3>{derivation.title}</h3>
            <p>{derivation.question}</p>
          </header>
          <ol className="derivation-steps">
            {derivation.steps.map((step, stepIndex) => (
              <li key={step.label}>
                <div className="derivation-step-head"><span>{stepIndex + 1}</span><strong>{step.label}</strong></div>
                <DerivationFormula latex={step.latex} />
                <p>{step.explanation}</p>
              </li>
            ))}
          </ol>
          <div className="worked-example">
            <span>在贯穿案例上手算</span>
            <h4>{derivation.workedExample.title}</h4>
            <p>{derivation.workedExample.setup}</p>
            <ul>{derivation.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ul>
            <strong>结果：{derivation.workedExample.result}</strong>
          </div>
          <div className="implementation-bridge"><strong>映射到实现</strong><p>{derivation.implementation}</p></div>
        </article>
      ))}
    </div>
  );
}
