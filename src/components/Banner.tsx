"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import styles from "./Banner.module.css";


export default function Banner() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const { data, loading, error } = useQuery<any>(GET_PRODUCTS, { fetchPolicy: "cache-first" });

  const rawProducts =
    data?.products?.edges?.map((e: any) => e.node) ||
    (Array.isArray(data?.products) ? data.products : []);

  const dynamicSlides = rawProducts.slice(0, 5).map((p: any) => ({
    tag: p.category?.name || p.categories?.[0]?.title || "Featured",
    title: (
      <span style={{ fontSize: "0.95em", lineHeight: "1.2" }}>
        {p.name || p.title}
      </span>
    ),
    image: resolveProductImage(p.media?.[0]?.url || p.thumbnail?.url || p.thumbnail?.mediaUrl, `${p.name} ${p.slug}`, p.id),
    link: `/product/${encodeURIComponent(p.id)}`,
  }));

  const slidesToUse = dynamicSlides;

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

  if (loading) {
    return (
      <div className={styles.banner} style={{ animation: "pulse 0.8s infinite" }}>
        <div className={styles.content} style={{ opacity: 0.5 }}>
          Loading featured products...
        </div>
      </div>
    );
  }

  if (slidesToUse.length === 0) {
    return null;
  }



  const slide = slidesToUse[currentSlide] || slidesToUse[0];

  return (
    <div className={styles.banner}>
      <div 
        className={styles.content}
        style={{
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(5px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <span className={styles.tagBadge}>{slide.tag}</span>
        <h2 className={styles.title}>{slide.title}</h2>
        <Link
          href={slide.link || "#products-section"}
          className={styles.shopButton}
          onClick={(e) => {
            if (slide.link) {
              e.preventDefault();
              router.push(slide.link);
            } else {
              e.preventDefault();
              const el = document.getElementById("products-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else router.push("/products");
            }
          }}
        >
          <span>View Product</span>
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
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
            priority
          />
        )}
      </div>
    </div>
  );
}
