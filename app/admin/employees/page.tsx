"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Users, UserPlus, Upload, Search, Building2, Mail, Phone,
  QrCode, Pencil, Trash2, CalendarDays, ChevronDown,
  BadgeCheck, CircleDashed, X, Download, Shield,
  TrendingUp, ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";
import { downloadCSV } from "../../utils/export";
import { useToast } from "../../components/Toast";
import { PERSONNEL_REGISTRY } from "../../utils/personnelRegistry";
import QRCode from "qrcode";

const C = {
  primaryDark: "#0f172a",
  primary:     "#16a34a",
  outerGreen:  "#475569",
  surface:     "#f8fafc",
  surface2:    "#f1f5f9",
  border:      "#e2e8f0",
  red:         "#dc2626",
};

type PersonnelStatus = "Active" | "Inactive";
type Personnel = {
  id: string; name: string; department: string;
  email: string; phone: string; status: PersonnelStatus;
  dateAdded: string; avatar: string;
};

const INITIAL_PERSONNEL: Personnel[] = [
  { id:"NSS-001", name:"John Doe",     department:"Operations", email:"john.doe@dvla.gov.gh",    phone:"+233 24 000 0001", status:"Active",   dateAdded:"2025-01-10", avatar:"JD" },
  { id:"NSS-014", name:"Sarah Malik",  department:"HR",         email:"sarah.malik@dvla.gov.gh", phone:"+233 24 000 0014", status:"Active",   dateAdded:"2025-02-03", avatar:"SM" },
  { id:"NSS-022", name:"Amina Yusuf", department:"Finance",    email:"amina.yusuf@dvla.gov.gh", phone:"+233 24 000 0022", status:"Inactive", dateAdded:"2025-02-14", avatar:"AY" },
  { id:"NSS-033", name:"Michael Chen",department:"IT",         email:"m.chen@dvla.gov.gh",      phone:"+233 24 000 0033", status:"Active",   dateAdded:"2025-01-22", avatar:"MC" },
  { id:"NSS-047", name:"Kofi Mensah", department:"Operations", email:"k.mensah@dvla.gov.gh",    phone:"+233 24 000 0047", status:"Active",   dateAdded:"2025-02-11", avatar:"KM" },
  { id:"NSS-058", name:"Esi Boateng", department:"IT",         email:"e.boateng@dvla.gov.gh",   phone:"+233 24 000 0058", status:"Inactive", dateAdded:"2025-02-18", avatar:"EB" },
];

const AVATAR_COLORS: Record<string, string> = {
  "NSS-001":"#16a34a","NSS-014":"#475569","NSS-022":"#145B2A",
  "NSS-033":"#0f172a","NSS-047":"#2A5C2A","NSS-058":"#475569",
};

