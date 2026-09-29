"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadCSV } from "../utils/export";
import { useToast } from "../components/Toast";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Wifi,
  KeyRound,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  QrCode,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = "Present" | "Late" | "Absent";

type AttendanceRecord = {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  checkIn: string;
  status: AttendanceStatus;
  avatar: string;
};

// ─── Brand Colors (from design system) ────────────────────────────────────────
const C = {
  primaryDark: "#0f172a",
  primary: "#16a34a",
  primaryLight: "#86efac",
  outerGreen: "#475569",
  yellow: "#eab308",
  golden: "#facc15",
  cream: "#f8fafc",
  orange: "#f97316",
  red: "#dc2626",
  surface: "#f8fafc",
  surface2: "#f1f5f9",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockToday: AttendanceRecord[] = [
  { id: 1, employeeId: "NSS-001", name: "John Doe",      department: "Operations", checkIn: "08:58", status: "Present", avatar: "JD" },
  { id: 2, employeeId: "NSS-014", name: "Sarah Malik",   department: "HR",         checkIn: "09:17", status: "Late",    avatar: "SM" },
  { id: 3, employeeId: "NSS-033", name: "Michael Chen",  department: "IT",         checkIn: "08:46", status: "Present", avatar: "MC" },
  { id: 4, employeeId: "NSS-022", name: "Amina Yusuf",   department: "Finance",    checkIn: "—",     status: "Absent",  avatar: "AY" },
  { id: 5, employeeId: "NSS-047", name: "Kofi Mensah",   department: "Operations", checkIn: "08:55", status: "Present", avatar: "KM" },
  { id: 6, employeeId: "NSS-058", name: "Esi Boateng",   department: "IT",         checkIn: "09:03", status: "Late",    avatar: "EB" },
];

const TOTAL = 42;
const weeklyData = [
  { day: "Mon", count: 34 },
  { day: "Tue", count: 39 },
  { day: "Wed", count: 37 },
  { day: "Thu", count: 40 },
  { day: "Fri", count: 36 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = (s: AttendanceStatus) => ({
  Present: { bg: "#E8F5E9", color: C.primary,  border: "#A5D6A7", dot: C.primary },
  Late:    { bg: "#FFFDE7", color: "#7A5C00",  border: C.golden,  dot: C.golden  },
  Absent:  { bg: "#FFEBEE", color: C.red,       border: "#EF9A9A", dot: C.red     },
}[s]);

const avatarColor = (id: number) =>
  [C.primary, C.outerGreen, C.primaryDark, "#145B2A"][id % 4];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent = false, highlight = false,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent?: boolean; highlight?: boolean;
}) {
  const bg    = highlight ? "#f1f5f9" : accent ? "#ecfdf5" : "#fff";
  const color = C.primaryDark;
  const subCl = C.outerGreen;
  const iconBg = accent ? "rgba(22,163,74,0.12)" : C.surface2;
  const iconCl = C.primary;

  return (
    <div style={{
      background: bg, borderRadius: 14, padding: "18px 20px",
      border: `1px solid ${C.surface2}`,
      boxShadow: "none",
      display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={iconCl} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: subCl, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 11, color: subCl }}>{sub}</div>
      </div>
    </div>
  );
}

function WeeklyBar({ day, count, max }: { day: string; count: number; max: number }) {
  const pct = (count / max) * 100;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: C.outerGreen, fontWeight: 500 }}>{count}</span>
      <div style={{ width: 28, height: 120, borderRadius: 10, background: C.surface2, display: "flex", alignItems: "flex-end", padding: 3 }}>
        <div style={{
          width: "100%", borderRadius: 8,
          background: C.primary,
          height: `${pct}%`,
          transition: "height 0.6s cubic-bezier(.16,1,.3,1)",
          boxShadow: "none",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark }}>{day}</span>
    </div>
  );
}

