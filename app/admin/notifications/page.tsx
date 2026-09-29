"use client";

import { useState } from "react";
import {
  Bell, Mail, MessageSquare, Smartphone, Clock,
  CheckCircle2, XCircle, AlertTriangle, Info, X,
  Save, BellOff, Zap,
} from "lucide-react";

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
type NotifLevel = "Info" | "Warning" | "Critical";
type NotificationItem = {
  id: string; title: string; desc: string; time: string; level: NotifLevel;
};

const LEVEL_CFG = {
  Info:     { color:C.primary, bg:"#ecfdf5",  border:"rgba(22,163,74,0.2)",  icon:Info          },
  Warning:  { color:C.amber,   bg:C.amberBg,  border:C.amberBorder,          icon:AlertTriangle },
  Critical: { color:C.red,     bg:"#fef2f2",  border:"rgba(220,38,38,0.2)",  icon:XCircle       },
};

const RECENT: NotificationItem[] = [
  { id:"NT-1001", title:"Late arrivals detected",    desc:"5 NSS Personnel checked in after 09:00.",     time:"09:18",    level:"Warning"  },
  { id:"NT-1002", title:"Daily summary ready",        desc:"Attendance summary generated for today.",     time:"08:02",    level:"Info"     },
  { id:"NT-1003", title:"Untrusted IP blocked",       desc:"Access attempt from 197.251.12.44.",          time:"Yesterday",level:"Critical" },
  { id:"NT-1004", title:"QR token regenerated",       desc:"Token for NSS-014 was revoked and reissued.", time:"Yesterday",level:"Warning"  },
  { id:"NT-1005", title:"Scanner device offline",     desc:"SCAN-07 went offline at 08:42.",              time:"2 days ago",level:"Warning" },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width:40, height:22, borderRadius:11, border:"none", cursor:"pointer",
        background: on ? C.primary : C.border,
        position:"relative", flexShrink:0, transition:"background 0.2s",
      }}
    >
      <span style={{
        position:"absolute", top:3, left: on ? 21 : 3,
        width:16, height:16, borderRadius:"50%", background:"#fff",
        transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
      }}/>
    </button>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ icon:Icon, label, enabled, onToggle, note }: {
  icon: React.ElementType; label: string; enabled: boolean; onToggle: () => void; note?: string;
}) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:14,
      padding:"14px 16px", borderRadius:12,
      border:`1.5px solid ${enabled ? "rgba(22,163,74,0.25)" : C.border}`,
      background: enabled ? "#ecfdf5" : "#fff",
      transition:"all 0.15s",
    }}>
      <div style={{ width:38, height:38, borderRadius:10, background: enabled ? "rgba(22,163,74,0.15)" : C.surface2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={17} color={enabled ? C.primary : C.outerGreen}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:13, color:C.primaryDark }}>{label}</div>
        {note && <div style={{ fontSize:10, color:C.outerGreen, marginTop:2 }}>{note}</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:11, fontWeight:600, color: enabled ? C.primary : C.outerGreen }}>
          {enabled ? "On" : "Off"}
        </span>
        <Toggle on={enabled} onChange={onToggle}/>
      </div>
    </div>
  );
}

