import { gql } from "@apollo/client";

// ─── USER AUTH & ACCOUNT ──────────────────────────────────────────────────────
export const OTP_REQUEST = gql`
  mutation OtpRequest($phone: String!) {
    otpRequest(phone: $phone) {
      success
      errors {
        field
        message
        code
      }
    }
  }
`;

export const OTP_CONFIRM = gql`
  mutation OtpConfirm($phone: String!, $otp: String!) {
    otpConfirm(phone: $phone, otp: $otp) {
      token
      refreshToken
      csrfToken
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const LOGIN_WITH_PASSWORD = gql`
  mutation TokenCreate($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      csrfToken
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const ACCOUNT_REGISTER = gql`
  mutation AccountRegister($input: AccountRegisterInput!) {
    accountRegister(input: $input) {
      requiresConfirmation
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const TOKEN_REFRESH = gql`
  mutation TokenRefresh($refreshToken: String!) {
    tokenRefresh(refreshToken: $refreshToken) {
      token
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_ME = gql`
  mutation AccountUpdate($input: AccountInput!) {
    accountUpdate(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

// ─── CHECKOUT & CART ──────────────────────────────────────────────────────────
export const CHECKOUT_CREATE = gql`
  mutation CheckoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      created
      checkout {
        id
        token
        totalPrice {
          gross {
            amount
            currency
          }
        }
        lines {
          id
          quantity
          variant {
            id
            name
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_LINES_ADD = gql`
  mutation CheckoutLinesAdd($checkoutId: ID, $lines: [CheckoutLineInput!]!) {
    checkoutLinesAdd(id: $checkoutId, lines: $lines) {
      checkout {
        id
        lines {
          id
          quantity
          variant {
            id
            name
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_LINES_UPDATE = gql`
  mutation CheckoutLinesUpdate($checkoutId: ID, $lines: [CheckoutLineUpdateInput!]!) {
    checkoutLinesUpdate(id: $checkoutId, lines: $lines) {
      checkout {
        id
        lines {
          id
          quantity
          variant {
            id
            name
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_LINE_DELETE = gql`
  mutation CheckoutLineDelete($checkoutId: ID, $lineId: ID!) {
    checkoutLineDelete(id: $checkoutId, lineId: $lineId) {
      checkout {
        id
        lines {
          id
          quantity
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const CREATE_USER_ADDRESS = gql`
  mutation AccountAddressCreate($input: AddressInput!, $type: AddressTypeEnum) {
    accountAddressCreate(input: $input, type: $type) {
      address {
        id
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        countryArea
        phone
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const DELETE_USER_ADDRESS = gql`
  mutation AccountAddressDelete($id: ID!) {
    accountAddressDelete(id: $id) {
      address {
        id
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_USER_ADDRESS = gql`
  mutation AccountAddressUpdate($id: ID!, $input: AddressInput!) {
    accountAddressUpdate(id: $id, input: $input) {
      address {
        id
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        countryArea
        phone
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const SET_DEFAULT_ADDRESS = gql`
  mutation AccountSetDefaultAddress($id: ID!, $type: AddressTypeEnum!) {
    accountSetDefaultAddress(id: $id, type: $type) {
      user {
        id
        defaultShippingAddress {
          id
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_SHIPPING_ADDRESS_UPDATE = gql`
  mutation CheckoutShippingAddressUpdate($checkoutId: ID, $shippingAddress: AddressInput!) {
    checkoutShippingAddressUpdate(id: $checkoutId, shippingAddress: $shippingAddress) {
      checkout {
        id
        shippingAddress {
          id
          firstName
          lastName
          streetAddress1
          city
          postalCode
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_COMPLETE = gql`
  mutation CheckoutComplete($checkoutId: ID!) {
    checkoutComplete(id: $checkoutId) {
      order {
        id
        number
        status
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_ADD_PROMO_CODE = gql`
  mutation CheckoutAddPromoCode($checkoutId: ID!, $promoCode: String!) {
    checkoutAddPromoCode(id: $checkoutId, promoCode: $promoCode) {
      checkout {
        id
        discount {
          amount
          currency
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CHECKOUT_REMOVE_PROMO_CODE = gql`
  mutation CheckoutRemovePromoCode($checkoutId: ID!, $promoCode: String!) {
    checkoutRemovePromoCode(id: $checkoutId, promoCode: $promoCode) {
      checkout {
        id
        discount {
          amount
          currency
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

