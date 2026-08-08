"use client";

import { useEffect, useState } from "react";

export function ProgressButton({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDone(window.localStorage.getItem(`vla-progress:${slug}`) === "done");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [slug]);

  function toggle() {
    const next = !done;
    setDone(next);
    if (next) window.localStorage.setItem(`vla-progress:${slug}`, "done");
    else window.localStorage.removeItem(`vla-progress:${slug}`);
  }

  return (
    <button className={`progress-button ${done ? "done" : ""}`} onClick={toggle} type="button">
      {done ? "✓ 已完成本章" : "标记为已完成"}
    </button>
  );
}
