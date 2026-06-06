"use client";

import { useState } from "react";

const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";

export function CoverField({ defaultValue = "" }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setUrl(data.url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">Обложка</label>

      {/* Submitted value */}
      <input type="hidden" name="coverImage" value={url} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-md border hairline px-4 py-2 text-sm font-medium hover:border-brand">
          {status === "uploading" ? "Загрузка…" : "📷 Загрузить файл"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={status === "uploading"} />
        </label>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="text-xs text-brand-600 hover:underline">
            Убрать
          </button>
        )}
      </div>

      {/* Or paste a URL */}
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="или вставьте URL изображения"
        className={`${inputCls} mt-2`}
      />

      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Превью обложки" className="mt-3 h-40 w-auto rounded-sm border hairline object-cover" />
      )}
    </div>
  );
}
