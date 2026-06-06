"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ defaultValue = "", placeholder }: { defaultValue?: string; placeholder: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="flex gap-2"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="min-w-0 flex-1 rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand"
      />
      <button type="submit" className="rounded-md bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-700">
        →
      </button>
    </form>
  );
}
