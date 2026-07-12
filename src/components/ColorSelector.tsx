"use client";

import React, { useState } from "react";
import styles from "./ColorSelector.module.css";

interface ColorSelectorProps {
  colors: string[];
}

export default function ColorSelector({ colors }: ColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useState(colors[4] || colors[0]);

  return (
    <div className={styles.container}>
      {colors.map((color) => {
        const isActive = color === selectedColor;
        return (
          <button
            key={color}
            className={`${styles.colorSwatch} ${isActive ? styles.active : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
            aria-label={`Select color ${color}`}
            type="button"
          />
        );
      })}
    </div>
  );
}
