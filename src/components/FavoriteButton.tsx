"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({ isLiked = false }: { isLiked?: boolean }) {
  const [liked, setLiked] = useState(isLiked);
  
  return (
    <button
      className={`${styles.button} ${liked ? styles.liked : ""}`}
      onClick={() => setLiked(!liked)}
      aria-label="Like product"
      type="button"
    >
      <Heart
        size={18}
        className={styles.icon}
        fill={liked ? "var(--like-active)" : "none"}
        stroke={liked ? "var(--like-active)" : "currentColor"}
        strokeWidth={2}
      />
    </button>
  );
}
