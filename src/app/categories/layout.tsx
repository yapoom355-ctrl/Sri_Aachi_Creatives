import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by Categories | Sri Aachi Creatives",
  description: "Explore our curated categories of premium handcrafted goods. Discover exclusive collections tailored to your lifestyle.",
  openGraph: {
    title: "Shop by Categories | Sri Aachi Creatives",
    description: "Explore our curated categories of premium handcrafted goods.",
  }
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
