export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  numericPrice: number;
  image: string;
  isLiked?: boolean;
  rating: number;
  reviewsCount: number;
  colors: string[];
  sizes: string[];
  limited?: boolean;
  category?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Midnight Bloom Hoodie",
    subtitle: "Minimal streetwear hoo...",
    description: "Classic premium green hoodie featuring standard adjustable fit, ideal for matching with casual denim or matching caps. Tailored from high-quality soft materials for a luxurious daily feel.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-green.png",
    isLiked: false,
    rating: 4.7,
    reviewsCount: 180,
    colors: ["#768067", "#c08457", "#b07d5b", "#e7e4dc", "#9db2cf", "#d7ec82"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    limited: false,
    category: "hoodie"
  },
  {
    id: "2",
    name: "Crimson Wave Hoodie",
    subtitle: "Minimal streetwear hoo...",
    description: "Classic adjustable cap featuring a sleek logo, ideal for adding a touch of flair to any outfit.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-blue.png",
    isLiked: true,
    rating: 4.8,
    reviewsCount: 300,
    colors: ["#768067", "#c08457", "#b07d5b", "#e7e4dc", "#9db2cf", "#d7ec82"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    limited: true,
    category: "hoodie"
  },
  {
    id: "3",
    name: "Forest Green Hoodie",
    subtitle: "Minimal streetwear hoo...",
    description: "Clean minimalist layout white hoodie, soft-touch fabric for comfortable regular fit. Essential addition to your street style wardrobe.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-white.png",
    isLiked: false,
    rating: 4.5,
    reviewsCount: 95,
    colors: ["#e7e4dc", "#9db2cf", "#768067"],
    sizes: ["M", "L", "XL"],
    limited: false,
    category: "hoodie"
  },
  {
    id: "4",
    name: "Ocean Depths Hoodie",
    subtitle: "Minimal streetwear hoo...",
    description: "Warm earth tones caramel hoodie, luxury heavy knit for perfect autumn styling. Features a relaxed comfort cut and double lined hood.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-brown.png",
    isLiked: false,
    rating: 4.9,
    reviewsCount: 145,
    colors: ["#b07d5b", "#c08457", "#e7e4dc"],
    sizes: ["S", "M", "L", "XL"],
    limited: true,
    category: "hoodie"
  },
  {
    id: "5",
    name: "Retro Urban Sneakers",
    subtitle: "Classic streetwear sneaks",
    description: "Premium canvas street sneakers built for regular usage. Flat vulcanized outsole and custom soft insole cushions.",
    price: "$95",
    numericPrice: 95,
    image: "/images/product-blue.png",
    isLiked: false,
    rating: 4.6,
    reviewsCount: 110,
    colors: ["#9db2cf", "#e7e4dc"],
    sizes: ["M", "L", "XL"],
    limited: false,
    category: "sneaker"
  },
  {
    id: "6",
    name: "Prestige Canvas Caps",
    subtitle: "Adjustable back strap cap",
    description: "Adjustable back strap classic fit cap, breathable layout canvas, matching perfectly with casual activewear.",
    price: "$30",
    numericPrice: 30,
    image: "/images/product-white.png",
    isLiked: false,
    rating: 4.4,
    reviewsCount: 50,
    colors: ["#e7e4dc", "#768067"],
    sizes: ["S", "M", "L"],
    limited: false,
    category: "face-cap"
  },
  {
    id: "7",
    name: "Minimalist Chrono Watch",
    subtitle: "Waterproof quartz movement",
    description: "Minimalist layout luxury watch featuring brown leather straps and waterproof black dial window.",
    price: "$180",
    numericPrice: 180,
    image: "/images/product-brown.png",
    isLiked: false,
    rating: 4.9,
    reviewsCount: 75,
    colors: ["#b07d5b", "#1c1b1f"],
    sizes: ["L"],
    limited: true,
    category: "watch"
  }
];
