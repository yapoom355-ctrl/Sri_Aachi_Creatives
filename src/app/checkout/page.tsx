"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  Circle,
  ShoppingBag,
  Info,
  ArrowRight,
  Loader2,
} from "lucide-react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import AddressModal from "@/components/AddressModal";
import { BackendAddress, useCart } from "@/context/CartContext";
import styles from "./page.module.css";

type PaymentMethod = "RAZORPAY" | "COD";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    cart,
    cartLoading,
    subtotal,
    appliedCoupon,
    discountAmount,
    addresses,
    addressesLoading,
    selectedAddressId,
    selectAddress,
    deleteAddress,
    checkoutWithCOD,
    checkoutWithRazorpay,
    isLoggedIn,
    setLoginModalOpen,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BackendAddress | null>(null);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.isPrimary) ||
    addresses[0];

  const billSummary = cart?.billSummary;
  const deliveryFee = billSummary?.deliveryFee ?? 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: BackendAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(id);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty. Please add items before checkout.");
      return;
    }
    if (!selectedAddress) {
      setCheckoutError("Please add and select a delivery address.");
      return;
    }

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      if (paymentMethod === "RAZORPAY") {
        const orderId = await checkoutWithRazorpay(selectedAddress.id);
        router.push(`/order/${orderId}`);
      } else {
        const orderId = await checkoutWithCOD(selectedAddress.id);
        router.push(`/order/${orderId}`);
      }
    } catch (err: any) {
      if (err?.message === "Payment cancelled") {
        setCheckoutError("Payment was cancelled. You can try again or select Cash on Delivery.");
      } else {
        setCheckoutError(err?.message || "Checkout failed. Please try again.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <MobileContainer>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn} aria-label="Go back">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className={styles.headerTitle}>Checkout</h1>
        <div style={{ width: 36 }} />
      </header>

      <main className={styles.main}>
        {cartLoading ? (
          <div className={styles.loadingBox}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Loading checkout...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyCartBox}>
            <ShoppingBag size={48} strokeWidth={1.5} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>Add some items from our collection to complete checkout.</p>
            <button className={styles.browseBtn} onClick={() => router.push("/products")}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* ── 1. DELIVERY ADDRESS SECTION ─────────────────────────── */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <MapPin size={18} className={styles.redPin} />
                  <h2 className={styles.sectionTitle}>DELIVERY ADDRESS</h2>
                </div>
                <button
                  type="button"
                  className={styles.addNewBtn}
                  onClick={handleOpenAddAddress}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Add New</span>
                </button>
              </div>

              {addressesLoading ? (
                <p className={styles.subtext}>Loading saved addresses...</p>
              ) : addresses.length === 0 ? (
                <div className={styles.noAddressCard}>
                  <p>No delivery address saved yet.</p>
                  <button
                    type="button"
                    className={styles.addFirstAddressBtn}
                    onClick={handleOpenAddAddress}
                  >
                    + Add Your Delivery Address
                  </button>
                </div>
              ) : (
                <div className={styles.addressList}>
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddress?.id;
                    const displayName = addr.customerName.toLowerCase().startsWith("home")
                      ? addr.customerName
                      : `Home - ${addr.customerName}`;

                    return (
                      <div
                        key={addr.id}
                        className={`${styles.addressCard} ${isSelected ? styles.addressCardSelected : ""}`}
                        onClick={() => selectAddress(addr.id)}
                      >
                        <div className={styles.addressTopRow}>
                          <div className={styles.addressTitleGroup}>
                            <span className={styles.addressName}>{displayName}</span>
                            {addr.isPrimary && (
                              <span className={styles.badgeDefault}>Default</span>
                            )}
                            {isSelected && (
                              <span className={styles.badgeSelected}>Selected</span>
                            )}
                          </div>
                          <div className={styles.addressActions}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={(e) => handleOpenEditAddress(addr, e)}
                              aria-label="Edit address"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              aria-label="Delete address"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        <p className={styles.addressLine}>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className={styles.addressLine}>{addr.addressLine2}</p>}
                        <p className={styles.addressCity}>
                          {addr.district}, {addr.state}, {addr.pincode}
                        </p>
                        <p className={styles.addressPhone}>Phone: +91 {addr.phoneNumber}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── 2. ORDER ITEMS SECTION ──────────────────────────────── */}
            <section className={styles.sectionCard}>
              <div className={styles.orderItemsHeader}>
                <h2 className={styles.sectionTitleBlack}>
                  Order Items ({cartItems.length})
                </h2>
                <Info size={16} className={styles.infoIcon} />
              </div>

              <div className={styles.itemsList}>
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={styles.orderItemCard}>
                    <div className={styles.itemThumbWrap}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className={styles.itemThumb}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemMeta}>
                        Portion: {item.size || "Standard"} • Price: ₹{item.numericPrice.toFixed(0)} • Qty: {item.quantity}
                      </p>
                      {item.customInstructions && (
                        <p className={styles.customTextNote}>
                          ✍️ Text: {item.customInstructions}
                        </p>
                      )}
                    </div>
                    <div className={styles.itemPriceCol}>
                      <span className={styles.itemTotalPrice}>
                        ₹{(item.numericPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 3. PAYMENT METHOD SECTION ───────────────────────────── */}
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionTitleBlack} style={{ marginBottom: "0.85rem" }}>
                Payment Method
              </h2>

              <div className={styles.paymentMethodsGrid}>
                {/* Razorpay Option */}
                <div
                  className={`${styles.paymentOptionCard} ${
                    paymentMethod === "RAZORPAY" ? styles.paymentOptionActive : ""
                  }`}
                  onClick={() => setPaymentMethod("RAZORPAY")}
                >
                  <div className={styles.paymentOptionLeft}>
                    <div className={styles.shieldIconWrap}>
                      <ShieldCheck size={24} className={styles.shieldIcon} />
                    </div>
                    <div>
                      <h3 className={styles.paymentTitle}>Razorpay Online Payment</h3>
                      <p className={styles.paymentSubtitle}>
                        UPI, GPay, PhonePe, Paytm, Cards & NetBanking (100% Secure)
                      </p>
                    </div>
                  </div>
                  <div className={styles.radioIndicator}>
                    {paymentMethod === "RAZORPAY" ? (
                      <CheckCircle2 size={20} className={styles.checkedRadio} />
                    ) : (
                      <Circle size={20} className={styles.uncheckedRadio} />
                    )}
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  className={`${styles.paymentOptionCard} ${
                    paymentMethod === "COD" ? styles.paymentOptionActive : ""
                  }`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <div className={styles.paymentOptionLeft}>
                    <div className={styles.codIconWrap}>
                      <Banknote size={24} className={styles.codIcon} />
                    </div>
                    <div>
                      <h3 className={styles.paymentTitle}>Cash on Delivery (COD)</h3>
                      <p className={styles.paymentSubtitle}>
                        Pay with cash upon delivery at your doorstep
                      </p>
                    </div>
                  </div>
                  <div className={styles.radioIndicator}>
                    {paymentMethod === "COD" ? (
                      <CheckCircle2 size={20} className={styles.checkedRadio} />
                    ) : (
                      <Circle size={20} className={styles.uncheckedRadio} />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 4. BILL SUMMARY & ACTION ────────────────────────────── */}
            <section className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Item Subtotal</span>
                <span className={styles.summaryValue}>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Coupon Discount</span>
                  <span className={styles.discountValue}>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Delivery Charges</span>
                <span className={styles.summaryValue}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>₹{grandTotal.toFixed(2)}</span>
              </div>

              {checkoutError && (
                <div className={styles.errorAlert}>
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </section>
          </>
        )}
      </main>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={editingAddress}
      />

      <BottomNav />
    </MobileContainer>
  );
}
