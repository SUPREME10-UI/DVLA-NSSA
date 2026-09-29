"use client";

import type { ElementType } from "react";
import Image from "next/image";
import {
  QrCode, ShieldCheck, Clock, Users, Zap,
  Star, CalendarDays, Bell, Settings,
  Lock, Building2,
  MapPin, Phone, Mail, Globe, Award, Shield,
} from "lucide-react";

const C = {
  primaryDark: "#0f172a",
  primary:     "#16a34a",
  outerGreen:  "#475569",
  surface:     "#f8fafc",
  surface2:    "#f1f5f9",
  border:      "#e2e8f0",
};

const VERSION = "1.0.0";
const BUILD   = "2026.02.19";

const FEATURES = [
  { icon: QrCode,       label: "QR-based Attendance",       desc: "NSS Personnel scan unique secure QR codes to check in and out instantly.",               color: "#16a34a", bg: "#ecfdf5" },
  { icon: Users,        label: "NSS Personnel Management",  desc: "Add, edit, deactivate, and manage all national service personnel records in one place.", color: "#475569", bg: "#f1f5f9" },
  { icon: CalendarDays, label: "Attendance Logs",            desc: "Full check-in/out history with computed hours worked and statuses.",                     color: "#16a34a", bg: "#ecfdf5" },
  { icon: ShieldCheck,  label: "Audit Trail",                desc: "Immutable log of all admin actions, auth events, and data changes.",                    color: "#7c3aed", bg: "#f5f3ff" },
  { icon: Bell,         label: "Smart Notifications",        desc: "Configurable alerts via email, SMS, or push for key system events.",                    color: "#d97706", bg: "#fffbeb" },
  { icon: Settings,     label: "Flexible Settings",          desc: "Customise attendance rules, security policies, and QR behaviour.",                      color: "#475569", bg: "#f1f5f9" },
];

const STATS = [
  { icon: Users,       value: "∞",         label: "Personnel supported",   accent: false },
  { icon: ShieldCheck, value: "100%",       label: "Token-based security",  accent: true  },
  { icon: Clock,       value: "Real-time",  label: "Attendance tracking",   accent: false },
  { icon: Zap,         value: "3",          label: "QR payload strategies", accent: false },
];

