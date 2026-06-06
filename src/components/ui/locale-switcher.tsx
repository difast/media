"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/lib/site-config";

const LOCALE_COOKIE = "pm_locale";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function set(locale: Locale) {
    if (locale === current) return;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center rounded-full border hairline text-xs font-semibold" aria-busy={isPending}>
      {(["ru", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          className={
            "px-2.5 py-1 uppercase transition-colors first:rounded-l-full last:rounded-r-full " +
            (current === l
              ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950"
              : "text-ink-500 hover:text-ink-900 dark:hover:text-white")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
