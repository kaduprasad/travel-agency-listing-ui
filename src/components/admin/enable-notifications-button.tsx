"use client";
import * as React from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "denied" | "unsubscribed" | "subscribed";

export function EnableNotificationsButton() {
  const [state, setState] = React.useState<State>("loading");
  const [busy, setBusy] = React.useState(false);
  const { toast } = useToast();
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const refresh = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setState("unsupported");
    if (Notification.permission === "denied") return setState("denied");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? "subscribed" : "unsubscribed");
    } catch {
      setState("unsubscribed");
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  async function subscribe() {
    if (!vapid) {
      toast({ variant: "destructive", title: "Push not configured", description: "VAPID public key missing." });
      return;
    }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "denied" : "unsubscribed"); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sub.toJSON(), user_agent: navigator.userAgent }),
      });
      if (!res.ok) throw new Error("Server rejected subscription");
      setState("subscribed");
      toast({ variant: "success", title: "Notifications enabled", description: "You'll get a push on every new enquiry." });
    } catch (e) {
      toast({ variant: "destructive", title: "Could not enable notifications", description: e instanceof Error ? e.message : "" });
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: "DELETE" });
        await sub.unsubscribe();
      }
      setState("unsubscribed");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <Button variant="outline" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin" /> Checking…</Button>;
  if (state === "unsupported") return <Button variant="outline" size="sm" disabled><BellOff className="h-4 w-4" /> Push unsupported</Button>;
  if (state === "denied") return <Button variant="outline" size="sm" disabled title="Re-enable notifications in browser settings"><BellOff className="h-4 w-4" /> Blocked</Button>;
  if (state === "subscribed") return <Button variant="outline" size="sm" onClick={unsubscribe} disabled={busy}><Bell className="h-4 w-4" /> Notifications on</Button>;
  return <Button variant="gradient" size="sm" onClick={subscribe} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Enable notifications</Button>;
}
