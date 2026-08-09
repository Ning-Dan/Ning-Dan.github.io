import Link from "next/link";
import { modules, studyGuidance } from "@/lib/course";

const bands = [
  { id: "01", title: "机器人与数学地基", note: "先统一系统边界、符号和训练假设", slugs: ["control-to-vla", "math-foundations", "history"] },
  { id: "02", title: "从演示到动作块", note: "BC → ACT，把训练与闭环接起来", slugs: ["behavior-cloning", "act-cvae", "action-chunking"] },
  { id: "03", title: "多模态与动作生成", note: "条件如何进入模型，动作如何被表示和采样", slugs: ["multimodal-transformer", "action-representations", "diffusion-policy", "flow-matching"] },
  { id: "04", title: "代表系统与适配", note: "先读 π₀.₅，再比较模型家族和数据工程", slugs: ["pi05", "vla-families", "data-and-adaptation"] },
  { id: "05", title: "经验改进与长期决策", note: "失败数据、后训练与世界模型", slugs: ["post-training", "world-models"] },
  { id: "06", title: "部署与交付", note: "从通用实时系统到你的 Thor 全身机器人", slugs: ["frontier-and-deployment", "mobile-dual-arm-pi-deployment", "capstone"] },
];

export function VlaKnowledgeMap() {
  const bySlug = new Map(modules.map((item) => [item.slug, item]));
  return (
    <section className="vla-map" aria-labelledby="vla-map-title">
      <div className="vla-map-head">
        <div><p className="eyebrow">Knowledge map · 18 chapters</p><h2 id="vla-map-title">先看依赖关系，再决定在哪一章慢下来</h2></div>
        <p>地图只负责导航，卡片链接到唯一的详细正文；不会再维护一份缩水摘要。横向是同一阶段的选择，纵向是建议先后依赖。</p>
      </div>
      <div className="vla-map-bands">
        {bands.map((band) => (
          <section className="vla-map-band" key={band.id}>
            <header><span>{band.id}</span><div><h3>{band.title}</h3><p>{band.note}</p></div></header>
            <div className="vla-map-nodes">
              {band.slugs.map((slug) => {
                const item = bySlug.get(slug);
                if (!item) return null;
                const guidance = studyGuidance[item.level];
                return (
                  <Link className={`vla-map-node ${guidance.tone}`} href={`/learning/vla/${item.slug}`} key={item.slug}>
                    <span>{String(item.index).padStart(2, "0")} · {guidance.label}</span>
                    <strong>{item.title}</strong>
                    <small>{item.hours} · {item.tags.slice(0, 2).join(" / ")}</small>
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
