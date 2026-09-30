"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ToastProvider } from "../components/Toast";
import {
  LayoutDashboard,
  Users,
  QrCode,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  ScanLine,
  Bell,
  ChevronRight,
  Dot,
  ClipboardList,
  Cog,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  primaryDark:  "#0f172a",
  primary:      "#16a34a",
  primaryLight: "#86efac",
  outerGreen:   "#4b5563",
  yellow:       "#eab308",
  golden:       "#facc15",
  cream:        "#f8fafc",
  surface:      "#f8fafc",
  surface2:     "#f1f5f9",
  border:       "#e2e8f0",
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const navItems = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/employees",  label: "NSS Personnel",  icon: Users },
  { href: "/admin/qr",         label: "QR Codes",   icon: QrCode },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/reports",    label: "Reports",    icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings",      label: "Settings", icon: Cog },
  { href: "/admin/audit",       label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/about",       label: "About", icon: Info },
];

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dvla_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore if localStorage not accessible
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dvla_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <ToastProvider>
      <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: collapsed ? 70 : 240,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          padding: "0",
          position: "relative",
          overflow: "hidden",
          borderRight: `1px solid ${C.border}`,
          transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}>

          {/* Brand */}
          <div style={{
            padding: collapsed ? "18px 12px 16px" : "18px 16px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            transition: "padding 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#fff",
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/dvla-logo.png"
                  alt="DVLA Ghana logo"
                  width={38}
                  height={38}
                  style={{ objectFit: "contain", width: "100%", height: "100%" }}
                  priority
                />
              </div>
              {!collapsed && (
                <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark, letterSpacing: "-0.01em" }}>
                    DVLA NSS Attendance
                  </div>
                  <div style={{ fontSize: 10, color: C.outerGreen, fontWeight: 500, marginTop: 1 }}>
                    Admin Platform
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nav label */}
          <div style={{ padding: collapsed ? "14px 0 6px" : "16px 18px 8px", textAlign: collapsed ? "center" : "left" }}>
            {!collapsed ? (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: C.outerGreen,
              }}>Main Menu</span>
            ) : (
              <div style={{ width: 20, height: 2, background: C.border, borderRadius: 2, margin: "0 auto" }} />
            )}
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: collapsed ? "0 8px" : "0 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", overflowX: "hidden" }}>
            {navItems.map((item) => {
              const active = item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    borderRadius: 10,
                    textDecoration: "none",
                    background: active ? "rgba(22,163,74,0.12)" : "transparent",
                    color: active ? C.primaryDark : C.outerGreen,
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all 0.15s ease",
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(15,23,42,0.04)";
                      (e.currentTarget as HTMLElement).style.color = C.primaryDark;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = C.outerGreen;
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && active && <ChevronRight size={13} strokeWidth={2.5} />}
                </Link>
              );
            })}
          </nav>

          {/* QR Scanner shortcut */}
          <div style={{ padding: collapsed ? "10px 8px" : "12px 10px 8px" }}>
            <Link
              href="/qr-scanner"
              title={collapsed ? "Open QR Scanner" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 9,
                padding: collapsed ? "10px 0" : "10px 12px",
                borderRadius: 10,
                background: "rgba(22,163,74,0.08)",
                border: `1px solid rgba(22,163,74,0.18)`,
                textDecoration: "none",
                color: C.primary,
                fontSize: 12,
                fontWeight: 600,
                transition: "background 0.15s",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              <ScanLine size={15} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span>Open QR Scanner</span>
                  <ChevronRight size={12} style={{ marginLeft: "auto" }} />
                </>
              )}
            </Link>
          </div>

          {/* Sidebar Footer */}
          <div style={{
            padding: collapsed ? "14px 8px" : "14px 16px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
          }}>
            <ShieldCheck size={14} color={C.outerGreen} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontSize: 10, color: C.outerGreen, fontWeight: 500, whiteSpace: "nowrap" }}>
                Secure internal use only
              </span>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* ── Top Header ── */}
          <header style={{
            height: 60,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px",
            background: "#fff",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            {/* Left: toggle + breadcrumb / title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={toggleCollapsed}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#fff",
                  border: `1.5px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: C.primaryDark,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.surface2;
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>

              <span style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark }}>
                Company Attendance System
              </span>
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(22,163,74,0.08)", border: `1px solid rgba(22,163,74,0.2)`,
                borderRadius: 100, padding: "3px 10px",
              }}>
                <Dot size={16} color={C.primary} style={{ margin: "-4px -2px" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Live
                </span>
              </div>
            </div>

            {/* Right: actions + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

              {/* Notifications */}
              <button style={{
                width: 34, height: 34, borderRadius: 9,
                background: "#fff", border: `1.5px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative",
              }}>
                <Bell size={15} color={C.primaryDark} />
                <span style={{
                  position: "absolute", top: 6, right: 6,
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.primary, border: `1.5px solid ${C.surface}`,
                }} />
              </button>

              {/* Divider */}
              <div style={{ width: 1, height: 24, background: C.border }} />

              {/* Admin profile + menu */}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, border: "none", background: "transparent",
                    cursor: "pointer", padding: 0,
                  }}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.primaryDark, lineHeight: 1.2 }}>Admin</div>
                    <div style={{ fontSize: 10, color: C.outerGreen }}>System Owner</div>
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: C.primaryDark, color: C.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.02em",
                  }}>AD</div>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 44,
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      padding: 6,
                      width: 180,
                      zIndex: 20,
                    }}
                  >
                    <div style={{ padding: "6px 8px 8px", borderBottom: `1px solid ${C.surface2}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark }}>Admin</div>
                      <div style={{ fontSize: 10, color: C.outerGreen }}>System Owner</div>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/admin/settings");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: C.primaryDark,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.04)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                    >
                      Settings
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/login");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 10px",
                        borderRadius: 8,
                      border: `1px solid ${C.surface2}`,
                        background: "#fff",
                        cursor: "pointer",
                      color: "#dc2626",
                        fontSize: 12,
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main style={{
            flex: 1, overflowY: "auto",
            padding: "28px 32px",
            background: C.surface,
          }}>
            <div style={{ maxWidth: 1480, margin: "0 auto", width: "100%" }}>
              {children}
            </div>
          </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
