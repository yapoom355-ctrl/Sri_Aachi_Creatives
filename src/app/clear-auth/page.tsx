"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearAuthPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("token");
    console.log("Token cleared from localStorage");
    // Redirect home after clearing
    setTimeout(() => router.push("/"), 1500);
  }, [router]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      gap: "1rem"
    }}>
      <h2>✅ Auth token cleared!</h2>
      <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>Redirecting to home page…</p>
    </div>
  );
}
