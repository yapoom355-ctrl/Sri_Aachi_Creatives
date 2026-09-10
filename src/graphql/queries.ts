import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      defaultShippingAddress {
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
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($first: Int = 100) {
    categories(first: $first) {
      edges {
        node {
          id
          name
          slug
          description
          backgroundImage {
            url
            alt
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($channel: String = "sri-aachi-creatives", $first: Int = 100, $search: String) {
    products(channel: $channel, first: $first, search: $search) {
      edges {
        node {
          id
          name
          slug
          description
          thumbnail(size: 1024) {
            url
            alt
          }
          media {
            id
            url
            alt
            type
          }
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          category {
            id
            name
            slug
          }
          variants {
            id
            name
            sku
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID, $slug: String, $channel: String = "sri-aachi-creatives") {
    product(id: $id, slug: $slug, channel: $channel) {
      id
      name
      slug
      description
      thumbnail(size: 1024) {
        url
        alt
      }
      media {
        id
        url
        alt
        type
      }
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
      category {
        id
        name
        slug
      }
      variants {
        id
        name
        sku
        pricing {
          price {
            gross {
              amount
              currency
            }
          }
        }
        attributes {
          attribute {
            id
            name
          }
          values {
            id
            name
            value
          }
        }
      }
    }
  }
`;

export const GET_USER_CART = gql`
  query GetCheckout($id: ID!) {
    checkout(id: $id) {
      id
      token
      lines {
        id
        quantity
        variant {
          id
          name
          pricing {
            price {
              gross {
                amount
                currency
              }
            }
          }
          product {
            id
            name
            thumbnail {
              url
            }
          }
        }
      }
      totalPrice {
        gross {
          amount
          currency
        }
      }
      subtotalPrice {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      discount {
        amount
        currency
      }
      shippingAddress {
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
    }
  }
`;

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    me {
      id
      addresses {
        id
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        countryArea
        phone
        isDefaultShippingAddress
        isDefaultBillingAddress
      }
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($first: Int = 20) {
    me {
      id
      orders(first: $first) {
        edges {
          node {
            id
            number
            created
            status
            total {
              gross {
                amount
                currency
              }
            }
            lines {
              id
              productName
              quantity
              thumbnail(size: 1024) {
                url
              }
              unitPrice {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      number
      created
      status
      isPaid
      paymentStatus
      subtotal {
        gross {
          amount
          currency
        }
      }
      fulfillments {
        id
        status
        statusDisplay
        trackingNumber
        created
      }
      total {
        gross {
          amount
          currency
        }
      }
      undiscountedTotal {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      metadata {
        key
        value
      }
      shippingAddress {
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        countryArea
        phone
      }
      lines {
        id
        productName
        quantity
        thumbnail(size: 1024) {
          url
        }
        unitPrice {
          gross {
            amount
            currency
          }
        }
        metadata {
          key
          value
        }
      }
    }
  }
`;

export const GET_COUPONS = gql`
  query GetVouchers($first: Int = 20, $channel: String = "default-channel") {
    vouchers(first: $first, channel: $channel) {
      edges {
        node {
          id
          name
          code
          discountValue
          type
        }
      }
    }
  }
`;
