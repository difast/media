import { prisma } from "@/lib/prisma";
import { updateUserRole } from "@/lib/actions/studio";

const ROLES = ["SUBSCRIBER", "JOURNALIST", "EDITOR"];
const inputCls = "rounded-md border hairline bg-transparent px-2 py-1 text-sm outline-none focus:border-brand";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Пользователи и авторы</h1>
      <p className="mt-1 text-sm text-ink-500">Управление ролями, должностями авторов и доступом.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border hairline">
        <table className="w-full text-sm">
          <thead className="border-b hairline bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-900/40">
            <tr>
              <th className="px-4 py-2">Имя</th><th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Материалов</th><th className="px-4 py-2">Роль и должность</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium">{u.name ?? "—"}</td>
                <td className="px-4 py-2 text-ink-500">{u.email}</td>
                <td className="px-4 py-2 text-ink-400">{u._count.articles}</td>
                <td className="px-4 py-2">
                  <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className={inputCls}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input name="position" defaultValue={u.position ?? ""} placeholder="Должность" className={inputCls} />
                    <button className="rounded bg-brand px-3 py-1 text-xs font-semibold text-white">Сохранить</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
