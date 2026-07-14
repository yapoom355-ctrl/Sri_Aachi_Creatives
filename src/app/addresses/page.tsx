"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, Plus, MapPin, Trash2, ShieldAlert } from "lucide-react";
import styles from "./page.module.css";

export default function ShippingAddressesPage() {
  const router = useRouter();
  const {
    addresses,
    addAddress,
    deleteAddress,
    setAddressAsDefault,
    isLoggedIn,
    setLoginModalOpen,
  } = useCart();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !addressLine1.trim() || !district.trim() || !state.trim() || !pincode.trim() || !phoneNumber.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await addAddress({
        customerName: customerName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || null,
        landmark: landmark.trim() || null,
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        phoneNumber: phoneNumber.trim(),
        isPrimary,
      });

      // Reset state
      setCustomerName("");
      setAddressLine1("");
      setAddressLine2("");
      setLandmark("");
      setDistrict("");
      setState("");
      setPincode("");
      setPhoneNumber("");
      setIsPrimary(false);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Shipping Addresses</h2>
          <div className={styles.iconButton} />
        </header>
        <main className={styles.mainContent}>
          <div className={styles.emptyState} style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <ShieldAlert size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p>Please log in to manage your addresses.</p>
            <button
              className={styles.saveBtn}
              style={{ marginTop: "1rem", maxWidth: "200px", margin: "1rem auto 0" }}
              onClick={() => setLoginModalOpen(true)}
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
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>Addresses</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`${styles.iconButton} ${showAddForm ? styles.iconButtonActive : ""}`}
          aria-label="Add new address"
        >
          <Plus size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          
          {/* List of saved addresses */}
          <div className={styles.listCol}>
            <h3 className={styles.sectionTitle}>Saved Addresses</h3>
            <div className={styles.addressesList}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`${styles.addressCard} ${addr.isPrimary ? styles.addressCardDefault : ""}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <MapPin size={18} className={styles.pinIcon} />
                      <span className={styles.addressLabel}>{addr.customerName}</span>
                    </div>
                    {addr.isPrimary ? (
                      <span className={styles.defaultBadge}>Default</span>
                    ) : (
                      <button
                        onClick={() => setAddressAsDefault(addr.id)}
                        className={styles.setDefaultBtn}
                        type="button"
                      >
                        Set Default
                      </button>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.streetText}>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className={styles.streetText}>{addr.addressLine2}</p>}
                    {addr.landmark && <p className={styles.streetText} style={{ opacity: 0.6 }}>Landmark: {addr.landmark}</p>}
                    <p className={styles.cityText}>{addr.district}, {addr.state} — {addr.pincode}</p>
                    <p className={styles.phoneText}>Phone: {addr.phoneNumber}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className={styles.deleteBtn}
                      type="button"
                      aria-label="Delete address"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {addresses.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No shipping addresses saved.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Address Form Block */}
          <div className={`${styles.formCol} ${showAddForm ? styles.formColOpen : ""}`}>
            <div className={styles.dragHandle} />
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Add New Address</h3>
              <form onSubmit={handleAddAddress} className={styles.addressForm}>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Receiver Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Line 1 *</label>
                  <input
                    type="text"
                    placeholder="e.g. 124 Baker Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 2, Apt 4"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Big Ben"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Westminster"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>State *</label>
                  <input
                    type="text"
                    placeholder="e.g. London"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Pincode / Zipcode *</label>
                  <input
                    type="text"
                    placeholder="e.g. NW16XE"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +442079460958"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="default-checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <label htmlFor="default-checkbox" className={styles.checkboxLabel}>
                    Set as default shipping address
                  </label>
                </div>

                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Address"}
                </button>
              </form>
            </div>
          </div>

          {/* Backdrop layer for mobile bottom sheet */}
          {showAddForm && (
            <div className={styles.backdrop} onClick={() => setShowAddForm(false)} />
          )}

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