function SecurityRow({
  icon: Icon, title, desc, badge, badgeBg, badgeColor,
}: {
  icon: React.ElementType; title: string; desc: string;
  badge: string; badgeBg: string; badgeColor: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "12px 14px", borderRadius: 12,
      background: C.surface, border: `1px solid ${C.surface2}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: badgeBg + "22",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={15} color={badgeColor} strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primaryDark }}>{title}</div>
          <div style={{ fontSize: 11, color: C.outerGreen, marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
        padding: "3px 10px", borderRadius: 100, background: badgeBg + "22", color: badgeColor, whiteSpace: "nowrap",
      }}>{badge}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "All">("All");
  const [records, setRecords] = useState<AttendanceRecord[]>(mockToday);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());


  const { present, late, absent } = useMemo(() => {
    const present = records.filter(r => r.status === "Present").length;
    const late    = records.filter(r => r.status === "Late").length;
    const absent  = TOTAL - present - late;
    return { present, late, absent };
  }, [records]);

  const filtered = useMemo(() =>
    records.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || r.status === filterStatus;
      return matchSearch && matchStatus;
    }), [records, search, filterStatus]);

  const maxWeekly = Math.max(...weeklyData.map(d => d.count));
  const attendancePct = Math.round((present / TOTAL) * 100);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      showToast("Attendance snapshot and live feed updated", "success");
    }, 600);
  };

  const handleExport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `DVLA-NSS-Attendance-${dateStr}.csv`;
    const headers = ["ID", "NSS ID", "Full Name", "Department", "Check-in Time", "Status", "Report Date"];
    const rows = filtered.map(r => [
      r.id,
      r.employeeId,
      r.name,
      r.department,
      r.checkIn,
      r.status,
      dateStr,
    ]);

    downloadCSV(filename, headers, rows);
    showToast(`Exported ${filtered.length} NSS Personnel records to ${filename}`, "success");
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: C.surface,
      minHeight: "100vh",
      padding: "24px 20px",
      maxWidth: 1140,
      margin: "0 auto",
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(22,163,74,0.08)", border: `1px solid rgba(22,163,74,0.2)`,
            borderRadius: 100, padding: "4px 12px", marginBottom: 10,
          }}>
            <TrendingUp size={11} color={C.primary} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.primary }}>
              Live Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.primaryDark, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Attendance Overview
          </h1>
          <p style={{ fontSize: 13, color: C.outerGreen, marginTop: 6, fontWeight: 400 }}>
            Live snapshot · {lastUpdated.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleExport}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.surface2}`,
              background: "#fff", color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.surface2; }}
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 10, border: "none",
              background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: isRefreshing ? "default" : "pointer",
              boxShadow: "none",
              opacity: isRefreshing ? 0.75 : 1,
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? "spin-icon" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Personnel"  value={TOTAL}   sub="All departments"          icon={Users}      />
        <StatCard label="Present Today"    value={present} sub={`${attendancePct}% on time`} icon={UserCheck} accent />
        <StatCard label="Late Arrivals"    value={late}    sub="Cut-off: 09:00"            icon={Clock}      />
        <StatCard label="Absent Today"     value={absent}  sub="Includes no-scan"          icon={UserX}      highlight />
      </div>

      {/* ── Attendance Rate Banner ── */}
      <div style={{
        background: "#fff",
        borderRadius: 14, padding: "16px 20px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        border: `1px solid ${C.surface2}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={20} color={C.primary} />
          </div>
          <div>
            <div style={{ color: C.outerGreen, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Today&#39;s Attendance Rate
            </div>
            <div style={{ color: C.primaryDark, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {attendancePct}% — {present + late} of {TOTAL} NSS Personnel checked in
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["IP restricted", "Encrypted QR", "Admin only"] as const).map((tag, i) => (
            <span key={i} style={{
              background: C.surface2, border: `1px solid ${C.surface2}`,
              color: C.outerGreen, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", padding: "4px 12px", borderRadius: 100,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Charts + Security Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 12, marginBottom: 20 }}>

        {/* Weekly Bar Chart */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          border: `1px solid ${C.surface2}`, boxShadow: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, margin: 0 }}>Weekly Attendance</h2>
              <p style={{ fontSize: 11, color: C.outerGreen, margin: "3px 0 0" }}>NSS Personnel present per working day</p>
            </div>
            <span style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 100,
              background: C.cream, color: "#7A5C00", fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>This Week</span>
          </div>
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-around",
            background: C.surface, borderRadius: 12, padding: "20px 16px",
          }}>
            {weeklyData.map(d => <WeeklyBar key={d.day} day={d.day} count={d.count} max={maxWeekly} />)}
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", color: C.primary,
              fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0,
            }}>
              View full report <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Security Panel */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          border: `1px solid ${C.surface2}`, boxShadow: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Shield size={15} color={C.primary} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, margin: 0 }}>Network & Security</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SecurityRow icon={Wifi}     title="Company Network"      desc="Whitelisted IP ranges only" badge="Locked"       badgeBg={C.primary} badgeColor={C.primary} />
            <SecurityRow icon={QrCode}   title="QR Payload"           desc="Tokenized, no raw PII"      badge="Encrypted"    badgeBg={C.orange}  badgeColor={C.orange}  />
            <SecurityRow icon={KeyRound} title="Admin Authentication" desc="Role-based access + 2FA ready" badge="Configurable" badgeBg={C.golden}  badgeColor="#7A5C00"   />
          </div>
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 12,
            background: C.surface, border: `1px dashed ${C.primaryLight}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <ArrowUpRight size={14} color={C.primary} />
            <span style={{ fontSize: 11, color: C.outerGreen, fontWeight: 500 }}>
              All systems operational · Last checked 2m ago
            </span>
          </div>
        </div>
      </div>

      {/* ── Check-in Table ── */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "18px 20px",
        border: `1px solid ${C.surface2}`, boxShadow: "none",
      }}>
        {/* Table Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, margin: 0 }}>Recent NSS Check-ins</h2>
              <p style={{ fontSize: 11, color: C.outerGreen, margin: "3px 0 0" }}>Live feed from scan endpoint</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: C.surface, border: `1.5px solid ${C.surface2}`,
              borderRadius: 10, padding: "7px 12px",
            }}>
              <Search size={13} color={C.outerGreen} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search NSS Personnel…"
                style={{
                  border: "none", background: "none", outline: "none",
                  fontSize: 12, color: C.primaryDark, width: 160,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", gap: 6 }}>
              {(["All", "Present", "Late", "Absent"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                    border: `1.5px solid ${filterStatus === s ? C.primary : C.surface2}`,
                    background: filterStatus === s ? C.primary : "#fff",
                    color: filterStatus === s ? "#fff" : C.outerGreen,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <Filter size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.surface2}` }}>
                {["Personnel", "Department", "Check-In", "Status", "Source IP"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                    textTransform: "uppercase", color: C.outerGreen,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const s = statusStyle(r.status);
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${C.surface}` : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Employee */}
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: avatarColor(r.id), color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>{r.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.primaryDark }}>{r.name}</div>
                          <div style={{ color: C.outerGreen, fontSize: 10 }}>{r.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: "12px", color: C.primaryDark, fontWeight: 500 }}>{r.department}</td>

                    {/* Check-In */}
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.primaryDark, fontWeight: 500 }}>
                        <Clock size={12} color={C.outerGreen} /> {r.checkIn}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                        {r.status}
                      </span>
                    </td>

                    {/* IP */}
                    <td style={{ padding: "12px", color: C.outerGreen, fontFamily: "monospace", fontSize: 11 }}>
                      192.168.1.{10 + r.id}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: C.outerGreen, fontSize: 13 }}>
                    No records match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.surface2}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, color: C.outerGreen }}>
            Showing {filtered.length} of {mockToday.length} records
          </span>
          <button
            onClick={() => router.push("/admin/employees")}
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none",
              border: "none", color: C.primary, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            View all NSS Personnel <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
