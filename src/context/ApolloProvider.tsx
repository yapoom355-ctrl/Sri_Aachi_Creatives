"use client";

import { ReactNode } from "react";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  Observable,
  from,
} from "@apollo/client";
import { ApolloProvider as Provider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL ||
    "https://sriaachicreatives.udayamarketing.in/graphql/",
});

// Attach Bearer token when token exists in localStorage
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Only attach valid JWT tokens (skip mock/session tokens)
  const isValidJwt =
    Boolean(token) &&
    !token?.startsWith("session-auth-") &&
    token?.split(".").length === 3;

  return {
    headers: {
      ...headers,
      ...(isValidJwt ? { authorization: `JWT ${token}` } : {}),
    },
  };
});

// Intercept auth errors
const errorLink = onError((errorObj: any) => {
  const { graphQLErrors } = errorObj;
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const msg: string = err.message || "";
      const lmsg = msg.toLowerCase();

      // Saleor permission errors (user not logged in visiting protected pages)
      // Suppress these silently — the UI handles the empty state
      if (
        lmsg.includes("authenticated_user") ||
        lmsg.includes("authenticated_app") ||
        lmsg.includes("you need one of the following permissions") ||
        lmsg.includes("permission denied")
      ) {
        console.warn("[Apollo] Protected query called without auth. User needs to log in.");
        return; // suppress — don't crash the app
      }

      // Clear bad / expired tokens
      if (
        lmsg.includes("invalid token") ||
        lmsg.includes("token format") ||
        lmsg.includes("signature has expired") ||
        lmsg.includes("not authenticated") ||
        lmsg.includes("unauthorized")
      ) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          console.warn("[Apollo] Cleared invalid/expired auth token:", msg);
        }
      }
    }
  }
});

// Real-time console logger for all GraphQL requests & responses
const loggerLink = new ApolloLink((operation, forward) => {
  const opName = operation.operationName || "GraphQL Operation";
  console.log(
    `%c📡 [GraphQL Sent] %c${opName} %c-> https://sriaachicreatives.udayamarketing.in/graphql/`,
    "color: #3b82f6; font-weight: bold",
    "color: #10b981; font-weight: bold",
    "color: #6b7280",
    operation.variables
  );

  return new Observable((observer) => {
    const handle = forward(operation).subscribe({
      next: (response: any) => {
        if (response.errors) {
          console.warn(`❌ [GraphQL Error] ${opName}:`, response.errors);
        } else {
          console.log(`✅ [GraphQL Received] ${opName}:`, response.data);
        }
        observer.next(response);
      },
      error: (err: any) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => handle.unsubscribe();
  });
});

const client = new ApolloClient({
  link: from([errorLink, loggerLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ["channel", "search", "filter"],
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
