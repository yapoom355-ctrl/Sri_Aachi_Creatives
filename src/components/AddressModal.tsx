"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Check } from "lucide-react";
import { BackendAddress, useCart } from "@/context/CartContext";
import styles from "./AddressModal.module.css";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: BackendAddress | null;
}

export default function AddressModal({ isOpen, onClose, addressToEdit }: AddressModalProps) {
  const { addAddress, updateAddress, selectAddress, user } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setCustomerName(addressToEdit.customerName || "");
      setPhoneNumber(addressToEdit.phoneNumber || "");
      setAddressLine1(addressToEdit.addressLine1 || "");
      setAddressLine2(addressToEdit.addressLine2 || "");
      setDistrict(addressToEdit.district || "");
      setState(addressToEdit.state || "");
      setPincode(addressToEdit.pincode || "");
      setIsPrimary(!!addressToEdit.isPrimary);
    } else {
      setCustomerName(user?.name && !user.name.toLowerCase().startsWith("user") ? user.name : "");
      const cleanPhone = (user?.phone || "").replace(/\D/g, "").slice(-10);
      setPhoneNumber(cleanPhone);
      setAddressLine1("");
      setAddressLine2("");
      setDistrict("");
      setState("");
      setPincode("");
      setIsPrimary(false);
    }
    setError("");
  }, [addressToEdit, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!addressLine1.trim()) {
      setError("Please enter street address / house details.");
      return;
    }
    if (!district.trim()) {
      setError("Please enter city / district.");
      return;
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setIsSaving(true);
    try {
      if (addressToEdit?.id) {
        await updateAddress(addressToEdit.id, {
          customerName: customerName.trim(),
          phoneNumber: cleanPhone,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || null,
          district: district.trim(),
          state: state.trim() || "Tamil Nadu",
          pincode: pincode.trim(),
          isPrimary,
        });
        selectAddress(addressToEdit.id);
      } else {
        await addAddress({
          customerName: customerName.trim(),
          phoneNumber: cleanPhone,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || null,
          landmark: null,
          district: district.trim(),
          state: state.trim() || "Tamil Nadu",
          pincode: pincode.trim(),
          isPrimary,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconCircle}>
              <MapPin size={18} className={styles.pinIcon} />
            </div>
            <h3 className={styles.title}>
              {addressToEdit ? "Edit Delivery Address" : "Add New Delivery Address"}
            </h3>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                type="text"
                placeholder="e.g. Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile Number *</label>
              <div className={styles.phoneInputWrap}>
                <span className={styles.phonePrefix}>+91</span>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>House No, Building, Street / Ward *</label>
            <input
              type="text"
              placeholder="e.g. Ward 147, Anna Nagar"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Apartment, Suite, Landmark (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Near Bus Stand / Landmark"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.rowThree}>
            <div className={styles.field}>
              <label className={styles.label}>City / District *</label>
              <input
                type="text"
                placeholder="e.g. Chennai, Salem"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State *</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>PIN Code *</label>
              <input
                type="text"
                placeholder="6-digit PIN"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className={styles.input}
                required
              />
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Set as default shipping address</span>
          </label>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={styles.saveBtn}>
              {isSaving ? "Saving..." : addressToEdit ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
