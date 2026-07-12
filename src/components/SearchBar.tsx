"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search size={20} className={styles.searchIcon} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
        />
      </div>
      <button className={styles.filterButton} aria-label="Filter products">
        <SlidersHorizontal size={20} className={styles.filterIcon} strokeWidth={2} />
      </button>
    </div>
  );
}
