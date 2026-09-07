"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logoLink} aria-label="Sri Aachi Creatives — Home">
            <Image
              src="/images/sri-aachi-logo.png"
              alt="Sri Aachi Creatives"
              width={200}
              height={200}
              className={styles.footerLogo}
            />
          </Link>
          <p className={styles.tagline}>
            Handcrafted with love & purpose — premium artisanal creations that celebrate tradition, elegance, and timeless craft.
          </p>
          <div className={styles.accentLine} />
        </div>

        {/* Link Column 1: Shop */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Explore</span>
          <ul className={styles.linkList}>
            <li>
              <Link href="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className={styles.link}>
                All Collections
              </Link>
            </li>
            <li>
              <Link href="/categories" className={styles.link}>
                Categories
              </Link>
            </li>
          </ul>
        </div>

        {/* Link Column 2: Legal Policies */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Policies</span>
          <ul className={styles.linkList}>
            <li>
              <Link href="/terms" className={styles.link}>
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/addresses" className={styles.link}>
                Shipping Addresses
              </Link>
            </li>
          </ul>
        </div>

        {/* Link Column 3: Contact Info */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Get in Touch</span>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactLabel}>Email</span>
              <a href="mailto:sriaachicreatives@gmail.com" className={styles.contactValue}>
                sriaachicreatives@gmail.com
              </a>
            </li>
            <li>
              <span className={styles.contactLabel}>Phone</span>
              <a href="tel:+916366858878" className={styles.contactValue}>
                +91 63668 58878
              </a>
            </li>
            <li>
              <span className={styles.contactLabel}>WhatsApp</span>
              <a
                href="https://wa.me/916366858878?text=Hi%20Sri%20Aachi%20Creatives,%20I'm%20interested%20in%20customizing%20a%20product."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactValue}
              >
                +91 63668 58878 (Chat now)
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.copyright}>
          © {new Date().getFullYear()} Sri Aachi Creatives. All rights reserved. Crafted with care.
        </span>
      </div>
    </footer>
  );
}
