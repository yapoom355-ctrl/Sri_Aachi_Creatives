"use client";

import React from "react";
import styles from "./MobileContainer.module.css";

export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {children}
      </div>
    </div>
  );
}