function StatCard({ value, label, icon: Icon, accent }: {
  value: string; label: string; icon: ElementType; accent?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 20px", borderRadius: 14, flex: 1,
      background: accent ? "linear-gradient(135deg,#ecfdf5,#d1fae5)" : "#fff",
      border: `1px solid ${accent ? "rgba(22,163,74,0.2)" : C.border}`,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: accent ? "rgba(22,163,74,0.15)" : C.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={C.primary} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.primaryDark, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</div>
        <div style={{ fontSize: 11, color: C.outerGreen, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, label, desc, color, bg }: {
  icon: ElementType; label: string; desc: string; color: string; bg: string;
}) {
  return (
    <div style={{ display: "flex", gap: 13, padding: "14px 16px", borderRadius: 12, background: "#fff", border: `1px solid ${C.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, color: C.primaryDark, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.outerGreen, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.primaryDark }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.outerGreen, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      <div style={{ background: "linear-gradient(135deg,#071526 0%,#0f2942 55%,#14532d 100%)", borderRadius: 18, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", color: "#fff", boxShadow: "0 8px 30px rgba(15,23,42,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#fff", padding: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <Image src="/dvla-logo.png" alt="DVLA Ghana Logo" width={56} height={56} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Driver and Vehicle Licensing Authority</span>
              <span style={{ background: "rgba(22,163,74,0.25)", border: "1px solid rgba(134,239,172,0.4)", color: "#86efac", fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "3px 11px", display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={11} /> DVLA-NSSA v{VERSION}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, marginBottom: 4 }}>National Service Personnel Attendance &amp; Verification Management Portal</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Republic of Ghana · Ministry of Transport · National Service Secretariat Partnership</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.75)" }}><ShieldCheck size={14} color="#86efac" /><span>On-Premises Subnet Verification</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.75)" }}><Lock size={14} color="#86efac" /><span>Cryptographic Tag Authentication</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.75)" }}><Award size={14} color="#86efac" /><span>Official Allowance Endorsement</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Building2 size={18} color={C.primary} />
          <h2 style={{ fontSize: 15, fontWeight: 800, color: C.primaryDark, margin: 0 }}>Institutional Mandate &amp; Purpose</h2>
        </div>
        <p style={{ fontSize: 12, color: C.outerGreen, lineHeight: 1.8, margin: 0, maxWidth: 960 }}>
          The <strong>Driver and Vehicle Licensing Authority (DVLA)</strong> is an autonomous agency operating under the Ministry of Transport mandated to promote good driving standards and verify vehicular safety across Ghana. Each year, DVLA welcomes hundreds of tertiary graduates deployed via the <strong>National Service Scheme (NSS)</strong> across Directorates including Driver Testing, Vehicle Inspection, IT &amp; Systems, Finance, Customer Service, and Transport Logistics.
        </p>
        <p style={{ fontSize: 12, color: C.outerGreen, lineHeight: 1.8, margin: "10px 0 0", maxWidth: 960 }}>
          The <strong>DVLA-NSSA Attendance Portal</strong> replaces manual attendance logbooks with an automated, contactless QR verification gateway. Scans are cryptographically authenticated and geo-restricted to official DVLA branch networks, guaranteeing punctual reporting, tamper-proof audit trails, and instant generation of verified records for monthly NSS allowance endorsements.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SectionCard title="Core Architectural Capabilities" subtitle="Security, automation, and reporting pillars">
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {FEATURES.map(f => <FeatureCard key={f.label} {...f} />)}
          </div>
        </SectionCard>
        <SectionCard title="Verification Lifecycle" subtitle="4-step duty validation process">
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { step: "01", title: "Personnel Registration",     desc: "HR registers newly deployed personnel into the registry and assigns unique IDs (NSS-xxx)." },
              { step: "02", title: "Credential Badge Issuance",  desc: "Personnel receive official ID tags with encrypted QR tokens — zero raw personal data is exposed." },
              { step: "03", title: "Daily Contactless Check-In", desc: "Personnel scan tags at entry kiosks connected strictly to verified DVLA intranet subnets." },
              { step: "04", title: "Monthly Allowance Sign-Off", desc: "Supervisors export verified duty attendance reports to endorse monthly NSS allowance vouchers." },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", borderRadius: 11, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primaryDark, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.outerGreen, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "22px 26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.primaryDark, marginBottom: 10 }}>DVLA Headquarters &amp; Directorate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11, color: C.outerGreen }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={13} color={C.primary} /><span>1 Jawaharlal Nehru Road, Cantonments, P.O. Box 9295, KIA, Accra</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Building2 size={13} color={C.primary} /><span>Digital Address: <strong>GL-076-1234</strong></span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={13} color={C.primary} /><span>General Directorate: +233 (0) 302 774 400 / +233 (0) 302 774 401</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe size={13} color={C.primary} /><span>Official Web Portal: www.dvla.gov.gh</span></div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.primaryDark, marginBottom: 10 }}>NSS Desk &amp; Systems Administration</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11, color: C.outerGreen }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={13} color={C.primary} /><span>NSS Personnel Desk: <strong>nss.support@dvla.gov.gh</strong></span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Settings size={13} color={C.primary} /><span>IT Systems Division: Internal Extension 4118 (Helpdesk)</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Shield size={13} color={C.primary} /><span>Auditing &amp; Governance: Quality Assurance &amp; Internal Audit Unit</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={13} color={C.primary} /><span>Hours of Operation: Monday – Friday, 08:00 – 17:00 GMT</span></div>
          </div>
        </div>
      </div>

      <div style={{ background: "#ecfdf5", borderRadius: 14, border: "1px solid rgba(22,163,74,0.2)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color={C.primary} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.primaryDark }}>Data Protection &amp; Security Certification</span>
        </div>
        <span style={{ fontSize: 11, color: C.outerGreen }}>Compliant with Ghana Data Protection Act 2012 (Act 843) · Encrypted QR Payloads · Immutable Audit Logs</span>
      </div>

      <div style={{ padding: "14px 20px", borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11, color: C.outerGreen }}>© 2026 Driver and Vehicle Licensing Authority (DVLA) · Republic of Ghana · Build {BUILD}</span>
        <span style={{ fontSize: 11, color: C.outerGreen }}>National Service Personnel Verification &amp; Attendance Administration</span>
      </div>

    </div>
  );
}
