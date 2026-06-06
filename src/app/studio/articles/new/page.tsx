import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/studio/article-form";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold">Новый материал</h1>
      <ArticleForm article={null} categories={categories} />
    </div>
  );
}
