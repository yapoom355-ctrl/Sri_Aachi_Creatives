import MobileContainer from "@/components/MobileContainer";
import Header from "@/components/Header";
import Title from "@/components/Title";
import SearchBar from "@/components/SearchBar";
import Banner from "@/components/Banner";
import CategorySlider from "@/components/CategorySlider";
import ProductGrid from "@/components/ProductGrid";
import BottomNav from "@/components/BottomNav";
import styles from "./page.module.css";

export default function Home() {
  return (
    <MobileContainer>
      <Header />
      <main className={styles.mainContent}>
        {/* Top Split Section for Desktop, normal flow for Mobile/Tablet */}
        <div className={styles.topSection}>
          <div className={styles.heroLeft}>
            <Title />
            <SearchBar />
            <div className={styles.desktopCategories}>
              <CategorySlider />
            </div>
          </div>
          <div className={styles.heroRight}>
            <Banner />
          </div>
        </div>
        
        {/* Horizontal Category Slider for Mobile/Tablet flow */}
        <div className={styles.mobileCategories}>
          <CategorySlider />
        </div>

        {/* Responsive Product Grid */}
        <ProductGrid />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
