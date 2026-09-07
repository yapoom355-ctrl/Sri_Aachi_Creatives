"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, Phone, Check, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import styles from "./LoginModal.module.css";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, login } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoginModalOpen) return null;

  const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
  const fullPhone = `+91${cleanPhone}`;
  const formattedPhone = cleanPhone.length === 10
    ? `${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    : cleanPhone;

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSendingOtp(true);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setError(resData.message || "Failed to send OTP. Please try again.");
        return;
      }

      // OTP sent successfully
      setStep(2);
      setCountdown(59);
      setSuccessMsg(`OTP sent to +91 ${formattedPhone}`);
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    setError("");
    const newVal = value.replace(/\D/g, "");
    const updated = [...otp];
    updated[index] = newVal.substring(newVal.length - 1);
    setOtp(updated);
    if (newVal && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setOtp(updated);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");

    if (code.length < 6) {
      setError("Please enter the 6-digit OTP received.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: code }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setError(resData.message || "Verification failed. Please try again.");
        return;
      }

      const token = resData.token;
      const user = resData.user;

      if (token) {
        const userName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : `User ${cleanPhone.slice(-4)}`;

        login(token, {
          name: userName,
          email: user?.email || `91${cleanPhone}@sriaachicreatives.in`,
          phone: fullPhone,
          avatar: "/images/profile.png",
        });

        setSuccessMsg(`Welcome, ${userName}! 🎉`);
        setTimeout(() => {
          setLoginModalOpen(false);
          resetState();
        }, 800);
      } else {
        setError("Verification succeeded but no session token was returned.");
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setSendingOtp(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setError(resData.message || "Failed to resend OTP.");
        return;
      }

      setCountdown(59);
      setSuccessMsg(`OTP resent successfully!`);
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setPhoneNumber("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMsg("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={() => { setLoginModalOpen(false); resetState(); }}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={() => { setLoginModalOpen(false); resetState(); }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Image
              src="/images/sri-aachi-logo.png"
              alt="Sri Aachi Creatives"
              width={200}
              height={200}
              className={styles.modalLogo}
            />
          </div>
          <h3 className={styles.title}>
            {step === 1 ? "Sign In / Sign Up" : "Verify OTP"}
          </h3>
          <p className={styles.subtitle}>
            {step === 1
              ? "Enter your 10-digit mobile number to continue"
              : `Enter the 6-digit OTP sent to +91 ${formattedPhone}`}
          </p>
        </div>

        {/* Error / Success banners */}
        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}
        {successMsg && (
          <div
            className={styles.errorBanner}
            style={{ background: "#dcfce7", color: "#15803d", borderColor: "#86efac" }}
          >
            ✅ {successMsg}
          </div>
        )}

        {step === 1 ? (
          /* ── Step 1: Mobile Number ── */
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputContainer}>
              <span className={styles.countryCode}>+91</span>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  id="login-phone-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit mobile number"
                  className={styles.inputField}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  autoFocus
                  disabled={sendingOtp}
                  required
                />
              </div>
            </div>

            <button
              id="login-send-otp-btn"
              type="submit"
              className={styles.submitBtn}
              disabled={sendingOtp || cleanPhone.length !== 10}
            >
              {sendingOtp ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Sending OTP…</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── Step 2: OTP Verification ── */
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.otpGrid} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  id={`otp-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={`${styles.otpInput} ${digit ? styles.otpFilled : ""}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  disabled={verifyingOtp}
                />
              ))}
            </div>

            <div className={styles.timerRow}>
              {countdown > 0 ? (
                <span className={styles.timerText}>Resend code in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? "Resending…" : "Resend OTP"}
                </button>
              )}
            </div>

            <button
              id="login-verify-otp-btn"
              type="submit"
              className={styles.submitBtn}
              disabled={verifyingOtp || otp.join("").length < 6}
            >
              {verifyingOtp ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Verify &amp; Continue</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => { setStep(1); setError(""); setSuccessMsg(""); }}
            >
              <ArrowLeft size={14} style={{ display: "inline", marginRight: 4 }} />
              Change mobile number
            </button>
          </form>
        )}

        {/* Policy */}
        <div className={styles.policyLinks}>
          By continuing, you agree to our{" "}
          <Link href="/terms" className={styles.policyLink} onClick={() => setLoginModalOpen(false)}>Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className={styles.policyLink} onClick={() => setLoginModalOpen(false)}>Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
