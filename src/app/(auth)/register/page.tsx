import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, auth } from "@/lib/auth";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Регистрация", robots: { index: false } };

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect("/studio");

  async function register(formData: FormData) {
    "use server";
    const parsed = schema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) redirect("/register?error=invalid");
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) redirect("/register?error=exists");

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "SUBSCRIBER", // new accounts start as subscribers
      },
    });
    try {
      await signIn("credentials", { email, password, redirectTo: "/" });
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      redirect("/login");
    }
  }

  const errors: Record<string, string> = {
    invalid: "Проверьте правильность полей",
    exists: "Пользователь с таким e-mail уже существует",
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="font-serif text-2xl font-bold">{SITE.name}</Link>
          <h1 className="mt-4 font-serif text-2xl font-bold">Регистрация</h1>
          <p className="mt-1 text-sm text-ink-500">Подписчикам — доступ к комментариям и закладкам</p>
        </div>

        {sp.error && (
          <p className="mt-4 rounded-md bg-brand-50 p-3 text-center text-sm text-brand-700">
            {errors[sp.error] ?? "Ошибка"}
          </p>
        )}

        <form action={register} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Имя</label>
            <input name="name" required className="w-full rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input name="email" type="email" required className="w-full rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Пароль</label>
            <input name="password" type="password" required minLength={6} className="w-full rounded-md border hairline bg-transparent px-3 py-2 outline-none focus:border-brand" />
          </div>
          <button type="submit" className="w-full rounded-md bg-brand py-2.5 font-semibold text-white hover:bg-brand-700">
            Создать аккаунт
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-500">
          Уже есть аккаунт? <Link href="/login" className="text-brand-600 hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
