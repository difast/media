"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ArticleStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { canWrite, canPublish } from "@/lib/auth";
import { slugify, estimateReadingMinutes } from "@/lib/utils";
import { postArticleToTelegram } from "@/lib/telegram";

async function requireWriter() {
  const session = await auth();
  if (!session?.user || !canWrite(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}
async function requireEditor() {
  const session = await auth();
  if (!session?.user || !canPublish(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

const articleSchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  categoryId: z.string().min(1),
  coverImage: z.string().optional(),
  videoUrl: z.string().optional(),
  podcastUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  locale: z.string().default("ru"),
});

export async function saveArticle(formData: FormData) {
  const user = await requireWriter();
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
    coverImage: formData.get("coverImage") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    podcastUrl: formData.get("podcastUrl") || undefined,
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    ogTitle: formData.get("ogTitle") || undefined,
    ogDescription: formData.get("ogDescription") || undefined,
    ogImage: formData.get("ogImage") || undefined,
    locale: formData.get("locale") || "ru",
  });
  if (!parsed.success) {
    throw new Error("Invalid article data: " + parsed.error.issues[0]?.message);
  }
  const data = parsed.data;

  const tagSlugs = String(formData.get("tags") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const sources = parseJson(formData.get("sources"), [] as { title: string; url: string }[]);
  const scheduledAtRaw = formData.get("scheduledAt");
  const scheduledAt = scheduledAtRaw ? new Date(String(scheduledAtRaw)) : null;
  const readingMinutes = estimateReadingMinutes(data.body);

  // Resolve tags (create missing)
  const tagConnect = [];
  for (const ts of tagSlugs) {
    const slug = slugify(ts);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, title: ts },
    });
    tagConnect.push(tag.id);
  }

  const baseData = {
    title: data.title,
    subtitle: data.subtitle,
    excerpt: data.excerpt,
    body: data.body,
    categoryId: data.categoryId,
    coverImage: data.coverImage,
    videoUrl: data.videoUrl,
    podcastUrl: data.podcastUrl,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    ogImage: data.ogImage,
    locale: data.locale,
    readingMinutes,
    sources,
    scheduledAt,
  };

  let articleId = id;
  if (id) {
    await prisma.article.update({
      where: { id },
      data: {
        ...baseData,
        tags: { deleteMany: {}, create: tagConnect.map((tagId) => ({ tagId })) },
      },
    });
  } else {
    const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    const created = await prisma.article.create({
      data: {
        ...baseData,
        slug,
        status: "DRAFT",
        authorId: user.id,
        authorTitle: (await prisma.user.findUnique({ where: { id: user.id } }))?.position,
        tags: { create: tagConnect.map((tagId) => ({ tagId })) },
      },
    });
    articleId = created.id;
  }

  // Revision snapshot (история изменений)
  await prisma.articleRevision.create({
    data: {
      articleId: articleId!,
      editorId: user.id,
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
      status: (await prisma.article.findUnique({ where: { id: articleId! } }))!.status,
      note: id ? "Редактирование" : "Создание черновика",
    },
  });

  revalidatePath("/studio/articles");
  redirect(`/studio/articles/${articleId}/edit?saved=1`);
}

const STATUS_PERMS: Record<string, "writer" | "editor"> = {
  DRAFT: "writer",
  IN_REVIEW: "writer", // submit for review
  APPROVED: "editor",
  SCHEDULED: "editor",
  PUBLISHED: "editor",
  ARCHIVED: "editor",
};

export async function changeArticleStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ArticleStatus;
  const perm = STATUS_PERMS[status];
  const user = perm === "editor" ? await requireEditor() : await requireWriter();

  const existing = await prisma.article.findUnique({ where: { id } });
  const data: Record<string, unknown> = { status };
  if (status === "PUBLISHED" && !existing?.publishedAt) {
    data.publishedAt = new Date();
  }
  await prisma.article.update({ where: { id }, data });
  await prisma.articleRevision.create({
    data: {
      articleId: id,
      editorId: user.id,
      title: existing!.title,
      body: "",
      status,
      note: `Статус изменён на ${status}`,
    },
  });

  // Auto cross-post to Telegram on first publish (idempotent inside helper)
  if (status === "PUBLISHED") {
    await postArticleToTelegram(id).catch(() => false);
  }

  revalidatePath("/studio/articles");
  revalidatePath("/");
}

export async function deleteArticle(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id"));
  await prisma.article.delete({ where: { id } });
  revalidatePath("/studio/articles");
}

export async function moderateComment(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as "APPROVED" | "REJECTED";
  await prisma.comment.update({ where: { id }, data: { status } });
  revalidatePath("/studio/comments");
}

export async function upsertCategory(formData: FormData) {
  await requireEditor();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const title = String(formData.get("title"));
  const slug = String(formData.get("slug") || slugify(title));
  const titleEn = String(formData.get("titleEn") || "");
  const description = String(formData.get("description") || "");
  if (id) {
    await prisma.category.update({ where: { id }, data: { title, titleEn, description } });
  } else {
    await prisma.category.create({ data: { title, slug, titleEn, description, kind: "ARTICLE" } });
  }
  revalidatePath("/studio/taxonomy");
}

export async function upsertAd(formData: FormData) {
  await requireEditor();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const data = {
    title: String(formData.get("title")),
    slot: String(formData.get("slot")) as never,
    targetUrl: String(formData.get("targetUrl")),
    imageUrl: String(formData.get("imageUrl") || "") || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) {
    await prisma.ad.update({ where: { id }, data });
  } else {
    await prisma.ad.create({ data });
  }
  revalidatePath("/studio/ads");
}

export async function updateUserRole(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as Role;
  const position = String(formData.get("position") || "");
  await prisma.user.update({ where: { id }, data: { role, position } });
  revalidatePath("/studio/users");
}

export async function saveMasthead(formData: FormData) {
  await requireEditor();
  const keys = ["registration", "founder", "editorInChief", "contacts", "legalEntity", "ageRating"];
  for (const k of keys) {
    const value = String(formData.get(k) || "");
    await prisma.siteSetting.upsert({
      where: { key: `masthead.${k}` },
      update: { value },
      create: { key: `masthead.${k}`, value },
    });
  }
  revalidatePath("/studio/settings");
  revalidatePath("/");
}

export async function runIngestNow() {
  await requireEditor();
  const { runIngest } = await import("@/lib/ingest");
  await runIngest();
  revalidatePath("/studio/articles");
  revalidatePath("/studio");
}

export async function postToTelegramAction(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id"));
  await postArticleToTelegram(id, true);
  revalidatePath("/studio/articles");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
