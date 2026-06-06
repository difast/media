import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Вход", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect(sp.callbackUrl || "/studio");

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const callbackUrl = String(formData.get("callbackUrl") || "/studio");
    try {
      await signIn("credentials", { email, password, redirectTo: callbackUrl });
    } catch (e) {
      // NEXT_REDIRECT is thrown on success — re-throw it.
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      redirect(`/login?error=1${sp.callbackUrl ? `&callbackUrl=${sp.callbackUrl}` : ""}`);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="font-serif text-2xl font-bold">{SITE.name}</Link>
          <h1 className="mt-4 font-serif text-2xl font-bold">Вход в редакцию</h1>
          <p className="mt-1 text-sm text-ink-500">Доступ для журналистов и редакторов</p>
        </div>

        {sp.error && (
          <p className="mt-4 rounded-md bg-brand-50 p-3 text-center text-sm text-brand-700">
            Неверный e-mail или пароль
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? "/studio"} />
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input name="email" type="email" required className="w-full rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Пароль</label>
            <input name="password" type="password" required minLength={6} className="w-full rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand" />
          </div>
          <button type="submit" className="w-full rounded-md bg-brand py-2.5 font-semibold text-white hover:bg-brand-700">
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          Нет аккаунта? <Link href="/register" className="text-brand-600 hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
