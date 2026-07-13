"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./Banner.module.css";

const SLIDES = [
  {
    tag: "New Arrivals",
    title: (
      <>
        Artisan-crafted,
        <br />
        <span className={styles.highlight}>timeless</span> pieces
      </>
    ),
    image: "/images/banner-hoodie.png",
  },
  {
    tag: "Premium Quality",
    title: (
      <>
        Handcrafted with
        <br />
        <span className={styles.highlight}>luxury</span> details
      </>
    ),
    image: "/images/product-green.png",
  },
  {
    tag: "Best Sellers",
    title: (
      <>
        Modern style for
        <br />
        <span className={styles.highlight}>everyday</span> wear
      </>
    ),
    image: "/images/product-white.png",
  },
  {
    tag: "Exclusive Offer",
    title: (
      <>
        Upgrade your look
        <br />
        <span className={styles.highlight}>effortlessly</span>
      </>
    ),
    image: "/images/product-brown.png",
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        setFade(true);
      }, 300); // match transition time
    }, 4000); // auto-scroll every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className={styles.banner}>
      <div 
        className={styles.content}
        style={{
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(5px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <span className={styles.tagBadge}>{slide.tag}</span>
        <h2 className={styles.title}>{slide.title}</h2>
        <Link href="/products" className={styles.shopButton}>
          <span>Explore Collection</span>
          <ArrowRight size={14} className={styles.arrowIcon} strokeWidth={2} />
        </Link>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src={slide.image}
          alt="Sri Aachi Creatives Collection"
          width={150}
          height={150}
          className={styles.hoodieImage}
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? "scale(1)" : "scale(0.95)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
          priority
        />
      </div>
    </div>
  );
}
