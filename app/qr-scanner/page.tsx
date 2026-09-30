"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lookupToken, PERSONNEL_REGISTRY, type PersonnelRecord } from "../utils/personnelRegistry";
import {
  QrCode, CheckCircle2, XCircle, Camera, CameraOff,
  ShieldAlert, Wifi, RefreshCw, ScanLine, UserCheck,
} from "lucide-react";

// ─── Colours ──────────────────────────────────────────────────────────────────
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

type ScanResult =
  | { kind: "success"; personnel: PersonnelRecord; time: string }
  | { kind: "error";   message: string }
  | null;

// ─── Attendance log entry ─────────────────────────────────────────────────────
type LogEntry = {
  personnel: PersonnelRecord;
  time: string;
  id: number;
};

// ─── QR Scanner Component ─────────────────────────────────────────────────────
export default function QrScannerPage() {
  const scannerRef   = useRef<HTMLDivElement>(null);
  const html5QrRef   = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [scanning, setScanning]   = useState(false);
  const [result, setResult]       = useState<ScanResult>(null);
  const [log, setLog]             = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [camError, setCamError]   = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef    = useRef(false);

  // ── Handle a decoded QR value ────────────────────────────────────────────
  const handleScan = useCallback((decodedText: string) => {
    // Debounce: ignore repeated scans within 3 seconds
    if (cooldownRef.current || lastScannedRef.current === decodedText) return;
    cooldownRef.current = true;
    lastScannedRef.current = decodedText;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Try to find the personnel by their token.
    // For "encrypted" and "signed" modes the value is base64-encoded;
    // we try both the raw value and a decoded version.
    let resolved: PersonnelRecord | null = lookupToken(decodedText);

    if (!resolved) {
      // Try decoding as base64 (encrypted token demo)
      try {
        const decoded = atob(decodedText);
        const obj = JSON.parse(decoded);
        if (obj.t) resolved = lookupToken(obj.t);
      } catch {/* not base64 JSON */}
    }

    if (!resolved) {
      // Try JWT-style: header.payload.sig — parse payload
      try {
        const parts = decodedText.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          // payload.sub is the NSS ID; find by id in the registry
          resolved = PERSONNEL_REGISTRY.find((p: PersonnelRecord) => p.id === payload.sub) ?? null;
        }
      } catch {/* not JWT */}
    }

    if (resolved) {
      if (resolved.status === "Inactive") {
        setResult({ kind: "error", message: `${resolved.name} (${resolved.id}) is marked Inactive and cannot check in.` });
      } else {
        setResult({ kind: "success", personnel: resolved, time: now });
        setLogCounter(c => {
          const newId = c + 1;
          setLog(prev => [{ personnel: resolved!, time: now, id: newId }, ...prev.slice(0, 9)]);
          return newId;
        });
      }
    } else {
      setResult({ kind: "error", message: "Unknown QR code — token not found in system." });
    }

    // Reset after 4 seconds
    setTimeout(() => {
      setResult(null);
      lastScannedRef.current = null;
      cooldownRef.current = false;
    }, 4000);
  }, []);

  // ── Start camera scanner ─────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    setCamError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerRef.current) return;

      // Clean up any leftover instance
      if (html5QrRef.current) {
        try { await html5QrRef.current.stop(); } catch { /* ignore */ }
        html5QrRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleScan,
        () => { /* QR not detected in frame — ignore */ }
      );
      setScanning(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCamError(msg.includes("Permission") || msg.includes("permission")
        ? "Camera permission denied. Please allow camera access and try again."
        : `Could not start camera: ${msg}`);
      setScanning(false);
    }
  }, [handleScan]);

  // ── Stop camera scanner ──────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch { /* ignore */ }
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, []);

  const avatarColor = (id: string) =>
    ({ "NSS-001":"#16a34a","NSS-014":"#475569","NSS-022":"#145B2A","NSS-033":"#0f172a","NSS-047":"#2A5C2A","NSS-058":"#475569" } as Record<string,string>)[id] ?? C.primary;

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:C.surface, minHeight:"100vh", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"32px 16px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes scanLine {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }
        #qr-reader video { border-radius: 12px; }
        #qr-reader img   { display: none !important; }
        #qr-reader        { border: none !important; }
      `}</style>

      <div style={{ width:"100%", maxWidth:920, display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>

        {/* ── Left: scanner card ── */}
        <div style={{ background:"#fff", borderRadius:20, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Header */}
          <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.surface2}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(22,163,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ScanLine size={18} color={C.primary} />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:C.primaryDark, letterSpacing:"-0.02em" }}>NSS Personnel Check-in</div>
              <div style={{ fontSize:11, color:C.outerGreen, marginTop:2 }}>Point your camera at a DVLA NSS QR tag to record attendance.</div>
            </div>
            {scanning && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:100, padding:"4px 12px" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:C.primary, display:"inline-block", animation:"pulse 1.4s ease-in-out infinite" }} />
                <span style={{ fontSize:10, fontWeight:700, color:C.primary, letterSpacing:"0.06em", textTransform:"uppercase" }}>Live</span>
              </div>
            )}
          </div>

          {/* Camera area */}
          <div style={{ padding:24 }}>
            <div style={{ position:"relative", borderRadius:16, overflow:"hidden", background:C.primaryDark, minHeight:300, display:"flex", alignItems:"center", justifyContent:"center" }}>

              {/* html5-qrcode mounts here */}
              <div
                id="qr-reader"
                ref={scannerRef}
                style={{ width:"100%", minHeight:300 }}
              />

              {/* Overlay when not scanning */}
              {!scanning && (
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"rgba(15,23,42,0.85)", borderRadius:16 }}>
                  {camError ? (
                    <>
                      <CameraOff size={36} color="#ef4444" />
                      <div style={{ fontSize:13, color:"#fca5a5", textAlign:"center", maxWidth:280, lineHeight:1.5 }}>{camError}</div>
                    </>
                  ) : (
                    <>
                      <Camera size={36} color="rgba(255,255,255,0.5)" />
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Camera is off</div>
                    </>
                  )}
                </div>
              )}

              {/* Scan line animation when active */}
              {scanning && (
                <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                  {/* Corner brackets */}
                  {[
                    { top:"50%",  left:"50%",  transform:"translate(-110px,-110px) rotate(0deg)"   },
                    { top:"50%",  left:"50%",  transform:"translate(70px,-110px) rotate(90deg)"    },
                    { top:"50%",  left:"50%",  transform:"translate(-110px,70px) rotate(-90deg)"   },
                    { top:"50%",  left:"50%",  transform:"translate(70px,70px) rotate(180deg)"     },
                  ].map((pos, i) => (
                    <div key={i} style={{ position:"absolute", width:36, height:36, ...pos }}>
                      <div style={{ position:"absolute", top:0, left:0, width:36, height:4, background:C.primary, borderRadius:2 }} />
                      <div style={{ position:"absolute", top:0, left:0, width:4, height:36, background:C.primary, borderRadius:2 }} />
                    </div>
                  ))}
                  {/* Moving scan line */}
                  <div style={{ position:"absolute", left:"calc(50% - 110px)", width:220, height:2, background:`linear-gradient(90deg,transparent,${C.primary},transparent)`, animation:"scanLine 2.4s linear infinite", borderRadius:1 }} />
                </div>
              )}

              {/* Result overlay */}
              {result && (
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"rgba(15,23,42,0.88)", borderRadius:16, animation:"fadeUp 0.2s ease" }}>
                  {result.kind === "success" ? (
                    <>
                      <div style={{ width:60, height:60, borderRadius:18, background:"rgba(22,163,74,0.2)", border:"2px solid rgba(22,163,74,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <CheckCircle2 size={28} color={C.primary} />
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>{result.personnel.name}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4 }}>{result.personnel.id} · {result.personnel.department}</div>
                        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, background:"rgba(22,163,74,0.15)", border:"1px solid rgba(22,163,74,0.3)", borderRadius:100, padding:"5px 14px" }}>
                          <UserCheck size={12} color={C.primary} />
                          <span style={{ fontSize:12, fontWeight:700, color:C.primary }}>Checked in at {result.time}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width:60, height:60, borderRadius:18, background:"rgba(220,38,38,0.15)", border:"2px solid rgba(220,38,38,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <XCircle size={28} color={C.red} />
                      </div>
                      <div style={{ fontSize:13, color:"#fca5a5", textAlign:"center", maxWidth:260, lineHeight:1.5 }}>{result.message}</div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div style={{ marginTop:16, display:"flex", gap:10 }}>
              {!scanning ? (
                <button
                  onClick={startScanner}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:12, border:"none", background:C.primary, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}
                >
                  <Camera size={15} /> Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={stopScanner}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:12, border:`1.5px solid ${C.border}`, background:"#fff", color:C.primaryDark, fontSize:13, fontWeight:600, cursor:"pointer" }}
                  >
                    <CameraOff size={15} /> Stop Camera
                  </button>
                  <button
                    onClick={async () => { await stopScanner(); startScanner(); }}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 16px", borderRadius:12, border:`1.5px solid ${C.border}`, background:"#fff", color:C.outerGreen, fontSize:12, fontWeight:600, cursor:"pointer" }}
                  >
                    <RefreshCw size={14} />
                  </button>
                </>
              )}
            </div>

            {/* Network note */}
            <div style={{ marginTop:14, display:"flex", gap:8, padding:"10px 14px", borderRadius:10, background:C.amberBg, border:`1px solid ${C.amberBorder}` }}>
              <Wifi size={13} color={C.amber} style={{ flexShrink:0, marginTop:1 }} />
              <span style={{ fontSize:11, color:C.amber, lineHeight:1.5 }}>
                In production, attendance is only recorded when connected to the DVLA office network. QR scans from outside the IP whitelist are rejected.
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: log + info ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* System status */}
          <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${C.border}`, padding:"16px 18px", display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.primaryDark, marginBottom:2 }}>System Status</div>
            {[
              { icon:ShieldAlert, label:"Token validation",   status:"Active",  ok:true  },
              { icon:Wifi,        label:"Network check",      status:"Offline (demo)",  ok:false },
              { icon:QrCode,      label:"QR decoder",         status:"Ready",   ok:true  },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:9, background: row.ok ? "#ecfdf5" : C.surface2, border:`1px solid ${row.ok ? "rgba(22,163,74,0.15)" : C.border}` }}>
                <row.icon size={13} color={row.ok ? C.primary : C.outerGreen} />
                <span style={{ fontSize:11, fontWeight:500, color:C.primaryDark, flex:1 }}>{row.label}</span>
                <span style={{ fontSize:10, fontWeight:700, color: row.ok ? C.primary : C.outerGreen }}>{row.status}</span>
              </div>
            ))}
          </div>

          {/* Check-in log */}
          <div style={{ background:"#fff", borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.surface2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.primaryDark }}>Check-in Log</div>
              <span style={{ fontSize:10, color:C.outerGreen, fontWeight:500 }}>Session only</span>
            </div>
            <div style={{ padding:"10px", display:"flex", flexDirection:"column", gap:6, minHeight:120 }}>
              {log.length === 0 ? (
                <div style={{ padding:"28px 0", textAlign:"center", color:C.outerGreen, fontSize:12 }}>
                  No check-ins yet this session.
                </div>
              ) : (
                log.map(entry => (
                  <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, animation:"fadeUp 0.2s ease" }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:avatarColor(entry.personnel.id), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>
                      {entry.personnel.avatar}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.primaryDark, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{entry.personnel.name}</div>
                      <div style={{ fontSize:10, color:C.outerGreen }}>{entry.personnel.id} · {entry.personnel.department}</div>
                    </div>
                    <div style={{ fontSize:10, color:C.primary, fontWeight:600, whiteSpace:"nowrap" }}>{entry.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* How to test */}
          <div style={{ background:"#fff", borderRadius:16, border:`1px dashed ${C.border}`, padding:"14px 16px" }}>
            <div style={{ fontWeight:700, fontSize:12, color:C.primaryDark, marginBottom:8 }}>How to test</div>
            <ol style={{ margin:0, paddingLeft:18, fontSize:11, color:C.outerGreen, lineHeight:2 }}>
              <li>Go to <strong style={{ color:C.primaryDark }}>QR Codes</strong> in the sidebar</li>
              <li>Select a personnel and click <strong style={{ color:C.primaryDark }}>Download</strong></li>
              <li>Open the PNG on another device or screen</li>
              <li>Come back here, start the camera and scan it</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
