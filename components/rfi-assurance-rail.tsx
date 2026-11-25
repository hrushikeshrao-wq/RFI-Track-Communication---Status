"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";

const SLIDES = 3;
const ADVANCE_MS = 3500;

/** Three assurance cards. On a phone they advance on their own and loop. */
export function RfiAssuranceRail({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const slides = Children.toArray(children);
  const first = slides[0];
  const loopClone = isValidElement(first)
    ? cloneElement(first as ReactElement<Record<string, unknown>>, {
        "data-assure-clone": "",
        "aria-hidden": true,
      })
    : null;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let paused = false;

    const update = () => {
      const width = scroller.clientWidth || 1;
      const next = Math.round(scroller.scrollLeft / width);
      setActive(((next % SLIDES) + SLIDES) % SLIDES);
    };

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const advance = () => {
      const width = scroller.clientWidth;
      if (width < 2) return;
      const index = Math.round(scroller.scrollLeft / width);
      scroller.scrollTo({ left: (index + 1) * width, behavior: "smooth" });
    };

    const start = () => {
      stop();
      if (paused || !mobileQuery.matches || reduceQuery.matches || document.hidden) return;
      timer = window.setInterval(advance, ADVANCE_MS);
    };

    const settleClone = () => {
      const width = scroller.clientWidth || 1;
      if (Math.round(scroller.scrollLeft / width) < SLIDES) return;
      scroller.scrollLeft = 0;
      update();
    };

    const pause = () => {
      paused = true;
      stop();
    };

    const resume = () => {
      paused = false;
      start();
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    scroller.addEventListener("scrollend", settleClone);
    scroller.addEventListener("pointerdown", pause);
    scroller.addEventListener("pointerup", resume);
    scroller.addEventListener("pointercancel", resume);
    scroller.addEventListener("mouseenter", pause);
    scroller.addEventListener("mouseleave", resume);
    scroller.addEventListener("focusin", pause);
    scroller.addEventListener("focusout", resume);
    mobileQuery.addEventListener("change", start);
    reduceQuery.addEventListener("change", start);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", update);
    start();

    return () => {
      stop();
      scroller.removeEventListener("scroll", update);
      scroller.removeEventListener("scrollend", settleClone);
      scroller.removeEventListener("pointerdown", pause);
      scroller.removeEventListener("pointerup", resume);
      scroller.removeEventListener("pointercancel", resume);
      scroller.removeEventListener("mouseenter", pause);
      scroller.removeEventListener("mouseleave", resume);
      scroller.removeEventListener("focusin", pause);
      scroller.removeEventListener("focusout", resume);
      mobileQuery.removeEventListener("change", start);
      reduceQuery.removeEventListener("change", start);
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="rfi-assure-scroller">
      <ul className="rfi-assurances" ref={scrollerRef}>
        {slides}
        {loopClone}
      </ul>
      <div className="rfi-assure-dashes" aria-hidden="true">
        {[0, 1, 2].map((dash) => (
          <span key={dash} className={dash === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  );
}
