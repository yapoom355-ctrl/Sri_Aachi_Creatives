"use client";

import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  numericPrice: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  cityState: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  addresses: Address[];
  selectedAddressId: string | null;
  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => void;
  deleteAddress: (id: string) => void;
  setAddressAsDefault: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_CART: CartItem[] = [
  {
    id: "1",
    name: "Elite Bloom Hoodie",
    subtitle: "Minimal streetwear hoodie crafted for everyday comfort.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-green.png",
    quantity: 1,
    size: "XXL",
    color: "#768067",
  },
  {
    id: "3",
    name: "Midnight Bloom Hoodie",
    subtitle: "Minimal streetwear hoodie crafted for everyday comfort.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-white.png",
    quantity: 1,
    size: "XXL",
    color: "#e7e4dc",
  },
  {
    id: "4",
    name: "Vault Signature Hoodie",
    subtitle: "Minimal streetwear hoodie crafted for everyday comfort.",
    price: "$120",
    numericPrice: 120,
    image: "/images/product-brown.png",
    quantity: 1,
    size: "XXL",
    color: "#b07d5b",
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += 1;
        return newItems;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.size === size && i.color === color))
    );
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size && i.color === color ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const applyCoupon = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "SAVE10" || formatted === "FREESHIP" || formatted === "WELCOME5") {
      setAppliedCoupon(formatted);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.numericPrice * item.quantity, 0);

  const discountAmount = (() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon === "SAVE10") {
      return subtotal * 0.1;
    }
    if (appliedCoupon === "WELCOME5") {
      return 5;
    }
    return 0;
  })();

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Asha Royden",
      street: "124 Baker Street",
      cityState: "London, NW1 6XE",
      country: "UK",
      phone: "+44 20 7946 0958",
      isDefault: true,
    },
    {
      id: "2",
      name: "Asha Royden (Office)",
      street: "30 St Mary Axe (The Gherkin)",
      cityState: "London, EC3A 8BF",
      country: "UK",
      phone: "+44 20 7946 0192",
      isDefault: false,
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("1");

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
  };

  const addAddress = (newAddrData: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => {
    const isDefault = newAddrData.isDefault || addresses.length === 0;
    const newAddr: Address = {
      ...newAddrData,
      id: Date.now().toString(),
      isDefault,
    };

    setAddresses((prev) => {
      let updated = [...prev];
      if (newAddr.isDefault) {
        updated = updated.map((addr) => ({ ...addr, isDefault: false }));
        setSelectedAddressId(newAddr.id);
      }
      return [...updated, newAddr];
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((addr) => addr.id !== id);
      if (filtered.length > 0 && prev.find((a) => a.id === id)?.isDefault) {
        filtered[0].isDefault = true;
        if (selectedAddressId === id) {
          setSelectedAddressId(filtered[0].id);
        }
      } else if (selectedAddressId === id) {
        setSelectedAddressId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const setAddressAsDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setSelectedAddressId(id);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isSidebarOpen,
        setSidebarOpen,
        cartCount,
        subtotal,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        addresses,
        selectedAddressId,
        selectAddress,
        addAddress,
        deleteAddress,
        setAddressAsDefault,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
