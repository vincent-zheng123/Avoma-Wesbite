"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const INDUSTRIES = [
  "DENTAL", "MEDICAL", "LEGAL", "PLUMBING", "HVAC",
  "SALON_SPA", "AUTO_REPAIR", "VETERINARY", "ROOFING",
];

const inputStyle = {
  background: "#0d0a1a",
  border: "1px solid rgba(168,85,247,0.25)",
  color: "#f3f0ff",
  outline: "none",
  borderRadius: "12px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "#6b6b80",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "6px",
};

export default function AddLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    industry: "",
    location: "",
    source: "",
    icpScore: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save lead.");
      setSaving(false);
      return;
    }
    router.push("/admin/leads");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/admin/leads"
        className="text-sm mb-6 inline-flex items-center gap-1"
        style={{ color: "#a78bfa" }}
      >
        ← Back to Leads
      </Link>

      <h1
        className="text-2xl font-bold mt-4 mb-2"
        style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}
      >
        Add Lead
      </h1>
      <p className="text-sm mb-8" style={{ color: "#6b6b80" }}>
        Manually add a prospect to your AVOMA sales pipeline.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl border p-6 space-y-5"
          style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Business Name <span style={{ color: "#f87171" }}>*</span></label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Bright Smile Dental"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contact Name</label>
              <input
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                placeholder="Dr. Jane Smith"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="jane@brightsmile.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Industry</label>
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Austin, TX"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Source</label>
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Indeed, Referral, LinkedIn…"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>ICP Score (1–10)</label>
              <input
                name="icpScore"
                type="number"
                min="1"
                max="10"
                value={form.icpScore}
                onChange={handleChange}
                placeholder="8"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm" style={{ color: "#f87171" }}>{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: saving ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 0 16px rgba(124,58,237,0.4)",
            }}
          >
            {saving ? "Saving…" : "Save Lead"}
          </button>
          <Link
            href="/admin/leads"
            className="px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "#6b6b80", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
