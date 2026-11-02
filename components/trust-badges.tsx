"use client";

import { useId } from "react";

/** Production's gold verified-supplier square (VerifiedSquareIcon on thomasnet.com). */
export function VerifiedSquareIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FFC118" />
      <rect x="2" y="2" width="20" height="10" rx="4" fill="#FFD152" />
      <path
        d="m12 6.2 1.75 3.6 3.95.55-2.86 2.78.68 3.93L12 15.2l-3.52 1.86.68-3.93-2.86-2.78 3.95-.55Z"
        fill="white"
      />
    </svg>
  );
}

const BUBBLE = "M7 3h10a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-6.5l-4.8 3.8a.6.6 0 0 1-1-.5V18A5 5 0 0 1 2 13V8a5 5 0 0 1 5-5Z";

/** Production's green "Top Responder" pill with its glossy bolt bubble. */
export function TopResponderBadge() {
  const id = useId();
  return (
    <span className="top-responder" aria-label="Top Responder">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#72D63C" />
            <stop offset="0.55" stopColor="#43A918" />
            <stop offset="1" stopColor="#2A7A0A" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="white" stopOpacity="0.55" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}c`}>
            <path d={BUBBLE} />
          </clipPath>
        </defs>
        <path d={BUBBLE} fill={`url(#${id}g)`} />
        <ellipse cx="12" cy="4.5" rx="11" ry="5" fill={`url(#${id}s)`} clipPath={`url(#${id}c)`} />
        <path d="M13.4 5.2 8.3 11.4h3.4l-1.1 4.6 5.1-6.3h-3.4l1.1-4.5Z" fill="white" />
      </svg>
      <span>Top Responder</span>
    </span>
  );
}
