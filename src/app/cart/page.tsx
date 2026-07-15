"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, X, ChevronLeft, ShoppingBag, MapPin, Wallet, CreditCard } from "lucide-react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

type PaymentMethod = "COD" | "RAZORPAY";

export default function MobileCartPage() {
  const router = useRouter();
  const {
    cartItems,
    cart,
    cartLoading,
    updateQuantity,
    removeFromCart,
    subtotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    addresses,
    addressesLoading,
    selectedAddressId,
    selectAddress,
    checkoutWithCOD,
    checkoutWithRazorpay,
    isLoggedIn,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [isSelectingAddress, setIsSelectingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    ?? addresses.find((a) => a.isPrimary)
    ?? addresses[0];

  const billSummary = cart?.billSummary;
  const deliveryFee = billSummary?.deliveryFee ?? 0;
  const tax = billSummary?.tax ?? 0;
  const grandTotal = billSummary?.grandTotal ?? (subtotal - discountAmount + deliveryFee + tax);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const success = await applyCoupon(promoCode.trim());
    if (success) {
      alert(`✅ Coupon "${promoCode.toUpperCase()}" applied!`);
      setPromoCode("");
    } else {
      alert("❌ Invalid or expired coupon code.");
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setCheckoutError("Please select a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      let orderId: string;
      if (paymentMethod === "COD") {
        orderId = await checkoutWithCOD(selectedAddress.id);
      } else {
        orderId = await checkoutWithRazorpay(selectedAddress.id);
      }
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      if (err?.message === "Payment cancelled") {
        setCheckoutError("Payment was cancelled. Please try again.");
      } else {
        setCheckoutError(err?.message ?? "Checkout failed. Please try again.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Cart</h2>
          <div className={styles.iconButton} />
        </header>
        <main className={styles.mainContent}>
          <div className={styles.emptyState}>
            <ShoppingBag size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p>Please log in to view your cart.</p>
            <button
              className={styles.checkoutBtn}
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/profile")}
            >
              Log In
            </button>
          </div>
        </main>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>Cart</h2>
        <button className={styles.iconButton} aria-label="Cart Overview">
          <ShoppingBag size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {cartLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>Loading cart…</div>
        ) : cartItems.length > 0 ? (
          <>
            {/* ── Cart Items ────────────────────────────────────────── */}
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className={styles.cartItem}>
                  <div className={styles.imageContainer}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={90}
                      height={100}
                      className={styles.itemImage}
                    />
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className={styles.removeButton}
                      aria-label="Remove item"
                    >
                      <X size={10} strokeWidth={3} className={styles.closeIcon} />
                    </button>
                  </div>

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.itemPrice}>{item.price}</span>
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className={styles.qtyBtn}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} strokeWidth={3} />
                        </button>
                        <span className={styles.qtyText}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className={styles.qtyBtn}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Promo Code ────────────────────────────────────────── */}
            <form onSubmit={handleApplyPromo} className={styles.promoForm}>
              <input
                type="text"
                placeholder="Enter Discount code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={styles.promoInput}
              />
              <button type="submit" className={styles.promoButton}>
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className={styles.couponsLinkContainer}>
                <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>
                  ✅ Coupon "{appliedCoupon}" applied
                </span>
                <button
                  type="button"
                  className={styles.couponsLink}
                  onClick={removeCoupon}
                  style={{ marginLeft: "auto" }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* ── Shipping Address ──────────────────────────────────── */}
            <div className={styles.addressSection}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>
                  <MapPin size={14} style={{ marginRight: 4, display: "inline" }} />
                  Delivery Address
                </h4>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    className={styles.changeAddressBtn}
                    onClick={() => setIsSelectingAddress(!isSelectingAddress)}
                  >
                    {isSelectingAddress ? "Cancel" : "Change"}
                  </button>
                )}
              </div>

              {addressesLoading ? (
                <div style={{ fontSize: "0.8rem", opacity: 0.5, padding: "0.5rem 0" }}>Loading addresses…</div>
              ) : addresses.length === 0 ? (
                <div className={styles.noAddressBox}>
                  <p className={styles.noAddressText}>No shipping addresses saved.</p>
                  <button
                    type="button"
                    className={styles.addAddressLink}
                    onClick={() => router.push("/addresses")}
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <>
                  {selectedAddress && !isSelectingAddress && (
                    <div className={styles.selectedAddressCard}>
                      <div className={styles.selectedHeader}>
                        <span className={styles.selectedName}>{selectedAddress.customerName}</span>
                        {selectedAddress.isPrimary && (
                          <span className={styles.miniBadge}>Default</span>
                        )}
                      </div>
                      <p className={styles.selectedStreet}>{selectedAddress.addressLine1}</p>
                      <p className={styles.selectedCity}>
                        {selectedAddress.district}, {selectedAddress.state} — {selectedAddress.pincode}
                      </p>
                      <p style={{ fontSize: "0.72rem", opacity: 0.6 }}>{selectedAddress.phoneNumber}</p>
                    </div>
                  )}

                  {isSelectingAddress && (
                    <div className={styles.otherAddressesSection}>
                      <span className={styles.otherAddressesTitle}>Choose an address:</span>
                      <div className={styles.addressSelectorList}>
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`${styles.selectorCard} ${addr.id === selectedAddressId ? styles.selectorCardActive : ""}`}
                            onClick={() => {
                              selectAddress(addr.id);
                              setIsSelectingAddress(false);
                            }}
                          >
                            <div className={styles.selectorHeader}>
                              <span className={styles.selectorName}>{addr.customerName}</span>
                              {addr.isPrimary && <span className={styles.miniBadge}>Default</span>}
                            </div>
                            <p className={styles.selectorStreet}>{addr.addressLine1}</p>
                            <p className={styles.selectorCity}>
                              {addr.district}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={styles.manageAddressBtnInline}
                        onClick={() => router.push("/addresses")}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Payment Method ────────────────────────────────────── */}
            <div className={styles.addressSection}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>
                  <CreditCard size={14} style={{ marginRight: 4, display: "inline" }} />
                  Payment Method
                </h4>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: paymentMethod === "COD" ? "2px solid #111" : "1.5px solid #e5e5e5",
                    background: paymentMethod === "COD" ? "#111" : "#fff",
                    color: paymentMethod === "COD" ? "#fff" : "#111",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s",
                  }}
                >
                  <Wallet size={14} />
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: paymentMethod === "RAZORPAY" ? "2px solid #6366f1" : "1.5px solid #e5e5e5",
                    background: paymentMethod === "RAZORPAY" ? "#6366f1" : "#fff",
                    color: paymentMethod === "RAZORPAY" ? "#fff" : "#111",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s",
                  }}
                >
                  <CreditCard size={14} />
                  Pay Online
                </button>
              </div>
            </div>

            {/* ── Price Summary ─────────────────────────────────────── */}
            <div className={styles.pricingSummary}>
              <div className={styles.summaryRow}>
                <span>Sub total:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount:</span>
                  <span style={{ color: "#22c55e" }}>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className={styles.summaryRow}>
                  <span>Delivery:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className={styles.summaryRow}>
                  <span>Tax:</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* ── Error Message ─────────────────────────────────────── */}
            {checkoutError && (
              <div
                style={{
                  margin: "0 1rem",
                  padding: "0.75rem 1rem",
                  background: "#fee2e2",
                  borderRadius: "10px",
                  color: "#dc2626",
                  fontSize: "0.78rem",
                }}
              >
                {checkoutError}
              </div>
            )}

            {/* ── Checkout CTA ──────────────────────────────────────── */}
            <div className={styles.actionContainer}>
              <button
                className={styles.checkoutBtn}
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut || !selectedAddress}
                style={{ opacity: isCheckingOut ? 0.7 : 1 }}
              >
                {isCheckingOut
                  ? "Processing…"
                  : paymentMethod === "COD"
                    ? "Place Order (COD)"
                    : "Proceed to Pay"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p>Your cart is empty</p>
            <button
              className={styles.checkoutBtn}
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/products")}
            >
              Browse Products
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
