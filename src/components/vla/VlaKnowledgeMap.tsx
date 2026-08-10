import Link from "next/link";
import { modules, studyGuidance } from "@/lib/course";
import { courseBands, courseSpine, runningExample } from "@/lib/courseSpine";

export function VlaKnowledgeMap() {
  const bySlug = new Map(modules.map((item) => [item.slug, item]));
  return (
    <section className="vla-map" aria-labelledby="vla-map-title">
      <div className="vla-map-head">
        <div><p className="eyebrow">Theory rail × practice rail</p><h2 id="vla-map-title">六段信号轨，把教材和实践接在一起。</h2></div>
        <p>每个节点同时标明学习深度和产出。上一章交付的合同、数据或模型，会成为下一章的输入；专题章建立索引，工程章负责把累计产物交付出去。</p>
      </div>
      <article className="vla-running-case">
        <div><span>贯穿案例</span><h3>{runningExample.title}</h3><p>{runningExample.task}</p></div>
        <ul><li>{runningExample.observation}</li><li>{runningExample.action}</li><li>{runningExample.execution}</li></ul>
        <small>{runningExample.boundary}</small>
      </article>
      <div className="vla-map-bands">
        {courseBands.map((band) => (
          <section className="vla-map-band" key={band.id}>
            <header><span>PHASE {band.id}</span><div><h3>{band.title}</h3><p>{band.note}</p></div></header>
            <div className="vla-map-nodes">
              {band.slugs.map((slug) => {
                const item = bySlug.get(slug);
                if (!item) return null;
                const guidance = studyGuidance[item.level];
                const spine = courseSpine[slug];
                return (
                  <Link className={`vla-map-node ${guidance.tone}`} href={`/learning/vla/${item.slug}`} key={item.slug}>
                    <span className="vla-node-meta"><b>{String(item.index).padStart(2, "0")} · {spine.role}</b><i>{guidance.label}</i></span>
                    <strong>{item.title}</strong>
                    <small>产出：{spine.contributes}</small>
                    <em aria-hidden="true">→</em>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
