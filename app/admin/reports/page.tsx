"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  CalendarDays,
  Clock,
  UserX,
  FileText,
  Mail,
  TrendingUp,
  TrendingDown,
  Building2,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { downloadCSV } from "../../utils/export";
import { useToast } from "../../components/Toast";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  primaryDark:  "#0f172a",
  primary:      "#16a34a",
  primaryLight: "#86efac",
  outerGreen:   "#475569",
  yellow:       "#eab308",
  golden:       "#facc15",
  cream:        "#f8fafc",
  orange:       "#f97316",
  red:          "#dc2626",
  surface:      "#f8fafc",
  surface2:     "#f1f5f9",
  border:       "#e2e8f0",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const departments = [
  { name: "Operations", present: 18, total: 20, trend: +2 },
  { name: "HR",         present: 7,  total: 8,  trend: -1 },
  { name: "Finance",    present: 6,  total: 7,  trend: 0  },
  { name: "IT",         present: 9,  total: 10, trend: +1 },
];

const exportCards = [
  {
    title:   "Daily Summary",
    desc:    "Total present, late, and absent counts per day.",
    icon:    CalendarDays,
    format:  "CSV",
    accent:  C.primary,
    accentBg:"#E8F5E9",
  },
  {
    title:   "Monthly Report",
    desc:    "Full attendance behaviour for a selected month.",
    icon:    FileSpreadsheet,
    format:  "Excel",
    accent:  C.outerGreen,
    accentBg:"#F0F4E8",
  },
  {
    title:   "Late Arrivals",
    desc:    "All NSS Personnel who checked in after the cut-off time.",
    icon:    Clock,
    format:  "CSV",
    accent:  "#7A5C00",
    accentBg: C.cream,
  },
  {
    title:   "Absence Report",
    desc:    "NSS Personnel who did not scan at all on selected days.",
    icon:    UserX,
    format:  "CSV",
    accent:  C.red,
    accentBg:"#FFEBEE",
  },
];

