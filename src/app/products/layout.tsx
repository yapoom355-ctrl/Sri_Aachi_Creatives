import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Products | Sri Aachi Creatives",
  description: "Browse our premium handcrafted collection of products. Find the perfect artisanal items crafted with care and elegance.",
  openGraph: {
    title: "Explore Products | Sri Aachi Creatives",
    description: "Browse our premium handcrafted collection of products. Find the perfect artisanal items crafted with care and elegance.",
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
