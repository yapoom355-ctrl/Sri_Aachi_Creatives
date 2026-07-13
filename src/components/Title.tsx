"use client";

import React from "react";
import styles from "./Title.module.css";

export default function Title() {
  return (
    <div className={styles.container}>
      <span className={styles.eyebrow}>Sri Aachi Creatives</span>
      <h1 className={styles.title}>
        Premium<br />
        <span className={styles.accent}>Handcrafted</span> Collection
      </h1>
    </div>
  );
}
