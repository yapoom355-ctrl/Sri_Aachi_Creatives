"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { GET_MY_ADDRESSES, GET_ME } from "@/graphql/queries";
import {
  CREATE_USER_ADDRESS,
  DELETE_USER_ADDRESS,
  UPDATE_USER_ADDRESS,
  SET_DEFAULT_ADDRESS,
  UPDATE_ME,
  CHECKOUT_CREATE,
  CHECKOUT_LINES_ADD,
  CHECKOUT_SHIPPING_ADDRESS_UPDATE,
  CHECKOUT_COMPLETE,
  CHECKOUT_ADD_PROMO_CODE,
  CHECKOUT_REMOVE_PROMO_CODE,
} from "@/graphql/mutations";

const FALLBACK_IMAGES = [
  "/images/resin-art-block.webp",
  "/images/resin-table.webp",
  "/images/photo-frame.webp",
  "/images/motor-engine-table.webp",
  "/images/motor-engine-table-3.webp",
];

const getProductImage = (thumbnailUrl?: string | null, id?: string) => {
  if (thumbnailUrl) {
    return thumbnailUrl;
  }
  const idStr = id || "";
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) {
    sum += idStr.charCodeAt(i);
  }
  return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length];
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BackendAddress {
  id: string;
  customerName: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  district: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface BillSummary {
  itemTotal: number;
  discountApplied: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  isFreeDelivery?: boolean;
  courierName?: string;
  estimatedDays?: string;
}

export interface BackendCartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    effectivePrice: number;
    thumbnail?: { mediaUrl: string } | null;
  };
}

export interface BackendCart {
  id: string;
  deliveryFee?: number;
  deliveryAddressId?: string;
  deliveryAddress?: BackendAddress | null;
  items: BackendCartItem[];
  billSummary: BillSummary;
}

