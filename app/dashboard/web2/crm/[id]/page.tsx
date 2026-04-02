import { notFound } from "next/navigation";
import { getSession } from "@/lib/firebase-session";
import { getContactById } from "@/lib/db-contacts";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { ContactDetailClient } from "./contact-detail-client";

interface ContactPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    notFound();
  }

  const contact = await getContactById(id, session.user.id);
  if (!contact) {
    notFound();
  }

  let projects: { id: string; name: string }[] = [];

  try {
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    projects = await db.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Contact page data error:", e);
  }

  return (
    <ContactDetailClient
      contact={contact}
      projects={projects}
    />
  );
}
