"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFirebaseAuth } from "@/lib/firebase-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{ orgName: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/team/invite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invite) {
          setInvite({ orgName: data.invite.orgName ?? "Organization", email: data.invite.email });
        } else {
          setError(data.error ?? "Invalid invite");
        }
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!user?.email) return;
    setAccepting(true);
    try {
      const res = await fetch("/api/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to accept");
        return;
      }
      setAccepted(true);
      setTimeout(() => router.push("/dashboard/team"), 1500);
    } catch {
      setError("Failed to accept");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Invalid Invite</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) return null;

  const emailMatch = user?.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>
            {accepted ? "You're in!" : `Join ${invite.orgName}`}
          </CardTitle>
          <CardDescription>
            {accepted
              ? "Redirecting to your team..."
              : `You've been invited to join ${invite.orgName} as a team member.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accepted ? (
            <div className="flex items-center gap-2 text-brand-green">
              <CheckCircle className="h-5 w-5" />
              <span>Successfully joined the team</span>
            </div>
          ) : !user ? (
            <>
              <p className="text-sm text-text-secondary">Sign in with {invite.email} to accept.</p>
              <Button asChild className="w-full">
                <Link href={`/login?redirect=/invite/${token}`}>Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Create Account</Link>
              </Button>
            </>
          ) : !emailMatch ? (
            <>
              <p className="text-sm text-text-secondary">
                This invite was sent to <strong>{invite.email}</strong>. You&apos;re signed in as{" "}
                <strong>{user.email}</strong>.
              </p>
              <p className="text-sm text-text-muted">
                Sign out and sign in with {invite.email} to accept.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Accept Invite
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/dashboard">Decline</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
