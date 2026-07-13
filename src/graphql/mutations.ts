import { gql } from "@apollo/client";

// ─── USER AUTH ────────────────────────────────────────────────────────────────
export const LOGIN_WITH_PASSWORD = gql`
  mutation LoginWithPassword($emailOrMobile: String!, $password: String!) {
    loginWithPassword(emailOrMobile: $emailOrMobile, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        mobilenumber
      }
    }
  }
`;

export const SEND_OTP = gql`
  mutation SendOtp($mobilenumber: String!) {
    sendOtp(mobilenumber: $mobilenumber) {
      success
      message
      otp
    }
  }
`;

export const LOGIN_WITH_OTP = gql`
  mutation LoginWithOtp($mobilenumber: String!, $otp: String!) {
    loginWithOtp(mobilenumber: $mobilenumber, otp: $otp) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        firstName
        lastName
        email
        mobilenumber
      }
    }
  }
`;

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
export const UPDATE_ME = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
      id
      firstName
      lastName
      email
      mobilenumber
    }
  }
`;

// ─── CART ─────────────────────────────────────────────────────────────────────
export const ADD_TO_CART = gql`
  mutation AddToCart($productId: UUID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        product {
          id
          title
          price
          effectivePrice
          thumbnail {
            mediaUrl
          }
        }
      }
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($productId: UUID!, $quantity: Int!) {
    updateCartItem(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        product {
          id
          title
          price
          effectivePrice
          thumbnail {
            mediaUrl
          }
        }
      }
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: UUID!) {
    removeFromCart(productId: $productId) {
      id
      items {
        id
        quantity
        product {
          id
          title
        }
      }
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      id
      items {
        id
      }
    }
  }
`;

export const APPLY_COUPON_TO_CART = gql`
  mutation ApplyCouponToCart($code: String!) {
    applyCouponToCart(code: $code) {
      id
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

export const REMOVE_COUPON_FROM_CART = gql`
  mutation RemoveCouponFromCart($code: String!) {
    removeCouponFromCart(code: $code) {
      id
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const CREATE_USER_ADDRESS = gql`
  mutation CreateUserAddress($input: CreateUserAddressInput!) {
    createUserAddress(input: $input) {
      id
      customerName
      addressLine1
      addressLine2
      landmark
      district
      state
      pincode
      phoneNumber
      isPrimary
    }
  }
`;

export const UPDATE_USER_ADDRESS = gql`
  mutation UpdateUserAddress($id: UUID!, $input: UpdateUserAddressInput!) {
    updateUserAddress(id: $id, input: $input) {
      id
      customerName
      addressLine1
      addressLine2
      district
      state
      pincode
      phoneNumber
      isPrimary
    }
  }
`;

export const DELETE_USER_ADDRESS = gql`
  mutation DeleteUserAddress($id: UUID!) {
    deleteUserAddress(id: $id)
  }
`;

// ─── CHECKOUT & ORDERS ────────────────────────────────────────────────────────
export const SELECT_DELIVERY_OPTION = gql`
  mutation SelectDeliveryOption($addressId: UUID!, $serviceName: String!) {
    selectDeliveryOption(addressId: $addressId, serviceName: $serviceName) {
      id
      deliveryFee
      deliveryService
      estimatedDays
      deliveryAddressId
      billSummary {
        itemTotal
        discountApplied
        deliveryFee
        tax
        grandTotal
      }
    }
  }
`;

export const CHECKOUT_CART = gql`
  mutation CheckoutCart($paymentMethod: String!) {
    checkoutCart(paymentMethod: $paymentMethod) {
      id
      orderStatus
      paymentStatus
      grandTotal
      itemTotal
      discountApplied
      deliveryFee
      tax
      createdAt
    }
  }
`;

// ─── RAZORPAY PAYMENT ─────────────────────────────────────────────────────────
export const INITIATE_ONLINE_PAYMENT = gql`
  mutation InitiateOnlinePayment($orderId: UUID!) {
    initiateOnlinePayment(orderId: $orderId) {
      key
      amount
      currency
      name
      orderId
    }
  }
`;

export const VERIFY_ONLINE_PAYMENT = gql`
  mutation VerifyOnlinePayment(
    $razorpayOrderId: String!
    $razorpayPaymentId: String!
    $razorpaySignature: String!
  ) {
    verifyOnlinePayment(
      razorpayOrderId: $razorpayOrderId
      razorpayPaymentId: $razorpayPaymentId
      razorpaySignature: $razorpaySignature
    ) {
      id
      orderStatus
      paymentStatus
      grandTotal
    }
  }
`;
