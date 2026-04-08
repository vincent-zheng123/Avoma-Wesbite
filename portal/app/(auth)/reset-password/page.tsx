"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-sm mb-4" style={{ color: "#f87171" }}>Invalid or missing reset token.</p>
        <Link href="/forgot-password" style={{ color: "#a855f7", fontSize: 14 }}>Request a new link</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>Password updated</h2>
        <p className="text-sm" style={{ color: "#a78bfa" }}>Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>Set new password</h1>
      <p className="text-sm mb-6" style={{ color: "#a78bfa" }}>Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#a78bfa" }}>
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#06040f", border: "1px solid rgba(168,85,247,0.2)", color: "#f3f0ff" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.2)")}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#a78bfa" }}>
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#06040f", border: "1px solid rgba(168,85,247,0.2)", color: "#f3f0ff" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.2)")}
          />
        </div>

        {error && (
          <p className="text-sm py-2 px-3 rounded-lg" style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{
            background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 0 20px rgba(124,58,237,0.4)",
          }}
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "#6b6b80" }}>
        <Link href="/login" style={{ color: "#a855f7" }}>← Back to sign in</Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#06040f" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 52 52" fill="none">
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#e879f9"/></linearGradient>
              </defs>
              <ellipse cx="26" cy="26" rx="21" ry="7" stroke="url(#lg1)" strokeWidth="1.6" fill="none"/>
              <ellipse cx="26" cy="26" rx="21" ry="7" stroke="url(#lg1)" strokeWidth="1.6" fill="none" transform="rotate(60 26 26)" opacity={0.75}/>
              <ellipse cx="26" cy="26" rx="21" ry="7" stroke="#e879f9" strokeWidth="1.6" fill="none" transform="rotate(-60 26 26)" opacity={0.6}/>
              <circle cx="26" cy="26" r="6" fill="url(#lg1)"/>
              <circle cx="26" cy="26" r="3" fill="#fff" opacity={0.35}/>
            </svg>
            <span className="text-xl font-black" style={{ fontFamily: "var(--font-orbitron)", background: "linear-gradient(135deg, #a855f7, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AVOMA
            </span>
          </Link>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.2)", boxShadow: "0 0 40px rgba(124,58,237,0.15)" }}>
          <Suspense fallback={<p style={{ color: "#a78bfa", fontSize: 14 }}>Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
