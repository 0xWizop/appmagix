/** Server-side helper to create notifications. Use in API routes or server actions. */
import { getAdminFirestore } from "@/lib/firebase-admin";

export type NotificationType = "ticket_reply" | "project_update" | "invoice_reminder" | "general";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  await db.collection("notifications").add({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    href: params.href ?? null,
    read: false,
    createdAt: new Date().toISOString(),
  });
}
