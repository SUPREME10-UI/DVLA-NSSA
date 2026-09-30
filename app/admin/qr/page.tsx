"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode, ShieldCheck, KeyRound, Fingerprint, Hash, Download,
  Printer, RefreshCw, Copy, CheckCircle2, AlertTriangle, Info,
  Lock, Zap, Database, ChevronDown,
} from "lucide-react";
import { PERSONNEL_REGISTRY, type PersonnelRecord } from "../../utils/personnelRegistry";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  primaryDark: "#0f172a",
  primary:     "#16a34a",
  outerGreen:  "#475569",
  surface:     "#f8fafc",
  surface2:    "#f1f5f9",
  border:      "#e2e8f0",
  amber:       "#d97706",
  amberBg:     "#fffbeb",
  amberBorder: "#fde68a",
};

type QRMode = "uuid" | "encrypted" | "signed";

const MODES = [
  {
    key:        "uuid" as QRMode,
    label:      "Secure UUID",
    icon:       Hash,
    tagline:    "Simplest setup — best for fully internal, trusted networks.",
    badge:      "Low complexity",
    badgeBg:    C.surface2,
    badgeColor: C.outerGreen,
    points: [
      "Generate a random, non-guessable UUID stored alongside the personnel record.",
      "On each scan, the UUID is looked up in your database to retrieve the personnel.",
      "Ideal when scans happen only on your internal network with trusted devices.",
    ],
  },
  {
    key:        "encrypted" as QRMode,
    label:      "Encrypted Token",
    icon:       Lock,
    tagline:    "Strong protection — recommended for most deployments.",
    badge:      "Recommended",
    badgeBg:    "#ecfdf5",
    badgeColor: "#16a34a",
    points: [
      "Encrypt personnelId + expiry + nonce with a secret key on your backend.",
      "QR contains only the encrypted blob — decrypt and validate expiry on each scan.",
      "Strong protection against token sharing when combined with short expiry and IP checks.",
    ],
  },
  {
    key:        "signed" as QRMode,
    label:      "Signed JWT",
    icon:       Fingerprint,
    tagline:    "High performance — no DB lookup needed on every scan.",
    badge:      "Advanced",
    badgeBg:    "#fffbeb",
    badgeColor: "#d97706",
    points: [
      "Sign a payload with personnelId, iat, and exp using HMAC-SHA256 or RS256.",
      "Scanner validates the signature and expiry without a database round-trip.",
      "Good balance of performance and security — no personal data is exposed.",
    ],
  },
];

const CHECKLIST = (mode: QRMode) => [
  { icon: Lock,          label: "Token expiry enforced",  ok: true },
  { icon: Database,      label: "DB lookup on scan",      ok: mode !== "signed" },
  { icon: Zap,           label: "Scanless verification",  ok: mode === "signed" },
  { icon: AlertTriangle, label: "Revocable tokens",       ok: mode !== "signed" },
];

// ─── Real QR Canvas ───────────────────────────────────────────────────────────
function QRCanvas({ value, size = 180 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: C.primaryDark, light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(console.error);
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8 }} />;
}

