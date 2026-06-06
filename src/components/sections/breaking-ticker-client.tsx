"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Item = { slug: string; title: string };

export function BreakingTickerClient({ items, label }: { items: Item[]; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // current translateX in px (<= 0)
  const halfRef = useRef(0); // width of one copy of the list
  const pausedRef = useRef(false);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });

  // Duplicate items so the loop is seamless.
  const loop = [...items, ...items];

  const wrap = () => {
    const half = halfRef.current;
    if (half <= 0) return;
    if (offsetRef.current <= -half) offsetRef.current += half;
    if (offsetRef.current > 0) offsetRef.current -= half;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => { halfRef.current = track.scrollWidth / 2; };
    measure();
    window.addEventListener("resize", measure);

    let raf = 0;
    const SPEED = 0.4; // px/frame (~24px/s) — slow
    const step = () => {
      if (!pausedRef.current && !drag.current.active) {
        offsetRef.current -= SPEED;
        wrap();
        track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [items.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startOffset: offsetRef.current, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    offsetRef.current = drag.current.startOffset + dx;
    wrap();
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
  };
  const endDrag = (e: React.PointerEvent) => {
    drag.current.active = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className="border-y hairline bg-ink-950 text-white dark:bg-black">
      <div className="container-page flex items-center gap-3 py-1.5">
        <span className="z-10 flex shrink-0 items-center gap-1.5 bg-brand px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          {label}
        </span>
        <div
          className="relative flex-1 cursor-grab overflow-hidden select-none active:cursor-grabbing"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div ref={trackRef} className="flex w-max gap-8 whitespace-nowrap will-change-transform">
            {loop.map((item, i) => (
              <Link
                key={`${item.slug}-${i}`}
                href={`/article/${item.slug}`}
                draggable={false}
                className="text-sm text-ink-100 transition-colors hover:text-brand-300"
              >
                <span className="mr-2 text-brand-400">•</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
