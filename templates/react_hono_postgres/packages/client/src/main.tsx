import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { httpBatchLink } from "@trpc/client";
import { createTRPCQueryUtils } from "@trpc/react-query";
import ReactDOM from "react-dom/client";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { trpc } from "./utils/trpc";
import "./index.css";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(error.message);
    },
  }),
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

const router = createRouter({
  routeTree,
  basepath: (import.meta.env.BASE_URL || '/') as string,
  defaultPreload: "intent",
  context: { trpcQueryUtils },
  defaultPendingComponent: () => <Loader />,
  Wrap: function WrapComponent({ children }) {
    return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    );
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
