import katex from "katex";

type SymbolNote = { symbol: string; meaning: string };

export function MathFormula({
  latex,
  symbols,
}: {
  latex: string;
  symbols: SymbolNote[];
}) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: true,
    strict: "warn",
  });

  return (
    <figure className="math-card">
      <div className="math-expression" dangerouslySetInnerHTML={{ __html: html }} />
      <figcaption className="symbol-list">
        {symbols.map((item) => (
          <div className="symbol-item" key={item.symbol}>
            <code>{item.symbol}</code>
            <span>{item.meaning}</span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
