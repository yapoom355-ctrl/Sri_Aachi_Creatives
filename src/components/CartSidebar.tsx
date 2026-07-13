"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";

export default function CartSidebar() {
  const router = useRouter();
  const {
    cartItems,
    isSidebarOpen,
    setSidebarOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    addresses,
    selectedAddressId,
    selectAddress,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [isSelectingAddress, setIsSelectingAddress] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    || addresses.find((a) => a.isPrimary)
    || addresses[0];

  const billSummary = useCart().cart?.billSummary;
  const deliveryFee = billSummary?.deliveryFee ?? 0;
  const discountDisplay = billSummary?.discountApplied ?? discountAmount;
  const totalAmount = billSummary?.grandTotal ?? Math.max(0, subtotal - discountDisplay + deliveryFee);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await applyCoupon(promoCode);
    if (success) {
      alert(`✅ Coupon "${promoCode.toUpperCase()}" applied!`);
    } else {
      alert("❌ Invalid or expired coupon code.");
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.backdrop} ${isSidebarOpen ? styles.backdropVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <button
            onClick={() => setSidebarOpen(false)}
            className={styles.closeButton}
            aria-label="Close cart"
          >
            <X size={20} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Cart</h2>
          <div className={styles.headerSpacer} />
        </div>

        <div className={styles.content}>
          {cartItems.length > 0 ? (
            <>
              {/* Cart Items List */}
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className={styles.cartItem}>
                    {/* Image with dismiss badge */}
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

                    {/* Description Details */}
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemSubtitle}>{item.subtitle}</p>
                      <span className={styles.itemSize}>{item.size}</span>
                      
                      <div className={styles.priceRow}>
                        <span className={styles.itemPrice}>{item.price}</span>
                        {/* Selector Controls */}
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

              {/* Promo input field */}
              <form onSubmit={handleApplyPromo} className={styles.promoForm}>
                <input
                  type="text"
                  placeholder="Enter Discount code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className={styles.promoInput}
                />
                <button type="submit" className={styles.promoButton}>
                  Apply code
                </button>
              </form>

              <div className={styles.couponsLinkContainer}>
                <button
                  type="button"
                  className={styles.couponsLink}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push("/coupons");
                  }}
                >
                  View Available Coupons
                </button>
              </div>

              {/* Shipping Address Section */}
              <div className={styles.addressSection}>
                <div className={styles.sectionHeader}>
                  <h4 className={styles.sectionTitle}>Shipping Address</h4>
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

                {addresses.length === 0 ? (
                  <div className={styles.noAddressBox}>
                    <p className={styles.noAddressText}>No shipping addresses saved.</p>
                    <button
                      type="button"
                      className={styles.addAddressLink}
                      onClick={() => {
                        setSidebarOpen(false);
                        router.push("/addresses");
                      }}
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Always show selected address card first */}
                    {selectedAddress && (
                      <div className={styles.selectedAddressCard}>
                        <div className={styles.selectedHeader}>
                          <span className={styles.selectedName}>{selectedAddress.customerName}</span>
                          {selectedAddress.isPrimary && (
                            <span className={styles.miniBadge}>Default</span>
                          )}
                        </div>
                        <p className={styles.selectedStreet}>{selectedAddress.addressLine1}</p>
                        <p className={styles.selectedCity}>{selectedAddress.district}, {selectedAddress.state} — {selectedAddress.pincode}</p>
                      </div>
                    )}

                    {/* Show other addresses list and inline manage button when selecting */}
                    {isSelectingAddress && (
                      <div className={styles.otherAddressesSection}>
                        <span className={styles.otherAddressesTitle}>Choose another address:</span>
                        {addresses.filter((addr) => addr.id !== selectedAddress?.id).length === 0 ? (
                          <p className={styles.noOtherText}>No other addresses saved.</p>
                        ) : (
                          <div className={styles.addressSelectorList}>
                            {addresses
                              .filter((addr) => addr.id !== selectedAddress?.id)
                              .map((addr) => (
                                <div
                                  key={addr.id}
                                  className={styles.selectorCard}
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
                                  <p className={styles.selectorCity}>{addr.district}, {addr.state}</p>
                                </div>
                              ))}
                          </div>
                        )}
                        <button
                          type="button"
                          className={styles.manageAddressBtnInline}
                          onClick={() => {
                            setSidebarOpen(false);
                            router.push("/addresses");
                          }}
                        >
                          Manage Addresses
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Breakdown pricing list */}
              <div className={styles.pricingSummary}>
                 <div className={styles.summaryRow}>
                   <span>Sub total:</span>
                   <span>₹{subtotal.toFixed(2)}</span>
                 </div>
                 {discountDisplay > 0 && (
                   <div className={styles.summaryRow}>
                     <span>Discount:</span>
                     <span style={{ color: "#22c55e" }}>-₹{discountDisplay.toFixed(2)}</span>
                   </div>
                 )}
                 {deliveryFee > 0 && (
                   <div className={styles.summaryRow}>
                     <span>Delivery:</span>
                     <span>₹{deliveryFee.toFixed(2)}</span>
                   </div>
                 )}
                 <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                   <span>Total:</span>
                   <span>₹{totalAmount.toFixed(2)}</span>
                 </div>
              </div>

              {/* Checkout Button */}
              <div className={styles.checkoutAction}>
                <button
                  className={styles.checkoutBtn}
                  type="button"
                  onClick={() => { setSidebarOpen(false); router.push("/cart"); }}
                >
                  Proceed to checkout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Your cart is empty</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
