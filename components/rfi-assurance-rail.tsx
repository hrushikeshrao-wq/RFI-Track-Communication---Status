"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Three assurance cards. On a phone they snap sideways and the dashes follow the visible card. */
export function RfiAssuranceRail({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      const width = scroller.clientWidth || 1;
      const next = Math.round(scroller.scrollLeft / width);
      setActive(Math.max(0, Math.min(2, next)));
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="rfi-assure-scroller">
      <ul className="rfi-assurances" ref={scrollerRef}>
        {children}
      </ul>
      <div className="rfi-assure-dashes" aria-hidden="true">
        {[0, 1, 2].map((dash) => (
          <span key={dash} className={dash === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  );
}
