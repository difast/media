"use client";

import { useState } from "react";

export function ShareBar({ title, url, label }: { title: string; url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { name: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { name: "VK", href: `https://vk.com/share.php?url=${enc(url)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(title + " " + url)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="kicker mr-1">{label}</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border hairline px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand-600"
        >
          {l.name}
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded-full border hairline px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand-600"
      >
        {copied ? "✓" : "Копировать ссылку"}
      </button>
    </div>
  );
}
