import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  beforeLoad: () => {
    return { pageTitle: "ダッシュボード" };
  },
});

function DashboardPage() {
  // Items state
  const [newItemName, setNewItemName] = useState("");

  // Images state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Items queries and mutations
  const { data: items, isLoading: isLoadingItems } = trpc.items.getAll.useQuery();

  const createItemMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      utils.items.getAll.invalidate();
      setNewItemName("");
    },
    onError: (error) => {
      alert(`作成に失敗しました: ${error.message}`);
    },
  });

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      utils.items.getAll.invalidate();
    },
    onError: (error) => {
      alert(`削除に失敗しました: ${error.message}`);
    },
  });

  // Images queries and mutations
  const { data: images, isLoading: isLoadingImages } = trpc.images.getAll.useQuery();

  const requestUploadUrlMutation = trpc.images.requestUploadUrl.useMutation();
  const confirmUploadMutation = trpc.images.confirmUpload.useMutation({
    onSuccess: () => {
      utils.images.getAll.invalidate();
      setIsUploading(false);
    },
    onError: (error) => {
      alert(`アップロードに失敗しました: ${error.message}`);
      setIsUploading(false);
    },
  });

  const deleteImageMutation = trpc.images.delete.useMutation({
    onSuccess: () => {
      utils.images.getAll.invalidate();
    },
    onError: (error) => {
      alert(`削除に失敗しました: ${error.message}`);
    },
  });

  // Item handlers
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      alert("アイテム名を入力してください");
      return;
    }
    createItemMutation.mutate({ name: newItemName });
  };

  const handleDeleteItem = (id: number) => {
    deleteItemMutation.mutate({ id });
  };

  // Image handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    try {
      setIsUploading(true);

      const { uploadUrl, fileKey } =
        await requestUploadUrlMutation.mutateAsync({
          filename: file.name,
          contentType: file.type as any,
          size: file.size,
        });

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!response.ok) {
        throw new Error("ストレージへのアップロードに失敗しました");
      }

      await confirmUploadMutation.mutateAsync({
        fileKey,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error: any) {
      alert(`アップロード失敗: ${error.message}`);
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = (id: number) => {
    deleteImageMutation.mutate({ id });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div>
      <main>
        {/* Items Section */}
        <section>
          <h2>アイテム一覧</h2>
          <div>
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="アイテム名を入力"
            />
            <button
              onClick={handleCreateItem}
              disabled={!newItemName.trim() || createItemMutation.isPending}
            >
              {createItemMutation.isPending ? "追加中..." : "追加"}
            </button>
          </div>
          {isLoadingItems ? (
            <div>読み込み中...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>行番号</th>
                  <th>アイテム名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items && items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItemMutation.isPending}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <p>アイテムが登録されていません</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Images Section */}
        <section>
          <div>
            <h2>画像一覧</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "アップロード中..." : "画像アップロード"}
            </button>
          </div>
          {isLoadingImages ? (
            <div>読み込み中...</div>
          ) : images && images.length > 0 ? (
            <div>
              {images.map((image) => (
                <div key={image.id}>
                  <img
                    src={image.url}
                    alt={image.originalName}
                    loading="lazy"
                  />
                  <div>
                    <p>{image.originalName}</p>
                    <p>{formatFileSize(image.size)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deleteImageMutation.isPending}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>画像が登録されていません</p>
          )}
        </section>
      </main>
    </div>
  );
}
