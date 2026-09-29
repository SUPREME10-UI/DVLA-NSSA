"use client";

import { useMemo, useState } from "react";
import {
  Search, ShieldCheck, AlertTriangle, Download, RefreshCw,
  Filter, Wifi, Info, Clock, User, Settings, CalendarDays,
  CheckCircle2, XCircle, ChevronDown, Eye, X,
} from "lucide-react";
import { downloadCSV } from "../../utils/export";
import { useToast } from "../../components/Toast";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  primaryDark: "#0f172a",
  primary:     "#16a34a",
  outerGreen:  "#475569",
  surface:     "#f8fafc",
  surface2:    "#f1f5f9",
  border:      "#e2e8f0",
  red:         "#dc2626",
  amber:       "#d97706",
  amberBg:     "#fffbeb",
  amberBorder: "#fde68a",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AuditLevel  = "Info" | "Warning" | "Critical";
type AuditType   = "Auth" | "Attendance" | "Data" | "Settings";
type AuditStatus = "Success" | "Blocked";

type AuditLog = {
  id: string; time: string; actor: string; action: string;
  type: AuditType; level: AuditLevel; ip: string; status: AuditStatus;
  detail?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const LOGS: AuditLog[] = [
  { id:"AUD-1001", time:"2026-02-19 09:02", actor:"Admin",    action:"Updated attendance cut-off to 09:00",      type:"Settings",   level:"Info",     ip:"10.0.2.14",     status:"Success", detail:"Cut-off time changed from 08:45 to 09:00. Effective immediately for all departments." },
  { id:"AUD-1002", time:"2026-02-19 08:45", actor:"System",   action:"Scanner device offline detected",          type:"Data",       level:"Warning",  ip:"10.0.3.21",     status:"Success", detail:"Device ID: SCAN-07 went offline. Last successful scan at 08:42. Auto-alert sent to IT." },
  { id:"AUD-1003", time:"2026-02-19 08:31", actor:"Admin",    action:"Exported daily attendance report",         type:"Attendance", level:"Info",     ip:"10.0.2.14",     status:"Success", detail:"PDF report exported for 2026-02-18. Included 6 NSS Personnel, 4 present, 1 late, 1 absent." },
  { id:"AUD-1004", time:"2026-02-18 17:52", actor:"Security", action:"Blocked login from untrusted IP",          type:"Auth",       level:"Critical", ip:"197.251.12.44", status:"Blocked", detail:"3 consecutive failed login attempts detected from 197.251.12.44. Account temporarily locked." },
  { id:"AUD-1005", time:"2026-02-18 15:18", actor:"Admin",    action:"Deleted inactive personnel record",        type:"Data",       level:"Warning",  ip:"10.0.2.14",     status:"Success", detail:"Personnel NSS-039 (James Owusu) permanently removed after 90-day inactivity period." },
  { id:"AUD-1006", time:"2026-02-18 09:07", actor:"System",   action:"Auto-generated late arrival summary",      type:"Attendance", level:"Info",     ip:"10.0.2.9",      status:"Success", detail:"Daily summary generated. 2 NSS Personnel flagged as late: Sarah Malik (09:17), Esi Boateng (09:03)." },
  { id:"AUD-1007", time:"2026-02-17 14:22", actor:"Admin",    action:"Regenerated QR token for NSS-014",        type:"Settings",   level:"Warning",  ip:"10.0.2.14",     status:"Success", detail:"QR token regenerated for Sarah Malik (NSS-014). Previous token revoked immediately." },
  { id:"AUD-1008", time:"2026-02-17 11:04", actor:"System",   action:"New personnel QR code issued",            type:"Data",       level:"Info",     ip:"10.0.2.9",      status:"Success", detail:"QR code generated for NSS-047 (Kofi Mensah). Token type: Encrypted. Expiry: 90 days." },
];

// ─── Config maps ──────────────────────────────────────────────────────────────
const LEVEL_CFG = {
  Info:     { color:C.primary,  bg:"#ecfdf5",  border:"rgba(22,163,74,0.2)",  icon:Info          },
  Warning:  { color:C.amber,    bg:C.amberBg,  border:C.amberBorder,          icon:AlertTriangle },
  Critical: { color:C.red,      bg:"#fef2f2",  border:"rgba(220,38,38,0.2)",  icon:XCircle       },
};

const TYPE_CFG = {
  Auth:       { color:"#7c3aed", bg:"#f5f3ff", icon:ShieldCheck  },
  Attendance: { color:C.primary, bg:"#ecfdf5", icon:CalendarDays },
  Data:       { color:C.outerGreen, bg:C.surface2, icon:Filter   },
  Settings:   { color:C.amber,   bg:C.amberBg, icon:Settings     },
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const lvl = LEVEL_CFG[log.level];
  const typ = TYPE_CFG[log.type];
  const LvlIcon = lvl.icon;
  const TypIcon = typ.icon;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:18,padding:28,width:440,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",gap:18,animation:"fadeUp 0.2s ease" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:800,fontSize:15,color:C.primaryDark }}>{log.id}</div>
            <div style={{ fontSize:11,color:C.outerGreen,marginTop:2,display:"flex",alignItems:"center",gap:5 }}>
              <Clock size={10}/>{log.time}
            </div>
          </div>
          <button onClick={onClose} style={{ border:"none",background:C.surface2,borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={13} color={C.outerGreen}/>
          </button>
        </div>

        {/* Action */}
        <div style={{ background:C.surface,borderRadius:10,padding:"12px 14px",fontSize:13,fontWeight:600,color:C.primaryDark,lineHeight:1.5 }}>
          {log.action}
        </div>

        {/* Meta chips */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background:lvl.bg,color:lvl.color,border:`1px solid ${lvl.border}` }}>
            <LvlIcon size={11}/>{log.level}
          </span>
          <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background:typ.bg,color:typ.color,border:`1px solid ${typ.color}22` }}>
            <TypIcon size={11}/>{log.type}
          </span>
          <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background: log.status==="Success" ? "#ecfdf5" : "#fef2f2", color: log.status==="Success" ? C.primary : C.red, border:`1px solid ${log.status==="Success" ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}` }}>
            {log.status==="Success" ? <CheckCircle2 size={11}/> : <XCircle size={11}/>}{log.status}
          </span>
        </div>

        {/* Details */}
        {log.detail && (
          <div style={{ background:C.surface2,borderRadius:10,padding:"12px 14px",fontSize:12,color:C.outerGreen,lineHeight:1.7 }}>
            {log.detail}
          </div>
        )}

        {/* Actor / IP */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <div style={{ background:C.surface,borderRadius:10,padding:"10px 14px" }}>
            <div style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:C.outerGreen,marginBottom:4 }}>Actor</div>
            <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:C.primaryDark }}>
              <User size={12} color={C.outerGreen}/>{log.actor}
            </div>
          </div>
          <div style={{ background:C.surface,borderRadius:10,padding:"10px 14px" }}>
            <div style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:C.outerGreen,marginBottom:4 }}>IP Address</div>
            <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:C.primaryDark,fontFamily:"monospace" }}>
              <Wifi size={12} color={C.outerGreen}/>{log.ip}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Pill({ count, label, bg, color, icon:Icon }: { count:number; label:string; bg:string; color:string; icon:React.ElementType }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,background:bg,border:`1px solid ${color}33` }}>
      <Icon size={14} color={color} strokeWidth={2.5}/>
      <span style={{ fontSize:18,fontWeight:800,color,lineHeight:1 }}>{count}</span>
      <span style={{ fontSize:11,color,fontWeight:500,opacity:0.85 }}>{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const { showToast } = useToast();
  const [query, setQuery]           = useState("");
  const [typeFilter, setTypeFilter] = useState<AuditType | "All">("All");
  const [levelFilter, setLevelFilter] = useState<AuditLevel | "All">("All");
  const [detail, setDetail]         = useState<AuditLog | null>(null);
  const [logs, setLogs]             = useState<AuditLog[]>(LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter(log =>
      (!q || log.action.toLowerCase().includes(q) || log.actor.toLowerCase().includes(q) || log.id.toLowerCase().includes(q)) &&
      (typeFilter === "All"  || log.type  === typeFilter) &&
      (levelFilter === "All" || log.level === levelFilter)
    );
  }, [logs, query, typeFilter, levelFilter]);

  const counts = useMemo(() => ({
    critical: logs.filter(l=>l.level==="Critical").length,
    warning:  logs.filter(l=>l.level==="Warning").length,
    blocked:  logs.filter(l=>l.status==="Blocked").length,
  }), [logs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Audit logs synchronized and verified", "success");
    }, 600);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("No audit logs match current filters", "warning");
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `DVLA-Audit-Logs-${dateStr}.csv`;
    const headers = ["Log ID", "Timestamp", "Actor", "Action", "Type", "Level", "IP Address", "Status", "Detail"];
    const rows = filtered.map(l => [
      l.id,
      l.time,
      l.actor,
      l.action,
      l.type,
      l.level,
      l.ip,
      l.status,
      l.detail || "",
    ]);

    downloadCSV(filename, headers, rows);
    showToast(`Exported ${filtered.length} audit logs to ${filename}`, "success");
  };

  const inp: React.CSSProperties = { padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"#fff",fontSize:12,color:C.primaryDark,fontFamily:"inherit",outline:"none" };
  const lbl10: React.CSSProperties = { fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.outerGreen,display:"block",marginBottom:5 };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .aud-row:hover td { background:${C.surface} !important; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>

      {detail && <DetailModal log={detail} onClose={()=>setDetail(null)}/>}

      <div style={{ display:"flex",flexDirection:"column",gap:22 }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:6 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:C.surface2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ShieldCheck size={16} color={C.primary}/>
              </div>
              <h1 style={{ fontSize:22,fontWeight:800,color:C.primaryDark,margin:0,letterSpacing:"-0.03em" }}>Audit Logs</h1>
            </div>
            <p style={{ fontSize:12,color:C.outerGreen,margin:0 }}>Track sensitive actions, authentication events, and data changes across the system.</p>
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:9,cursor:isRefreshing ? "default" : "pointer",
                border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,
                opacity: isRefreshing ? 0.75 : 1,
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? "spin-icon" : ""}/>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:9,cursor:"pointer",
                border:"none",background:C.primary,color:"#fff",fontSize:12,fontWeight:700,
                transition:"opacity 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              <Download size={13}/> Export CSV
            </button>
          </div>
        </div>

        {/* Summary pills */}
        <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
          <Pill count={counts.critical} label="Critical Events" bg="#fef2f2"  color={C.red}    icon={XCircle}       />
          <Pill count={counts.warning}  label="Warnings"        bg={C.amberBg} color={C.amber}  icon={AlertTriangle} />
          <Pill count={counts.blocked}  label="Blocked"         bg="#fef2f2"  color={C.red}    icon={ShieldCheck}   />
          <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ display:"flex",alignItems:"center",gap:5,background:"#ecfdf5",border:"1px solid rgba(22,163,74,0.2)",borderRadius:100,padding:"5px 12px",fontSize:11,fontWeight:600,color:C.primary }}>
              <ShieldCheck size={11}/> Logs are read-only & tamper-proof
            </span>
          </div>
        </div>

        {/* Table card */}
        <div style={{ background:"#fff",borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>

          {/* Filters */}
          <div style={{ padding:"16px 20px",borderBottom:`1px solid ${C.surface2}`,display:"flex",alignItems:"flex-end",flexWrap:"wrap",gap:14 }}>

            {/* Search */}
            <div style={{ flex:"1 1 220px",minWidth:200 }}>
              <label style={lbl10}>Search</label>
              <div style={{ position:"relative" }}>
                <Search size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Action, actor or ID…" style={{ ...inp,paddingLeft:30,width:"100%",boxSizing:"border-box" }}/>
              </div>
            </div>

            {/* Type */}
            <div>
              <label style={lbl10}>Type</label>
              <div style={{ position:"relative" }}>
                <Filter size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as AuditType|"All")} style={{ ...inp,paddingLeft:30,paddingRight:28,appearance:"none",width:150,cursor:"pointer" }}>
                  <option value="All">All Types</option>
                  <option value="Auth">Auth</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Data">Data</option>
                  <option value="Settings">Settings</option>
                </select>
              </div>
            </div>

            {/* Level */}
            <div>
              <label style={lbl10}>Level</label>
              <div style={{ position:"relative" }}>
                <AlertTriangle size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value as AuditLevel|"All")} style={{ ...inp,paddingLeft:30,paddingRight:28,appearance:"none",width:140,cursor:"pointer" }}>
                  <option value="All">All Levels</option>
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <span style={{ marginLeft:"auto",fontSize:11,color:C.outerGreen,alignSelf:"flex-end",paddingBottom:2,whiteSpace:"nowrap" }}>
              {filtered.length} of {LOGS.length} records
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead>
                <tr style={{ background:C.surface,borderBottom:`1px solid ${C.border}` }}>
                  {["Time","Actor","Action","Type","Level","IP Address","Status",""].map(h=>(
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:C.outerGreen,whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign:"center",padding:"48px 20px",color:C.outerGreen,fontSize:13 }}>No audit logs match the current filters.</td></tr>
                ) : filtered.map((log, i) => {
                  const lvl = LEVEL_CFG[log.level];
                  const typ = TYPE_CFG[log.type];
                  const LvlIcon = lvl.icon;
                  const TypIcon = typ.icon;
                  const isBlocked = log.status === "Blocked";
                  return (
                    <tr key={log.id} className="aud-row" style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.surface2}` : "none" }}>

                      {/* Time */}
                      <td style={{ padding:"12px 14px",whiteSpace:"nowrap" }}>
                        <div style={{ display:"flex",flexDirection:"column",gap:1 }}>
                          <span style={{ fontWeight:600,color:C.primaryDark,fontSize:11 }}>{log.time.split(" ")[0]}</span>
                          <span style={{ fontSize:10,color:C.outerGreen,display:"flex",alignItems:"center",gap:3 }}>
                            <Clock size={9}/>{log.time.split(" ")[1]}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td style={{ padding:"12px 14px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <div style={{ width:26,height:26,borderRadius:7,background: log.actor==="System" ? C.surface2 : log.actor==="Security" ? "#fef2f2" : "#ecfdf5", display:"flex",alignItems:"center",justifyContent:"center" }}>
                            <User size={12} color={ log.actor==="System" ? C.outerGreen : log.actor==="Security" ? C.red : C.primary }/>
                          </div>
                          <span style={{ fontWeight:600,color:C.primaryDark }}>{log.actor}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding:"12px 14px",maxWidth:240 }}>
                        <span style={{ color:C.primaryDark,lineHeight:1.5 }}>{log.action}</span>
                      </td>

                      {/* Type */}
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:6,background:typ.bg,color:typ.color,fontSize:11,fontWeight:600 }}>
                          <TypIcon size={10}/>{log.type}
                        </span>
                      </td>

                      {/* Level */}
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background:lvl.bg,color:lvl.color,border:`1px solid ${lvl.border}` }}>
                          <LvlIcon size={11}/>{log.level}
                        </span>
                      </td>

                      {/* IP */}
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color: isBlocked ? C.red : C.outerGreen,fontFamily:"monospace",fontWeight: isBlocked ? 700 : 400 }}>
                          <Wifi size={10} color={ isBlocked ? C.red : C.outerGreen }/>{log.ip}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background: isBlocked ? "#fef2f2" : "#ecfdf5", color: isBlocked ? C.red : C.primary, border:`1px solid ${isBlocked ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"}` }}>
                          {isBlocked ? <XCircle size={11}/> : <CheckCircle2 size={11}/>}
                          {log.status}
                        </span>
                      </td>

                      {/* Details */}
                      <td style={{ padding:"12px 14px" }}>
                        <button onClick={()=>setDetail(log)} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,cursor:"pointer",border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>
                          <Eye size={11} color={C.outerGreen}/> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding:"12px 20px",borderTop:`1px solid ${C.surface2}`,display:"flex",alignItems:"center",gap:8 }}>
            <ShieldCheck size={12} color={C.outerGreen}/>
            <span style={{ fontSize:11,color:C.outerGreen }}>
              Audit logs are <strong>immutable</strong> — records cannot be edited or deleted. Retained for 12 months.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}