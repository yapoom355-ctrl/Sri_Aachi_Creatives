"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { GET_USER_CART, GET_MY_ADDRESSES, GET_ME } from "@/graphql/queries";
import {
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
  APPLY_COUPON_TO_CART,
  REMOVE_COUPON_FROM_CART,
  SELECT_DELIVERY_OPTION,
  CHECKOUT_CART,
  INITIATE_ONLINE_PAYMENT,
  VERIFY_ONLINE_PAYMENT,
  CREATE_USER_ADDRESS,
  DELETE_USER_ADDRESS,
  UPDATE_USER_ADDRESS,
  UPDATE_ME,
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
}

export interface BackendCart {
  id: string;
  deliveryFee?: number;
  deliveryAddressId?: string;
  deliveryAddress?: BackendAddress | null;
  items: BackendCartItem[];
  billSummary: BillSummary;
}

// Legacy types kept for compatibility with existing cart UI components
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

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface CartContextType {
  // Backend cart
  cart: BackendCart | null;
  cartLoading: boolean;
  cartItems: CartItem[]; // mapped for backward compatibility
  cartCount: number;
  subtotal: number;

  // Cart mutations
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  clearCart: () => Promise<void>;

  // Coupon
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;

  // Addresses from backend
  addresses: BackendAddress[];
  addressesLoading: boolean;
  selectedAddressId: string | null;
  selectAddress: (id: string) => void;
  addAddress: (input: Omit<BackendAddress, "id">) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setAddressAsDefault: (id: string) => Promise<void>;

  // Checkout
  checkoutWithCOD: (addressId: string) => Promise<string>; // returns order ID
  checkoutWithRazorpay: (addressId: string) => Promise<string>; // returns order ID

  // UI state
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Auth (lightweight — real auth should be in separate context)
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (token: string, userProfile: UserProfile) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  updateUserProfile: (input: { name?: string; email?: string }) => Promise<void>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlistSidebarOpen: boolean;
  setWishlistSidebarOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Helper: Load Razorpay script ─────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const apolloClient = useApolloClient();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isWishlistSidebarOpen, setWishlistSidebarOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  // ── Auth state ──────────────────────────────────────────────────────────────
  // Validate token on init — if stored token is malformed, clear it immediately
  // so public queries (products, categories) work without auth errors
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const parts = token.split(".");
        if (parts.length !== 3) {
          localStorage.removeItem("token");
        } else {
          try {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              localStorage.removeItem("token");
            } else {
              setIsLoggedIn(true);
            }
          } catch {
            localStorage.removeItem("token");
          }
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
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

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
    }
    setIsLoggedIn(false);
    setUser(null);
    apolloClient.clearStore();
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
  }, []);

  // ── Backend user (sync from server on login) ────────────────────────────────
  const { data: meData } = useQuery(GET_ME, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  }) as any;

  // Sync user profile from backend when GET_ME data arrives
  useEffect(() => {
    if (meData?.me) {
      const backendUser = meData.me;
      const backendName = [backendUser.firstName, backendUser.lastName].filter(Boolean).join(" ");
      const updatedProfile: UserProfile = {
        name: backendName || user?.name || "",
        email: backendUser.email || user?.email || "",
        phone: backendUser.mobilenumber || user?.phone || "",
        avatar: user?.avatar || "/images/profile.png",
      };
      setUser(updatedProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  // ── Backend cart ────────────────────────────────────────────────────────────
  const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_USER_CART, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",

  }) as any;

  const cart: BackendCart | null = cartData?.myCart ?? null;

  // Map backend cart items to legacy CartItem shape for existing UI components
  const cartItems: CartItem[] = (cart?.items ?? []).map((item) => ({
    id: item.product.id,
    name: item.product.title,
    subtitle: "",
    price: `₹${item.product.effectivePrice ?? item.product.price ?? 0}`,
    numericPrice: item.product.effectivePrice ?? item.product.price ?? 0,
    image: getProductImage(item.product.thumbnail?.mediaUrl, item.product.id),
    quantity: item.quantity,
    size: "M",
    color: "#000",
  }));

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cart?.billSummary?.itemTotal ?? 0;
  const discountAmount = cart?.billSummary?.discountApplied ?? 0;
  const appliedCoupon = appliedCouponCode;

  // ── Backend addresses ───────────────────────────────────────────────────────
  const { data: addressData, loading: addressesLoading, refetch: refetchAddresses } = useQuery(GET_MY_ADDRESSES, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  }) as any;

  const addresses: BackendAddress[] = addressData?.myAddresses ?? [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const primary = addresses.find((a) => a.isPrimary) ?? addresses[0];
      setSelectedAddressId(primary.id);
    }
  }, [addresses, selectedAddressId]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const [addToCartMutation] = useMutation(ADD_TO_CART) as any;
  const [updateCartItemMutation] = useMutation(UPDATE_CART_ITEM) as any;
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART) as any;
  const [clearCartMutation] = useMutation(CLEAR_CART) as any;
  const [applyCouponMutation] = useMutation(APPLY_COUPON_TO_CART) as any;
  const [removeCouponMutation] = useMutation(REMOVE_COUPON_FROM_CART) as any;
  const [selectDeliveryMutation] = useMutation(SELECT_DELIVERY_OPTION) as any;
  const [checkoutCartMutation] = useMutation(CHECKOUT_CART) as any;
  const [initiatePaymentMutation] = useMutation(INITIATE_ONLINE_PAYMENT) as any;
  const [verifyPaymentMutation] = useMutation(VERIFY_ONLINE_PAYMENT) as any;
  const [createAddressMutation] = useMutation(CREATE_USER_ADDRESS) as any;
  const [deleteAddressMutation] = useMutation(DELETE_USER_ADDRESS) as any;
  const [updateUserAddressMutation] = useMutation(UPDATE_USER_ADDRESS) as any;
  const [updateMeMutation] = useMutation(UPDATE_ME) as any;

  // ── Cart actions ────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    // If user is not logged in, open login modal and return
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    try {
      await addToCartMutation({ variables: { productId, quantity } });
      await refetchCart();
    } catch (err) {
      console.error("addToCart error:", err);
    }
  }, [addToCartMutation, refetchCart, isLoggedIn, setLoginModalOpen]);

  // Backward-compat: legacy uses (id, size, color, qty) — we map to productId
  const updateQuantity = useCallback(async (id: string, _size: string, _color: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCartMutation({ variables: { productId: id } });
      } else {
        await updateCartItemMutation({ variables: { productId: id, quantity } });
      }
      await refetchCart();
    } catch (err) {
      console.error("updateQuantity error:", err);
    }
  }, [updateCartItemMutation, removeFromCartMutation, refetchCart]);

  const removeFromCart = useCallback(async (id: string, _size: string, _color: string) => {
    try {
      await removeFromCartMutation({ variables: { productId: id } });
      await refetchCart();
    } catch (err) {
      console.error("removeFromCart error:", err);
    }
  }, [removeFromCartMutation, refetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await clearCartMutation();
      await refetchCart();
    } catch (err) {
      console.error("clearCart error:", err);
    }
  }, [clearCartMutation, refetchCart]);

  // ── Coupon actions ──────────────────────────────────────────────────────────
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      await applyCouponMutation({ variables: { code } });
      setAppliedCouponCode(code.toUpperCase());
      await refetchCart();
      return true;
    } catch (err) {
      console.error("applyCoupon error:", err);
      return false;
    }
  }, [applyCouponMutation, refetchCart]);

  const removeCoupon = useCallback(async () => {
    if (!appliedCouponCode) return;
    try {
      await removeCouponMutation({ variables: { code: appliedCouponCode } });
      setAppliedCouponCode(null);
      await refetchCart();
    } catch (err) {
      console.error("removeCoupon error:", err);
    }
  }, [appliedCouponCode, removeCouponMutation, refetchCart]);

  // ── Address actions ─────────────────────────────────────────────────────────
  const selectAddress = (id: string) => setSelectedAddressId(id);

  const addAddress = useCallback(async (input: Omit<BackendAddress, "id">) => {
    try {
      await createAddressMutation({ variables: { input } });
      await refetchAddresses();
    } catch (err) {
      console.error("addAddress error:", err);
    }
  }, [createAddressMutation, refetchAddresses]);

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await deleteAddressMutation({ variables: { id } });
      if (selectedAddressId === id) setSelectedAddressId(null);
      await refetchAddresses();
    } catch (err) {
      console.error("deleteAddress error:", err);
    }
  }, [deleteAddressMutation, refetchAddresses, selectedAddressId]);

  const setAddressAsDefault = useCallback(async (id: string) => {
    try {
      const addr = addresses.find((a) => a.id === id);
      if (!addr) return;
      await updateUserAddressMutation({
        variables: {
          id,
          input: {
            customerName: addr.customerName,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            landmark: addr.landmark,
            district: addr.district,
            state: addr.state,
            pincode: addr.pincode,
            phoneNumber: addr.phoneNumber,
            isPrimary: true,
          },
        },
      });
      await refetchAddresses();
    } catch (err) {
      console.error("setAddressAsDefault error:", err);
    }
  }, [updateUserAddressMutation, addresses, refetchAddresses]);

  // ── Update user profile ─────────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (input: { name?: string; email?: string }) => {
    try {
      let updateInput: any = {};
      if (input.name !== undefined) {
        const parts = input.name.trim().split(" ");
        updateInput.firstName = parts[0] || "";
        updateInput.lastName = parts.slice(1).join(" ") || "";
      }
      if (input.email !== undefined) {
        updateInput.email = input.email;
      }

      const result = await updateMeMutation({ variables: { input: updateInput } });
      const updated = result.data?.updateMe;
      if (updated) {
        const newName = [updated.firstName, updated.lastName].filter(Boolean).join(" ");
        const newProfile: UserProfile = {
          name: newName || user?.name || "",
          email: updated.email || user?.email || "",
          phone: updated.mobilenumber || user?.phone || "",
          avatar: user?.avatar || "/images/profile.png",
        };
        setUser(newProfile);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_profile", JSON.stringify(newProfile));
        }
      }
    } catch (err) {
      console.error("updateUserProfile error:", err);
      throw err;
    }
  }, [updateMeMutation, user]);

  // ── Checkout ────────────────────────────────────────────────────────────────
  const checkoutWithCOD = useCallback(async (addressId: string): Promise<string> => {
    // 1. Set delivery address (using "standard" as the service name for COD)
    await selectDeliveryMutation({ variables: { addressId, serviceName: "standard" } });
    // 2. Checkout
    const result = await checkoutCartMutation({ variables: { paymentMethod: "COD" } });
    const orderId: string = result.data.checkoutCart.id;
    await refetchCart();
    return orderId;
  }, [selectDeliveryMutation, checkoutCartMutation, refetchCart]);

  const checkoutWithRazorpay = useCallback(async (addressId: string): Promise<string> => {
    // 1. Set delivery address
    await selectDeliveryMutation({ variables: { addressId, serviceName: "standard" } });
    // 2. Create order via checkoutCart with ONLINE
    const checkoutResult = await checkoutCartMutation({ variables: { paymentMethod: "ONLINE" } });
    const order = checkoutResult.data.checkoutCart;

    // 3. Initiate Razorpay payment
    const payResult = await initiatePaymentMutation({ variables: { orderId: order.id } });
    const payData = payResult.data.initiateOnlinePayment;

    // 4. Load Razorpay SDK and open checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Failed to load Razorpay SDK");

    return new Promise((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        key: payData.key,
        amount: payData.amount,
        currency: payData.currency,
        name: payData.name,
        order_id: payData.orderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation({
              variables: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            await refetchCart();
            resolve(order.id);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });
      rzp.open();
    });
  }, [selectDeliveryMutation, checkoutCartMutation, initiatePaymentMutation, verifyPaymentMutation, refetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartItems,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        addresses,
        addressesLoading,
        selectedAddressId,
        selectAddress,
        addAddress,
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
