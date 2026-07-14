"use client";

import { ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { ApolloProvider as Provider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL ||
    "https://gubera-2-0-backend-fastapi-graphql.vercel.app/graphql",
});

// Attach x-tenant-id and Bearer token (only when token exists)
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    headers: {
      ...headers,
      "x-tenant-id":
        process.env.NEXT_PUBLIC_TENANT_ID ||
        "4c7b9c85-0963-49ba-bd2f-7776a0be4b71",
      // Never send authorization header with empty/null value — backend treats it as invalid
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Intercept auth errors: if the backend says token is invalid, clear it so
// subsequent requests (products, categories, etc.) work without the bad token.
const errorLink = onError((errorObj: any) => {
  const { graphQLErrors } = errorObj;
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const msg: string = err.message || "";
      const isAuthError =
        msg.toLowerCase().includes("invalid token") ||
        msg.toLowerCase().includes("token format") ||
        msg.toLowerCase().includes("not authenticated") ||
        msg.toLowerCase().includes("unauthorized");

      if (isAuthError && typeof window !== "undefined") {
        // Clear the bad token so future requests go through cleanly
        localStorage.removeItem("token");
        console.warn("[Apollo] Cleared invalid/expired auth token:", msg);
      }
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ["productType", "search"],
          },
          categories: {
            keyArgs: ["search"],
          },
        },
      },
    },
  }),
});

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
}

// Export client so CartContext can call client.clearStore() on logout
export { client as apolloClient };
