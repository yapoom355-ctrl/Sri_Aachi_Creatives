"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, MapPin, Edit2, Trash2 } from "lucide-react";
import { BackendAddress, useCart } from "@/context/CartContext";
import AddressModal from "@/components/AddressModal";
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
    deleteAddress,
    cart,
    isFreeShipping,
    isLoadingShipping,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BackendAddress | null>(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    || addresses.find((a) => a.isPrimary)
    || addresses[0];

  const billSummary = cart?.billSummary;
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
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}-${item.customInstructions || ""}-${item.customImage || ""}-${idx}`}
                    className={styles.cartItem}
                  >
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
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.size,
                            item.color,
                            item.customInstructions,
                            item.customImage
                          )
                        }
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

                      {/* Customization Details Preview */}
                      {item.customInstructions && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#4338ca",
                            background: "#eef2ff",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            margin: "4px 0",
                            wordBreak: "break-word",
                          }}
                        >
                          ✍️ <strong>Text:</strong> {item.customInstructions}
                        </div>
                      )}
                      {item.customImage && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "11px",
                            color: "#065f46",
                            background: "#ecfdf5",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            margin: "4px 0",
                          }}
                        >
                          <img
                            src={item.customImage}
                            alt="Custom upload"
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "3px",
                              objectFit: "cover",
                            }}
                          />
                          <span>Photo attached</span>
                        </div>
                      )}

                      <div className={styles.priceRow}>
                        <span className={styles.itemPrice}>{item.price}</span>
                        {/* Selector Controls */}
                        <div className={styles.quantityControls}>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.color,
                                item.quantity - 1,
                                item.customInstructions,
                                item.customImage
                              )
                            }
                            className={styles.qtyBtn}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} strokeWidth={3} />
                          </button>
                          <span className={styles.qtyText}>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.color,
                                item.quantity + 1,
                                item.customInstructions,
                                item.customImage
                              )
                            }
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

              {/* Delivery Address Section (Matching Screenshot 1) */}
              <div className={styles.addressSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <MapPin size={16} className={styles.redPin} />
                    <h4 className={styles.sectionTitle}>DELIVERY ADDRESS</h4>
                  </div>
                  <button
                    type="button"
                    className={styles.addNewAddressBtn}
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className={styles.noAddressBox}>
                    <p className={styles.noAddressText}>No delivery address saved.</p>
                    <button
                      type="button"
                      className={styles.addAddressLink}
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className={styles.addressCardsList}>
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddress?.id;
                      const displayName = addr.customerName.toLowerCase().startsWith("home")
                        ? addr.customerName
                        : `Home - ${addr.customerName}`;

                      return (
                        <div
                          key={addr.id}
                          className={`${styles.addressCardItem} ${isSelected ? styles.addressCardItemSelected : ""}`}
                          onClick={() => selectAddress(addr.id)}
                        >
                          <div className={styles.addressCardHeader}>
                            <div className={styles.addressBadgeGroup}>
                              <span className={styles.addressCardName}>{displayName}</span>
                              {addr.isPrimary && <span className={styles.badgeDefault}>Default</span>}
                              {isSelected && <span className={styles.badgeSelected}>Selected</span>}
                            </div>
                            <div className={styles.addressActionBtns}>
                              <button
                                type="button"
                                className={styles.cardEditBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAddress(addr);
                                  setIsAddressModalOpen(true);
                                }}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className={styles.cardDeleteBtn}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Delete this address?")) {
                                    await deleteAddress(addr.id);
                                  }
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <p className={styles.cardAddressLine}>{addr.addressLine1}</p>
                          <p className={styles.cardAddressCity}>
                            {addr.district}, {addr.state}, {addr.pincode}
                          </p>
                          <p className={styles.cardAddressPhone}>Phone: +91 {addr.phoneNumber}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Breakdown pricing list */}
              <div className={styles.pricingSummary}>
                <div className={styles.summaryRow}>
                  <span>Item Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountDisplay > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Discount:</span>
                    <span style={{ color: "#22c55e" }}>-₹{discountDisplay.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Delivery Fee:</span>
                  <span style={billSummary?.isFreeDelivery ? { color: "#22c55e", fontWeight: 600 } : undefined}>
                    {billSummary?.isFreeDelivery ? "FREE" : `₹${(deliveryFee > 0 ? deliveryFee : 73).toFixed(2)}`}
                  </span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className={styles.checkoutAction}>
                <button
                  className={styles.checkoutBtn}
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push("/checkout");
                  }}
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

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={editingAddress}
      />
    </>
  );
}
