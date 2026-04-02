import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BookPageClient } from "./book-client";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await db.bookingLink.findUnique({
    where: { slug: slug.toLowerCase(), active: true },
    select: { id: true, title: true, slug: true, durationMinutes: true },
  });
  if (!link) notFound();
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <BookPageClient
        slug={link.slug}
        link={{
          id: link.id,
          title: link.title,
          slug: link.slug,
          durationMinutes: link.durationMinutes,
        }}
      />
    </div>
  );
}
