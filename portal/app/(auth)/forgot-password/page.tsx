"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#06040f" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-3 mb-4">
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>Check your email</h2>
              <p className="text-sm mb-6" style={{ color: "#a78bfa" }}>
                If an account exists for <strong style={{ color: "#f3f0ff" }}>{email}</strong>, you&apos;ll receive a reset link shortly. It expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="text-sm font-medium"
                style={{ color: "#a855f7" }}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>Forgot password?</h1>
              <p className="text-sm mb-6" style={{ color: "#a78bfa" }}>Enter your account email and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#a78bfa" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
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
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "#6b6b80" }}>
                Remember it?{" "}
                <Link href="/login" style={{ color: "#a855f7" }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