const weeklyTrend = [72, 85, 78, 90, 83, 88, 92]; // % present
const dayLabels   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ExportCard({ title, desc, icon: Icon, format, accent, accentBg, onExport }: typeof exportCards[0] & { onExport?: () => void }) {
  return (
    <div style={{
      borderRadius: 12, padding: "16px",
      background: "#fff", border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", gap: 10,
      transition: "box-shadow 0.15s",
      boxShadow: "none",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "none")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: accentBg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} color={accent} strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark }}>{title}</div>
          <div style={{ fontSize: 11, color: C.outerGreen, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
        </div>
      </div>
      <button
        onClick={onExport}
        style={{
          display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
          padding: "6px 13px", borderRadius: 7, cursor: "pointer",
          border: `1px solid ${accent}33`,
          background: accentBg,
          color: accent, fontSize: 11, fontWeight: 700,
          transition: "opacity 0.15s, transform 0.1s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
      >
        <Download size={11} /> Export {format}
      </button>
    </div>
  );
}

function DeptBar({ name, present, total, trend }: typeof departments[0]) {
  const pct = Math.round((present / total) * 100);
  const isUp = trend > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Building2 size={11} color={C.outerGreen} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primaryDark }}>{name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {trend !== 0 && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 10, fontWeight: 700,
              color: isUp ? C.primary : C.red,
            }}>
              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isUp ? "+" : ""}{trend}
            </span>
          )}
          <span style={{ fontSize: 11, color: C.outerGreen }}>
            {present}/{total} · <strong style={{ color: C.primaryDark }}>{pct}%</strong>
          </span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: C.surface2, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 6, width: `${pct}%`,
          background: pct >= 90
            ? C.primary
            : pct >= 75
            ? C.golden
            : C.red,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function SparkLine() {
  const max = Math.max(...weeklyTrend);
  const min = Math.min(...weeklyTrend);
  const H = 44, W = 180;
  const pts = weeklyTrend.map((v, i) => {
    const x = (i / (weeklyTrend.length - 1)) * W;
    const y = H - ((v - min) / (max - min + 1)) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={C.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {weeklyTrend.map((v, i) => {
        const x = (i / (weeklyTrend.length - 1)) * W;
        const y = H - ((v - min) / (max - min + 1)) * H;
        return <circle key={i} cx={x} cy={y} r="3" fill={C.primary} />;
      })}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { showToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const avgAttendance = Math.round(weeklyTrend.reduce((a, b) => a + b, 0) / weeklyTrend.length);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Analytics metrics and departmental trends refreshed", "success");
    }, 600);
  };

  const handleExportCard = (title: string, format: string) => {
    const dateStr = new Date().toISOString().slice(0, 10);
    if (title === "Daily Summary") {
      const filename = `DVLA-Daily-Attendance-Summary-${dateStr}.csv`;
      const headers = ["Department", "Present", "Total Personnel", "Attendance Rate (%)", "Trend Direction"];
      const rows = departments.map(d => [
        d.name,
        d.present,
        d.total,
        Math.round((d.present / d.total) * 100),
        d.trend > 0 ? "+1" : d.trend < 0 ? "-1" : "0"
      ]);
      downloadCSV(filename, headers, rows);
      showToast(`Exported Daily Attendance Summary (${format}) to ${filename}`, "success");
    } else if (title === "Monthly Report") {
      const filename = `DVLA-Monthly-Attendance-Report-${dateStr}.csv`;
      const headers = ["Day Label", "Attendance & Punctuality (%)", "Active Gates", "Status"];
      const rows = dayLabels.map((d, i) => [
        d,
        weeklyTrend[i] || 85,
        "Gate 1, Gate 2",
        (weeklyTrend[i] || 85) >= 80 ? "Target Met" : "Needs Review"
      ]);
      downloadCSV(filename, headers, rows);
      showToast(`Exported Monthly Attendance Report (${format}) to ${filename}`, "success");
    } else if (title === "Late Arrivals") {
      const filename = `DVLA-NSS-Late-Arrivals-Report-${dateStr}.csv`;
      const headers = ["NSS ID", "Full Name", "Department", "Cut-off Time", "Check-in Time", "Minutes Late"];
      const rows = [
        ["NSS-014", "Sarah Malik", "HR", "09:00", "09:17", "17"],
        ["NSS-058", "Esi Boateng", "IT", "09:00", "09:03", "3"],
        ["NSS-029", "Daniel Mensah", "Operations", "09:00", "09:12", "12"],
      ];
      downloadCSV(filename, headers, rows);
      showToast(`Exported Late Arrivals Report (${format}) to ${filename}`, "success");
    } else {
      // Absence Report
      const filename = `DVLA-NSS-Absence-Report-${dateStr}.csv`;
      const headers = ["NSS ID", "Full Name", "Department", "Date", "Status", "Reason / Tag"];
      const rows = [
        ["NSS-022", "Amina Yusuf", "Finance", dateStr, "Absent", "No scan recorded"],
        ["NSS-061", "Kwame Asante", "Transport", dateStr, "Absent", "Duty Leave"],
      ];
      downloadCSV(filename, headers, rows);
      showToast(`Exported Absence Report (${format}) to ${filename}`, "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.surface2, border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BarChart3 size={15} color={C.primary} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primaryDark, margin: 0, letterSpacing: "-0.02em" }}>
              Reports & Analytics
            </h1>
          </div>
          <p style={{ fontSize: 13, color: C.outerGreen, margin: 0 }}>
            Generate exports and review high-level attendance summaries.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 14px", borderRadius: 9, cursor: isRefreshing ? "default" : "pointer",
              border: `1px solid ${C.border}`, background: "#fff",
              color: C.primaryDark, fontSize: 12, fontWeight: 600,
              opacity: isRefreshing ? 0.75 : 1,
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "spin-icon" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => handleExportCard("Daily Summary", "CSV")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 14px", borderRadius: 9, cursor: "pointer",
              border: "none", background: C.primary,
              color: "#fff", fontSize: 12, fontWeight: 700,
            }}
          >
            <Download size={13} /> Export All
          </button>
        </div>
      </div>

      {/* ── Top KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

        {/* Avg Attendance sparkline card */}
        <div style={{
          gridColumn: "1 / 2",
          background: "#fff", borderRadius: 16, padding: "18px 20px",
          display: "flex", flexDirection: "column", gap: 10,
          boxShadow: "none",
          border: `1px solid ${C.border}`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles size={13} color={C.primary} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: C.outerGreen }}>
              Avg Attendance Rate
            </span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.primaryDark, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {avgAttendance}<span style={{ fontSize: 20, color: C.primary }}>%</span>
          </div>
          <SparkLine />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {dayLabels.map((d, i) => (
              <span key={i} style={{ fontSize: 9, color: C.outerGreen, fontWeight: 600 }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Period selector + quick stats */}
        <div style={{
          gridColumn: "2 / 4",
          background: "#fff", borderRadius: 16, padding: "18px 20px",
          border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 16,
        }}>
          {/* Period toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark }}>Quick Metrics</span>
            <div style={{ display: "flex", gap: 4, background: C.surface2, borderRadius: 9, padding: 3, border: `1px solid ${C.border}` }}>
              {(["today", "week", "month"] as const).map(p => (
                <button key={p} onClick={() => setSelectedPeriod(p)} style={{
                  padding: "4px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: selectedPeriod === p ? "#fff" : "transparent",
                  color: selectedPeriod === p ? C.primaryDark : C.outerGreen,
                  fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                  transition: "all 0.15s",
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Metric pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Present",  value: selectedPeriod === "today" ? "38" : selectedPeriod === "week" ? "184" : "720", icon: FileText,   color: C.primary,  bg: "#E8F5E9" },
              { label: "Late",     value: selectedPeriod === "today" ? "3"  : selectedPeriod === "week" ? "12"  : "48",  icon: Clock,      color: "#7A5C00",  bg: C.cream   },
              { label: "Absent",   value: selectedPeriod === "today" ? "1"  : selectedPeriod === "week" ? "9"   : "32",  icon: UserX,      color: C.red,      bg: "#FFEBEE" },
            ].map(m => (
              <div key={m.label} style={{
                padding: "12px 14px", borderRadius: 10,
                background: m.bg, border: `1px solid ${m.color}22`,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <m.icon size={12} color={m.color} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: m.color }}>{m.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Export + Department ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Export cards */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "18px 20px",
          border: `1.5px solid ${C.border}`,
          boxShadow: "0 1px 6px rgba(27,61,27,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, margin: 0 }}>Export Attendance</h2>
              <p style={{ fontSize: 11, color: C.outerGreen, margin: "4px 0 0" }}>
                Triggers report generation with secure, time-limited download links.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {exportCards.map(card => (
              <ExportCard
                key={card.title}
                {...card}
                onExport={() => handleExportCard(card.title, card.format)}
              />
            ))}
          </div>
        </div>

        {/* Department summary */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "18px 20px",
          border: `1px solid ${C.border}`,
          boxShadow: "none",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, margin: 0 }}>By Department</h2>
            <p style={{ fontSize: 11, color: C.outerGreen, marginTop: 4 }}>
              Live aggregates per department. Bar color reflects rate.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {departments.map(d => <DeptBar key={d.name} {...d} />)}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8, borderTop: `1px solid ${C.surface2}` }}>
            {[
              { label: "≥ 90%", color: C.primary },
              { label: "75–89%", color: C.golden },
              { label: "< 75%", color: C.red },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 10, color: C.outerGreen, fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>

          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "9px", borderRadius: 9, cursor: "pointer",
            border: `1px solid ${C.border}`, background: C.surface,
            color: C.primaryDark, fontSize: 11, fontWeight: 600,
            marginTop: "auto",
          }}>
            Full Department Report <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
