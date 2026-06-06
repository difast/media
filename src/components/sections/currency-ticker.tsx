// Live currency rates (RUB) from the Central Bank of Russia.
// Source: https://www.cbr-xml-daily.ru/daily_json.js — free, no API key required.

type Valute = { Value: number; Previous: number };
type CbrResponse = { Valute: Record<string, Valute> };

async function getRates(): Promise<{ code: string; label: string; value: number; up: boolean }[] | null> {
  try {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
      next: { revalidate: 3600 }, // refresh hourly
    });
    if (!res.ok) return null;
    const data: CbrResponse = await res.json();
    const pick = (code: string, label: string) => {
      const v = data.Valute[code];
      return v ? { code, label, value: v.Value, up: v.Value >= v.Previous } : null;
    };
    return [pick("USD", "$"), pick("EUR", "€"), pick("CNY", "¥")].filter(Boolean) as {
      code: string; label: string; value: number; up: boolean;
    }[];
  } catch {
    return null;
  }
}

export async function CurrencyTicker({ className = "" }: { className?: string }) {
  const rates = await getRates();
  if (!rates || rates.length === 0) return null;

  return (
    <div className={"flex items-center gap-3 text-xs " + className}>
      {rates.map((r) => (
        <span key={r.code} className="flex items-center gap-1 whitespace-nowrap" title={`${r.code}/RUB`}>
          <span className="font-semibold">{r.label}</span>
          <span className="tabular-nums">{r.value.toFixed(2)}</span>
          <span className={r.up ? "text-emerald-600 dark:text-emerald-400" : "text-brand-600 dark:text-brand-400"}>
            {r.up ? "▲" : "▼"}
          </span>
        </span>
      ))}
    </div>
  );
}
