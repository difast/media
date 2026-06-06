import { saveMasthead } from "@/lib/actions/studio";
import { getMasthead } from "@/lib/settings";

const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500";

export default async function SettingsPage() {
  const m = await getMasthead();
  const fields: { key: keyof typeof m; label: string }[] = [
    { key: "registration", label: "Свидетельство о регистрации СМИ" },
    { key: "founder", label: "Учредитель" },
    { key: "editorInChief", label: "Главный редактор" },
    { key: "contacts", label: "Контактные данные редакции" },
    { key: "legalEntity", label: "Юридическая информация (ИНН/ОГРН)" },
    { key: "ageRating", label: "Возрастная маркировка" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Выходные данные СМИ</h1>
      <p className="mt-1 text-sm text-ink-500">
        Блок предусмотрен для внесения официальных данных после регистрации СМИ. Сейчас отображаются заглушки.
      </p>

      <form action={saveMasthead} className="mt-6 max-w-2xl space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className={labelCls}>{f.label}</label>
            <input name={f.key} defaultValue={m[f.key]} className={inputCls} />
          </div>
        ))}
        <button className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          Сохранить выходные данные
        </button>
      </form>
    </div>
  );
}
