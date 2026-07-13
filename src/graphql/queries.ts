import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      mobilenumber
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($search: String) {
    categories(search: $search) {
      id
      title
      subtitle
      description
      thumbnail {
        mediaUrl
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($productType: ProductTypeEnum, $search: String) {
    products(productType: $productType, search: $search) {
      id
      title
      subtitle
      description
      price
      effectivePrice
      thumbnail {
        mediaUrl
      }
      categories {
        id
        title
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: UUID!) {
    product(id: $id) {
      id
      title
      subtitle
      description
      price
      effectivePrice
      thumbnail {
        mediaUrl
      }
      media {
        mediaUrl
      }
      categories {
        id
        title
      }
      attributes {
        id
        attributeValue {
          id
          value
          hexCode
          attribute {
            id
            name
            displayName
          }
        }
      }
    }
  }
`;

export const GET_USER_CART = gql`
  query GetUserCart {
    myCart {
      id
      deliveryFee
      deliveryAddressId
      deliveryAddress {
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

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    myAddresses {
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

export const GET_ORDER = gql`
  query GetOrder($id: UUID!) {
    order(id: $id) {
      id
      orderStatus
      paymentStatus
      itemTotal
      discountApplied
      deliveryFee
      tax
      grandTotal
      createdAt
      deliveryAddress {
        customerName
        addressLine1
        district
        state
        pincode
        phoneNumber
      }
      items {
        id
        quantity
        product {
          id
          title
          thumbnail {
            mediaUrl
          }
        }
      }
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    myOrders {
      id
      orderStatus
      paymentStatus
      grandTotal
      createdAt
      items {
        id
        quantity
        product {
          id
          title
          thumbnail {
            mediaUrl
          }
        }
      }
    }
  }
`;

export const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      id
      code
      description
      discountType
      discountValue
      endDate
    }
  }
`;