// ─── Regenerate Confirm Modal ─────────────────────────────────────────────────
function RegenModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:18, padding:28, width:320, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", textAlign:"center" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:C.amberBg, border:`1px solid ${C.amberBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <RefreshCw size={18} color={C.amber} />
        </div>
        <div style={{ fontWeight:800, fontSize:14, color:C.primaryDark, marginBottom:8 }}>Regenerate Token?</div>
        <div style={{ fontSize:12, color:C.outerGreen, marginBottom:22, lineHeight:1.6 }}>
          This will revoke the current QR code. Any <strong>printed tags</strong> with the old QR will stop working immediately.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"9px", borderRadius:9, border:`1px solid ${C.border}`, background:"#fff", color:C.primaryDark, fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", background:C.amber, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Regenerate</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QrManagementPage() {
  const [mode, setMode]               = useState<QRMode>("encrypted");
  const [copied, setCopied]           = useState(false);
  const [showRegen, setShowRegen]     = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelRecord>(PERSONNEL_REGISTRY[0]);
  const [tokenTimestamp, setTokenTimestamp] = useState<number>(1775000000000);

  const activeMode = MODES.find(m => m.key === mode)!;

  // Build the QR token value based on mode (deterministic timestamp avoids SSR hydration mismatch)
  const qrValue = (() => {
    const base = selectedPersonnel.token;
    if (mode === "uuid")      return base; // plain token / UUID-style
    if (mode === "encrypted") return btoa(`{"t":"${base}","exp":${tokenTimestamp + 86400000}}`);
    // signed: simple base64 JWT-style demo
    const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: selectedPersonnel.id, iat: Math.floor(tokenTimestamp/1000) }));
    return `${header}.${payload}.DVLA_DEMO_SIG`;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegen = () => {
    setTokenTimestamp(Date.now());
    setRegenerated(true);
    setShowRegen(false);
    setTimeout(() => setRegenerated(false), 3000);
  };

  // ── Download: render QR to PNG ─────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: 400,
        margin: 3,
        color: { dark: C.primaryDark, light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      const img = new Image();
      img.onload = () => {
        const pad = 28, textH = 48;
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  + pad * 2;
        canvas.height = img.height + pad * 2 + textH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, pad, pad);
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = C.primaryDark;
        ctx.textAlign = "center";
        ctx.fillText(`${selectedPersonnel.name}  |  ${selectedPersonnel.id}`, canvas.width / 2, img.height + pad + 20);
        ctx.fillStyle = C.primary;
        ctx.font = "10px monospace";
        ctx.fillText(activeMode.label, canvas.width / 2, img.height + pad + 38);
        canvas.toBlob(blob => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `DVLA-QR-${selectedPersonnel.id}-${mode}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
        }, "image/png");
      };
      img.src = dataUrl;
    } catch (err) {
      console.error(err);
    }
  };

  // ── Print: open styled popup window ───────────────────────────────────────
  const handlePrint = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: 260,
        margin: 2,
        color: { dark: C.primaryDark, light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      const win = window.open("", "_blank", "width=420,height=560");
      if (!win) { alert("Please allow pop-ups to print the QR code."); return; }
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>DVLA QR Code – ${selectedPersonnel.id}</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: system-ui, sans-serif; background:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; }
            .card { border:2px solid #e2e8f0; border-radius:16px; padding:28px 24px; width:320px; display:flex; flex-direction:column; align-items:center; gap:16px; }
            .logo-row { display:flex; align-items:center; gap:8px; }
            .logo-row span { font-size:13px; font-weight:800; color:#0f172a; }
            .logo-row small { font-size:9px; color:#475569; }
            .qr-wrap { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px; }
            .qr-wrap img { display:block; }
            .name-row { font-size:14px; font-weight:700; color:#0f172a; }
            .id-row   { font-size:10px; color:#475569; }
            .footer   { font-size:8px; color:#94a3b8; text-align:center; line-height:1.5; }
            @media print { body { margin:0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-row">
              <span>DVLA Ghana</span>
              <small>National Service Personnel</small>
            </div>
            <div class="qr-wrap"><img src="${dataUrl}" width="260" height="260" /></div>
            <div class="name-row">${selectedPersonnel.name}</div>
            <div class="id-row">${selectedPersonnel.id} &nbsp;·&nbsp; ${activeMode.label}</div>
            <div class="footer">Driver &amp; Vehicle Licensing Authority · Republic of Ghana<br/>This QR is cryptographically secured — no personal data is embedded.</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
        </html>
      `);
      win.document.close();
    } catch (err) {
      console.error(err);
    }
  };

  const btnBase: React.CSSProperties = {
    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
    padding:"9px 14px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:600, border:`1px solid ${C.border}`,
  };

  return (
    <>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }`}</style>

      {showRegen && <RegenModal onClose={() => setShowRegen(false)} onConfirm={handleRegen} />}

      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:C.surface2, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <QrCode size={16} color={C.primary} />
              </div>
              <h1 style={{ fontSize:22, fontWeight:800, color:C.primaryDark, margin:0, letterSpacing:"-0.03em" }}>QR Code Management</h1>
            </div>
            <p style={{ fontSize:12, color:C.outerGreen, margin:0 }}>
              Configure payload strategy, preview codes, and manage token security for NSS Personnel QR tags.
            </p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <span style={{ display:"flex", alignItems:"center", gap:5, background:"#ecfdf5", border:"1px solid #a7f3d0", borderRadius:100, padding:"5px 12px", fontSize:11, fontWeight:600, color:C.primary }}>
              <ShieldCheck size={11} /> No raw personal data in QR
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:5, background:C.amberBg, border:`1px solid ${C.amberBorder}`, borderRadius:100, padding:"5px 12px", fontSize:11, fontWeight:600, color:C.amber }}>
              <KeyRound size={11} /> JWT / token signing ready
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>

          {/* Left: strategy */}
          <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ padding:"18px 20px", borderBottom:`1px solid ${C.surface2}` }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.primaryDark }}>QR Payload Strategy</div>
              <div style={{ fontSize:11, color:C.outerGreen, marginTop:3 }}>Personnel details stay in your database — only a token or ID is embedded in the QR.</div>
            </div>

            <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:18 }}>

              {/* Mode cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {MODES.map(m => {
                  const Icon = m.icon;
                  const isActive = mode === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      style={{
                        display:"flex", flexDirection:"column", alignItems:"flex-start", gap:10,
                        padding:"14px", borderRadius:12, cursor:"pointer", textAlign:"left",
                        border:`2px solid ${isActive ? C.primary : C.border}`,
                        background: isActive ? "#ecfdf5" : "#fff",
                        transition:"all 0.15s",
                      }}
                    >
                      <div style={{ width:34, height:34, borderRadius:9, background: isActive ? C.primary : C.surface2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon size={15} color={isActive ? "#fff" : C.outerGreen} strokeWidth={2} />
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.primaryDark }}>{m.label}</div>
                        <div style={{ fontSize:10, color:C.outerGreen, marginTop:3, lineHeight:1.4 }}>{m.tagline}</div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 9px", borderRadius:100, background: isActive ? "rgba(22,163,74,0.1)" : m.badgeBg, color: isActive ? C.primary : m.badgeColor, border:`1px solid ${isActive ? "rgba(22,163,74,0.25)" : "transparent"}` }}>
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detail box */}
              <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <activeMode.icon size={14} color={C.primary} />
                  <span style={{ fontSize:13, fontWeight:700, color:C.primaryDark }}>{activeMode.label}</span>
                  <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 10px", borderRadius:100, background:activeMode.badgeBg, color:activeMode.badgeColor }}>{activeMode.badge}</span>
                </div>
                <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10, fontSize:12 }}>
                  {activeMode.points.map((p, i) => (
                    <li key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <CheckCircle2 size={13} color={C.primary} style={{ flexShrink:0, marginTop:1 }} />
                      <span style={{ color:C.primaryDark, lineHeight:1.6 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Integration note */}
              <div style={{ borderRadius:12, padding:"14px 16px", border:`1.5px dashed #86efac`, background:"#f0fdf4", display:"flex", gap:10 }}>
                <Info size={14} color={C.primary} style={{ flexShrink:0, marginTop:1 }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.primaryDark, marginBottom:4 }}>Backend Integration Note</div>
                  <p style={{ fontSize:11, color:C.outerGreen, margin:0, lineHeight:1.6 }}>
                    When a new NSS Personnel is registered, call your backend to generate a secure token and store it alongside the personnel record.
                    The QR image printed on the personnel&#39;s tag must contain <strong style={{ color:C.primaryDark }}>only that token</strong> — never name, email, or phone number directly.
                  </p>
                </div>
              </div>

              {/* Security checklist */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {CHECKLIST(mode).map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:9, background: item.ok ? "#ecfdf5" : C.surface2, border:`1px solid ${item.ok ? "rgba(22,163,74,0.2)" : C.border}` }}>
                    <item.icon size={12} color={item.ok ? C.primary : C.outerGreen} />
                    <span style={{ fontSize:11, fontWeight:500, color: item.ok ? C.primaryDark : C.outerGreen }}>{item.label}</span>
                    {item.ok
                      ? <CheckCircle2 size={12} color={C.primary} style={{ marginLeft:"auto" }} />
                      : <span style={{ marginLeft:"auto", fontSize:9, color:C.outerGreen }}>N/A</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: QR preview */}
          <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ padding:"18px 20px", borderBottom:`1px solid ${C.surface2}` }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.primaryDark }}>Live QR Preview</div>
              <div style={{ fontSize:11, color:C.outerGreen, marginTop:3 }}>Real scannable code — print or download onto the personnel&#39;s physical ID tag.</div>
            </div>

            <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>

              {/* Personnel picker */}
              <div style={{ position:"relative" }}>
                <select
                  value={selectedPersonnel.id}
                  onChange={e => {
                    const found = PERSONNEL_REGISTRY.find(p => p.id === e.target.value);
                    if (found) setSelectedPersonnel(found);
                  }}
                  style={{
                    width:"100%", padding:"9px 34px 9px 12px", borderRadius:10,
                    border:`1.5px solid ${C.border}`, background:C.surface,
                    fontSize:12, fontWeight:600, color:C.primaryDark,
                    fontFamily:"inherit", appearance:"none", cursor:"pointer",
                    outline:"none",
                  }}
                >
                  {PERSONNEL_REGISTRY.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                  ))}
                </select>
                <ChevronDown size={14} color={C.outerGreen} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
              </div>

              {/* QR graphic */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"20px 16px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}` }}>
                {/* Personnel chip */}
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:100, background:C.primaryDark }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:"#eab308", color:C.primaryDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800 }}>{selectedPersonnel.avatar}</div>
                  <span style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{selectedPersonnel.name}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>{selectedPersonnel.id}</span>
                </div>

                {/* Real QR Code */}
                <div style={{ background:"#fff", padding:12, borderRadius:10, border:`1.5px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
                  <QRCanvas key={`${selectedPersonnel.id}-${mode}-${regenerated}-${tokenTimestamp}`} value={qrValue} size={180} />
                </div>

                <span style={{ fontSize:10, color:C.outerGreen }}>
                  Strategy: <strong style={{ color:C.primaryDark }}>{activeMode.label}</strong>
                </span>
              </div>

              {/* Regenerated toast */}
              {regenerated && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:9, background:"#ecfdf5", border:"1px solid rgba(22,163,74,0.2)", animation:"fadeUp 0.2s ease" }}>
                  <CheckCircle2 size={13} color={C.primary} />
                  <span style={{ fontSize:11, fontWeight:600, color:C.primary }}>Token regenerated successfully</span>
                </div>
              )}

              {/* Token display */}
              <div style={{ borderRadius:10, background:C.primaryDark, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <code
                  suppressHydrationWarning
                  style={{ fontSize:10, color:"#86efac", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}
                >
                  {qrValue}
                </code>
                <button onClick={handleCopy} style={{ background:"none", border:"none", cursor:"pointer", color: copied ? "#eab308" : "rgba(255,255,255,0.35)", flexShrink:0, padding:4, transition:"color 0.2s" }}>
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <button onClick={handleDownload} style={{ ...btnBase, background:"#fff", color:C.primaryDark }}>
                  <Download size={13} /> Download
                </button>
                <button onClick={handlePrint} style={{ ...btnBase, background:"#fff", color:C.primaryDark }}>
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setShowRegen(true)}
                  style={{ ...btnBase, gridColumn:"1/-1", border:`1px solid ${C.amberBorder}`, background:C.amberBg, color:C.amber, fontWeight:700 }}
                >
                  <RefreshCw size={13} /> Regenerate Token
                </button>
              </div>

              {/* Warning */}
              <div style={{ display:"flex", gap:8, padding:"10px 12px", borderRadius:9, background:C.amberBg, border:`1px solid ${C.amberBorder}` }}>
                <AlertTriangle size={13} color={C.amber} style={{ flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:11, color:C.amber, lineHeight:1.5 }}>
                  Regenerating revokes the old token — printed QR tags will stop working immediately.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
