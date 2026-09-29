"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Building2,
  Download,
  SlidersHorizontal,
  Clock,
  Pencil,
  Trash2,
  Monitor,
  Wifi,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
  RefreshCw,
  X,
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

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = "Present" | "Late" | "Absent";

type AttendanceRow = {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  date: string;
  checkIn: string;
  status: AttendanceStatus;
  ip: string;
  device: string;
  avatar: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockAttendance: AttendanceRow[] = [
  { id: 1, employeeId: "NSS-001", name: "John Doe",     department: "Operations", date: "2025-02-19", checkIn: "08:58", status: "Present", ip: "192.168.1.14", device: "Android / Chrome",  avatar: "JD" },
  { id: 2, employeeId: "NSS-014", name: "Sarah Malik",  department: "HR",         date: "2025-02-19", checkIn: "09:17", status: "Late",    ip: "192.168.1.27", device: "iOS / Safari",      avatar: "SM" },
  { id: 3, employeeId: "NSS-033", name: "Michael Chen", department: "IT",         date: "2025-02-18", checkIn: "08:47", status: "Present", ip: "192.168.1.19", device: "Windows / Edge",    avatar: "MC" },
  { id: 4, employeeId: "NSS-022", name: "Amina Yusuf",  department: "Finance",    date: "2025-02-19", checkIn: "—",     status: "Absent",  ip: "—",            device: "—",                 avatar: "AY" },
  { id: 5, employeeId: "NSS-047", name: "Kofi Mensah",  department: "Operations", date: "2025-02-19", checkIn: "08:55", status: "Present", ip: "192.168.1.31", device: "Android / Chrome",  avatar: "KM" },
  { id: 6, employeeId: "NSS-058", name: "Esi Boateng",  department: "IT",         date: "2025-02-19", checkIn: "09:03", status: "Late",    ip: "192.168.1.44", device: "macOS / Firefox",   avatar: "EB" },
];

const avatarBg = (id: number) =>
  [C.primary, C.outerGreen, C.primaryDark, "#145B2A", "#2A5C2A", C.outerGreen][id % 6];

const statusConfig = (s: AttendanceStatus) => ({
  Present: { bg: "#ecfdf5", color: C.primary,  border: "rgba(22,163,74,0.2)", icon: CheckCircle2, label: "Present" },
  Late:    { bg: "#fef9c3", color: "#7a5c00",  border: "#fde68a",  icon: AlertCircle,  label: "Late"    },
  Absent:  { bg: "#fef2f2", color: C.red,       border: "rgba(220,38,38,0.2)", icon: XCircle,      label: "Absent"  },
}[s]);

// ─── Tiny stat pill ───────────────────────────────────────────────────────────
function StatPill({ count, label, bg, color, icon: Icon }: {
  count: number; label: string; bg: string; color: string; icon: React.ElementType;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 14px", borderRadius: 10,
      background: bg, border: `1px solid ${color}22`,
    }}>
      <Icon size={14} color={color} strokeWidth={2.5} />
      <span style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{count}</span>
      <span style={{ fontSize: 11, color, fontWeight: 500, opacity: 0.8 }}>{label}</span>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.outerGreen }}>
        {label}
      </span>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 9, border: `1px solid ${C.border}`,
  background: "#fff", fontSize: 12, color: C.primaryDark,
  fontFamily: "inherit", outline: "none",
  transition: "border 0.15s",
};

