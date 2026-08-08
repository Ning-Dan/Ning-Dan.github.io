"use client";

import { useEffect, useState } from "react";

export function ProgressButton({ slug, course = "vla" }: { slug: string; course?: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDone(window.localStorage.getItem(`${course}-progress:${slug}`) === "done");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [course, slug]);

  function toggle() {
    const next = !done;
    setDone(next);
    if (next) window.localStorage.setItem(`${course}-progress:${slug}`, "done");
    else window.localStorage.removeItem(`${course}-progress:${slug}`);
  }

  return (
    <button className={`progress-button ${done ? "done" : ""}`} onClick={toggle} type="button">
      {done ? "✓ 已完成本章" : "标记为已完成"}
    </button>
  );
}
