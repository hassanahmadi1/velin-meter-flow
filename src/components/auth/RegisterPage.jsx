const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Lock, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { safeReturnTo } from "@/lib/authReturnTo";

const isAlreadyVerified = (err) => err?.status === 400 && /already verified/i.test(err?.message ?? "");

/**
 * The /register page: register → OTP → verifyOtp → setToken. Registration alone
 * does not sign the user in (the account is unverified), so the code step is never
 * skipped and loginViaEmailPassword is never called right after register.
 */
export function RegisterPage() {
  const returnTo = safeReturnTo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function register(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیست");
      return;
    }
    setBusy(true);
    try {
      await db.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "ثبتنام ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await db.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) db.auth.setToken(result.access_token);
      window.location.href = returnTo;
    } catch (err) {
      // Verified server-side but the answer never arrived: the code is spent and
      // there is no token, so the only way forward is a normal sign-in.
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "کد تایید نادرست است");
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await db.auth.resendOtp(email);
      toast("کد ارسال شد", { description: "ایمیل خود را برای دریافت کد جدید بررسی کنید." });
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "ارسال مجدد کد ناموفق بود");
    }
  }

  if (step === "already_verified") {
    return (
      <AuthLayout title="ساخت حساب کاربری" subtitle="برای شروع، حساب خود را بسازید">
        <p className="mb-4 text-xs leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> قبلاً تایید شده است. برای ادامه وارد شوید.
        </p>
        <AuthLink to="/login" returnTo={returnTo} className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          ورود
        </AuthLink>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout title="ساخت حساب کاربری" subtitle="کد تایید را وارد کنید">
        <form onSubmit={verify}>
          <p className="mb-4 text-xs leading-6 text-muted-foreground">
            یک کد ۶ رقمی به <span className="font-medium text-foreground">{email}</span> ارسال شد.
          </p>
          <AuthError>{error}</AuthError>
          <div className="mb-6 flex justify-center" dir="ltr">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <SubmitButton busy={busy} busyLabel="در حال بررسی…" disabled={busy || otpCode.length < 6}>
            تایید
          </SubmitButton>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            کد را دریافت نکردید؟{" "}
            <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
              ارسال مجدد
            </button>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="ساخت حساب کاربری" subtitle="برای شروع، حساب خود را بسازید">
      <GoogleButton returnTo={returnTo} />
      <OrDivider />
      <AuthError>{error}</AuthError>
      <form onSubmit={register} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">ایمیل</Label>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 ps-10" disabled={busy} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">رمز عبور</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 ps-10" disabled={busy} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">تکرار رمز عبور</Label>
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 ps-10" disabled={busy} required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="در حال ساخت حساب…">
          ساخت حساب
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        قبلاً ثبتنام کردید؟{" "}
        <AuthLink to="/login" returnTo={returnTo}>
          ورود
        </AuthLink>
      </p>
    </AuthLayout>
  );
}