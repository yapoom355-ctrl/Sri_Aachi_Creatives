import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Cart | Sri Aachi Creatives",
  description: "Review your selected premium handcrafted items and proceed to a secure checkout.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