// ─── Edit Attendance Modal ───────────────────────────────────────────────────
function EditAttendanceModal({
  record,
  onClose,
  onSave,
}: {
  record: AttendanceRow;
  onClose: () => void;
  onSave: (updated: AttendanceRow) => void;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(record.status);
  const [checkIn, setCheckIn] = useState(record.checkIn === "—" ? "09:00" : record.checkIn);
  const [department, setDepartment] = useState(record.department);
  const [notes, setNotes] = useState("");

  const depts = ["Operations", "HR", "Finance", "IT", "Sales", "Marketing", "Transport"];
  const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.outerGreen, marginBottom: 4, display: "block" };
  const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 12, color: C.primaryDark, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  const handleSave = () => {
    onSave({
      ...record,
      status,
      checkIn: status === "Absent" ? "—" : checkIn,
      department,
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>Edit Attendance Record</span>
            <div style={{ fontSize: 11, color: C.outerGreen }}>{record.name} ({record.employeeId}) · {record.date}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: C.surface2, borderRadius: 7, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} color={C.outerGreen} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={lbl}>Status</label>
            <select style={{ ...inp, appearance: "none" }} value={status} onChange={e => setStatus(e.target.value as AttendanceStatus)}>
              <option value="Present">Present (On Time)</option>
              <option value="Late">Late Arrival</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {status !== "Absent" && (
            <div>
              <label style={lbl}>Check-In Time</label>
              <input style={inp} type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
          )}

          <div>
            <label style={lbl}>Department</label>
            <select style={{ ...inp, appearance: "none" }} value={department} onChange={e => setDepartment(e.target.value)}>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Audit Note / Reason for Change</label>
            <input style={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Approved official duty, badge scan error" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save Record</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { showToast } = useToast();
  const [date, setDate]              = useState("2025-02-19");
  const [department, setDepartment]  = useState("all");
  const [employeeQuery, setQuery]    = useState("");
  const [statusFilter, setStatus]    = useState<AttendanceStatus | "all">("all");
  const [records, setRecords]        = useState<AttendanceRow[]>(mockAttendance);
  const [editRecord, setEditRecord]  = useState<AttendanceRow | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const departments = useMemo(() =>
    Array.from(new Set(records.map(r => r.department))), [records]);

  const filtered = useMemo(() =>
    records.filter(row => {
      const matchDate   = row.date === date;
      const matchDept   = department === "all" || row.department === department;
      const matchQuery  = !employeeQuery.trim() ||
        row.name.toLowerCase().includes(employeeQuery.toLowerCase()) ||
        row.employeeId.toLowerCase().includes(employeeQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchDate && matchDept && matchQuery && matchStatus;
    }), [records, date, department, employeeQuery, statusFilter]);

  const counts = useMemo(() => ({
    present: filtered.filter(r => r.status === "Present").length,
    late:    filtered.filter(r => r.status === "Late").length,
    absent:  filtered.filter(r => r.status === "Absent").length,
  }), [filtered]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Attendance logs synced with scanner gates", "success");
    }, 600);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("No records match the current filter to export", "warning");
      return;
    }
    const filename = `DVLA-NSS-Attendance-Logs-${date}.csv`;
    const headers = ["Record ID", "NSS ID", "Personnel Name", "Department", "Date", "Check-in Time", "Status", "IP Address", "Device"];
    const rows = filtered.map(r => [
      r.id,
      r.employeeId,
      r.name,
      r.department,
      r.date,
      r.checkIn,
      r.status,
      r.ip,
      r.device,
    ]);

    downloadCSV(filename, headers, rows);
    showToast(`Exported ${filtered.length} attendance records to ${filename}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: C.surface2, border: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CalendarDays size={15} color={C.primary} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primaryDark, margin: 0, letterSpacing: "-0.02em" }}>
              Attendance Logs
            </h1>
          </div>
          <p style={{ fontSize: 13, color: C.outerGreen, margin: 0 }}>
            Review, filter, and manage attendance records captured via QR scans.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            {isRefreshing ? "Syncing..." : "Refresh"}
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 14px", borderRadius: 9, cursor: "pointer",
              border: `1px solid ${C.border}`, background: "#fff",
              color: C.primaryDark, fontSize: 12, fontWeight: 600,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={() => {
              const target = filtered[0] || records[0];
              if (target) setEditRecord(target);
              else showToast("No records available to override", "warning");
            }}
            style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 14px", borderRadius: 9, cursor: "pointer",
            border: "none", background: C.primary,
            color: "#fff", fontSize: 12, fontWeight: 600,
            boxShadow: "none",
          }}>
            <FileEdit size={13} /> Manual Override
          </button>
        </div>
      </div>

      {/* ── Summary Pills ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatPill count={counts.present} label="Present" bg="#E8F5E9" color={C.primary}  icon={CheckCircle2} />
        <StatPill count={counts.late}    label="Late"    bg="#FFFDE7" color="#7A5C00"    icon={AlertCircle}  />
        <StatPill count={counts.absent}  label="Absent"  bg="#FFEBEE" color={C.red}       icon={XCircle}      />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldAlert size={13} color={C.outerGreen} />
          <span style={{ fontSize: 11, color: C.outerGreen }}>
            Edits are <strong>audit-logged</strong> for compliance
          </span>
        </div>
      </div>

      {/* ── Filters + Table ── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: `1px solid ${C.border}`,
        boxShadow: "none",
        overflow: "hidden",
      }}>

        {/* Filter bar */}
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.surface2}`,
          display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 14,
        }}>

          {/* Date */}
          <FilterField label="Date">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <CalendarDays size={13} color={C.outerGreen} style={{ position: "absolute", left: 10, pointerEvents: "none" }} />
              <input
                type="date" value={date}
                onChange={e => setDate(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30, width: 148 }}
              />
            </div>
          </FilterField>

          {/* Department */}
          <FilterField label="Department">
            <div style={{ position: "relative" }}>
              <Building2 size={13} color={C.outerGreen} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <ChevronDown size={12} color={C.outerGreen} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30, paddingRight: 30, appearance: "none", width: 148, cursor: "pointer" }}
              >
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </FilterField>

          {/* Status */}
          <FilterField label="Status">
            <div style={{ position: "relative" }}>
              <SlidersHorizontal size={13} color={C.outerGreen} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <ChevronDown size={12} color={C.outerGreen} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <select
                value={statusFilter}
                onChange={e => setStatus(e.target.value as AttendanceStatus | "all")}
                style={{ ...inputStyle, paddingLeft: 30, paddingRight: 30, appearance: "none", width: 130, cursor: "pointer" }}
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </FilterField>

          {/* Search */}
          <FilterField label="Personnel">
            <div style={{ position: "relative" }}>
              <Search size={13} color={C.outerGreen} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text" value={employeeQuery}
                onChange={e => setQuery(e.target.value)}
                placeholder="Name or ID…"
                style={{ ...inputStyle, paddingLeft: 30, width: 200 }}
              />
            </div>
          </FilterField>

          <span style={{ marginLeft: "auto", fontSize: 11, color: C.outerGreen, alignSelf: "flex-end", paddingBottom: 2 }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                {["Personnel", "Department", "Date", "Check-In", "Status", "IP Address", "Device", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                    textTransform: "uppercase", color: C.outerGreen, whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px 20px", color: C.outerGreen, fontSize: 13 }}>
                    No records match the current filters.
                  </td>
                </tr>
              ) : filtered.map((row, i) => {
                const s = statusConfig(row.status);
                const StatusIcon = s.icon;
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? `1px solid ${C.surface2}` : "none",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >

                    {/* Employee */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: avatarBg(row.id), color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700,
                        }}>{row.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.primaryDark }}>{row.name}</div>
                          <div style={{ fontSize: 10, color: C.outerGreen }}>{row.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 9px", borderRadius: 6,
                        background: C.surface2, color: C.primaryDark,
                        fontSize: 11, fontWeight: 500,
                      }}>
                        <Building2 size={10} color={C.outerGreen} />
                        {row.department}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "12px 14px", color: C.primaryDark, fontWeight: 500 }}>
                      {new Date(row.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    {/* Check-in */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={12} color={C.outerGreen} />
                        <span style={{ color: C.primaryDark, fontWeight: 500 }}>{row.checkIn}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        <StatusIcon size={11} strokeWidth={2.5} />
                        {s.label}
                      </span>
                    </td>

                    {/* IP */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Wifi size={11} color={C.outerGreen} />
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: C.outerGreen }}>{row.ip}</span>
                      </div>
                    </td>

                    {/* Device */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Monitor size={11} color={C.outerGreen} />
                        <span style={{ fontSize: 11, color: C.outerGreen }}>{row.device}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setEditRecord(row)}
                          style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 7, cursor: "pointer",
                          border: `1px solid ${C.border}`, background: "#fff",
                          color: C.primaryDark, fontSize: 11, fontWeight: 600,
                          transition: "all 0.12s",
                        }}>
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setRecords(prev => prev.filter(r => r.id !== row.id));
                            showToast(`Deleted attendance record for ${row.name}`, "info");
                          }}
                          style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 7, cursor: "pointer",
                          border: `1px solid rgba(220,38,38,0.2)`, background: "#fef2f2",
                          color: C.red, fontSize: 11, fontWeight: 600,
                          transition: "all 0.12s",
                        }}>
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid ${C.surface2}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Clock size={12} color={C.outerGreen} />
          <span style={{ fontSize: 11, color: C.outerGreen }}>
            Future: add <strong>check-out</strong> column to compute total hours per personnel with minimum on-site rules.
          </span>
        </div>
      </div>

      {editRecord && (
        <EditAttendanceModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSave={updated => {
            setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
            showToast(`Updated attendance for ${updated.name} (${updated.employeeId}) to ${updated.status}`, "success");
          }}
        />
      )}
    </div>
  );
}
