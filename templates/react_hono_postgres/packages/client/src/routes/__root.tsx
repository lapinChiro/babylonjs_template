import Header from "@/components/header";
import Loader from "@/components/loader";
import { trpcQueryUtils } from "@/main";
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

export interface RouterAppContext {
  trpcQueryUtils: typeof trpcQueryUtils;
  pageTitle?: string;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  const routerState = useRouterState();

  // ページタイトルの設定（vue_hono_postgresのrouter.beforeEachと同様）
  useEffect(() => {
    const currentRoute = routerState.matches[routerState.matches.length - 1];
    const pageTitle = currentRoute?.context?.pageTitle as string | undefined;

    if (pageTitle) {
      document.title = `${pageTitle} - サンプルシステム`;
    } else {
      document.title = 'サンプルシステム';
    }
  }, [routerState.matches]);

  return (
    <>
      <Header />
      {isFetching && <Loader />}
      <Outlet />
    </>
  );
}
