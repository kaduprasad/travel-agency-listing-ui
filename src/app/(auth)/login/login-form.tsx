"use client";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="gradient" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-white/80">Mobile number or Email</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          inputMode="email"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          placeholder="9876543210 or admin@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
