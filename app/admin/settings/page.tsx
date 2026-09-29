"use client";

import { useState } from "react";
import {
  Settings, Clock, Building2, Shield, Save, CheckCircle2,
  Globe, KeyRound, ChevronDown, Eye, EyeOff,
  AlertTriangle, Trash2, Bell, Database,
  Mail, Smartphone, Download, RefreshCw,
  ShieldCheck, Info, X,
} from "lucide-react";
import { downloadCSV } from "../../utils/export";

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

// ─── Shared ───────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width:"100%", padding:"9px 12px", borderRadius:9,
  border:`1.5px solid ${C.border}`, fontSize:12,
  color:C.primaryDark, fontFamily:"inherit", outline:"none",
  boxSizing:"border-box", background:"#fff",
};
const lbl: React.CSSProperties = {
  fontSize:10, fontWeight:700, letterSpacing:"0.08em",
  textTransform:"uppercase", color:C.outerGreen, display:"block", marginBottom:5,
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange} style={{ width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",background:on?C.primary:C.border,position:"relative",flexShrink:0,transition:"background 0.2s" }}>
      <span style={{ position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.15)" }}/>
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon:Icon, iconColor=C.primary, title, desc, children }: { icon:React.ElementType; iconColor?:string; title:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ background:"#fff",borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
      <div style={{ padding:"16px 20px",borderBottom:`1px solid ${C.surface2}`,display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:8,background:C.surface2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Icon size={14} color={iconColor}/>
        </div>
        <div>
          <div style={{ fontWeight:700,fontSize:14,color:C.primaryDark }}>{title}</div>
          {desc && <div style={{ fontSize:11,color:C.outerGreen,marginTop:1 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ padding:"20px" }}>{children}</div>
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, sublabel, on, onChange }: { label:string; sublabel?:string; on:boolean; onChange:()=>void }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,padding:"12px 0",borderBottom:`1px solid ${C.surface2}` }}>
      <div>
        <div style={{ fontSize:12,fontWeight:600,color:C.primaryDark }}>{label}</div>
        {sublabel && <div style={{ fontSize:11,color:C.outerGreen,marginTop:2 }}>{sublabel}</div>}
      </div>
      <Toggle on={on} onChange={onChange}/>
    </div>
  );
}

// ─── Ghost button ─────────────────────────────────────────────────────────────
function GhostBtn({ icon:Icon, children, onClick }: { icon:React.ElementType; children:React.ReactNode; onClick?:()=>void }) {
  return (
    <button onClick={onClick} style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,border:`1px solid ${C.border}`,background:C.surface2,fontSize:12,fontWeight:600,cursor:"pointer",color:C.outerGreen }}>
      <Icon size={12}/> {children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Org
  const [orgName,    setOrgName]    = useState("DVLA Ghana");
  const [timezone,   setTimezone]   = useState("Africa/Accra");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  // Attendance
  const [workStart,  setWorkStart]  = useState("08:00");
  const [workEnd,    setWorkEnd]    = useState("17:00");
  const [cutoff,     setCutoff]     = useState("09:00");
  const [lateWindow, setLateWindow] = useState("15");
  const [weekends,   setWeekends]   = useState(false);

  // Security
  const [twoFactor,  setTwoFactor]  = useState(true);
  const [ipLock,     setIpLock]     = useState(false);
  const [sessionExp, setSessionExp] = useState("8");
  const [showPwd,    setShowPwd]    = useState(false);
  const [pwdVal,     setPwdVal]     = useState("");

  // QR
  const [tokenExpiry, setTokenExpiry] = useState("90");
  const [autoRegen,   setAutoRegen]   = useState(false);
  const [qrStrategy,  setQrStrategy]  = useState("encrypted");

  // Notifications
  const [emailOn,    setEmailOn]    = useState(true);
  const [smsOn,      setSmsOn]      = useState(false);
  const [pushOn,     setPushOn]     = useState(true);
  const [alertEmail, setAlertEmail] = useState("alerts@dvla.gov.gh");
  const [digest,     setDigest]     = useState("daily");

  // Data
  const [retention,    setRetention]    = useState("365");
  const [backupFreq,   setBackupFreq]   = useState("daily");
  const [backupTime,   setBackupTime]   = useState("02:00");
  const [exportFormat, setExportFormat] = useState("csv");

  // UI state
  const [dirty,     setDirty]     = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [toast,     setToast]     = useState<{type:"success"|"info"; text:string}|null>(null);

  const mark = () => setDirty(true);
  const notify = (text:string, type:"success"|"info"="info") => {
    setToast({ type, text });
    setTimeout(()=>setToast(null), 2500);
  };
  const handleSave = () => {
    if (!dirty) return;
    setSaved(true); setDirty(false);
    notify("Settings saved successfully.", "success");
    setTimeout(()=>setSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      organization: { orgName, timezone, dateFormat },
      attendance: { workStart, workEnd, cutoff, lateWindow, weekends },
      security: { twoFactor, ipLock, sessionExp },
      qr: { tokenExpiry, autoRegen, qrStrategy },
      notifications: { emailOn, smsOn, pushOn, alertEmail, digest },
      storage: { retention, backupFreq, backupTime, exportFormat },
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };

    if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DVLA-System-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ["Setting Category", "Parameter", "Configured Value"];
      const rows = [
        ["Organization", "Organization Name", orgName],
        ["Organization", "Timezone", timezone],
        ["Organization", "Date Format", dateFormat],
        ["Attendance", "Work Hours Start", workStart],
        ["Attendance", "Work Hours End", workEnd],
        ["Attendance", "Cut-off Time", cutoff],
        ["Attendance", "Late Window (mins)", lateWindow],
        ["Security", "Two-Factor Auth", twoFactor ? "Enabled" : "Disabled"],
        ["Security", "IP Locking", ipLock ? "Enabled" : "Disabled"],
        ["QR System", "Token Expiry (days)", tokenExpiry],
        ["Data & Storage", "Retention Period (days)", retention],
      ];
      downloadCSV(`DVLA-System-Backup-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    }
    notify("System backup exported successfully.", "success");
  };

  const TIMEZONES = ["Africa/Accra","Europe/London","America/New_York","Europe/Paris","Asia/Dubai","Asia/Singapore"];

  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>

      {/* ── Reset Modal ── */}
      {showReset && (
        <div onClick={()=>setShowReset(false)} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:18,padding:28,width:360,boxShadow:"0 20px 60px rgba(0,0,0,0.15)",textAlign:"center" }}>
            <div style={{ width:48,height:48,borderRadius:14,background:"#fef2f2",border:"1px solid rgba(220,38,38,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <AlertTriangle size={22} color={C.red}/>
            </div>
            <div style={{ fontWeight:800,fontSize:15,color:C.primaryDark,marginBottom:8 }}>Reset All Data?</div>
            <div style={{ fontSize:12,color:C.outerGreen,marginBottom:24,lineHeight:1.7 }}>
              This will <strong style={{ color:C.red }}>permanently delete</strong> all NSS Personnel, attendance records, QR tokens, and audit logs. This cannot be undone.
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setShowReset(false)} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>{ setShowReset(false); notify("All data reset.", "info"); }} style={{ flex:1,padding:"10px",borderRadius:10,border:"none",background:C.red,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>Yes, Reset</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:22 }}>

        {/* ── Header ── */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:6 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:C.surface2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Settings size={16} color={C.primary}/>
              </div>
              <h1 style={{ fontSize:22,fontWeight:800,color:C.primaryDark,margin:0,letterSpacing:"-0.03em" }}>Settings</h1>
            </div>
            <p style={{ fontSize:12,color:C.outerGreen,margin:0 }}>Configure your organisation, attendance rules, security, QR, notifications, and data preferences.</p>
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <button onClick={handleExportBackup} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:9,cursor:"pointer",border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600 }}>
              <Download size={13}/> Export Backup
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,cursor:dirty?"pointer":"not-allowed",border:"none",background:saved?"#15803d":dirty?C.primary:C.border,color:"#fff",fontSize:12,fontWeight:700,transition:"background 0.2s",opacity:dirty?1:0.65 }}
            >
              {saved ? <><CheckCircle2 size={13}/> Saved!</> : <><Save size={13}/> Save Changes</>}
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,background:toast.type==="success"?"#ecfdf5":C.surface2,border:`1px solid ${toast.type==="success"?"rgba(22,163,74,0.2)":C.border}`,animation:"fadeUp 0.2s ease" }}>
            {toast.type==="success" ? <CheckCircle2 size={14} color={C.primary}/> : <Info size={14} color={C.outerGreen}/>}
            <span style={{ fontSize:12,fontWeight:600,color:toast.type==="success"?C.primary:C.outerGreen }}>{toast.text}</span>
            <button onClick={()=>setToast(null)} style={{ marginLeft:"auto",border:"none",background:"none",cursor:"pointer",padding:2 }}><X size={12} color={C.outerGreen}/></button>
          </div>
        )}

        {/* ── Quick status row ── */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12 }}>
          {[
            { icon:ShieldCheck, label:"2FA",          value:twoFactor?"Enabled":"Disabled", active:twoFactor  },
            { icon:Bell,        label:"Notifications", value:[emailOn&&"Email",smsOn&&"SMS",pushOn&&"Push"].filter(Boolean).join(", ")||"Off", active:emailOn||smsOn||pushOn },
            { icon:Database,    label:"Backup",        value:`${backupFreq} · ${backupTime}`, active:true       },
            { icon:KeyRound,    label:"Token expiry",  value:`${tokenExpiry} days`,           active:true       },
          ].map(s=>(
            <div key={s.label} style={{ background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:s.active?"#ecfdf5":C.surface2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <s.icon size={15} color={s.active?C.primary:C.outerGreen}/>
              </div>
              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.outerGreen }}>{s.label}</div>
                <div style={{ fontSize:12,fontWeight:700,color:C.primaryDark,marginTop:2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 2-column grid ── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

          {/* Organisation */}
          <SectionCard icon={Building2} title="Organisation" desc="Basic profile and regional settings">
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={lbl}>Organisation Name</label>
                <input style={inp} value={orgName} onChange={e=>{ setOrgName(e.target.value); mark(); }}/>
              </div>
              <div>
                <label style={lbl}>Timezone</label>
                <div style={{ position:"relative" }}>
                  <Globe size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                  <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                  <select value={timezone} onChange={e=>{ setTimezone(e.target.value); mark(); }} style={{ ...inp,paddingLeft:30,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                    {TIMEZONES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Date Format</label>
                <div style={{ position:"relative" }}>
                  <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                  <select value={dateFormat} onChange={e=>{ setDateFormat(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                    {["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Attendance */}
          <SectionCard icon={Clock} title="Attendance Rules" desc="Working hours and late thresholds">
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={lbl}>Work Start</label>
                  <input type="time" value={workStart} onChange={e=>{ setWorkStart(e.target.value); mark(); }} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Work End</label>
                  <input type="time" value={workEnd} onChange={e=>{ setWorkEnd(e.target.value); mark(); }} style={inp}/>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={lbl}>Late Cut-Off</label>
                  <input type="time" value={cutoff} onChange={e=>{ setCutoff(e.target.value); mark(); }} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Grace Period (min)</label>
                  <input type="number" min={0} max={60} value={lateWindow} onChange={e=>{ setLateWindow(e.target.value); mark(); }} style={inp}/>
                </div>
              </div>
              <ToggleRow label="Count weekends" sublabel="Include Sat & Sun in attendance" on={weekends} onChange={()=>{ setWeekends(v=>!v); mark(); }}/>
            </div>
          </SectionCard>

          {/* Security */}
          <SectionCard icon={Shield} title="Security" desc="Authentication and session controls">
            <div style={{ display:"flex",flexDirection:"column" }}>
              <ToggleRow label="Two-factor authentication" sublabel="Require 2FA for all admin logins" on={twoFactor} onChange={()=>{ setTwoFactor(v=>!v); mark(); }}/>
              <ToggleRow label="IP allowlist enforcement" sublabel="Restrict admin access to known IPs" on={ipLock} onChange={()=>{ setIpLock(v=>!v); mark(); }}/>
              <div style={{ paddingTop:14,display:"flex",flexDirection:"column",gap:14 }}>
                <div>
                  <label style={lbl}>Session expiry (hours)</label>
                  <input type="number" min={1} max={72} value={sessionExp} onChange={e=>{ setSessionExp(e.target.value); mark(); }} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Change Admin Password</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPwd?"text":"password"} placeholder="New password…" value={pwdVal} onChange={e=>{ setPwdVal(e.target.value); mark(); }} style={{ ...inp,paddingRight:36 }}/>
                    <button onClick={()=>setShowPwd(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",padding:0 }}>
                      {showPwd ? <EyeOff size={14} color={C.outerGreen}/> : <Eye size={14} color={C.outerGreen}/>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* QR Tokens */}
          <SectionCard icon={KeyRound} title="QR Token Settings" desc="Token lifetime and rotation policy">
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <ToggleRow label="Auto-regenerate on expiry" sublabel="Automatically issue new tokens when they expire" on={autoRegen} onChange={()=>{ setAutoRegen(v=>!v); mark(); }}/>
              <div>
                <label style={lbl}>Token expiry (days)</label>
                <input type="number" min={1} max={365} value={tokenExpiry} onChange={e=>{ setTokenExpiry(e.target.value); mark(); }} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Default QR Strategy</label>
                <div style={{ position:"relative" }}>
                  <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                  <select value={qrStrategy} onChange={e=>{ setQrStrategy(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                    <option value="uuid">Secure UUID</option>
                    <option value="encrypted">Encrypted Token</option>
                    <option value="signed">Signed JWT</option>
                  </select>
                </div>
              </div>
              <div style={{ padding:"11px 14px",borderRadius:10,background:C.amberBg,border:`1px solid ${C.amberBorder}`,display:"flex",gap:8 }}>
                <AlertTriangle size={13} color={C.amber} style={{ flexShrink:0,marginTop:1 }}/>
                <span style={{ fontSize:11,color:C.amber,lineHeight:1.6 }}>Expiry changes apply to <strong>new tokens only</strong>. Existing tokens keep their original expiry.</span>
              </div>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard icon={Bell} title="Notifications" desc="Alert channels and digest preferences">
            <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
              <ToggleRow label="Email alerts" sublabel="Send critical alerts to admins via email" on={emailOn} onChange={()=>{ setEmailOn(v=>!v); mark(); }}/>
              <ToggleRow label="SMS alerts" sublabel="Send urgent alerts to verified phone numbers" on={smsOn} onChange={()=>{ setSmsOn(v=>!v); mark(); }}/>
              <ToggleRow label="Push (in-app) alerts" sublabel="Browser and mobile app notifications" on={pushOn} onChange={()=>{ setPushOn(v=>!v); mark(); }}/>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14 }}>
              <div>
                <label style={lbl}>Alert Digest</label>
                <div style={{ position:"relative" }}>
                  <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                  <select value={digest} onChange={e=>{ setDigest(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Alert Email</label>
                <input value={alertEmail} onChange={e=>{ setAlertEmail(e.target.value); mark(); }} style={inp}/>
              </div>
            </div>
            <div style={{ display:"flex",gap:9,marginTop:14 }}>
              <GhostBtn icon={Mail} onClick={()=>notify("Test email sent")}>Test Email</GhostBtn>
              <GhostBtn icon={Smartphone} onClick={()=>notify("Test SMS sent")}>Test SMS</GhostBtn>
            </div>
          </SectionCard>

          {/* Data & Storage */}
          <SectionCard icon={Database} title="Data & Storage" desc="Backups, retention, and export settings">
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={lbl}>Retention Period</label>
                  <div style={{ position:"relative" }}>
                    <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                    <select value={retention} onChange={e=>{ setRetention(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                      <option value="90">90 days</option>
                      <option value="180">6 months</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="0">Indefinite</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Backup Frequency</label>
                  <div style={{ position:"relative" }}>
                    <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                    <select value={backupFreq} onChange={e=>{ setBackupFreq(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Backup Time</label>
                  <input type="time" value={backupTime} onChange={e=>{ setBackupTime(e.target.value); mark(); }} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Export Format</label>
                  <div style={{ position:"relative" }}>
                    <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                    <select value={exportFormat} onChange={e=>{ setExportFormat(e.target.value); mark(); }} style={{ ...inp,paddingRight:28,appearance:"none",cursor:"pointer" }}>
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",gap:9 }}>
                <GhostBtn icon={Download} onClick={handleExportBackup}>Download Backup</GhostBtn>
                <GhostBtn icon={RefreshCw} onClick={()=>notify("Devices synced and online.", "success")}>Sync Devices</GhostBtn>
              </div>
            </div>
          </SectionCard>

        </div>

        {/* ── Danger Zone ── */}
        <div style={{ background:"#fff",borderRadius:16,border:`1.5px solid rgba(220,38,38,0.25)`,overflow:"hidden" }}>
          <div style={{ padding:"14px 20px",borderBottom:"1px solid rgba(220,38,38,0.12)",display:"flex",alignItems:"center",gap:8,background:"#fef2f2" }}>
            <AlertTriangle size={14} color={C.red}/>
            <span style={{ fontWeight:700,fontSize:13,color:C.red }}>Danger Zone</span>
          </div>
          <div style={{ padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:C.primaryDark }}>Reset all application data</div>
              <div style={{ fontSize:11,color:C.outerGreen,marginTop:3 }}>Permanently deletes all NSS Personnel, attendance records, QR tokens, and audit logs.</div>
            </div>
            <button onClick={()=>setShowReset(true)} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:9,border:`1.5px solid rgba(220,38,38,0.3)`,background:"#fef2f2",color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
              <Trash2 size={13}/> Reset Data
            </button>
          </div>
        </div>

      </div>
    </>
  );
}