"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { GET_ORDERS } from "@/graphql/queries";
import {
  ChevronLeft,
  Bell,
  ChevronRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  Settings,
  LogOut,
  User,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import styles from "./page.module.css";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isRed?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, user, logout, setLoginModalOpen, cartCount, updateUserProfile } = useCart();

  const { data: ordersData } = useQuery<any>(GET_ORDERS, { skip: !isLoggedIn });
  const ordersCount = ordersData?.myOrders?.length ?? 0;

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateUserProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.graphQLErrors?.[0]?.message || err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "orders",
      label: "My Orders",
      icon: <ShoppingBag size={20} strokeWidth={1.8} />,
    },
    {
      id: "shipping",
      label: "Shipping Addresses",
      icon: <MapPin size={20} strokeWidth={1.8} />,
    },
    {
      id: "payment",
      label: "Payment Methods",
      icon: <CreditCard size={20} strokeWidth={1.8} />,
    },
    {
      id: "promos",
      label: "Promo Codes",
      icon: <Tag size={20} strokeWidth={1.8} />,
      badge: "1 Active",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} strokeWidth={1.8} />,
    },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={20} strokeWidth={1.8} />,
      isRed: true,
    },
  ];

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>My Profile</h2>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {!isLoggedIn || !user ? (
          /* Logged out state */
          <div className={styles.loggedOutCard}>
            <div className={styles.loggedOutIconCircle}>
              <User size={36} />
            </div>
            <h3 className={styles.loggedOutTitle}>Sign in to your account</h3>
            <p className={styles.loggedOutText}>
              Track your orders, manage shipping addresses, and use exclusive coupons.
            </p>
            <button 
              type="button" 
              className={styles.loginBtn}
              onClick={() => setLoginModalOpen(true)}
            >
              Sign In / Register
            </button>
          </div>
        ) : (
          /* Split grid wrapper for responsive layouts */
          <div className={styles.responsiveWrapper}>
            {/* Left Column - Details */}
            <div className={styles.detailsBlock}>
              {/* User Avatar Card */}
              <div className={styles.userCard}>
                {isEditing ? (
                  /* Inline edit form */
                  <div style={{ width: "100%" }}>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.6, display: "block", marginBottom: "0.3rem" }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1.5px solid #e5e5e5",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        placeholder="Your name"
                        disabled={saving}
                      />
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.6, display: "block", marginBottom: "0.3rem" }}>
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1.5px solid #e5e5e5",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        placeholder="your@email.com"
                        disabled={saving}
                      />
                    </div>
                    {saveError && (
                      <p style={{ fontSize: "0.78rem", color: "#dc2626", marginBottom: "0.5rem" }}>{saveError}</p>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          background: "#111",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          background: "#f5f5f5",
                          color: "#111",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className={styles.userName}>{user.name}</h3>
                    {user.email && <p className={styles.userEmail}>{user.email}</p>}
                    <p className={styles.userPhone}>{user.phone}</p>
                    {saveSuccess && (
                      <p style={{ fontSize: "0.78rem", color: "#22c55e", marginTop: "0.4rem" }}>
                        ✅ Profile updated!
                      </p>
                    )}
                    <button
                      onClick={handleStartEdit}
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.4rem 0.9rem",
                        borderRadius: "8px",
                        border: "1.5px solid #e5e5e5",
                        background: "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Edit2 size={13} />
                      Edit Profile
                    </button>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{ordersCount}</span>
                  <span className={styles.statLabel}>Orders</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>{cartCount}</span>
                  <span className={styles.statLabel}>In Cart</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>Coupons</span>
                </div>
              </div>
            </div>

            {/* Right Column - Options List */}
            <div className={styles.menuBlock}>
              <div className={styles.menuList}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.menuItem} ${item.isRed ? styles.menuItemRed : ""}`}
                    onClick={() => {
                      if (item.id === "orders") {
                        router.push("/orders");
                      } else if (item.id === "shipping") {
                        router.push("/addresses");
                      } else if (item.id === "promos") {
                        alert("Your active promo code is: SAVE10");
                      } else if (item.id === "logout") {
                        logout();
                      }
                    }}
                    type="button"
                  >
                    <div className={styles.itemLeft}>
                      <div className={styles.iconWrapper}>{item.icon}</div>
                      <span className={styles.itemLabel}>{item.label}</span>
                    </div>
                    <div className={styles.itemRight}>
                      {item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
                      <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
