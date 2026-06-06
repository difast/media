"use client";

import { useState } from "react";

export function NewsletterForm({
  placeholder,
  cta,
  successMsg,
  locale,
}: {
  placeholder: string;
  cta: string;
  successMsg: string;
  locale: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMsg}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" ? "…" : cta}
      </button>
    </form>
  );
}
