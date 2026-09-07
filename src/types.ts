export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  numericPrice: number;
  image: string;
  isLiked?: boolean;
  rating?: number;
  reviewsCount?: number;
  colors: string[];
  sizes: string[];
  limited?: boolean;
  category?: string;
  categoryName?: string;
}
