import { authClient } from "@/lib/auth-client";
import { Package, Image, LogOut } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "./ui/button";
import DarkModeToggle from "./dark-mode-toggle";

export default function Header() {
  const { data: session } = authClient.useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  if (!session) return null;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">サンプルシステム</h1>
          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/items">
              <Button
                variant={currentPath === "/items" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Package className="size-4" />
                アイテム
              </Button>
            </Link>
            <Link to="/images">
              <Button
                variant={currentPath === "/images" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Image className="size-4" />
                画像
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.email}
          </span>
          <DarkModeToggle />
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
