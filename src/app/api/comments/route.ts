import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ comments: [] });

  const comments = await prisma.comment.findMany({
    where: { articleId, status: "APPROVED", parentId: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, image: true } },
      replies: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
  return NextResponse.json({ comments });
}

const schema = z.object({
  articleId: z.string(),
  body: z.string().min(2).max(4000),
  parentId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  // Editors' comments auto-approve; others go to moderation queue.
  const autoApprove = session.user.role === "EDITOR" || session.user.role === "JOURNALIST";
  const comment = await prisma.comment.create({
    data: {
      articleId: parsed.data.articleId,
      userId: session.user.id,
      body: parsed.data.body,
      parentId: parsed.data.parentId,
      status: autoApprove ? "APPROVED" : "PENDING",
    },
  });
  return NextResponse.json({ ok: true, status: comment.status });
}
