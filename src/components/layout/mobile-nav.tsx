"use client";

import Link from "next/link";
import { useState } from "react";

type NavItem = { href: string; label: string };

export function MobileNav({ items, menuLabel }: { items: NavItem[]; menuLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 lg:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-paper p-6 shadow-2xl dark:bg-paper-dark">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-serif text-lg font-bold">{menuLabel}</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-500">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
