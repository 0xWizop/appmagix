"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
const toDateTimeLocal = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./booking-calendar.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Loader2, Trash2, Link2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type BookingEvent = Event & {
  id?: string;
  userId?: string;
  projectId?: string | null;
  status?: string;
  description?: string | null;
  user?: { name: string | null; email: string };
  project?: { name: string } | null;
};

type BookingPageClientProps = {
  isAdmin: boolean;
  projects: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
};

export function BookingPageClient({
  isAdmin,
  projects,
  users,
}: BookingPageClientProps) {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<BookingEvent | null>(null);
  const [bookingLinks, setBookingLinks] = useState<{ id: string; title: string; slug: string; durationMinutes: number; active: boolean }[]>([]);
  const [createLinkOpen, setCreateLinkOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return { start, end };
  });

  const fetchBookings = useCallback(
    async (start: Date, end: Date) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        });
        const res = await fetch(`/api/bookings?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const list: BookingEvent[] = (data.bookings || []).map((b: {
          id: string;
          title: string;
          description?: string | null;
          startTime: string;
          endTime: string;
          userId: string;
          projectId?: string | null;
          status: string;
          user?: { name: string | null; email: string };
          project?: { name: string } | null;
        }) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          userId: b.userId,
          projectId: b.projectId,
          status: b.status,
          user: b.user,
          project: b.project,
        }));
        setEvents(list);
        setDateRange({ start, end });
      } catch (e) {
        console.error(e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      const r = Array.isArray(range) ? range[0] : range.start;
      const start = startOfMonth(r);
      const end = endOfMonth(r);
      if (
        !dateRange.start ||
        start.getTime() !== dateRange.start.getTime() ||
        end.getTime() !== dateRange.end.getTime()
      ) {
        fetchBookings(start, end);
      }
    },
    [dateRange, fetchBookings]
  );

  const onNavigate = useCallback(
    (date: Date) => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      fetchBookings(start, end);
    },
    [fetchBookings]
  );

  useEffect(() => {
    fetchBookings(dateRange.start, dateRange.end);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const refetchBookingLinks = useCallback(() => {
    fetch("/api/booking-links")
      .then((res) => res.json())
      .then((data) => setBookingLinks(data.links || []))
      .catch(() => setBookingLinks([]));
  }, []);
  useEffect(() => refetchBookingLinks(), [refetchBookingLinks]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Card className="mb-3 border-border bg-surface py-2 px-3">
        <CardContent className="flex flex-wrap items-center gap-3 py-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
            <Link2 className="h-3.5 w-3.5 text-brand-green" />
            Booking links
          </span>
          {bookingLinks.length === 0 ? (
            <span className="text-xs text-text-muted">No links yet.</span>
          ) : (
            <ul className="flex flex-wrap items-center gap-2">
              {bookingLinks.map((l) => (
                <li key={l.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
                  <span className="text-xs text-text-secondary">{l.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs"
                    onClick={() => {
                      const u = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${l.slug}`;
                      navigator.clipboard.writeText(u);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <CreateBookingLinkDialog open={createLinkOpen} onOpenChange={setCreateLinkOpen} onCreated={() => { setCreateLinkOpen(false); refetchBookingLinks(); }} />
          <Button variant="outline" size="sm" onClick={() => setCreateLinkOpen(true)} className="h-7 gap-1 text-xs">
            <Link2 className="h-3 w-3" />
            New link
          </Button>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="text-sm text-text-secondary">
            View and schedule calls, kickoffs, and reviews.
          </p>
        </div>
        <CreateBookingDialog
          isAdmin={isAdmin}
          projects={projects}
          users={users}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={() => {
            if (dateRange.start && dateRange.end) {
              fetchBookings(dateRange.start, dateRange.end);
            }
          }}
        />
      </div>
      <EditBookingDialog
        event={editEvent}
        open={!!editEvent}
        onOpenChange={(open) => !open && setEditEvent(null)}
        projects={projects}
        isAdmin={isAdmin}
        users={users}
        onSaved={() => {
          setEditEvent(null);
          if (dateRange.start && dateRange.end) fetchBookings(dateRange.start, dateRange.end);
        }}
      />
      <div className="flex-1 min-h-[520px] relative rounded-2xl border border-border bg-surface overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          </div>
        )}
        <div className="booking-calendar-dark flex-1 min-h-[520px] p-4 flex flex-col">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onRangeChange={onRangeChange}
            onNavigate={onNavigate}
            onSelectEvent={(event) => setEditEvent(event as BookingEvent)}
            style={{ height: "100%", minHeight: 520 }}
            // @ts-ignore - overrides for custom toolbars
            components={{
              toolbar: CustomToolbar,
              event: CustomEventWrapper,
            }}
            eventPropGetter={() => ({
              className: "rbc-event-solid shadow-sm",
              style: {
                backgroundColor: "#22c55e",
                color: "#18181b",
                border: "none",
                borderRadius: "6px",
              },
            })}
          />
        </div>
      </div>
    </div>
  );
}

function CreateBookingLinkDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/booking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: (slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || "booking",
          durationMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create link");
      onCreated();
      onOpenChange(false);
      setTitle("");
      setSlug("");
      setDurationMinutes(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New booking link</DialogTitle>
          <DialogDescription>
            Clients will use this link to pick a time. You will see their booking on your calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Discovery call" required />
          </div>
          <div>
            <Label>URL slug (lowercase, hyphens only)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, "").toLowerCase())}
              placeholder="discovery-call"
            />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type EditBookingDialogProps = {
  event: BookingEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
  isAdmin: boolean;
  users: { id: string; name: string | null; email: string }[];
  onSaved: () => void;
};

function EditBookingDialog({
  event,
  open,
  onOpenChange,
  projects,
  isAdmin,
  users,
  onSaved,
}: EditBookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [projectId, setProjectId] = useState<string>("__none__");
  const [status, setStatus] = useState<"SCHEDULED" | "COMPLETED" | "CANCELLED">("SCHEDULED");

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartTime(event.start ? toDateTimeLocal(event.start) : "");
      setEndTime(event.end ? toDateTimeLocal(event.end) : "");
      setProjectId(event.projectId || "__none__");
      setStatus((event.status as "SCHEDULED" | "COMPLETED" | "CANCELLED") || "SCHEDULED");
      setError(null);
    }
  }, [event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event?.id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          projectId: projectId && projectId !== "__none__" ? projectId : null,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit booking</DialogTitle>
          <DialogDescription>
            Update booking details. Changes are saved immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {event.user && (
            <p className="text-sm text-text-secondary">
              With: {event.user.name || event.user.email}
            </p>
          )}
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          {projects.length > 0 && (
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "SCHEDULED" | "COMPLETED" | "CANCELLED")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="ml-2">Cancel booking</span>
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CreateBookingDialogProps = {
  isAdmin: boolean;
  projects: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

function CreateBookingDialog({
  isAdmin,
  projects,
  users,
  open,
  onOpenChange,
  onCreated,
}: CreateBookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [projectId, setProjectId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const endDateTimeDisplay = (() => {
    if (!startDateTime) return null;
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return toDateTimeLocal(end);
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateTime) {
      setError("Please select a start date and time");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const start = new Date(startDateTime);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const payload: {
        title: string;
        description?: string;
        startTime: string;
        endTime: string;
        projectId?: string;
        userId?: string;
      } = {
        title,
        description: description || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
      if (projectId) payload.projectId = projectId;
      if (isAdmin && userId) payload.userId = userId;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");
      onCreated();
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setStartDateTime("");
      setDurationMinutes(30);
      setProjectId("");
      setUserId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          New booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
          <DialogDescription>
            Schedule a call, meeting, or review. End time is calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {isAdmin && users.length > 0 && (
            <div>
              <Label>Client</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discovery call"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda or notes"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="start">Start (date & time)</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>
          <div>
            <Label>Duration</Label>
            <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {endDateTimeDisplay && (
            <div>
              <Label className="text-text-muted">End (auto-filled)</Label>
              <p className="text-sm text-text-primary mt-1 rounded-md border border-border bg-surface px-3 py-2">
                {endDateTimeDisplay.replace("T", " at ")}
              </p>
            </div>
          )}
          {projects.length > 0 && (
            <div>
              <Label>Project (optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomToolbar(toolbar: any) {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  const label = () => {
    const date = format(toolbar.date, 'MMMM yyyy');
    return <span className="text-xl font-bold text-text-primary capitalize tracking-tight">{date}</span>;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        {label()}
        <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden shadow-sm">
          <button type="button" onClick={goToBack} className="p-2 hover:bg-surface-hover text-text-secondary transition-colors" title="Previous"><ChevronLeft className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-border" />
          <button type="button" onClick={goToCurrent} className="px-3 py-1 text-sm font-medium hover:bg-surface-hover text-text-secondary transition-colors" title="Today">Today</button>
          <div className="w-[1px] h-4 bg-border" />
          <button type="button" onClick={goToNext} className="p-2 hover:bg-surface-hover text-text-secondary transition-colors" title="Next"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm">
        {['month', 'week', 'day', 'agenda'].map(view => (
          <button
            key={view}
            type="button"
            onClick={() => toolbar.onView(view)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
              toolbar.view === view ? "bg-brand-green text-black shadow-sm" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            )}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}

function CustomEventWrapper({ event }: { event: BookingEvent }) {
  return (
    <div className="flex flex-col gap-0.5 px-1 py-0.5 w-full overflow-hidden">
      <span className="font-medium truncate text-xs leading-tight">{event.title}</span>
      {event.user && (
        <span className="truncate text-[9px] opacity-80 leading-tight">
          {event.user.name || event.user.email}
        </span>
      )}
    </div>
  );
}
