"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirebaseAuth, type AccountType } from "@/lib/firebase-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Loader2, User, Wrench } from "lucide-react";

const GOOGLE_ENABLED = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
);

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user, loading } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("USER");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, name, accountType);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("auth/email-already-in-use")) {
        setError("An account with this email already exists");
      } else if (msg.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError("Could not sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 py-8">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(105deg, transparent, transparent 2px, rgb(34 197 94) 2px, rgb(34 197 94) 3px)`,
          backgroundSize: "100px 100px",
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-green/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-green/8 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md relative bg-black border-2 border-brand-green/30 shadow-xl shadow-black/40">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-brand italic tracking-tight">
              merchant<span className="text-brand-green">magix</span>.
            </span>
          </Link>
          <CardTitle className="text-2xl text-white">Create an account</CardTitle>
          <CardDescription className="text-white/70">
            Get started with your merchantmagix dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {GOOGLE_ENABLED && (
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </Button>
          )}

          {GOOGLE_ENABLED && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-white/60">Or continue with</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/90">Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("USER")}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors",
                    accountType === "USER"
                      ? "border-brand-green bg-brand-green-dark text-white"
                      : "border-border hover:border-brand-green/50 text-white/80"
                  )}
                >
                  <User className="h-5 w-5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">User</div>
                    <div className="text-xs opacity-80">I need a website or app built</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("DEVELOPER")}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors",
                    accountType === "DEVELOPER"
                      ? "border-brand-green bg-brand-green-dark text-white"
                      : "border-border hover:border-brand-green/50 text-white/80"
                  )}
                >
                  <Wrench className="h-5 w-5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Developer</div>
                    <div className="text-xs opacity-80">I build for clients</div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-white/60">You can switch this anytime in Settings</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create a password (min 6 chars)" required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" required autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-green hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
