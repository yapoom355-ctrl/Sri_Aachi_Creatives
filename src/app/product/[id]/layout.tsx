import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Using generateMetadata allows us to inject dynamic titles if needed.
  // For now we just resolve the ID and provide a fallback.
  // Ideally, you would fetch the product name from the database here.
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  return {
    title: `Product Details | Sri Aachi Creatives`,
    description: `Discover this premium handcrafted product (${productId}) at Sri Aachi Creatives.`,
  };
}

export default function ProductDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
