import { authClient } from "@/lib/auth-client";

export default function Header() {
  const { data: session } = authClient.useSession();

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
    <header>
      <div>
        <h1>サンプルシステム</h1>
        <div>
          <span>
            {session.user.email}
          </span>
          <button onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