// ─── QR Modal ─────────────────────────────────────────────────────────────────
function QRModal({ emp, onClose }: { emp: Personnel; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Look up the consistent token from the registry (falls back to a generated one)
  const token = PERSONNEL_REGISTRY.find(p => p.id === emp.id)?.token
    ?? `DVLA-NSS-${emp.id}-DEMO`;

  // Render real QR code into canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, token, {
      width: 180,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(console.error);
  }, [token]);

  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(token, {
        width: 400,
        margin: 3,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      const img = new Image();
      img.onload = () => {
        const pad = 20, textH = 44;
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  + pad * 2;
        canvas.height = img.height + pad * 2 + textH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, pad, pad);
        ctx.textAlign = "center";
        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText(`${emp.name}  (${emp.id})`, canvas.width / 2, img.height + pad + 18);
        ctx.font = "9px monospace";
        ctx.fillStyle = "#16a34a";
        ctx.fillText(token.slice(0, 50), canvas.width / 2, img.height + pad + 34);
        canvas.toBlob(blob => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `DVLA-QR-${emp.id}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
        }, "image/png");
      };
      img.src = dataUrl;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:32,width:320,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",alignItems:"center",gap:20,animation:"fadeUp 0.2s ease" }}>
        <div style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontWeight:700,fontSize:14,color:C.primaryDark }}>Personnel QR Code</span>
          <button onClick={onClose} style={{ border:"none",background:C.surface2,borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={13} color={C.outerGreen} />
          </button>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:42,height:42,borderRadius:11,background:AVATAR_COLORS[emp.id]??C.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13 }}>{emp.avatar}</div>
          <div>
            <div style={{ fontWeight:700,color:C.primaryDark,fontSize:13 }}>{emp.name}</div>
            <div style={{ fontSize:11,color:C.outerGreen }}>{emp.id}</div>
          </div>
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:`2px solid ${C.border}`,padding:8,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <canvas ref={canvasRef} width={180} height={180} style={{ borderRadius:8,display:"block" }} />
        </div>
        <div style={{ background:C.surface2,borderRadius:9,padding:"8px 14px",fontSize:10,fontFamily:"monospace",color:C.outerGreen,letterSpacing:"0.06em",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:7,maxWidth:"100%",overflow:"hidden" }}>
          <Shield size={10} color={C.primary}/>
          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{token}</span>
        </div>
        <button onClick={handleDownload} style={{ width:"100%",padding:"10px",borderRadius:10,border:"none",background:C.primary,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7 }}>
          <Download size={13}/> Download QR Code
        </button>
        <p style={{ margin:0,fontSize:10,color:C.outerGreen,textAlign:"center",lineHeight:1.5 }}>
          Real scannable QR — token only, no personal data embedded.
        </p>
      </div>
    </div>
  );
}

// ─── Add Personnel Modal ───────────────────────────────────────────────────────
function AddPersonnelModal({ onClose, onAdd, existingIds = [] }: { onClose:()=>void; onAdd:(e:Personnel)=>void; existingIds?: string[] }) {
  const depts = ["Operations","HR","Finance","IT","Sales","Marketing"];
  const [form,setForm] = useState({ nssId:"",name:"",department:"Operations",email:"",phone:"" });
  const [idError,setIdError] = useState("");
  const set = (k:string,v:string) => { setForm(f=>({...f,[k]:v})); if (k==="nssId") setIdError(""); };
  const lbl: React.CSSProperties = { fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,color:C.outerGreen,marginBottom:4,display:"block" };
  const inp: React.CSSProperties = { width:"100%",padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"#fff",fontSize:12,color:C.primaryDark,fontFamily:"inherit",outline:"none",boxSizing:"border-box" as const };
  const inpErr: React.CSSProperties = { ...inp, border:`1.5px solid ${C.red}` };

  const handleAdd = () => {
    const rawId = form.nssId.trim().toUpperCase();
    if (!rawId) {
      setIdError("NSS ID is required — it cannot be left blank.");
      return;
    }
    if (rawId.length < 3) {
      setIdError("Please enter a valid NSS ID (at least 3 characters).");
      return;
    }
    if (existingIds.some(eid => eid.toUpperCase() === rawId)) {
      setIdError(`NSS ID "${rawId}" is already registered to another personnel.`);
      return;
    }
    if (!form.name.trim()) return;
    if (!form.email.trim()) return;

    onAdd({
      id: rawId,
      name: form.name.trim(),
      department: form.department,
      email: form.email.trim(),
      phone: form.phone.trim() || "+233 24 000 0000",
      status: "Active",
      dateAdded: new Date().toISOString().split("T")[0],
      avatar: form.name.trim().split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase() || "NS"
    });
    onClose();
  };

  const isFormValid = Boolean(form.nssId.trim() && form.name.trim() && form.email.trim() && !idError);

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:28,width:420,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <span style={{ fontWeight:800,fontSize:15,color:C.primaryDark,display:"block" }}>Add New Personnel</span>
            <span style={{ fontSize:11,color:C.outerGreen }}>Enter the personnel's official NSS credentials and details</span>
          </div>
          <button onClick={onClose} style={{ border:"none",background:C.surface2,borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={13} color={C.outerGreen}/>
          </button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>

          {/* 1. Full Name */}
          <div>
            <label style={lbl}>Full Name *</label>
            <input style={inp} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Jane Smith"/>
          </div>

          {/* 2. Email */}
          <div>
            <label style={lbl}>Email *</label>
            <input style={inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="jane@dvla.gov.gh"/>
          </div>

          {/* 3. NSS ID */}
          <div>
            <label style={lbl}>NSS ID *</label>
            <div style={{ position:"relative" }}>
              <input
                style={idError ? inpErr : inp}
                value={form.nssId}
                onChange={e=>set("nssId",e.target.value.toUpperCase())}
                placeholder="e.g. NSS-072 or NSSGHA123456"
                maxLength={20}
              />
              {form.nssId.trim().length >= 3 && !idError && (
                <span style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.primary,fontWeight:700 }}>✓</span>
              )}
            </div>
            {idError
              ? <span style={{ fontSize:10,color:C.red,marginTop:4,display:"block" }}>{idError}</span>
              : <span style={{ fontSize:10,color:C.outerGreen,marginTop:4,display:"block" }}>Official NSS number assigned by the scheme (e.g. NSS-072)</span>
            }
          </div>

          {/* 4. Department */}
          <div>
            <label style={lbl}>Department</label>
            <select style={{...inp,appearance:"none"}} value={form.department} onChange={e=>set("department",e.target.value)}>
              {depts.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

          {/* 5. Phone */}
          <div>
            <label style={lbl}>Phone</label>
            <input style={inp} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+233 24 000 0000"/>
          </div>

        </div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:4 }}>
          <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:9,border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!isFormValid}
            style={{
              padding:"9px 18px",
              borderRadius:9,
              border:"none",
              background:isFormValid?C.primary:C.surface2,
              color:isFormValid?"#fff":C.outerGreen,
              fontSize:12,
              fontWeight:700,
              cursor:isFormValid?"pointer":"not-allowed",
              transition:"all 0.15s ease"
            }}
          >
            Add Personnel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Personnel Modal ──────────────────────────────────────────────────────
function EditPersonnelModal({ personnel, onClose, onSave }: { personnel:Personnel; onClose:()=>void; onSave:(updated:Personnel)=>void }) {
  const depts = ["Operations","HR","Finance","IT","Sales","Marketing","Transport","Logistics"];
  const [form, setForm] = useState({
    name: personnel.name,
    department: personnel.department,
    email: personnel.email,
    phone: personnel.phone,
    status: personnel.status,
  });
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));
  const lbl: React.CSSProperties = { fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,color:C.outerGreen,marginBottom:4,display:"block" };
  const inp: React.CSSProperties = { width:"100%",padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"#fff",fontSize:12,color:C.primaryDark,fontFamily:"inherit",outline:"none",boxSizing:"border-box" as const };
  const handleSave = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase() || personnel.avatar;
    onSave({
      ...personnel,
      ...form,
      avatar,
    });
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,padding:28,width:380,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <span style={{ fontWeight:800,fontSize:15,color:C.primaryDark }}>Edit NSS Personnel</span>
            <div style={{ fontSize:11,color:C.outerGreen }}>ID: {personnel.id}</div>
          </div>
          <button onClick={onClose} style={{ border:"none",background:C.surface2,borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={13} color={C.outerGreen}/>
          </button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Full Name"/></div>
          <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@dvla.gov.gh"/></div>
          <div><label style={lbl}>Department</label><select style={{...inp,appearance:"none"}} value={form.department} onChange={e=>set("department",e.target.value)}>{depts.map(d=><option key={d}>{d}</option>)}</select></div>
          <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+233 24 000 0000"/></div>
          <div>
            <label style={lbl}>Status</label>
            <select style={{...inp,appearance:"none"}} value={form.status} onChange={e=>set("status",e.target.value as PersonnelStatus)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:9,border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding:"9px 18px",borderRadius:9,border:"none",background:C.primary,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────
function BulkImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (newPersonnel: Personnel[]) => void;
}) {
  const { showToast } = useToast();
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Parse CSV text into records
  const parsedRecords: Personnel[] = useMemo(() => {
    if (!csvText.trim()) return [];
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const records: Personnel[] = [];
    const startIndex = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("nss") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 2 && parts[0]) {
        let id = "";
        let name = "";
        let department = "Operations";
        let email = "";
        let phone = "+233 24 000 0000";

        // Check if format is Full Name, Email, NSS ID, Department, Phone (email in column 1)
        if (parts[1] && parts[1].includes("@")) {
          name = parts[0] || "";
          email = parts[1];
          id = (parts[2] || "").toUpperCase();
          department = parts[3] || "Operations";
          phone = parts[4] || "+233 24 000 0000";
        } else if (parts.length >= 5 || parts[0].toUpperCase().startsWith("NSS")) {
          // Alternative format: NSS ID, Full Name, Department, Email, Phone
          id = parts[0].toUpperCase();
          name = parts[1] || "";
          department = parts[2] || "Operations";
          email = parts[3] || `${name.toLowerCase().replace(/\s+/g, ".")}@dvla.gov.gh`;
          phone = parts[4] || "+233 24 000 0000";
        } else {
          name = parts[0];
          email = parts[1] || `${name.toLowerCase().replace(/\s+/g, ".")}@dvla.gov.gh`;
          id = (parts[2] || `NSS-${String(i + 100).padStart(3, "0")}`).toUpperCase();
          department = parts[3] || "Operations";
          phone = parts[4] || "+233 24 000 0000";
        }
        if (!name || !id) continue;
        const avatar = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "NS";

        records.push({
          id,
          name,
          department,
          email,
          phone,
          status: "Active",
          dateAdded: new Date().toISOString().split("T")[0],
          avatar,
        });
      }
    }
    return records;
  }, [csvText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvText(text || "");
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const headers = ["Full Name", "Email", "NSS ID", "Department", "Phone"];
    const rows = [
      ["Kwame Mensah", "kwame.mensah@dvla.gov.gh", "NSS-081", "Operations", "+233 24 123 4567"],
      ["Abena Osei", "abena.osei@dvla.gov.gh", "NSS-082", "IT", "+233 20 987 6543"],
      ["Kofi Antwi", "kofi.antwi@dvla.gov.gh", "NSS-083", "HR", "+233 55 456 7890"],
      ["Akosua Sarpong", "akosua.sarpong@dvla.gov.gh", "NSS-084", "Finance", "+233 27 345 6789"],
    ];
    downloadCSV("DVLA-NSS-Personnel-Template.csv", headers, rows);
    showToast("Downloaded sample CSV template (Full Name, Email, NSS ID, Department, Phone)", "info");
  };

  const handleDoImport = () => {
    if (parsedRecords.length === 0) {
      showToast("No valid records found in the CSV data", "warning");
      return;
    }
    onImport(parsedRecords);
    showToast(`Successfully imported ${parsedRecords.length} NSS Personnel records`, "success");
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: 520, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>Bulk Import NSS Personnel</span>
            <div style={{ fontSize: 11, color: C.outerGreen }}>Upload a CSV file or paste tabular data to batch-register personnel</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: C.surface2, borderRadius: 7, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} color={C.outerGreen} />
          </button>
        </div>

        {/* Action bar for template */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid rgba(22,163,74,0.2)" }}>
          <div style={{ fontSize: 11, color: C.primaryDark }}>
            Need the correct column format?
          </div>
          <button
            onClick={handleDownloadTemplate}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.primary}`, background: "#fff", color: C.primary, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            <Download size={11} /> Download CSV Template
          </button>
        </div>

        {/* Upload box */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.outerGreen, marginBottom: 6, display: "block" }}>
            Choose CSV File
          </label>
          <div style={{ position: "relative", border: `2px dashed ${C.border}`, borderRadius: 12, padding: "20px", textAlign: "center", background: C.surface }}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
            />
            <Upload size={24} color={C.primary} style={{ margin: "0 auto 8px" }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: C.primaryDark }}>
              {fileName ? `Selected: ${fileName}` : "Click to select or drag & drop a .csv file"}
            </div>
            <div style={{ fontSize: 10, color: C.outerGreen, marginTop: 4 }}>
              Columns: Full Name, Department, Email, Phone
            </div>
          </div>
        </div>

        {/* Or paste directly */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.outerGreen, marginBottom: 4, display: "block" }}>
            Or Paste CSV Text Directly
          </label>
          <textarea
            value={csvText}
            onChange={e => { setCsvText(e.target.value); setFileName(null); }}
            placeholder={"Full Name, Department, Email, Phone\nKofi Mensah, Operations, kofi.mensah@dvla.gov.gh, +233 24 123 4567\nEsi Boateng, IT, esi.boateng@dvla.gov.gh, +233 20 876 5432"}
            rows={4}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 11, color: C.primaryDark, fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        {/* Live preview */}
        {parsedRecords.length > 0 && (
          <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", background: C.surface }}>
            <div style={{ padding: "8px 12px", background: C.surface2, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark }}>
                Preview: {parsedRecords.length} record{parsedRecords.length !== 1 ? "s" : ""} detected
              </span>
              <span style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>All valid</span>
            </div>
            <div style={{ maxHeight: 120, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <tbody>
                  {parsedRecords.slice(0, 5).map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.surface2}` }}>
                      <td style={{ padding: "6px 10px", fontWeight: 600, color: C.primaryDark }}>{r.name}</td>
                      <td style={{ padding: "6px 10px", color: C.outerGreen }}>{r.department}</td>
                      <td style={{ padding: "6px 10px", color: C.outerGreen }}>{r.email}</td>
                      <td style={{ padding: "6px 10px", color: C.outerGreen }}>{r.phone}</td>
                    </tr>
                  ))}
                  {parsedRecords.length > 5 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "6px 10px", textAlign: "center", color: C.outerGreen, fontSize: 10 }}>
                        + {parsedRecords.length - 5} more records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleDoImport}
            disabled={parsedRecords.length === 0}
            style={{
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: parsedRecords.length > 0 ? C.primary : C.surface2,
              color: parsedRecords.length > 0 ? "#fff" : C.outerGreen,
              fontSize: 12, fontWeight: 700,
              cursor: parsedRecords.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            Import {parsedRecords.length > 0 ? `(${parsedRecords.length})` : ""} Personnel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Personnel Profile Drawer ─────────────────────────────────────────────────
function PersonnelProfileDrawer({
  emp, onClose, onEdit, onViewQR, onToggleStatus,
}: {
  emp: Personnel;
  onClose: () => void;
  onEdit: () => void;
  onViewQR: () => void;
  onToggleStatus: () => void;
}) {
  const isActive = emp.status === "Active";
  const avatarBg = AVATAR_COLORS[emp.id] ?? C.primary;


  // Mock activity summary for this personnel
  const mockActivity = [
    { date: "Mon, 27 Jan", checkIn: "08:52", checkOut: "17:05", status: "Present" },
    { date: "Tue, 28 Jan", checkIn: "09:14", checkOut: "17:01", status: "Late"    },
    { date: "Wed, 29 Jan", checkIn: "08:47", checkOut: "17:10", status: "Present" },
    { date: "Thu, 30 Jan", checkIn: "—",     checkOut: "—",     status: "Absent"  },
    { date: "Fri, 31 Jan", checkIn: "08:58", checkOut: "17:00", status: "Present" },
  ];

  const statusColor = (s: string) =>
    s === "Present" ? { bg: "#ecfdf5", color: C.primary, border: "rgba(22,163,74,0.2)" }
    : s === "Late"  ? { bg: "#fffbeb", color: "#92400e", border: "#fde68a" }
    :                 { bg: "#fef2f2", color: C.red,      border: "rgba(220,38,38,0.2)" };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)",
        }}
      />
      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 1101,
        width: 380, background: "#fff",
        boxShadow: "-8px 0 40px rgba(15,23,42,0.15)",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.22s ease",
        overflowY: "auto",
      }}>

        {/* Top gradient header */}
        <div style={{
          background: "linear-gradient(135deg,#071526 0%,#0f2942 55%,#14532d 100%)",
          padding: "24px 24px 32px",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.12)", border: "none",
              borderRadius: 8, width: 30, height: 30, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} color="rgba(255,255,255,0.8)" />
          </button>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: avatarBg, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800,
              border: "3px solid rgba(255,255,255,0.25)",
              flexShrink: 0,
              opacity: isActive ? 1 : 0.5,
            }}>
              {emp.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {emp.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{
                  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 700,
                  borderRadius: 100, padding: "3px 10px", fontFamily: "monospace",
                }}>
                  {emp.id}
                </span>
                <span style={{
                  background: isActive ? "rgba(22,163,74,0.3)" : "rgba(71,85,105,0.3)",
                  border: `1px solid ${isActive ? "rgba(134,239,172,0.4)" : "rgba(148,163,184,0.4)"}`,
                  color: isActive ? "#86efac" : "#cbd5e1",
                  fontSize: 10, fontWeight: 700,
                  borderRadius: 100, padding: "3px 10px",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                  {emp.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Contact & Info */}
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.outerGreen, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Personnel Information
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { icon: Mail,         label: "Email",      value: emp.email },
                { icon: Phone,        label: "Phone",      value: emp.phone },
                { icon: Building2,    label: "Department", value: emp.department },
                { icon: CalendarDays, label: "Joined",     value: new Date(emp.dateAdded).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 16px",
                    borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fff", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color={C.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.outerGreen, fontWeight: 600, marginBottom: 1 }}>{row.label}</div>
                      <div style={{ fontSize: 12, color: C.primaryDark, fontWeight: 500 }}>{row.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Attendance */}
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.outerGreen, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Recent Attendance (Last 5 Days)
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {mockActivity.map((a, i) => {
                const sc = statusColor(a.status);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 16px",
                    borderBottom: i < mockActivity.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark }}>{a.date}</div>
                      <div style={{ fontSize: 10, color: C.outerGreen, marginTop: 1 }}>
                        {a.checkIn !== "—" ? `In: ${a.checkIn}  ·  Out: ${a.checkOut}` : "No check-in recorded"}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    }}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.outerGreen, letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={() => { onClose(); onEdit(); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                <Pencil size={13} /> Edit Details
              </button>
              <button
                onClick={() => { onClose(); onViewQR(); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                <QrCode size={13} color={C.primary} /> View QR
              </button>
            </div>
            <button
              onClick={() => { onToggleStatus(); onClose(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                border: isActive ? "1px solid rgba(220,38,38,0.2)" : `1px solid ${C.border}`,
                background: isActive ? "#fef2f2" : C.surface,
                color: isActive ? C.red : C.primaryDark,
              }}
            >
              {isActive
                ? <><ToggleLeft size={14} color={C.red} /> Deactivate Personnel</>
                : <><ToggleRight size={14} color={C.primary} /> Activate Personnel</>}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon:Icon, accent, trend }: { value:number; label:string; icon:React.ElementType; accent?:boolean; trend?:string }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",borderRadius:14,background:accent?"linear-gradient(135deg,#ecfdf5,#d1fae5)":"#fff",border:`1px solid ${accent?"rgba(22,163,74,0.2)":C.border}` }}>
      <div style={{ width:40,height:40,borderRadius:11,background:accent?"rgba(22,163,74,0.15)":C.surface2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <Icon size={17} color={C.primary} strokeWidth={2}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:24,fontWeight:800,color:C.primaryDark,lineHeight:1,letterSpacing:"-0.03em" }}>{value}</div>
        <div style={{ fontSize:11,color:C.outerGreen,marginTop:3 }}>{label}</div>
      </div>
      {trend && <div style={{ display:"flex",alignItems:"center",gap:3,fontSize:10,color:C.primary,fontWeight:600 }}><TrendingUp size={11}/> {trend}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PersonnelPage() {
  const { showToast } = useToast();
  const [personnelList,setPersonnelList] = useState<Personnel[]>(INITIAL_PERSONNEL);
  const [query,setQuery] = useState("");
  const [statusFilter,setStatusFilter] = useState<"all"|PersonnelStatus>("all");
  const [departmentFilter,setDepartmentFilter] = useState("all");
  const [qrEmp,setQrEmp] = useState<Personnel|null>(null);
  const [showAdd,setShowAdd] = useState(false);
  const [showBulkImport,setShowBulkImport] = useState(false);
  const [editPersonnel,setEditPersonnel] = useState<Personnel|null>(null);
  const [deleteId,setDeleteId] = useState<string|null>(null);
  const [isRefreshing,setIsRefreshing] = useState(false);
  const [viewPersonnel,setViewPersonnel] = useState<Personnel|null>(null);

  const departments = useMemo(()=>Array.from(new Set(personnelList.map(e=>e.department))),[personnelList]);

  const filtered = useMemo(()=>personnelList.filter(emp=>{
    const q=query.trim().toLowerCase();
    return (!q||emp.name.toLowerCase().includes(q)||emp.id.toLowerCase().includes(q)||emp.email.toLowerCase().includes(q))&&
      (statusFilter==="all"||emp.status===statusFilter)&&
      (departmentFilter==="all"||emp.department===departmentFilter);
  }),[personnelList,query,statusFilter,departmentFilter]);

  const activeCount   = personnelList.filter(e=>e.status==="Active").length;
  const inactiveCount = personnelList.filter(e=>e.status==="Inactive").length;

  const toggleStatus = (id:string) => setPersonnelList(prev=>prev.map(e=>e.id===id?{...e,status:e.status==="Active"?"Inactive":"Active"}:e));
  const handleDelete = (id:string) => { setPersonnelList(prev=>prev.filter(e=>e.id!==id)); setDeleteId(null); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("NSS Personnel registry synchronised with HR records", "success");
    }, 600);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("No personnel records match current filters", "warning");
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `DVLA-NSS-Personnel-Registry-${dateStr}.csv`;
    const headers = ["Personnel ID", "Full Name", "Department", "Email Address", "Phone Number", "Status", "Date Added"];
    const rows = filtered.map(e => [
      e.id,
      e.name,
      e.department,
      e.email,
      e.phone,
      e.status,
      e.dateAdded,
    ]);

    downloadCSV(filename, headers, rows);
    showToast(`Exported ${filtered.length} NSS Personnel records to ${filename}`, "success");
  };

  const inputStyle: React.CSSProperties = { padding:"8px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,background:"#fff",fontSize:12,color:C.primaryDark,fontFamily:"inherit",outline:"none" };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }
        .emp-row:hover td { background:${C.surface} !important; }
        .emp-row { cursor: pointer; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>

      {showAdd && (
        <AddPersonnelModal
          onClose={()=>setShowAdd(false)}
          onAdd={emp=>setPersonnelList(prev=>[...prev,emp])}
          existingIds={personnelList.map(p=>p.id)}
        />
      )}
      {showBulkImport && (
        <BulkImportModal
          onClose={()=>setShowBulkImport(false)}
          onImport={newRecords => {
            setPersonnelList(prev => [...prev, ...newRecords]);
          }}
        />
      )}
      {editPersonnel && (
        <EditPersonnelModal
          personnel={editPersonnel}
          onClose={()=>setEditPersonnel(null)}
          onSave={updated => {
            setPersonnelList(prev => prev.map(p => p.id === updated.id ? updated : p));
            showToast(`Updated details for ${updated.name} (${updated.id})`, "success");
          }}
        />
      )}
      {viewPersonnel && (
        <PersonnelProfileDrawer
          emp={viewPersonnel}
          onClose={() => setViewPersonnel(null)}
          onEdit={() => setEditPersonnel(viewPersonnel)}
          onViewQR={() => setQrEmp(viewPersonnel)}
          onToggleStatus={() => toggleStatus(viewPersonnel.id)}
        />
      )}

      {deleteId && (
        <div onClick={()=>setDeleteId(null)} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:16,padding:28,width:320,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",textAlign:"center" }}>
            <div style={{ width:44,height:44,borderRadius:12,background:"#fef2f2",border:"1px solid rgba(220,38,38,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
              <Trash2 size={18} color={C.red}/>
            </div>
            <div style={{ fontWeight:700,fontSize:14,color:C.primaryDark,marginBottom:8 }}>Delete Personnel Record?</div>
            <div style={{ fontSize:12,color:C.outerGreen,marginBottom:22 }}>This will permanently remove the personnel record and their QR code. This action cannot be undone.</div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setDeleteId(null)} style={{ flex:1,padding:"9px",borderRadius:9,border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>handleDelete(deleteId)} style={{ flex:1,padding:"9px",borderRadius:9,border:"none",background:C.red,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:22 }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:6 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:C.surface2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Users size={16} color={C.primary}/>
              </div>
              <h1 style={{ fontSize:22,fontWeight:800,color:C.primaryDark,margin:0,letterSpacing:"-0.03em" }}>NSS Personnel Management</h1>
            </div>
            <p style={{ fontSize:12,color:C.outerGreen,margin:0 }}>Manage national service personnel records and their QR codes linked to attendance.</p>
          </div>
          <div style={{ display:"flex",gap:9,flexWrap:"wrap" }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display:"flex",alignItems:"center",gap:7,padding:"9px 14px",borderRadius:9,cursor:isRefreshing ? "default" : "pointer",
                border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,
                opacity: isRefreshing ? 0.75 : 1,
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? "spin-icon" : ""}/>
              {isRefreshing ? "Syncing..." : "Refresh"}
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                display:"flex",alignItems:"center",gap:7,padding:"9px 14px",borderRadius:9,cursor:"pointer",
                border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600,
                transition:"border-color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
            >
              <Download size={13}/> Export CSV
            </button>
            <button
              onClick={()=>setShowBulkImport(true)}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:9,cursor:"pointer",border:`1px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:12,fontWeight:600 }}
            >
              <Upload size={13}/> Bulk Import
            </button>
            <button onClick={()=>setShowAdd(true)} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 15px",borderRadius:9,cursor:"pointer",border:"none",background:C.primary,color:"#fff",fontSize:12,fontWeight:700 }}>
              <UserPlus size={13}/> Add Personnel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12 }}>
          <StatCard value={personnelList.length} label="Total Personnel" icon={Users} trend="+3 this month"/>
          <StatCard value={activeCount}       label="Active"          icon={BadgeCheck} accent/>
          <StatCard value={inactiveCount}     label="Inactive"        icon={CircleDashed}/>
          <StatCard value={departments.length} label="Departments"    icon={Building2}/>
        </div>

        {/* Table card */}
        <div style={{ background:"#fff",borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>

          {/* Filters */}
          <div style={{ padding:"16px 20px",borderBottom:`1px solid ${C.surface2}`,display:"flex",alignItems:"flex-end",flexWrap:"wrap",gap:14 }}>
            <div style={{ display:"flex",flexDirection:"column",gap:5,flex:"1 1 220px",minWidth:200 }}>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.outerGreen }}>Search</span>
              <div style={{ position:"relative" }}>
                <Search size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, ID, or email…" style={{ ...inputStyle,paddingLeft:30,width:"100%",boxSizing:"border-box" }}/>
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.outerGreen }}>Department</span>
              <div style={{ position:"relative" }}>
                <Building2 size={13} color={C.outerGreen} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <ChevronDown size={12} color={C.outerGreen} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}/>
                <select value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)} style={{ ...inputStyle,paddingLeft:30,paddingRight:28,appearance:"none",width:160,cursor:"pointer" }}>
                  <option value="all">All Departments</option>
                  {departments.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.outerGreen }}>Status</span>
              <div style={{ display:"flex",gap:3,background:C.surface2,borderRadius:10,padding:4,border:`1px solid ${C.border}` }}>
                {(["all","Active","Inactive"] as const).map(o=>{
                  const on=statusFilter===o;
                  return <button key={o} onClick={()=>setStatusFilter(o)} style={{ padding:"5px 14px",borderRadius:7,border:"none",background:on?"#fff":"transparent",color:on?C.primaryDark:C.outerGreen,fontWeight:on?700:500,fontSize:11,cursor:"pointer" }}>{o==="all"?"All":o}</button>;
                })}
              </div>
            </div>

            <span style={{ marginLeft:"auto",fontSize:11,color:C.outerGreen,alignSelf:"flex-end",paddingBottom:2 }}>
              {filtered.length} of {personnelList.length} personnel
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:1100 }}>
              <thead>
                <tr style={{ background:C.surface,borderBottom:`1px solid ${C.border}` }}>
                  {["Personnel","NSS ID","Department","Contact","Status","Added","QR Code","Actions"].map(h=>(
                    <th key={h} style={{ padding:"12px 20px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:C.outerGreen,whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={8} style={{ textAlign:"center",padding:"48px 20px",color:C.outerGreen,fontSize:13 }}>No personnel match the current filters.</td></tr>
                ) : filtered.map((emp,i)=>{
                  const isActive = emp.status==="Active";
                  return (
                    <tr key={emp.id} className="emp-row" style={{ borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:"none" }} onClick={() => setViewPersonnel(emp)}>

                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,background:AVATAR_COLORS[emp.id]??C.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,opacity:isActive?1:0.45 }}>{emp.avatar}</div>
                          <div style={{ fontWeight:600,color:isActive?C.primaryDark:C.outerGreen,whiteSpace:"nowrap" }}>{emp.name}</div>
                        </div>
                      </td>

                      {/* NSS ID column */}
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:C.surface2,border:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.primaryDark,letterSpacing:"0.04em",whiteSpace:"nowrap" }}>
                          {emp.id}
                        </span>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:C.surface2,color:C.primaryDark,fontSize:11,fontWeight:500,whiteSpace:"nowrap" }}>
                          <Building2 size={11} color={C.outerGreen}/>{emp.department}
                        </span>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",flexDirection:"column",gap:3 }}>
                          <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.primaryDark,whiteSpace:"nowrap" }}><Mail size={11} color={C.outerGreen}/>{emp.email}</span>
                          <span style={{ display:"flex",alignItems:"center",gap:5,fontSize:10,color:C.outerGreen,whiteSpace:"nowrap" }}><Phone size={10} color={C.outerGreen}/>{emp.phone}</span>
                        </div>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:600,background:isActive?"#ecfdf5":C.surface2,color:isActive?C.primary:C.outerGreen,border:`1px solid ${isActive?"rgba(22,163,74,0.2)":C.border}`,whiteSpace:"nowrap" }}>
                          <span style={{ width:6,height:6,borderRadius:"50%",background:isActive?C.primary:C.outerGreen,flexShrink:0 }}/>
                          {emp.status}
                        </span>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:C.outerGreen,whiteSpace:"nowrap" }}>
                          <CalendarDays size={11} color={C.outerGreen}/>
                          {new Date(emp.dateAdded).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                        </span>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <button onClick={(e)=>{e.stopPropagation();setQrEmp(emp);}} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 13px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>
                          <QrCode size={13} color={C.primary}/> View QR
                        </button>
                      </td>

                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",gap:6,alignItems:"center",whiteSpace:"nowrap" }}>
                          <button onClick={(e)=>{e.stopPropagation();setEditPersonnel(emp);}} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${C.border}`,background:"#fff",color:C.primaryDark,fontSize:11,fontWeight:600 }}>
                            <Pencil size={11}/> Edit
                          </button>
                          <button onClick={(e)=>{e.stopPropagation();toggleStatus(emp.id);}} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${C.border}`,background:C.surface2,color:C.primaryDark,fontSize:11,fontWeight:600 }}>
                            {isActive
                              ? <><ToggleLeft size={12} color={C.outerGreen}/> Deactivate</>
                              : <><ToggleRight size={12} color={C.primary}/> Activate</>}
                          </button>
                          <button onClick={(e)=>{e.stopPropagation();setDeleteId(emp.id);}} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,cursor:"pointer",border:"1px solid rgba(220,38,38,0.2)",background:"#fef2f2",color:C.red,fontSize:11,fontWeight:600 }}>
                            <Trash2 size={11}/> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding:"12px 20px",borderTop:`1px solid ${C.surface2}`,display:"flex",alignItems:"center",gap:8 }}>
            <Shield size={12} color={C.outerGreen}/>
            <span style={{ fontSize:11,color:C.outerGreen }}>Each personnel QR encodes a <strong>secure token only</strong> — no raw personal data is embedded in the QR payload.</span>
          </div>
        </div>
      </div>
    </>
  );
}