// ─── Alert Row ────────────────────────────────────────────────────────────────
function AlertRow({ label, sublabel, enabled, onToggle }: {
  label: string; sublabel?: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.surface2}` }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:600, color:C.primaryDark }}>{label}</div>
        {sublabel && <div style={{ fontSize:11, color:C.outerGreen, marginTop:2 }}>{sublabel}</div>}
      </div>
      <Toggle on={enabled} onChange={onToggle}/>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.surface2}` }}>
        <div style={{ fontWeight:700, fontSize:14, color:C.primaryDark }}>{title}</div>
      </div>
      <div style={{ padding:"16px 20px" }}>{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  // Channels
  const [emailOn,   setEmailOn]   = useState(true);
  const [smsOn,     setSmsOn]     = useState(false);
  const [pushOn,    setPushOn]    = useState(true);

  // Alert types
  const [lateOn,    setLateOn]    = useState(true);
  const [offlineOn, setOfflineOn] = useState(true);
  const [auditOn,   setAuditOn]   = useState(true);
  const [qrOn,      setQrOn]      = useState(true);
  const [absentOn,  setAbsentOn]  = useState(false);

  // Quiet hours
  const [quietOn,   setQuietOn]   = useState(true);
  const [quietStart,setQuietStart]= useState("18:00");
  const [quietEnd,  setQuietEnd]  = useState("06:00");

  // Notifications feed
  const [items, setItems] = useState<NotificationItem[]>(RECENT);
  const [saved, setSaved] = useState(false);

  const dismiss = (id: string) => setItems(prev => prev.filter(n => n.id !== id));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp: React.CSSProperties = {
    width:"100%", padding:"8px 12px", borderRadius:9,
    border:`1.5px solid ${C.border}`, fontSize:12,
    color:C.primaryDark, fontFamily:"inherit", outline:"none", boxSizing:"border-box",
  };

  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:700, letterSpacing:"0.08em",
    textTransform:"uppercase", color:C.outerGreen, display:"block", marginBottom:5,
  };

  return (
    <>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }`}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:C.surface2, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Bell size={16} color={C.primary}/>
              </div>
              <h1 style={{ fontSize:22, fontWeight:800, color:C.primaryDark, margin:0, letterSpacing:"-0.03em" }}>Notifications</h1>
            </div>
            <p style={{ fontSize:12, color:C.outerGreen, margin:0 }}>Configure alert channels and manage how you receive system events.</p>
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <button style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 15px", borderRadius:9, cursor:"pointer", border:`1px solid ${C.border}`, background:"#fff", color:C.primaryDark, fontSize:12, fontWeight:600 }}>
              <Zap size={13}/> Test Notification
            </button>
            <button onClick={handleSave} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 15px", borderRadius:9, cursor:"pointer", border:"none", background:C.primary, color:"#fff", fontSize:12, fontWeight:700 }}>
              <Save size={13}/> {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Save toast */}
        {saved && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:10, background:"#ecfdf5", border:"1px solid rgba(22,163,74,0.2)", animation:"fadeUp 0.2s ease" }}>
            <CheckCircle2 size={14} color={C.primary}/>
            <span style={{ fontSize:12, fontWeight:600, color:C.primary }}>Notification settings saved successfully.</span>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Channels */}
          <Card title="Notification Channels">
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <ChannelCard icon={Mail}         label="Email"         enabled={emailOn} onToggle={()=>setEmailOn(v=>!v)}  note="Sent to admin@example.com"/>
              <ChannelCard icon={MessageSquare} label="SMS"           enabled={smsOn}   onToggle={()=>setSmsOn(v=>!v)}   note="Sent to +44 7700 900000"/>
              <ChannelCard icon={Smartphone}   label="Push (In-App)" enabled={pushOn}  onToggle={()=>setPushOn(v=>!v)}  note="Browser and mobile app"/>
            </div>
          </Card>

          {/* Alert types */}
          <Card title="Alert Types">
            <div style={{ display:"flex", flexDirection:"column" }}>
              <AlertRow label="Late arrival alerts"       sublabel="Triggered when check-in is past the cut-off"    enabled={lateOn}    onToggle={()=>setLateOn(v=>!v)}/>
              <AlertRow label="Scanner offline alerts"    sublabel="Triggered when a scanner device goes offline"   enabled={offlineOn} onToggle={()=>setOfflineOn(v=>!v)}/>
              <AlertRow label="Critical audit events"     sublabel="Blocked logins, untrusted IPs, data breaches"   enabled={auditOn}   onToggle={()=>setAuditOn(v=>!v)}/>
              <AlertRow label="QR token changes"          sublabel="Regenerated or revoked personnel QR tokens"       enabled={qrOn}      onToggle={()=>setQrOn(v=>!v)}/>
              <div style={{ paddingTop:12 }}>
                <AlertRow label="Absent personnel alerts" sublabel="Daily digest of NSS Personnel with no check-in" enabled={absentOn}  onToggle={()=>setAbsentOn(v=>!v)}/>
              </div>
            </div>
          </Card>

          {/* Quiet hours */}
          <Card title="Quiet Hours">
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.primaryDark }}>Enable quiet hours</div>
                  <div style={{ fontSize:11, color:C.outerGreen, marginTop:2 }}>Pause non-critical alerts during set times</div>
                </div>
                <Toggle on={quietOn} onChange={()=>setQuietOn(v=>!v)}/>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, opacity: quietOn ? 1 : 0.4, pointerEvents: quietOn ? "auto" : "none" }}>
                <div>
                  <label style={lbl}>Start time</label>
                  <input type="time" value={quietStart} onChange={e=>setQuietStart(e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>End time</label>
                  <input type="time" value={quietEnd} onChange={e=>setQuietEnd(e.target.value)} style={inp}/>
                </div>
              </div>

              {quietOn && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:9, background:C.amberBg, border:`1px solid ${C.amberBorder}` }}>
                  <BellOff size={13} color={C.amber}/>
                  <span style={{ fontSize:11, color:C.amber, fontWeight:500 }}>
                    Non-critical alerts are paused from <strong>{quietStart}</strong> to <strong>{quietEnd}</strong>.
                  </span>
                </div>
              )}

              <div style={{ padding:"10px 12px", borderRadius:9, background:C.surface2, border:`1px solid ${C.border}`, fontSize:11, color:C.outerGreen, display:"flex", alignItems:"center", gap:7 }}>
                <AlertTriangle size={12} color={C.red}/>
                <span><strong style={{ color:C.primaryDark }}>Critical alerts</strong> (e.g. blocked logins) are always delivered regardless of quiet hours.</span>
              </div>
            </div>
          </Card>

          {/* Recent notifications */}
          <Card title={`Recent Notifications${items.length > 0 ? ` (${items.length})` : ""}`}>
            {items.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:C.outerGreen, fontSize:13 }}>
                <BellOff size={28} color={C.border} style={{ display:"block", margin:"0 auto 10px" }}/>
                All caught up — no recent notifications.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {items.map(item => {
                  const lvl = LEVEL_CFG[item.level];
                  const LvlIcon = lvl.icon;
                  return (
                    <div key={item.id} style={{ display:"flex", gap:10, padding:"12px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}` }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:lvl.bg, border:`1px solid ${lvl.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <LvlIcon size={14} color={lvl.color}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                          <span style={{ fontWeight:700, fontSize:12, color:C.primaryDark }}>{item.title}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                            <span style={{ fontSize:10, color:C.outerGreen, display:"flex", alignItems:"center", gap:3 }}><Clock size={9}/>{item.time}</span>
                            <button onClick={()=>dismiss(item.id)} style={{ border:"none", background:"none", cursor:"pointer", padding:2, color:C.outerGreen, display:"flex" }}>
                              <X size={12}/>
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:C.outerGreen, marginTop:3 }}>{item.desc}</div>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:7, padding:"2px 8px", borderRadius:100, border:`1px solid ${lvl.border}`, background:lvl.bg, color:lvl.color, fontSize:10, fontWeight:700 }}>
                          <LvlIcon size={10}/>{item.level}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <button onClick={()=>setItems([])} style={{ alignSelf:"flex-end", padding:"6px 14px", borderRadius:8, border:`1px solid ${C.border}`, background:"#fff", color:C.outerGreen, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  Clear all
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
