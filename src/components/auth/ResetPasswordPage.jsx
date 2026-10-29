const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link } from "@tanstack/react-router";
import { AlertTriangle, Lock } from "lucide-react";
import { useState } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The /reset-password page; the reset email links here with ?token=.
export function ResetPasswordPage() {
  // Read raw: the router's search parser would turn an all-digit token into a number.
  const token = new URLSearchParams(window.location.search).get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیست");
      return;
    }
    setBusy(true);
    try {
      await db.auth.resetPassword({ resetToken: token, newPassword: password });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "تغییر رمز عبور ناموفق بود");
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="لینک نامعتبر"
        subtitle="این لینک بازیابی ناقص یا منقضی شده است"
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            درخواست لینک جدید
          </Link>
        }
      >
        <p className="text-center text-xs leading-6 text-foreground">
          لینکی که باز کردید کامل نیست. لطفاً یک ایمیل بازیابی جدید درخواست کنید.
        </p>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout title="رمز عبور جدید" subtitle="رمز عبور تازه خود را وارد کنید">
      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-password">رمز عبور جدید</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 ps-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">تکرار رمز عبور</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 ps-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="در حال تغییر…">
          ذخیره رمز عبور
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}