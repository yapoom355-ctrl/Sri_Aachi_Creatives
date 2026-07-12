import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          Buy 1 hoodie,<br />
          get <span className={styles.highlight}>45% off</span> caps
        </h2>
        <Link href="/products" className={styles.shopButton}>
          <span>Shop now</span>
          <ArrowRight size={14} className={styles.arrowIcon} strokeWidth={2.5} />
        </Link>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src="/images/banner-hoodie.png"
          alt="Purple Hoodie Promo"
          width={150}
          height={150}
          className={styles.hoodieImage}
          priority
        />
      </div>
    </div>
  );
}
