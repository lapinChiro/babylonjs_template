import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import EditNameDialog from "./edit-name-dialog";
import { trpc } from "@/utils/trpc";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const { data: currentUser } = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !!session,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);

  if (isPending) {
    return <span>読み込み中...</span>;
  }

  if (!session) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      alert("パスワードは6文字以上で入力してください");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        alert(error.message || "パスワードの変更に失敗しました");
      } else {
        alert("パスワードを変更しました");
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Password change error:", err);
      alert("パスワードの変更に失敗しました");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/",
          });
        },
        onError: () => {
          alert("サインアウトに失敗しました");
        },
      },
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {currentUser?.name || session.user.name}
      </button>

      {isMenuOpen && (
        <div>
          <div>
            <p>{currentUser?.name || session.user.name}</p>
            <p>{session.user.email}</p>
          </div>
          <hr />

          <button
            onClick={() => {
              setIsEditNameDialogOpen(true);
              setIsMenuOpen(false);
            }}
          >
            名前を変更
          </button>

          <button
            onClick={() => {
              setIsPasswordDialogOpen(true);
              setIsMenuOpen(false);
            }}
          >
            パスワードを変更
          </button>

          <hr />
          <button onClick={handleSignOut}>
            サインアウト
          </button>
        </div>
      )}

      {/* Edit Name Dialog */}
      {isEditNameDialogOpen && (
        <EditNameDialog
          currentName={currentUser?.name || session.user.name}
          onClose={() => setIsEditNameDialogOpen(false)}
        />
      )}

      {/* Password Change Dialog */}
      {isPasswordDialogOpen && (
        <div>
          <div>
            <h2>パスワードの変更</h2>
            <p>
              現在のパスワードと新しいパスワードを入力してください。
            </p>
            <div>
              <div>
                <label htmlFor="current-password">現在のパスワード</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワードを入力"
                />
              </div>
              <div>
                <label htmlFor="new-password">新しいパスワード</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワードを入力"
                />
              </div>
              <div>
                <label htmlFor="confirm-password">パスワードの確認</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="新しいパスワードを再入力"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={isChangingPassword}
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? "変更中..." : "パスワードを変更"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
