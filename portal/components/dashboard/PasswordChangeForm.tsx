"use client";

import { useState } from "react";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/client/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  const inputStyle = {
    background: "#06040f",
    border: "1px solid rgba(168,85,247,0.25)",
    borderRadius: "10px",
    color: "#f3f0ff",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  } as const;

  return (
    <div className="rounded-2xl border p-6 mt-5" style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}>
      <h2 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={inputStyle}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>

        {message && (
          <p
            className="text-xs px-3 py-2 rounded-lg"
            style={{
              background: status === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
              color: status === "success" ? "#4ade80" : "#f87171",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff",
            opacity: status === "loading" ? 0.6 : 1,
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
