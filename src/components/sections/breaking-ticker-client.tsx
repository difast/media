"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Item = { slug: string; title: string };

export function BreakingTickerClient({ items, label }: { items: Item[]; label: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ active: boolean; startX: number; startScroll: number; moved: boolean }>({
    active: false, startX: 0, startScroll: 0, moved: false,
  });

  // Duplicate items so the loop is seamless.
  const loop = [...items, ...items];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const SPEED = 0.4; // px per frame (~24px/s) — slow

    const step = () => {
      if (!pausedRef.current && !dragRef.current.active) {
        el.scrollLeft += SPEED;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el || !dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startScroll - dx;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft < 0) el.scrollLeft += half;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
  };
  const endDrag = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    dragRef.current.active = false;
    try { el?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };
  // Prevent accidental navigation right after a drag.
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
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
          ref={scrollerRef}
          className="no-scrollbar flex flex-1 cursor-grab gap-8 overflow-x-auto whitespace-nowrap select-none active:cursor-grabbing"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
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
  );
}
