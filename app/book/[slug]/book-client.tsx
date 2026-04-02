"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

type LinkInfo = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
};

export function BookPageClient({ slug, link }: { slug: string; link: LinkInfo }) {
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selected, setSelected] = useState<{ start: string; end: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    fetch(
      `/api/booking-links/${slug}/slots?start=${start.toISOString()}&end=${end.toISOString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) setSlots(data.slots);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [slug]);

  const slotsByDay = slots.reduce<Record<string, { start: string; end: string }[]>>((acc, s) => {
    const day = format(parseISO(s.start), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-links/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: selected.start,
          endTime: selected.end,
          guestName: name.trim(),
          guestEmail: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-3 text-brand-green">
              <CheckCircle className="h-10 w-10" />
              <CardTitle className="text-xl">You’re booked</CardTitle>
            </div>
            <CardDescription>
              We’ve sent a confirmation to {email}. Add this to your calendar and we’ll see you then.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center p-6 pt-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link href="/" className="text-xl font-brand italic tracking-tight text-text-primary">
            merchant<span className="text-brand-green">magix</span>.
          </Link>
        </div>
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-xl">{link.title}</CardTitle>
            <CardDescription>
              {link.durationMinutes} min · Pick a time below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selected ? (
              <>
                <p className="text-sm text-text-secondary">Available times</p>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-text-muted">No available slots in the next 2 weeks.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(slotsByDay).map(([day, daySlots]) => (
                      <div key={day}>
                        <p className="mb-2 text-xs font-medium text-text-muted">
                          {format(parseISO(day), "EEEE, MMM d")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((slot) => (
                            <Button
                              key={slot.start}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-border hover:bg-brand-green hover:border-brand-green hover:text-black"
                              onClick={() => setSelected(slot)}
                            >
                              {format(parseISO(slot.start), "h:mm a")}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  {format(parseISO(selected.start), "EEEE, MMM d 'at' h:mm a")} –{" "}
                  {format(parseISO(selected.end), "h:mm a")}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-text-muted"
                  onClick={() => setSelected(null)}
                >
                  Change time
                </Button>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="mt-1 border-border bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1 border-border bg-background"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-green text-black hover:bg-brand-green-light"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
