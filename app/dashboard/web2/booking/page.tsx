import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { BookingPageClient } from "./booking-client";

export default async function BookingPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  let projects: { id: string; name: string }[] = [];
  let users: { id: string; name: string | null; email: string }[] = [];

  if (userId) {
    try {
      const user = await getOrCreateUserByFirebaseUid(
        session!.user!.id,
        session!.user!.email,
        session!.user!.name
      );
      if (isAdmin) {
        const [projectList, userList] = await Promise.all([
          db.project.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          }),
          db.user.findMany({
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
          }),
        ]);
        projects = projectList;
        users = userList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }));
      } else {
        const projectList = await db.project.findMany({
          where: { userId: user.id },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });
        projects = projectList;
      }
    } catch (e) {
      console.error("Booking page data error:", e);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-0 p-6 lg:p-8">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Booking</h1>
      </div>
      <BookingPageClient
        isAdmin={!!isAdmin}
        projects={projects}
        users={users}
      />
    </div>
  );
}
