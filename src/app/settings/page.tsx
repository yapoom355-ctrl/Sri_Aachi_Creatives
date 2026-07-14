"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  MessageSquare,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  Headphones,
} from "lucide-react";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useCart();

  // Mock states for toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.push("/profile")}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} />
        </button>
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.iconButton} />
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          
          {/* Account Settings */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Settings</h3>
            <div className={styles.menuList}>
              <button className={styles.menuItem} onClick={() => router.push("/profile")}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <User size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Profile Information</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
              
            </div>
          </div>

          {/* Notification Preferences */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notification Preferences</h3>
            <div className={styles.menuList}>
              <div className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Mail size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Email Notifications</span>
                </div>
                <div className={styles.toggleWrapper}>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={emailNotif} 
                      onChange={(e) => setEmailNotif(e.target.checked)} 
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <MessageSquare size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>SMS Notifications</span>
                </div>
                <div className={styles.toggleWrapper}>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={smsNotif} 
                      onChange={(e) => setSmsNotif(e.target.checked)} 
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Bell size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Push Notifications</span>
                </div>
                <div className={styles.toggleWrapper}>
                  <label className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={pushNotif} 
                      onChange={(e) => setPushNotif(e.target.checked)} 
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Legal */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Privacy & Legal</h3>
            <div className={styles.menuList}>
              <button className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Shield size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Privacy Policy</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
              
              <button className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <FileText size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Terms & Conditions</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Help & Support</h3>
            <div className={styles.menuList}>
              <button className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <HelpCircle size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>FAQs</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
              
              <button className={styles.menuItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Headphones size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Contact Support</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