export interface CartItem {
  id: string;
  variantId?: string;       // Saleor variant ID — required for real checkout
  name: string;
  subtitle: string;
  price: string;
  numericPrice: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  customInstructions?: string;
  customImage?: string;
  customImageName?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface CartContextType {
  cart: BackendCart | null;
  cartLoading: boolean;
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  shippingCourier: string;
  isFreeShipping: boolean;
  isLoadingShipping: boolean;

  addToCart: (productId: string, quantity?: number, itemDetails?: Partial<CartItem>) => Promise<void>;
  updateQuantity: (id: string, size: string, color: string, quantity: number, customInstructions?: string, customImage?: string) => void;
  removeFromCart: (id: string, size: string, color: string, customInstructions?: string, customImage?: string) => void;
  clearCart: () => Promise<void>;

  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;

  addresses: BackendAddress[];
  addressesLoading: boolean;
  selectedAddressId: string | null;
  selectAddress: (id: string) => void;
  addAddress: (input: Omit<BackendAddress, "id">) => Promise<void>;
  updateAddress: (id: string, input: Partial<BackendAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setAddressAsDefault: (id: string) => Promise<void>;

  checkoutWithCOD: (addressId: string, customDeliveryFee?: number) => Promise<string>;
  checkoutWithRazorpay: (addressId: string, customDeliveryFee?: number) => Promise<string>;

  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (token: string, userProfile: UserProfile) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  updateUserProfile: (input: { name?: string; email?: string }) => Promise<void>;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlistSidebarOpen: boolean;
  setWishlistSidebarOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const apolloClient = useApolloClient();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isWishlistSidebarOpen, setWishlistSidebarOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
            } else {
              setIsLoggedIn(true);
            }
          } else {
            setIsLoggedIn(true);
          }
        } catch {
          setIsLoggedIn(true);
        }
      }

      const storedUser = localStorage.getItem("user_profile");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const login = (token: string, userProfile: UserProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user_profile", JSON.stringify(userProfile));
    }
    setIsLoggedIn(true);
    setUser(userProfile);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user_profile");
      localStorage.removeItem("local_cart");
      localStorage.removeItem("local_addresses");
      localStorage.removeItem("wishlist");
    }
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    setLocalAddresses([]);
    setWishlist([]);
    setSelectedAddressId(null);
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    try {
      apolloClient.clearStore().catch(() => {});
    } catch {
      // Ignore
    }
  };

  // ── Wishlist state ────────────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const newWishlist = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      if (typeof window !== "undefined") {
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      }
      return newWishlist;
    });
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    }
  }, [isLoggedIn]);

  // ── Local Cart Items State ──────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("local_cart");
      if (storedCart) {
        try {
          const parsed: CartItem[] = JSON.parse(storedCart);
          const sanitized = parsed.map((item) => {
            let numPrice = item.numericPrice;
            if ((!numPrice || numPrice === 0) && item.price) {
              numPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
            }
            return { ...item, numericPrice: numPrice };
          });
          setCartItems(sanitized);
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const saveCartItems = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", JSON.stringify(items));
    }
  };

  // ── Sync user profile from Saleor GET_ME ────────────────────────────────────
  const { data: meData } = useQuery(GET_ME, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  }) as any;

  useEffect(() => {
    if (meData?.me) {
      const backendUser = meData.me;
      const backendName = [backendUser.firstName, backendUser.lastName].filter(Boolean).join(" ");
      const updatedProfile: UserProfile = {
        name: backendName || user?.name || "User",
        email: backendUser.email || user?.email || "",
        phone: user?.phone || "",
        avatar: user?.avatar || "/images/profile.png",
      };
      setUser(updatedProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  // ── Sync addresses from Saleor + Local Backup ───────────────────────────────
  const [localAddresses, setLocalAddresses] = useState<BackendAddress[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("local_addresses");
      if (stored) {
        try {
          setLocalAddresses(JSON.parse(stored));
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const saveLocalAddresses = (list: BackendAddress[]) => {
    setLocalAddresses(list);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_addresses", JSON.stringify(list));
    }
  };

  const { data: addressData, loading: addressesLoading, refetch: refetchAddresses } = useQuery(GET_MY_ADDRESSES, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  }) as any;

  const rawAddresses = addressData?.me?.addresses || [];
  const backendAddresses: BackendAddress[] = rawAddresses.map((a: any) => ({
    id: a.id,
    customerName: [a.firstName, a.lastName].filter(Boolean).join(" ") || "Customer",
    addressLine1: a.streetAddress1 || "",
    addressLine2: a.streetAddress2 || "",
    landmark: "",
    district: a.city || "",
    state: a.countryArea || "",
    pincode: a.postalCode || "",
    phoneNumber: a.phone || "",
    isPrimary: !!a.isDefaultShippingAddress,
  }));

  const addresses: BackendAddress[] = [
    ...backendAddresses,
    ...localAddresses.filter((la) => !backendAddresses.some((ba) => ba.id === la.id)),
  ];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const primary = addresses.find((a) => a.isPrimary) ?? addresses[0];
      setSelectedAddressId(primary.id);
    }
  }, [addresses, selectedAddressId]);

  // ── Cart mutations ──────────────────────────────────────────────────────────
  const [createAddressMutation] = useMutation(CREATE_USER_ADDRESS) as any;
  const [deleteAddressMutation] = useMutation(DELETE_USER_ADDRESS) as any;
  const [updateAddressMutation] = useMutation(UPDATE_USER_ADDRESS) as any;
  const [setDefaultAddressMutation] = useMutation(SET_DEFAULT_ADDRESS) as any;
  const [updateMeMutation] = useMutation(UPDATE_ME) as any;
  const [checkoutCreateMutation] = useMutation(CHECKOUT_CREATE) as any;
  const [checkoutLinesAddMutation] = useMutation(CHECKOUT_LINES_ADD) as any;
  const [checkoutShippingAddressUpdateMutation] = useMutation(CHECKOUT_SHIPPING_ADDRESS_UPDATE) as any;
  const [checkoutCompleteMutation] = useMutation(CHECKOUT_COMPLETE) as any;
  const [checkoutAddPromoCodeMutation] = useMutation(CHECKOUT_ADD_PROMO_CODE) as any;
  const [checkoutRemovePromoCodeMutation] = useMutation(CHECKOUT_REMOVE_PROMO_CODE) as any;

  // Helper: build a real Saleor checkout from current cart + address
  const buildSaleorCheckout = useCallback(async (addressId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userEmail = user?.email || `guest-${Date.now()}@sriaachicreatives.in`;

    // Find the address object
    const addr = addresses.find((a) => a.id === addressId);
    if (!addr) throw new Error("Address not found.");

    // Build lines from cart items (need variantId)
    const lines = cartItems
      .filter((item) => item.variantId)
      .map((item) => ({ variantId: item.variantId!, quantity: item.quantity }));

    if (lines.length === 0) {
      throw new Error("No items with valid variant IDs in cart. Please re-add your items.");
    }

    // 1. Create checkout
    const checkoutResult = await checkoutCreateMutation({
      variables: {
        input: {
          channel: "sri-aachi-creatives",
          email: userEmail,
          lines,
        },
      },
    });

    const checkoutErrors = checkoutResult.data?.checkoutCreate?.errors ?? [];
    if (checkoutErrors.length > 0) {
      throw new Error(checkoutErrors.map((e: any) => e.message).join(", "));
    }

    const checkoutId = checkoutResult.data?.checkoutCreate?.checkout?.id;
    if (!checkoutId) throw new Error("Failed to create checkout.");

    // 2. Set shipping address
    const nameParts = addr.customerName.split(" ");
    await checkoutShippingAddressUpdateMutation({
      variables: {
        checkoutId,
        shippingAddress: {
          firstName: nameParts[0] || "Customer",
          lastName: nameParts.slice(1).join(" ") || "",
          streetAddress1: addr.addressLine1,
          streetAddress2: addr.addressLine2 || "",
          city: addr.district,
          countryArea: addr.state,
          postalCode: addr.pincode,
          country: "IN",
          phone: addr.phoneNumber,
        },
      },
    });

    return checkoutId;
  }, [cartItems, addresses, user, checkoutCreateMutation, checkoutShippingAddressUpdateMutation]);


  const addToCart = useCallback(
    async (productId: string, quantity: number = 1, itemDetails?: Partial<CartItem>) => {
      setCartItems((prev) => {
        const customInstructions = itemDetails?.customInstructions?.trim() || "";
        const customImage = itemDetails?.customImage || "";
        const customImageName = itemDetails?.customImageName || "";
        const variantId = itemDetails?.variantId || "";

        const existingIndex = prev.findIndex(
          (i) =>
            i.id === productId &&
            (i.customInstructions || "") === customInstructions &&
            (i.customImage || "") === customImage
        );

        let updated: CartItem[];
        if (existingIndex > -1) {
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
        } else {
          const rawPriceStr = itemDetails?.price || "₹0";
          let parsedNumericPrice = itemDetails?.numericPrice || 0;
          if ((!parsedNumericPrice || parsedNumericPrice === 0) && rawPriceStr) {
            parsedNumericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, "")) || 0;
          }

          const newItem: CartItem = {
            id: productId,
            variantId: variantId || undefined,
            name: itemDetails?.name || "Product",
            subtitle: itemDetails?.subtitle || "",
            price: rawPriceStr,
            numericPrice: parsedNumericPrice,
            image: itemDetails?.image || getProductImage(null, productId),
            quantity,
            size: itemDetails?.size || "Standard",
            color: itemDetails?.color || "#000",
            customInstructions: customInstructions || undefined,
            customImage: customImage || undefined,
            customImageName: customImageName || undefined,
          };
          updated = [...prev, newItem];
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("local_cart", JSON.stringify(updated));
        }
        return updated;
      });
      if (!isLoggedIn) {
        setLoginModalOpen(true);
      }
    },
    [isLoggedIn]
  );

  const updateQuantity = useCallback(
    (id: string, _size: string, _color: string, quantity: number, customInstructions?: string, customImage?: string) => {
      setCartItems((prev) => {
        let updated: CartItem[];
        if (quantity <= 0) {
          updated = prev.filter(
            (i) =>
              !(
                i.id === id &&
                (customInstructions === undefined || (i.customInstructions || "") === customInstructions) &&
                (customImage === undefined || (i.customImage || "") === customImage)
              )
          );
        } else {
          updated = prev.map((i) => {
            const matches =
              i.id === id &&
              (customInstructions === undefined || (i.customInstructions || "") === customInstructions) &&
              (customImage === undefined || (i.customImage || "") === customImage);
            return matches ? { ...i, quantity } : i;
          });
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("local_cart", JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string, _size: string, _color: string, customInstructions?: string, customImage?: string) => {
    setCartItems((prev) => {
      const updated = prev.filter(
        (i) =>
          !(
            i.id === id &&
            (customInstructions === undefined || (i.customInstructions || "") === customInstructions) &&
            (customImage === undefined || (i.customImage || "") === customImage)
          )
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("local_cart", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearCart = useCallback(async () => {
    saveCartItems([]);
  }, []);

  // ── Dynamic Backend Delivery Calculation (Instant, Zero Delay) ──────────────
  const [shippingFee, setShippingFee] = useState<number>(73);
  const [shippingCourier, setShippingCourier] = useState<string>("Standard Delivery");
  const [shippingDays, setShippingDays] = useState<string>("2-4 days");
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (cartItems.length === 0) {
      setShippingFee(0);
      setIsFreeShipping(false);
      return;
    }

    const isTestProduct = cartItems.every((item: any) => {
      const id = item.id || item.variantId || "";
      const name = (item.name || item.productName || "").toLowerCase();
      return id === "UHJvZHVjdDoxOA==" || id === "UHJvZHVjdFZhcmlhbnQ6MTc=" || name.includes("live test product");
    });

    if (isTestProduct) {
      setShippingFee(0);
      setIsFreeShipping(true);
      setShippingCourier("Special Free Delivery");
      setShippingDays("1-2 days");
      return;
    }

    setIsFreeShipping(false);

    const activeAddress =
      addresses.find((a) => a.id === selectedAddressId) ||
      addresses.find((a) => a.isPrimary) ||
      addresses[0];

    async function calculateShipping() {
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            deliveryPincode: activeAddress?.pincode || "",
            paymentMethod: "RAZORPAY",
          }),
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setShippingFee(Number(data.deliveryFee) || 73);
          setIsFreeShipping(Boolean(data.isFreeDelivery));
          setShippingCourier(data.courierName || "Standard Delivery");
          setShippingDays(data.estimatedDays || "2-4 days");
        }
      } catch (err) {
        console.warn("CartContext shipping calculate error:", err);
      }
    }

    calculateShipping();
    return () => {
      isMounted = false;
    };
  }, [cartItems, selectedAddressId, addresses]);

  // ── Calculated properties ───────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cartItems.reduce((acc, i) => acc + i.numericPrice * i.quantity, 0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const cart: BackendCart = {
    id: "cart-1",
    deliveryFee: shippingFee,
    items: cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.id,
        title: item.name,
        price: item.numericPrice,
        effectivePrice: item.numericPrice,
        thumbnail: { mediaUrl: item.image },
      },
    })),
    billSummary: {
      itemTotal: subtotal,
      discountApplied: discountAmount,
      deliveryFee: shippingFee,
      tax: 0,
      grandTotal: Math.max(0, subtotal - discountAmount + shippingFee),
      isFreeDelivery: isFreeShipping,
      courierName: shippingCourier,
      estimatedDays: shippingDays,
    },
  };

  // Real Saleor coupon validation via checkoutAddPromoCode
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    // We need a temporary checkout to validate the coupon
    // Store the promo code optimistically; real discount applied at checkout
    try {
      const lines = cartItems
        .filter((item) => item.variantId)
        .map((item) => ({ variantId: item.variantId!, quantity: item.quantity }));

      if (lines.length === 0) {
        // No valid lines yet, just store code and let user proceed
        setAppliedCouponCode(code.toUpperCase());
        return true;
      }

      // Create a temp checkout to validate promo
      const tempResult = await checkoutCreateMutation({
        variables: {
          input: {
            channel: "sri-aachi-creatives",
            email: user?.email || `temp@sriaachicreatives.in`,
            lines,
          },
        },
      });
      const tempCheckoutId = tempResult.data?.checkoutCreate?.checkout?.id;

      if (!tempCheckoutId) {
        setAppliedCouponCode(code.toUpperCase());
        return true;
      }

      const promoResult = await checkoutAddPromoCodeMutation({
        variables: { checkoutId: tempCheckoutId, promoCode: code },
      });

      const promoErrors = promoResult.data?.checkoutAddPromoCode?.errors ?? [];
      if (promoErrors.length > 0) {
        console.warn("Coupon error:", promoErrors[0]?.message);
        return false;
      }

      // Calculate real discount
      const discountFromSaleor = promoResult.data?.checkoutAddPromoCode?.checkout?.discount?.amount ?? 0;
      setDiscountAmount(discountFromSaleor);
      setAppliedCouponCode(code.toUpperCase());
      return true;
    } catch (err) {
      console.error("applyCoupon error:", err);
      // Fallback: accept coupon optimistically
      setAppliedCouponCode(code.toUpperCase());
      return true;
    }
  }, [cartItems, user, checkoutCreateMutation, checkoutAddPromoCodeMutation]);

  const removeCoupon = useCallback(async () => {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
  }, []);

  const selectAddress = (id: string) => setSelectedAddressId(id);

  const addAddress = useCallback(
    async (input: Omit<BackendAddress, "id">) => {
      const newId = `addr-${Date.now()}`;
      const newAddressObj: BackendAddress = {
        id: newId,
        ...input,
        isPrimary: localAddresses.length === 0 && backendAddresses.length === 0,
      };

      // 1. Always save locally first so user is never blocked
      const updatedLocal = [...localAddresses, newAddressObj];
      saveLocalAddresses(updatedLocal);
      setSelectedAddressId(newId);

      // 2. Attempt Saleor accountAddressCreate mutation if authenticated
      try {
        const parts = input.customerName.split(" ");
        const result = await createAddressMutation({
          variables: {
            input: {
              firstName: parts[0] || "Customer",
              lastName: parts.slice(1).join(" ") || "",
              streetAddress1: input.addressLine1,
              streetAddress2: input.addressLine2 || "",
              city: input.district,
              countryArea: input.state,
              postalCode: input.pincode,
              country: "IN",
              phone: input.phoneNumber,
            },
          },
        });
        if (result?.data?.accountAddressCreate?.address?.id) {
          await refetchAddresses();
        }
      } catch (err: any) {
        console.warn("Saleor accountAddressCreate skipped/failed:", err?.message || err);
      }
    },
    [createAddressMutation, refetchAddresses, localAddresses, backendAddresses]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      // 1. Remove from local state
      const updatedLocal = localAddresses.filter((a) => a.id !== id);
      saveLocalAddresses(updatedLocal);
      if (selectedAddressId === id) setSelectedAddressId(null);

      // 2. Try Saleor mutation if backend address ID
      try {
        if (!id.startsWith("addr-")) {
          await deleteAddressMutation({ variables: { id } });
          await refetchAddresses();
        }
      } catch (err) {
        console.warn("deleteAddress error:", err);
      }
    },
    [deleteAddressMutation, refetchAddresses, localAddresses, selectedAddressId]
  );

  const updateAddress = useCallback(
    async (id: string, input: Partial<BackendAddress>) => {
      // 1. Update locally first for instant UI response
      const updatedLocal = localAddresses.map((addr) =>
        addr.id === id ? { ...addr, ...input } : addr
      );
      saveLocalAddresses(updatedLocal);

      // 2. Persist to Saleor GraphQL database if it's a backend address
      try {
        if (!id.startsWith("addr-")) {
          const parts = (input.customerName || "").trim().split(" ");
          const formattedInput: any = {};
          if (input.customerName) {
            formattedInput.firstName = parts[0] || "Customer";
            formattedInput.lastName = parts.slice(1).join(" ") || "";
          }
          if (input.addressLine1 !== undefined) formattedInput.streetAddress1 = input.addressLine1;
          if (input.addressLine2 !== undefined) formattedInput.streetAddress2 = input.addressLine2;
          if (input.district !== undefined) formattedInput.city = input.district;
          if (input.state !== undefined) formattedInput.countryArea = input.state;
          if (input.pincode !== undefined) formattedInput.postalCode = input.pincode;
          if (input.phoneNumber !== undefined) formattedInput.phone = input.phoneNumber;
          formattedInput.country = "IN";

          await updateAddressMutation({
            variables: { id, input: formattedInput },
          });
        }
        await refetchAddresses();
      } catch (err) {
        console.warn("updateAddress backend error:", err);
      }
    },
    [localAddresses, updateAddressMutation, refetchAddresses]
  );

  const setAddressAsDefault = useCallback(
    async (id: string) => {
      setSelectedAddressId(id);
      const updatedLocal = localAddresses.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
      }));
      saveLocalAddresses(updatedLocal);

      try {
        if (!id.startsWith("addr-")) {
          await setDefaultAddressMutation({
            variables: { id, type: "SHIPPING" },
          });
        }
        await refetchAddresses();
      } catch (err) {
        console.warn("setAddressAsDefault backend error:", err);
      }
    },
    [localAddresses, setDefaultAddressMutation, refetchAddresses]
  );

  const updateUserProfile = useCallback(
    async (input: { name?: string; email?: string }) => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const isValidJwt = Boolean(token) && !token?.startsWith("session-auth-") && token?.split(".").length === 3;

        let updatedBackendUser: any = null;

        if (isValidJwt) {
          try {
            const updateInput: { firstName?: string; lastName?: string } = {};
            if (input.name !== undefined) {
              const parts = input.name.trim().split(" ");
              updateInput.firstName = parts[0] || "";
              updateInput.lastName = parts.slice(1).join(" ") || "";
            }

            const result = await updateMeMutation({ variables: { input: updateInput } });
            if (result?.data?.accountUpdate?.errors?.length > 0) {
              const errMessage = result.data.accountUpdate.errors[0]?.message || "Failed to update profile";
              console.warn("Saleor accountUpdate error:", errMessage);
            } else if (result?.data?.accountUpdate?.user) {
              updatedBackendUser = result.data.accountUpdate.user;
            }
          } catch (backendErr: any) {
            console.warn("Saleor accountUpdate skipped/failed:", backendErr?.message || backendErr);
          }
        }

        const newName = updatedBackendUser
          ? [updatedBackendUser.firstName, updatedBackendUser.lastName].filter(Boolean).join(" ")
          : input.name?.trim() || user?.name || "User";

        const newProfile: UserProfile = {
          name: newName || user?.name || "User",
          email: input.email !== undefined ? input.email.trim() : (updatedBackendUser?.email || user?.email || ""),
          phone: user?.phone || "",
          avatar: user?.avatar || "/images/profile.png",
        };

        setUser(newProfile);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_profile", JSON.stringify(newProfile));
        }
      } catch (err) {
        console.error("updateUserProfile error:", err);
        throw err;
      }
    },
    [updateMeMutation, user]
  );

  // Real COD checkout: creates a genuine Saleor order via server-side draft order fulfillment
  const checkoutWithCOD = useCallback(
    async (addressId: string, customDeliveryFee?: number): Promise<string> => {
      if (!addressId) {
        throw new Error("Delivery address is required to proceed with checkout.");
      }

      const targetAddress = addresses.find((a) => a.id === addressId);
      if (!targetAddress) {
        throw new Error("Delivery address could not be found.");
      }

      const validLines = cartItems
        .filter((item) => item.variantId)
        .map((item) => ({ variantId: item.variantId!, quantity: item.quantity }));

      if (validLines.length === 0) {
        throw new Error("No items in cart with valid product variants. Please re-add your items.");
      }

      const userEmail =
        user?.email ||
        (user?.phone ? `91${user.phone.replace(/\D/g, "").slice(-10)}@sriaachicreatives.in` : "customer@sriaachicreatives.in");

      let delivery = customDeliveryFee;
      if (delivery === undefined) {
        try {
          const shipRes = await fetch("/api/shipping/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartItems,
              deliveryPincode: targetAddress.pincode,
              paymentMethod: "COD",
            }),
          });
          const shipData = await shipRes.json();
          delivery = shipData.deliveryFee ?? 0;
        } catch {
          delivery = 0;
        }
      }

      const res = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: targetAddress,
          lines: validLines,
          userEmail,
          deliveryFee: delivery,
          customerNote: appliedCouponCode ? `Coupon applied: ${appliedCouponCode}` : "Cash on Delivery (COD)",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place COD order.");
      }

      await clearCart();
      return data.orderId;
    },
    [addresses, cartItems, user, appliedCouponCode, clearCart]
  );

  // Real Razorpay checkout: opens Razorpay, creates Saleor order on success
  const checkoutWithRazorpay = useCallback(
    async (addressId: string, customDeliveryFee?: number): Promise<string> => {
      if (!addressId) {
        throw new Error("Delivery address is required to proceed with checkout.");
      }

      const targetAddress = addresses.find((a) => a.id === addressId);
      if (!targetAddress) {
        throw new Error("Delivery address could not be found.");
      }

      const validLines = cartItems
        .filter((item) => item.variantId)
        .map((item) => ({ variantId: item.variantId!, quantity: item.quantity }));

      if (validLines.length === 0) {
        throw new Error("No items in cart with valid product variants. Please re-add your items.");
      }

      let delivery = customDeliveryFee;
      if (delivery === undefined) {
        try {
          const shipRes = await fetch("/api/shipping/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartItems,
              deliveryPincode: targetAddress.pincode,
              paymentMethod: "RAZORPAY",
            }),
          });
          const shipData = await shipRes.json();
          delivery = shipData.deliveryFee ?? 0;
        } catch {
          delivery = 0;
        }
      }

      // Calculate grand total in paise
      const itemTotal = cartItems.reduce((acc, i) => acc + i.numericPrice * i.quantity, 0);
      const grandTotal = Math.max(0, itemTotal - discountAmount + delivery);
      const amountInPaise = Math.round(grandTotal * 100);

      if (amountInPaise === 0) {
        throw new Error("Cart total is ₹0. Please add items before checkout.");
      }

      const userEmail =
        user?.email ||
        (user?.phone ? `91${user.phone.replace(/\D/g, "").slice(-10)}@sriaachicreatives.in` : "customer@sriaachicreatives.in");

      return new Promise((resolve, reject) => {
        const loadRazorpay = () =>
          new Promise<void>((res, rej) => {
            if ((window as any).Razorpay) return res();
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => res();
            script.onerror = () => rej(new Error("Failed to load Razorpay SDK."));
            document.body.appendChild(script);
          });

        loadRazorpay()
          .then(async () => {
            let activeRazorpayKey = "rzp_live_TTugxbb85oHrLR";
            try {
              const keyRes = await fetch("/api/checkout/razorpay-key");
              const keyData = await keyRes.json();
              if (keyData?.key) activeRazorpayKey = keyData.key;
            } catch (e) {
              console.warn("Could not fetch key from backend, using fallback", e);
            }

            const options = {
              key: activeRazorpayKey,
              amount: amountInPaise,
              currency: "INR",
              name: "Sri Aachi Creatives",
              description: `Order for ${cartItems.length} item(s)`,
              image: "/images/sri-aachi-logo.png",
              prefill: {
                name: user?.name || targetAddress.customerName || "",
                contact: user?.phone || targetAddress.phoneNumber || "",
                email: userEmail,
              },
              theme: { color: "#a47449" },
              handler: async (response: any) => {
                try {
                  const res = await fetch("/api/checkout/razorpay-complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      address: targetAddress,
                      lines: validLines,
                      userEmail,
                      deliveryFee: delivery,
                      razorpayPaymentId: response.razorpay_payment_id,
                    }),
                  });

                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data.message || "Failed to record payment in store.");
                  }

                  await clearCart();
                  resolve(data.orderId);
                } catch (err: any) {
                  reject(new Error("Payment succeeded but order recording failed: " + err.message));
                }
              },
              modal: {
                ondismiss: () => reject(new Error("Payment cancelled")),
              },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", (response: any) => {
              reject(new Error(response?.error?.description || "Payment failed."));
            });
            rzp.open();
          })
          .catch(reject);
      });
    },
    [addresses, cartItems, discountAmount, user, clearCart]
  );


  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading: false,
        cartItems,
        cartCount,
        subtotal,
        shippingFee,
        shippingCourier,
        isFreeShipping,
        isLoadingShipping,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon: appliedCouponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        addresses,
        addressesLoading,
        selectedAddressId,
        selectAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setAddressAsDefault,
        checkoutWithCOD,
        checkoutWithRazorpay,
        isSidebarOpen,
        setSidebarOpen,
        isLoggedIn,
        user,
        login,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
        updateUserProfile,
        wishlist,
        toggleWishlist,
        isWishlistSidebarOpen,
        setWishlistSidebarOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
