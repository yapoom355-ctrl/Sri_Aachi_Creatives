"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import styles from "./Banner.module.css";

const STATIC_SLIDES = [
  {
    tag: "New Arrivals",
    title: (
      <>
        Artisan-crafted,
        <br />
        <span className={styles.highlight}>timeless</span> pieces
      </>
    ),
    image: "/images/resin-table.webp",
    link: "/products",
  }
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, { fetchPolicy: "cache-first" });

  const dynamicSlides = data?.products?.slice(0, 5).map((p: any) => ({
    tag: p.categories?.[0]?.title || "Featured Product",
    title: (
      <span style={{ fontSize: "0.95em", lineHeight: "1.2" }}>
        {p.title}
      </span>
    ),
    image: p.thumbnail?.mediaUrl || "/images/resin-table.webp",
    link: `/product/${p.id}`,
  })) || [];

  const slidesToUse = dynamicSlides.length > 0 ? dynamicSlides : STATIC_SLIDES;

  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
        setFade(true);
      }, 300); // match transition time
    }, 4000); // auto-scroll every 4 seconds
    return () => clearInterval(timer);
  }, [slidesToUse.length]);

  const slide = slidesToUse[currentSlide] || STATIC_SLIDES[0];

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
        <Link href={slide.link} className={styles.shopButton}>
          <span>{dynamicSlides.length > 0 ? "View Product" : "Explore Collection"}</span>
          <ArrowRight size={14} className={styles.arrowIcon} strokeWidth={2} />
        </Link>
      </div>
      <div className={styles.imageContainer}>
        {slide.image && (
          <Image
            src={slide.image}
            alt={slide.tag || "Sri Aachi Creatives Collection"}
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
        )}
      </div>
    </div>
  );
}
