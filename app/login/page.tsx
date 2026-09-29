"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/admin");
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          background: #edeae4;
        }

        /* ── LEFT HALF ── */
        .left-half {
          display: none;
          width: 55%;
          flex-shrink: 0;
          align-items: stretch;
          justify-content: flex-end;
          padding: 16px 10px 16px 20px;
        }
        @media (min-width: 900px) { .left-half { display: flex; } }

        /* ── RIGHT HALF ── */
        .right-half {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 20px 16px 10px;
          min-height: 100vh;
        }
        @media (max-width: 899px) { .right-half { padding: 32px 20px; justify-content: center; } }

        /* ── IMAGE CARD ── */
        .image-card {
          position: relative;
          width: 100%;
          min-height: calc(100vh - 32px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.22);
          display: flex;
          flex-direction: column;
        }

        .image-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.5) saturate(1.1);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.38);
        }

        /* Top content pushed lower */
        .image-top {
          position: relative;
          z-index: 2;
          padding: 0 36px 36px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          flex: 1;
        }

        .image-headline {
          margin-top: 0;
          font-size: clamp(1.75rem, 2.6vw, 2.4rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .image-headline span { color: #facc15; }

        .image-desc {
          margin-top: 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 320px;
        }

        /* Stats row pinned to bottom of card */
        .image-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 24px 28px;
          border-top: 1px solid rgba(255,255,255,0.13);
        }

        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.48);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ── SIGN-IN CARD ── */
        .signin-card {
          background: #faf9f6;
          border-radius: 20px;
          padding: 52px 44px;
          width: 100%;
          max-width: 460px;
          min-height: calc(100vh - 32px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.09);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 26px;
        }
        .logo-wrap {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: transparent;
          border: none;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .logo-text { display: flex; flex-direction: column; gap: 1px; }
        .logo-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #009f4d;
        }
        .logo-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1814;
          line-height: 1.25;
        }

        .divider {
          height: 1px;
          background: linear-gradient(to right, #e0dbd3 50%, transparent);
          margin-bottom: 26px;
        }

        .form-heading {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.022em;
          color: #1a1814;
          line-height: 1.17;
          margin-bottom: 7px;
        }
        .form-sub {
          font-size: 12.5px;
          color: #7c7670;
          line-height: 1.65;
          margin-bottom: 28px;
        }

        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
        .form-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #4a4641;
          letter-spacing: 0.03em;
        }
        .input-wrap { position: relative; }
        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e0dbd3;
          border-radius: 10px;
          background: #fff;
          font-size: 13.5px;
          color: #1a1814;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
          font-family: inherit;
        }
        .form-input::placeholder { color: #c5c0b8; }
        .form-input:focus {
          border-color: #009f4d;
          box-shadow: 0 0 0 3px rgba(0,159,77,0.11);
        }
        .pw-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9b9589; font-size: 11px; font-weight: 600;
          padding: 4px; font-family: inherit; letter-spacing: 0.04em;
        }

        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          font-size: 12px;
        }
        .remember-check {
          display: flex; align-items: center; gap: 6px;
          color: #6b6560; cursor: pointer;
        }
        .remember-check input { accent-color: #009f4d; cursor: pointer; }
        .forgot-link {
          color: #009f4d; font-weight: 600;
          text-decoration: none; font-size: 12px;
        }
        .forgot-link:hover { text-decoration: underline; }

        .submit-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          background: #009f4d;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.025em;
          border: none;
          cursor: pointer;
          transition: background .18s, box-shadow .18s, transform .1s;
          box-shadow: 0 4px 18px rgba(0,159,77,0.28);
          font-family: inherit;
        }
        .submit-btn:hover { background: #007d3c; box-shadow: 0 6px 22px rgba(0,159,77,0.34); }
        .submit-btn:active { transform: scale(0.989); }

        .bottom-copy {
          margin-top: 22px;
          font-size: 10.5px;
          color: #b5b0a8;
          text-align: center;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT HALF ── */}
        <div className="left-half">
          {/* ── IMAGE CARD ── */}
          <div className="image-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dvla-event.jpg"
            alt="DVLA Ghana operations"
            className="image-card-img"
          />
          <div className="image-overlay" />

          <div className="image-top">
            <h2 className="image-headline">
              NSS Personnel Attendance<br />
              <span> Management System</span><br />
            </h2>
            <p className="image-desc">
              A centralised system for tracking and managing the daily attendance
              of National Service Scheme personnel across all DVLA regional
              offices and service centres in Ghana.
            </p>
          </div>

          {/* Stats spread across the bottom */}
          <div className="image-bottom">
            <div className="stat-item">
              <span className="stat-num">16</span>
              <span className="stat-label">Regions Covered</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Live Monitoring</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">QR</span>
              <span className="stat-label">Frequent Scan</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">NSS</span>
              <span className="stat-label">Personnel Tracking</span>
            </div>
          </div>
          </div>
        </div>{/* end left-half */}

        {/* ── RIGHT HALF ── */}
        <div className="right-half">
          {/* ── SIGN-IN CARD ── */}
          <div className="signin-card">
          <div className="logo-row">
            <div className="logo-wrap">
              <Image
                src="/dvla-logo.png"
                alt="DVLA Ghana"
                width={44}
                height={44}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <div className="logo-text">
              <span className="logo-eyebrow">DVLA Ghana</span>
              <span className="logo-title">NSSA Admin Portal</span>
            </div>
          </div>

          <div className="divider" />

          <h1 className="form-heading">Administrator<br />Sign In</h1>
          <p className="form-sub">
            Restricted to authorised DVLA administrators. NSS personnel check in
            daily via QR ID tags at entry gates — this portal manages their
            attendance records and reporting.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="staffId" className="form-label">Staff ID or Email Address</label>
              <div className="input-wrap">
                <input
                  id="staffId"
                  type="text"
                  className="form-input"
                  placeholder="DVLA-00123 or admin@dvla.gov.gh"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  style={{ paddingRight: "50px" }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="remember-check">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn">
              Sign In →
            </button>
          </form>

          <p className="bottom-copy">
            © {new Date().getFullYear()} Driver &amp; Vehicle Licensing Authority, Ghana
          </p>
          </div>{/* end signin-card */}
        </div>{/* end right-half */}

      </div>
    </>
  );
}