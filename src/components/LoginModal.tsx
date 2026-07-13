"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { useCart } from "@/context/CartContext";
import { SEND_OTP, LOGIN_WITH_OTP } from "@/graphql/mutations";
import { X, Phone, KeyRound, ChevronRight, Check, Loader2 } from "lucide-react";
import styles from "./LoginModal.module.css";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, login } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [devOtp, setDevOtp] = useState<string | null>(null); // show OTP from backend in dev

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [sendOtpMutation, { loading: sendingOtp }] = useMutation<any>(SEND_OTP);
  const [loginWithOtpMutation, { loading: verifyingOtp }] = useMutation<any>(LOGIN_WITH_OTP);

  // Countdown for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoginModalOpen) return null;

  const cleanPhone = phoneNumber.replace(/\D/g, "");
  // Backend SMS integration expects the 10-digit number without the +91 prefix
  const fullMobile = cleanPhone;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const result = await sendOtpMutation({ variables: { mobilenumber: fullMobile } });
      const sendResult = result.data?.sendOtp;

      if (sendResult?.success === false) {
        setError(sendResult?.message || "Failed to send OTP. Please try again.");
        return;
      }

      // Backend returns otp in dev/test mode — show it for testing convenience
      if (sendResult?.otp) {
        setDevOtp(sendResult.otp);
      }

      setStep(2);
      setCountdown(59);
      setSuccessMsg("OTP sent successfully!");
    } catch (err: any) {
      const msg = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to send OTP.";
      setError(msg);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    setError("");
    const newVal = value.replace(/\D/g, "");
    const updated = [...otp];
    updated[index] = newVal.substring(newVal.length - 1);
    setOtp(updated);
    if (newVal && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    try {
      const result = await loginWithOtpMutation({
        variables: { mobilenumber: fullMobile, otp: code },
      });

      const payload = result.data?.loginWithOtp;
      const accessToken: string = payload?.tokens?.accessToken;
      const userData = payload?.user;

      if (!accessToken) {
        setError("Login failed. Invalid OTP.");
        return;
      }

      // Persist token and update cart context
      const backendName = [userData?.firstName, userData?.lastName].filter(Boolean).join(" ");
      const userName = backendName || userData?.mobilenumber || "User";
      login(accessToken, {
        name: userName,
        email: userData?.email || "",
        phone: userData?.mobilenumber || fullMobile,
        avatar: "/images/profile.png",
      });

      // Show welcome back message if it's likely an existing user
      if (backendName && backendName.trim() !== "") {
        setSuccessMsg(`Welcome back, ${backendName}!`);
      } else {
        setSuccessMsg("Welcome back! Logged in successfully.");
      }

      // Wait a moment so the user sees the success message
      setTimeout(() => {
        setLoginModalOpen(false);
        resetState();
      }, 1500);
    } catch (err: any) {
      const msg = err?.graphQLErrors?.[0]?.message || err?.message || "Invalid OTP. Please try again.";
      setError(msg);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const result = await sendOtpMutation({ variables: { mobilenumber: fullMobile } });
      const sendResult = result.data?.sendOtp;
      if (sendResult?.otp) setDevOtp(sendResult.otp);
      setCountdown(59);
      setSuccessMsg("OTP resent!");
    } catch (err: any) {
      setError("Failed to resend OTP.");
    }
  };

  const resetState = () => {
    setStep(1);
    setPhoneNumber("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMsg("");
    setDevOtp(null);
  };

  return (
    <div className={styles.overlay} onClick={() => setLoginModalOpen(false)}>
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
          <h3 className={styles.title}>Welcome</h3>
          <p className={styles.subtitle}>
            {step === 1 ? "Sign in or register to continue" : `Verify code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* Error / Success banners */}
        {error && <div className={styles.errorBanner}>{error}</div>}
        {successMsg && (
          <div className={styles.errorBanner} style={{ background: "#dcfce7", color: "#15803d", borderColor: "#86efac" }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Dev OTP hint */}
        {devOtp && (
          <div
            className={styles.errorBanner}
            style={{ background: "#fef9c3", color: "#854d0e", borderColor: "#fde047", marginTop: 0 }}
          >
            🔑 Dev OTP: <strong>{devOtp}</strong>
          </div>
        )}

        {step === 1 ? (
          /* ── Step 1: Enter Phone ── */
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputContainer}>
              <span className={styles.countryCode}>+91</span>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder="Phone number"
                  className={styles.inputField}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={14}
                  autoFocus
                  disabled={sendingOtp}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={sendingOtp}>
              {sendingOtp ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending…</>
              ) : (
                <><span>Get Verification Code</span><ChevronRight size={16} /></>
              )}
            </button>
          </form>
        ) : (
          /* ── Step 2: Enter OTP ── */
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.otpGrid}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
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
                  {sendingOtp ? "Resending…" : "Resend verification code"}
                </button>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={verifyingOtp}>
              {verifyingOtp ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Verifying…</>
              ) : (
                <><Check size={16} /><span>Verify &amp; Sign In</span></>
              )}
            </button>

            <button type="button" className={styles.backBtn} onClick={() => { setStep(1); setError(""); setDevOtp(null); }}>
              ← Change phone number
            </button>
          </form>
        )}

        {/* Policy Links */}
        <div className={styles.policyLinks}>
          By continuing, you agree to our{" "}
          <Link href="/terms" className={styles.policyLink} onClick={() => setLoginModalOpen(false)}>
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={styles.policyLink} onClick={() => setLoginModalOpen(false)}>
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  );
}
