"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Phone, KeyRound, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import styles from "./LoginModal.module.css";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, login } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(59);
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setStep(2);
    setCountdown(59);
  };

  const handleOtpChange = (index: number, value: string) => {
    setError("");
    const newVal = value.replace(/\D/g, "");
    const updated = [...otp];
    updated[index] = newVal.substring(newVal.length - 1);
    setOtp(updated);

    // Autofocus next input
    if (newVal && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 4) {
      setError("Please enter all 4 digits of the OTP");
      return;
    }
    // Mock validation: accept "1234" (standard testing code)
    if (code !== "1234") {
      setError("Invalid OTP. Hint: Use 1234 for testing.");
      return;
    }
    
    // Login successfully
    login(`+1 (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`);
    setLoginModalOpen(false);
    resetState();
  };

  const resetState = () => {
    setStep(1);
    setPhoneNumber("");
    setOtp(["", "", "", ""]);
    setError("");
  };

  return (
    <div className={styles.overlay} onClick={() => setLoginModalOpen(false)}>
      <div 
        className={styles.modalCard} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className={styles.closeBtn} 
          onClick={() => setLoginModalOpen(false)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title and Logo */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>G</div>
          <h3 className={styles.title}>Gubera Shop</h3>
          <p className={styles.subtitle}>
            {step === 1 ? "Enter your phone number to sign in or register" : "Verify code sent to your phone"}
          </p>
        </div>

        {/* Errors banner */}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputContainer}>
              <span className={styles.countryCode}>+1</span>
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
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              <span>Get Verification Code</span>
              <ChevronRight size={16} />
            </button>
            
            <p className={styles.testHint}>
              Hint: Use any 10-digit number & code <strong>1234</strong>
            </p>
          </form>
        ) : (
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
                  onClick={() => {
                    setCountdown(59);
                    setError("Mock OTP code resent to phone.");
                  }}
                >
                  Resend verification code
                </button>
              )}
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Check size={16} />
              <span>Verify & Sign In</span>
            </button>

            <button 
              type="button" 
              className={styles.backBtn}
              onClick={() => setStep(1)}
            >
              Change phone number
            </button>
          </form>
        )}

        {/* Policy Links */}
        <div className={styles.policyLinks}>
          By continuing, you agree to our{" "}
          <Link 
            href="/terms" 
            className={styles.policyLink}
            onClick={() => setLoginModalOpen(false)}
          >
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link 
            href="/privacy" 
            className={styles.policyLink}
            onClick={() => setLoginModalOpen(false)}
          >
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  );
}
