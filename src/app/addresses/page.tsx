"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, Plus, MapPin, Trash2 } from "lucide-react";
import styles from "./page.module.css";

export default function ShippingAddressesPage() {
  const router = useRouter();
  const {
    addresses,
    addAddress,
    deleteAddress,
    setAddressAsDefault,
  } = useCart();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [cityState, setCityState] = useState("");
  const [country, setCountry] = useState("UK");
  const [phone, setPhone] = useState("");
  const [isDefaultForm, setIsDefaultForm] = useState(false);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !street.trim() || !cityState.trim() || !phone.trim()) {
      alert("Please fill in all address parameters.");
      return;
    }

    addAddress({
      name,
      street,
      cityState,
      country,
      phone,
      isDefault: isDefaultForm,
    });

    setName("");
    setStreet("");
    setCityState("");
    setCountry("UK");
    setPhone("");
    setIsDefaultForm(false);
    setShowAddForm(false);
  };

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
        <h2 className={styles.title}>Shipping Addresses</h2>
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
                  className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ""}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <MapPin size={18} className={styles.pinIcon} />
                      <span className={styles.addressLabel}>{addr.name}</span>
                    </div>
                    {addr.isDefault ? (
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
                    <p className={styles.streetText}>{addr.street}</p>
                    <p className={styles.cityText}>{addr.cityState}, {addr.country}</p>
                    <p className={styles.phoneText}>Phone: {addr.phone}</p>
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

          {/* Add Address Form Block - always rendered, CSS manages mobile overlay vs desktop inline layout */}
          <div className={`${styles.formCol} ${showAddForm ? styles.formColOpen : ""}`}>
            <div className={styles.dragHandle} />
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Add New Address</h3>
              <form onSubmit={handleAddAddress} className={styles.addressForm}>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Name / Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Asha Royden (Home)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 124 Baker Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City & State / Postcode</label>
                  <input
                    type="text"
                    placeholder="e.g. London, NW1 6XE"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Country</label>
                  <input
                    type="text"
                    placeholder="e.g. UK"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +44 20 7946 0958"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="default-checkbox"
                    checked={isDefaultForm}
                    onChange={(e) => setIsDefaultForm(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <label htmlFor="default-checkbox" className={styles.checkboxLabel}>
                    Set as default shipping address
                  </label>
                </div>

                <button type="submit" className={styles.saveBtn}>
                  Save Address
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
