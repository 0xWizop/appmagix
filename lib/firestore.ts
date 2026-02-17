import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore, adminApp } from "@/lib/firebase-admin";

// Use Firestore Admin for server-side (no client SDK in server components)
const db = () => getAdminFirestore();

function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  if (typeof val === "string") return new Date(val);
  return new Date();
}

export interface FirestoreProject {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  startDate?: Date;
  targetLaunchDate?: Date;
  websiteUrl?: string;
  siteVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
  completedAt?: Date;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreTicket {
  id: string;
  userId: string;
  projectId?: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  project?: { name: string };
  messageCount?: number;
}

export interface FirestoreMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: { displayName?: string; email?: string; photoURL?: string; role?: string };
}

export interface FirestoreContact {
  id: string;
  ownerId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  stage?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreSite {
  id: string;
  ownerId: string;
  domain: string;
  siteToken: string;
  verifiedAt?: Date;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getContactsByOwner(ownerId: string): Promise<FirestoreContact[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("contacts")
    .where("ownerId", "==", ownerId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ownerId: data.ownerId,
      name: data.name ?? "",
      email: data.email,
      phone: data.phone,
      company: data.company,
      notes: data.notes,
      stage: data.stage ?? "LEAD",
      projectId: data.projectId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function getSitesByOwner(ownerId: string): Promise<FirestoreSite[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("sites")
    .where("ownerId", "==", ownerId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ownerId: data.ownerId,
      domain: data.domain ?? "",
      siteToken: data.siteToken ?? "",
      verifiedAt: data.verifiedAt ? toDate(data.verifiedAt) : undefined,
      projectId: data.projectId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function createSite(
  ownerId: string,
  domain: string,
  projectId?: string
): Promise<{ site: FirestoreSite; token: string; error?: string }> {
  if (!adminApp) return { site: {} as FirestoreSite, token: "", error: "Not configured" };
  const normalized = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
  if (!normalized) return { site: {} as FirestoreSite, token: "", error: "Invalid domain" };

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  const now = new Date();
  const ref = await db().collection("sites").add({
    ownerId,
    domain: normalized,
    siteToken: token,
    verifiedAt: null,
    projectId: projectId ?? null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  const site: FirestoreSite = {
    id: ref.id,
    ownerId,
    domain: normalized,
    siteToken: token,
    projectId,
    createdAt: now,
    updatedAt: now,
  };
  return { site, token };
}

export async function verifySite(siteId: string, ownerId: string): Promise<boolean> {
  if (!adminApp) return false;
  const siteRef = db().collection("sites").doc(siteId);
  const snap = await siteRef.get();
  if (!snap.exists || snap.data()?.ownerId !== ownerId) return false;
  const data = snap.data()!;
  const domain = data.domain;
  const token = data.siteToken;
  if (!domain || !token) return false;

  try {
    const base = domain.startsWith("http") ? domain : `https://${domain}`;
    const res = await fetch(base, { headers: { "User-Agent": "MerchantMagix-Verifier/1.0" } });
    const html = await res.text();
    const metaMatch =
      html.match(
        new RegExp(
          `<meta[^>]+name=["']merchantmagix-site["'][^>]+content=["']${token}["']`,
          "i"
        )
      ) ||
      html.match(
        new RegExp(
          `<meta[^>]+content=["']${token}["'][^>]+name=["']merchantmagix-site["']`,
          "i"
        )
      );
    if (metaMatch) {
      await siteRef.update({
        verifiedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return true;
    }
  } catch {
    // fetch failed
  }
  return false;
}

export async function createContact(
  ownerId: string,
  data: { name: string; email?: string; phone?: string; company?: string; notes?: string; stage?: string; projectId?: string }
): Promise<FirestoreContact> {
  if (!adminApp) throw new Error("Not configured");
  const now = new Date();
  const ref = await db().collection("contacts").add({
    ownerId,
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    company: data.company ?? null,
    notes: data.notes ?? null,
    stage: data.stage ?? "LEAD",
    projectId: data.projectId ?? null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  const doc = await ref.get();
  const d = doc.data()!;
  return {
    id: ref.id,
    ownerId: d.ownerId,
    name: d.name ?? "",
    email: d.email,
    phone: d.phone,
    company: d.company,
    notes: d.notes,
    stage: d.stage ?? "LEAD",
    projectId: d.projectId,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function updateContact(
  contactId: string,
  ownerId: string,
  data: { stage?: string; projectId?: string | null }
): Promise<FirestoreContact | null> {
  if (!adminApp) return null;
  const snap = await db().collection("contacts").doc(contactId).get();
  if (!snap.exists || snap.data()?.ownerId !== ownerId) return null;
  const now = new Date();
  const updates: Record<string, unknown> = { updatedAt: Timestamp.fromDate(now) };
  if (data.stage !== undefined) updates.stage = data.stage;
  if (data.projectId !== undefined) updates.projectId = data.projectId ?? null;
  await db().collection("contacts").doc(contactId).update(updates);
  const updated = await db().collection("contacts").doc(contactId).get();
  const d = updated.data()!;
  return {
    id: contactId,
    ownerId: d.ownerId,
    name: d.name ?? "",
    email: d.email,
    phone: d.phone,
    company: d.company,
    notes: d.notes,
    stage: d.stage ?? "LEAD",
    projectId: d.projectId,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function deleteContact(contactId: string, ownerId: string): Promise<boolean> {
  if (!adminApp) return false;
  const snap = await db().collection("contacts").doc(contactId).get();
  if (!snap.exists || snap.data()?.ownerId !== ownerId) return false;
  await db().collection("contacts").doc(contactId).delete();
  return true;
}

export async function getProjectsByOwner(ownerId: string): Promise<FirestoreProject[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("projects")
    .where("ownerId", "==", ownerId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ownerId: data.ownerId,
      name: data.name ?? data.title ?? "",
      description: data.description,
      type: data.type ?? "SHOPIFY",
      status: data.status ?? "DISCOVERY",
      startDate: data.startDate ? toDate(data.startDate) : undefined,
      targetLaunchDate: data.targetLaunchDate ? toDate(data.targetLaunchDate) : undefined,
      websiteUrl: data.websiteUrl,
      siteVerifiedAt: data.siteVerifiedAt ? toDate(data.siteVerifiedAt) : undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function getProjectsWithMilestones(ownerId: string): Promise<(FirestoreProject & { milestones: { status?: string }[] })[]> {
  const projects = await getProjectsByOwner(ownerId);
  const withMilestones = await Promise.all(
    projects.map(async (p) => {
      const snap = await db().collection("projects").doc(p.id).collection("milestones").orderBy("sortOrder", "asc").get();
      const milestones = snap.docs.map((d) => {
        const data = d.data();
        return { status: data.status, id: d.id };
      });
      return { ...p, milestones };
    })
  );
  return withMilestones;
}

export interface FirestoreInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjectWithDetails(
  projectId: string,
  ownerId: string
): Promise<(FirestoreProject & { milestones: FirestoreMilestone[]; tickets: FirestoreTicket[]; invoices: FirestoreInvoice[] }) | null> {
  if (!adminApp) return null;
  const projectRef = db().collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists || projectSnap.data()?.ownerId !== ownerId) return null;

  const data = projectSnap.data()!;
  const project: FirestoreProject & { milestones: FirestoreMilestone[]; tickets: FirestoreTicket[]; invoices: FirestoreInvoice[] } = {
    id: projectSnap.id,
    ownerId: data.ownerId,
    name: data.name ?? data.title ?? "",
    description: data.description,
    type: data.type ?? "SHOPIFY",
    status: data.status ?? "DISCOVERY",
    startDate: data.startDate ? toDate(data.startDate) : undefined,
    targetLaunchDate: data.targetLaunchDate ? toDate(data.targetLaunchDate) : undefined,
    websiteUrl: data.websiteUrl,
    siteVerifiedAt: data.siteVerifiedAt ? toDate(data.siteVerifiedAt) : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    milestones: [],
    tickets: [],
    invoices: [],
  };

  const [milestonesSnap, ticketsSnap, invoicesSnap] = await Promise.all([
    db().collection("projects").doc(projectId).collection("milestones").orderBy("sortOrder", "asc").get(),
    db().collection("tickets").where("projectId", "==", projectId).limit(10).get(),
    db().collection("invoices").where("projectId", "==", projectId).orderBy("createdAt", "desc").limit(5).get(),
  ]);

  project.milestones = milestonesSnap.docs.map((d) => {
    const m = d.data();
    return {
      id: d.id,
      projectId,
      title: m.title,
      description: m.description,
      status: m.status ?? "PENDING",
      dueDate: m.dueDate ? toDate(m.dueDate) : undefined,
      completedAt: m.completedAt ? toDate(m.completedAt) : undefined,
      sortOrder: m.sortOrder ?? 0,
      createdAt: toDate(m.createdAt),
      updatedAt: toDate(m.updatedAt),
    };
  });

  project.tickets = ticketsSnap.docs
    .filter((d) => d.data().status !== "RESOLVED")
    .slice(0, 5)
    .map((d) => {
      const t = d.data();
      return {
        id: d.id,
        userId: t.userId,
        projectId: t.projectId,
        subject: t.subject,
        description: t.description ?? "",
        status: t.status ?? "OPEN",
        priority: t.priority ?? "MEDIUM",
        createdAt: toDate(t.createdAt),
        updatedAt: toDate(t.updatedAt),
      };
    });

  project.invoices = invoicesSnap.docs.map((d) => {
    const i = d.data();
    return {
      id: d.id,
      invoiceNumber: i.invoiceNumber ?? "",
      amount: i.amount ?? 0,
      status: i.status ?? "PENDING",
      createdAt: toDate(i.createdAt),
      updatedAt: toDate(i.updatedAt),
    };
  });

  return project;
}

export async function getTicketsByUser(userId: string): Promise<FirestoreTicket[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("tickets")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const tickets: FirestoreTicket[] = [];
  for (const d of snapshot.docs) {
    const data = d.data();
    const projectId = data.projectId;
    let projectName: string | undefined;
    if (projectId) {
      const projSnap = await db().collection("projects").doc(projectId).get();
      projectName = projSnap.data()?.name ?? projSnap.data()?.title;
    }
    const msgSnap = await db().collection("tickets").doc(d.id).collection("messages").get();
    tickets.push({
      id: d.id,
      userId: data.userId,
      projectId: data.projectId,
      subject: data.subject,
      description: data.description ?? "",
      status: data.status ?? "OPEN",
      priority: data.priority ?? "MEDIUM",
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      project: projectName ? { name: projectName } : undefined,
      messageCount: msgSnap.size,
    });
  }
  return tickets;
}

export async function createTicket(data: {
  userId: string;
  projectId?: string;
  subject: string;
  description: string;
  priority: string;
}): Promise<FirestoreTicket> {
  const now = new Date();
  const ref = await db().collection("tickets").add({
    userId: data.userId,
    projectId: data.projectId || null,
    subject: data.subject,
    description: data.description,
    status: "OPEN",
    priority: data.priority,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  const doc = await ref.get();
  const d = doc.data()!;
  return {
    id: ref.id,
    userId: d.userId,
    projectId: d.projectId,
    subject: d.subject,
    description: d.description,
    status: d.status,
    priority: d.priority,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function getTicketWithMessages(
  ticketId: string,
  userId: string
): Promise<(FirestoreTicket & { messages: FirestoreMessage[] }) | null> {
  if (!adminApp) return null;
  const ticketRef = db().collection("tickets").doc(ticketId);
  const ticketSnap = await ticketRef.get();
  if (!ticketSnap.exists || ticketSnap.data()?.userId !== userId) return null;

  const data = ticketSnap.data()!;
  const ticket: FirestoreTicket & { messages: FirestoreMessage[] } = {
    id: ticketSnap.id,
    userId: data.userId,
    projectId: data.projectId,
    subject: data.subject,
    description: data.description ?? "",
    status: data.status ?? "OPEN",
    priority: data.priority ?? "MEDIUM",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    messages: [],
  };

  const projectId = data.projectId;
  if (projectId) {
    const projSnap = await db().collection("projects").doc(projectId).get();
    ticket.project = { name: projSnap.data()?.name ?? projSnap.data()?.title ?? "" };
  }

  const messagesSnap = await ticketRef.collection("messages").orderBy("createdAt", "asc").get();
  for (const m of messagesSnap.docs) {
    const msgData = m.data();
    const senderId = msgData.senderId;
    let sender: FirestoreMessage["sender"];
    const userSnap = await db().collection("users").doc(senderId).get();
    sender = {
      displayName: userSnap.data()?.displayName,
      email: userSnap.data()?.email,
      photoURL: userSnap.data()?.photoURL,
      role: userSnap.data()?.role,
    };
    ticket.messages.push({
      id: m.id,
      ticketId,
      senderId,
      content: msgData.content ?? msgData.body ?? "",
      createdAt: toDate(msgData.createdAt),
      sender,
    });
  }

  return ticket;
}

export async function addTicketMessage(
  ticketId: string,
  userId: string,
  content: string
): Promise<FirestoreMessage | null> {
  const ticketSnap = await db().collection("tickets").doc(ticketId).get();
  if (!ticketSnap.exists || ticketSnap.data()?.userId !== userId) return null;
  const ticketData = ticketSnap.data()!;
  if (ticketData.status === "RESOLVED") return null;

  const now = new Date();
  const ref = await db()
    .collection("tickets")
    .doc(ticketId)
    .collection("messages")
    .add({
      senderId: userId,
      content,
      createdAt: Timestamp.fromDate(now),
    });

  await db().collection("tickets").doc(ticketId).update({
    updatedAt: Timestamp.fromDate(now),
    status: ticketData.status === "IN_PROGRESS" ? "OPEN" : ticketData.status,
  });

  const docSnap = await ref.get();
  const d = docSnap.data()!;
  return {
    id: ref.id,
    ticketId,
    senderId: userId,
    content: d.content,
    createdAt: toDate(d.createdAt),
  };
}

export async function getProjectsForApi(ownerId: string): Promise<{ id: string; name: string }[]> {
  const projects = await getProjectsByOwner(ownerId);
  return projects.map((p) => ({ id: p.id, name: p.name }));
}

// --- Analytics ---

export interface AnalyticsEvent {
  projectId: string;
  type: "page_view" | "custom";
  path: string;
  referrer?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export async function ingestAnalyticsEvent(data: {
  projectToken: string;
  type: string;
  path?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  if (!adminApp) return { ok: false, error: "Analytics not configured" };
  const token = data.projectToken;

  // Check projects first (legacy)
  const projectsSnap = await db()
    .collection("projects")
    .where("siteToken", "==", token)
    .limit(1)
    .get();
  if (!projectsSnap.empty) {
    const projectId = projectsSnap.docs[0].id;
    const ownerId = projectsSnap.docs[0].data().ownerId;
    await db().collection("analytics_events").add({
      projectId,
      ownerId,
      type: data.type === "page_view" ? "page_view" : "custom",
      path: data.path ?? "/",
      referrer: data.referrer ?? null,
      metadata: data.metadata ?? null,
      timestamp: Timestamp.fromDate(new Date()),
    });
    return { ok: true };
  }

  // Check standalone sites
  const sitesSnap = await db()
    .collection("sites")
    .where("siteToken", "==", token)
    .limit(1)
    .get();
  if (!sitesSnap.empty) {
    const siteId = sitesSnap.docs[0].id;
    const ownerId = sitesSnap.docs[0].data().ownerId;
    await db().collection("analytics_events").add({
      siteId,
      ownerId,
      type: data.type === "page_view" ? "page_view" : "custom",
      path: data.path ?? "/",
      referrer: data.referrer ?? null,
      metadata: data.metadata ?? null,
      timestamp: Timestamp.fromDate(new Date()),
    });
    return { ok: true };
  }

  return { ok: false, error: "Invalid token" };
}

export async function getAnalyticsForProject(
  projectId: string,
  ownerId: string,
  days: number = 30
): Promise<{
  pageViews: number;
  uniquePaths: number;
  dailyViews: { date: string; views: number }[];
  topPaths: { path: string; count: number }[];
}> {
  if (!adminApp) {
    return { pageViews: 0, uniquePaths: 0, dailyViews: [], topPaths: [] };
  }
  const projectSnap = await db().collection("projects").doc(projectId).get();
  if (!projectSnap.exists || projectSnap.data()?.ownerId !== ownerId) {
    return { pageViews: 0, uniquePaths: 0, dailyViews: [], topPaths: [] };
  }

  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const snapshot = await db()
    .collection("analytics_events")
    .where("projectId", "==", projectId)
    .where("type", "==", "page_view")
    .where("timestamp", ">=", Timestamp.fromDate(start))
    .get();

  const events = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      path: data.path ?? "/",
      timestamp: toDate(data.timestamp),
    };
  });

  const pageViews = events.length;
  const pathCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  events.forEach((e) => {
    pathCounts[e.path] = (pathCounts[e.path] ?? 0) + 1;
    const day = e.timestamp.toISOString().slice(0, 10);
    dateCounts[day] = (dateCounts[day] ?? 0) + 1;
  });

  const topPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const dailyViews = Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, views]) => ({ date, views }));

  return {
    pageViews,
    uniquePaths: Object.keys(pathCounts).length,
    dailyViews,
    topPaths,
  };
}

export async function getAnalyticsForSite(
  siteId: string,
  ownerId: string,
  days: number = 30
): Promise<{
  pageViews: number;
  uniquePaths: number;
  dailyViews: { date: string; views: number }[];
  topPaths: { path: string; count: number }[];
}> {
  if (!adminApp) {
    return { pageViews: 0, uniquePaths: 0, dailyViews: [], topPaths: [] };
  }
  const siteSnap = await db().collection("sites").doc(siteId).get();
  if (!siteSnap.exists || siteSnap.data()?.ownerId !== ownerId) {
    return { pageViews: 0, uniquePaths: 0, dailyViews: [], topPaths: [] };
  }

  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const snapshot = await db()
    .collection("analytics_events")
    .where("siteId", "==", siteId)
    .where("type", "==", "page_view")
    .where("timestamp", ">=", Timestamp.fromDate(start))
    .get();

  const events = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      path: data.path ?? "/",
      timestamp: toDate(data.timestamp),
    };
  });

  const pageViews = events.length;
  const pathCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  events.forEach((e) => {
    pathCounts[e.path] = (pathCounts[e.path] ?? 0) + 1;
    const day = e.timestamp.toISOString().slice(0, 10);
    dateCounts[day] = (dateCounts[day] ?? 0) + 1;
  });

  const topPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const dailyViews = Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, views]) => ({ date, views }));

  return {
    pageViews,
    uniquePaths: Object.keys(pathCounts).length,
    dailyViews,
    topPaths,
  };
}

export async function updateProjectSite(
  projectId: string,
  ownerId: string,
  websiteUrl: string
): Promise<{ token: string; error?: string }> {
  if (!adminApp) return { token: "", error: "Not configured" };
  const projectRef = db().collection("projects").doc(projectId);
  const snap = await projectRef.get();
  if (!snap.exists || snap.data()?.ownerId !== ownerId) {
    return { token: "", error: "Project not found" };
  }
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  await projectRef.update({
    websiteUrl: websiteUrl.replace(/\/$/, ""),
    siteToken: token,
    siteVerifiedAt: null,
    updatedAt: Timestamp.fromDate(new Date()),
  });
  return { token };
}

export async function verifyProjectSite(projectId: string, ownerId: string): Promise<boolean> {
  if (!adminApp) return false;
  const projectRef = db().collection("projects").doc(projectId);
  const snap = await projectRef.get();
  if (!snap.exists || snap.data()?.ownerId !== ownerId) return false;
  const data = snap.data()!;
  const websiteUrl = data.websiteUrl;
  const token = data.siteToken;
  if (!websiteUrl || !token) return false;

  try {
    const base = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    const res = await fetch(base, { headers: { "User-Agent": "MerchantMagix-Verifier/1.0" } });
    const html = await res.text();
    const metaMatch = html.match(
      new RegExp(
        `<meta[^>]+name=["']merchantmagix-site["'][^>]+content=["']${token}["']`,
        "i"
      )
    ) || html.match(
      new RegExp(
        `<meta[^>]+content=["']${token}["'][^>]+name=["']merchantmagix-site["']`,
        "i"
      )
    );
    if (metaMatch) {
      await projectRef.update({
        siteVerifiedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return true;
    }
  } catch {
    // fetch failed
  }
  return false;
}

export interface FirestoreInvoiceFull extends FirestoreInvoice {
  project?: { name: string };
  dueDate?: Date;
  paidAt?: Date;
  stripePaymentUrl?: string;
  pdfUrl?: string;
  description?: string;
}

export async function getInvoicesByUser(userId: string): Promise<FirestoreInvoiceFull[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("invoices")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const invoices: FirestoreInvoiceFull[] = [];
  for (const d of snapshot.docs) {
    const data = d.data();
    let projectName: string | undefined;
    if (data.projectId) {
      const projSnap = await db().collection("projects").doc(data.projectId).get();
      projectName = projSnap.data()?.name ?? projSnap.data()?.title;
    }
    invoices.push({
      id: d.id,
      invoiceNumber: data.invoiceNumber ?? "",
      amount: data.amount ?? 0,
      status: data.status ?? "PENDING",
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      project: projectName ? { name: projectName } : undefined,
      dueDate: data.dueDate ? toDate(data.dueDate) : undefined,
      paidAt: data.paidAt ? toDate(data.paidAt) : undefined,
      stripePaymentUrl: data.stripePaymentUrl,
      pdfUrl: data.pdfUrl,
      description: data.description,
    });
  }
  return invoices;
}

export interface DashboardActivity {
  id: string;
  type: "project" | "ticket" | "invoice";
  message: string;
  date: Date;
  href?: string;
}

export async function getDashboardData(userId: string): Promise<{
  projectCount: number;
  openTicketCount: number;
  pendingInvoiceTotal: number;
  projectsInDevelopment: number;
  recentActivity: DashboardActivity[];
  projects: (FirestoreProject & { milestones: { status?: string }[] })[];
}> {
  const [projects, tickets, invoices] = await Promise.all([
    getProjectsWithMilestones(userId),
    getTicketsByUser(userId),
    getInvoicesByUser(userId),
  ]);

  const openTickets = tickets.filter((t) => t.status !== "RESOLVED");
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const projectsInDev = projects.filter(
    (p) => p.status === "DEVELOPMENT" || p.status === "DESIGN" || p.status === "REVIEW"
  ).length;

  const activity: DashboardActivity[] = [];

  projects.forEach((p) => {
    activity.push({
      id: `project-${p.id}`,
      type: "project",
      message: `Project "${p.name}" is ${p.status.replace("_", " ").toLowerCase()}`,
      date: p.updatedAt,
      href: `/dashboard/projects/${p.id}`,
    });
  });

  tickets.forEach((t) => {
    const verb = t.status === "RESOLVED" ? "was resolved" : "needs attention";
    activity.push({
      id: `ticket-${t.id}`,
      type: "ticket",
      message: `Support ticket "${t.subject}" ${verb}`,
      date: t.updatedAt,
      href: `/dashboard/support/${t.id}`,
    });
  });

  invoices
    .filter((i) => i.status === "PAID")
    .forEach((i) => {
      activity.push({
        id: `invoice-${i.id}`,
        type: "invoice",
        message: `Invoice ${i.invoiceNumber} was paid`,
        date: i.paidAt ?? i.updatedAt,
        href: "/dashboard/billing",
      });
    });

  activity.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivity = activity.slice(0, 10);

  return {
    projectCount: projects.length,
    openTicketCount: openTickets.length,
    pendingInvoiceTotal: pendingTotal,
    projectsInDevelopment: projectsInDev,
    recentActivity,
    projects: projects.slice(0, 5),
  };
}

// --- Team / Organization ---

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  displayName?: string;
  email?: string;
  joinedAt: Date;
}

export interface OrgInvite {
  id: string;
  organizationId: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  invitedBy: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdAt: Date;
}

export async function getTeamData(userId: string): Promise<{
  organization: Organization | null;
  members: OrgMember[];
  invites: OrgInvite[];
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null;
}> {
  if (!adminApp) return { organization: null, members: [], invites: [], currentUserRole: null };

  const memberSnap = await db()
    .collection("org_members")
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (memberSnap.empty) {
    return { organization: null, members: [], invites: [], currentUserRole: null };
  }

  const memberData = memberSnap.docs[0].data();
  const orgId = memberData.organizationId;
  const orgSnap = await db().collection("organizations").doc(orgId).get();
  if (!orgSnap.exists) return { organization: null, members: [], invites: [], currentUserRole: null };

  const orgData = orgSnap.data()!;
  const organization: Organization = {
    id: orgSnap.id,
    name: orgData.name ?? "My Organization",
    ownerId: orgData.ownerId ?? "",
    createdAt: toDate(orgData.createdAt),
    updatedAt: toDate(orgData.updatedAt),
  };

  const membersSnap = await db()
    .collection("org_members")
    .where("organizationId", "==", orgId)
    .get();

  const members: OrgMember[] = [];
  for (const d of membersSnap.docs) {
    const m = d.data();
    let displayName: string | undefined;
    let email: string | undefined;
    const userSnap = await db().collection("users").doc(m.userId).get();
    if (userSnap.exists) {
      displayName = userSnap.data()?.displayName;
      email = userSnap.data()?.email;
    }
    members.push({
      id: d.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role ?? "MEMBER",
      displayName,
      email,
      joinedAt: toDate(m.joinedAt),
    });
  }

  const invitesSnap = await db()
    .collection("org_invites")
    .where("organizationId", "==", orgId)
    .where("status", "==", "PENDING")
    .orderBy("createdAt", "desc")
    .get();

  const invites: OrgInvite[] = invitesSnap.docs.map((d) => {
    const i = d.data();
    return {
      id: d.id,
      organizationId: i.organizationId,
      email: i.email ?? "",
      role: i.role ?? "MEMBER",
      invitedBy: i.invitedBy ?? "",
      status: i.status ?? "PENDING",
      createdAt: toDate(i.createdAt),
    };
  });

  const currentMember = members.find((m) => m.userId === userId);
  const currentUserRole = currentMember?.role ?? null;

  return { organization, members, invites, currentUserRole };
}

export async function createOrganization(userId: string, name: string): Promise<Organization | null> {
  if (!adminApp) throw new Error("Firebase Admin not configured");
  const now = new Date();
  const ref = await db().collection("organizations").add({
    name: name.trim() || "My Organization",
    ownerId: userId,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  await db().collection("org_members").add({
    userId,
    organizationId: ref.id,
    role: "OWNER",
    joinedAt: Timestamp.fromDate(now),
  });
  const doc = await ref.get();
  const data = doc.data()!;
  return {
    id: ref.id,
    name: data.name ?? "My Organization",
    ownerId: data.ownerId,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function inviteToOrganization(
  orgId: string,
  inviterId: string,
  email: string,
  role: "ADMIN" | "MEMBER" | "VIEWER"
): Promise<{ ok: boolean; error?: string; inviteId?: string; token?: string }> {
  if (!adminApp) return { ok: false, error: "Not configured" };
  const orgSnap = await db().collection("organizations").doc(orgId).get();
  if (!orgSnap.exists) return { ok: false, error: "Organization not found" };
  const orgData = orgSnap.data()!;
  const isOwner = orgData.ownerId === inviterId;
  const memberSnap = await db()
    .collection("org_members")
    .where("organizationId", "==", orgId)
    .where("userId", "==", inviterId)
    .limit(1)
    .get();
  const inviterRole = memberSnap.docs[0]?.data()?.role;
  const canInvite = isOwner || inviterRole === "ADMIN" || inviterRole === "OWNER";
  if (!canInvite) return { ok: false, error: "Not authorized to invite" };
  const existing = await db()
    .collection("org_members")
    .where("organizationId", "==", orgId)
    .get();
  for (const d of existing.docs) {
    const u = await db().collection("users").doc(d.data().userId).get();
    if (u.data()?.email?.toLowerCase() === email.toLowerCase()) {
      return { ok: false, error: "User is already a member" };
    }
  }
  const existingInvite = await db()
    .collection("org_invites")
    .where("organizationId", "==", orgId)
    .where("email", "==", email.toLowerCase())
    .where("status", "==", "PENDING")
    .limit(1)
    .get();
  if (!existingInvite.empty) return { ok: false, error: "Invite already sent" };

  const token = crypto.randomUUID().replace(/-/g, "");
  const ref = await db().collection("org_invites").add({
    organizationId: orgId,
    email: email.toLowerCase(),
    role,
    invitedBy: inviterId,
    status: "PENDING",
    token,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return { ok: true, inviteId: ref.id, token };
}

export async function getInviteByToken(token: string): Promise<{
  invite: OrgInvite & { id: string; orgName?: string };
} | null> {
  if (!adminApp) return null;
  const snap = await db()
    .collection("org_invites")
    .where("token", "==", token)
    .where("status", "==", "PENDING")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  const orgSnap = await db().collection("organizations").doc(data.organizationId).get();
  const orgName = orgSnap.exists ? (orgSnap.data()?.name ?? "Organization") : "Organization";
  return {
    invite: {
      id: d.id,
      organizationId: data.organizationId,
      email: data.email ?? "",
      role: data.role ?? "MEMBER",
      invitedBy: data.invitedBy ?? "",
      status: data.status ?? "PENDING",
      createdAt: toDate(data.createdAt),
      orgName,
    },
  };
}

export async function acceptInvite(
  token: string,
  userId: string,
  userEmail: string
): Promise<{ ok: boolean; error?: string }> {
  if (!adminApp) return { ok: false, error: "Not configured" };
  const result = await getInviteByToken(token);
  if (!result) return { ok: false, error: "Invalid or expired invite" };
  const { invite } = result;
  if (userEmail.toLowerCase() !== invite.email) {
    return { ok: false, error: "This invite was sent to a different email address" };
  }
  const existing = await db()
    .collection("org_members")
    .where("organizationId", "==", invite.organizationId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  if (!existing.empty) return { ok: false, error: "You are already a member" };

  const now = new Date();
  await db().collection("org_members").add({
    userId,
    organizationId: invite.organizationId,
    role: invite.role,
    joinedAt: Timestamp.fromDate(now),
  });
  await db().collection("org_invites").doc(invite.id).update({
    status: "ACCEPTED",
    acceptedAt: Timestamp.fromDate(now),
    acceptedBy: userId,
  });
  return { ok: true };
}

// --- Intakes ---

export interface FirestoreIntake {
  id: string;
  status: "SUBMITTED" | "REVIEWED" | "PROJECT_CREATED";
  projectType: string;
  businessName?: string;
  industry?: string;
  goals?: string;
  scope?: string;
  features?: string;
  budget?: string;
  timeline?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  ownerId?: string | null;
  projectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntakeInput {
  projectType: string;
  businessName?: string;
  industry?: string;
  goals?: string;
  scope?: string;
  features?: string;
  budget?: string;
  timeline?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  ownerId?: string | null;
}

export async function createIntake(data: CreateIntakeInput): Promise<FirestoreIntake> {
  if (!adminApp) throw new Error("Not configured");
  const now = new Date();
  const ref = await db().collection("intakes").add({
    status: "SUBMITTED",
    projectType: data.projectType ?? "",
    businessName: data.businessName ?? null,
    industry: data.industry ?? null,
    goals: data.goals ?? null,
    scope: data.scope ?? null,
    features: data.features ?? null,
    budget: data.budget ?? null,
    timeline: data.timeline ?? null,
    contactName: data.contactName ?? "",
    contactEmail: data.contactEmail ?? "",
    contactPhone: data.contactPhone ?? null,
    ownerId: data.ownerId ?? null,
    projectId: null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  const doc = await ref.get();
  const d = doc.data()!;
  return {
    id: ref.id,
    status: d.status ?? "SUBMITTED",
    projectType: d.projectType ?? "",
    businessName: d.businessName,
    industry: d.industry,
    goals: d.goals,
    scope: d.scope,
    features: d.features,
    budget: d.budget,
    timeline: d.timeline,
    contactName: d.contactName ?? "",
    contactEmail: d.contactEmail ?? "",
    contactPhone: d.contactPhone,
    ownerId: d.ownerId,
    projectId: d.projectId,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function getIntakesForAdmin(): Promise<FirestoreIntake[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("intakes")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      status: data.status ?? "SUBMITTED",
      projectType: data.projectType ?? "",
      businessName: data.businessName,
      industry: data.industry,
      goals: data.goals,
      scope: data.scope,
      features: data.features,
      budget: data.budget,
      timeline: data.timeline,
      contactName: data.contactName ?? "",
      contactEmail: data.contactEmail ?? "",
      contactPhone: data.contactPhone,
      ownerId: data.ownerId,
      projectId: data.projectId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function getIntakesByUser(ownerId: string): Promise<FirestoreIntake[]> {
  if (!adminApp) return [];
  const snapshot = await db()
    .collection("intakes")
    .where("ownerId", "==", ownerId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      status: data.status ?? "SUBMITTED",
      projectType: data.projectType ?? "",
      businessName: data.businessName,
      industry: data.industry,
      goals: data.goals,
      scope: data.scope,
      features: data.features,
      budget: data.budget,
      timeline: data.timeline,
      contactName: data.contactName ?? "",
      contactEmail: data.contactEmail ?? "",
      contactPhone: data.contactPhone,
      ownerId: data.ownerId,
      projectId: data.projectId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function createProject(
  ownerId: string,
  data: { name: string; description?: string; type: string }
): Promise<FirestoreProject> {
  if (!adminApp) throw new Error("Not configured");
  const now = new Date();
  const ref = await db().collection("projects").add({
    ownerId,
    name: data.name,
    description: data.description ?? null,
    type: data.type ?? "SHOPIFY",
    status: "DISCOVERY",
    startDate: null,
    targetLaunchDate: null,
    websiteUrl: null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  const doc = await ref.get();
  const d = doc.data()!;
  return {
    id: ref.id,
    ownerId: d.ownerId,
    name: d.name ?? "",
    description: d.description,
    type: d.type ?? "SHOPIFY",
    status: d.status ?? "DISCOVERY",
    startDate: undefined,
    targetLaunchDate: undefined,
    websiteUrl: d.websiteUrl,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function createProjectFromIntake(
  intakeId: string,
  developerId: string
): Promise<{ project: FirestoreProject; error?: string }> {
  if (!adminApp) return { project: null as unknown as FirestoreProject, error: "Not configured" };
  const intakeSnap = await db().collection("intakes").doc(intakeId).get();
  if (!intakeSnap.exists) return { project: null as unknown as FirestoreProject, error: "Intake not found" };
  const intake = intakeSnap.data()!;
  if (intake.status === "PROJECT_CREATED") {
    return { project: null as unknown as FirestoreProject, error: "Project already created from this intake" };
  }

  const ownerId = intake.ownerId ?? developerId;
  const projectName = intake.businessName
    ? `${intake.businessName} - ${intake.projectType}`
    : `${intake.contactName} - ${intake.projectType}`;

  const project = await createProject(ownerId, {
    name: projectName.trim(),
    description: [intake.goals, intake.scope, intake.features].filter(Boolean).join("\n\n") || undefined,
    type: intake.projectType?.toUpperCase().includes("CUSTOM") ? "CUSTOM" : "SHOPIFY",
  });

  await db().collection("intakes").doc(intakeId).update({
    status: "PROJECT_CREATED",
    projectId: project.id,
    updatedAt: Timestamp.fromDate(new Date()),
  });

  return { project };
}
