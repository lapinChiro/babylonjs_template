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
          ) : items && items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>行番号</th>
                  <th>アイテム名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
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
                ))}
              </tbody>
            </table>
          ) : (
            <p>アイテムが登録されていません</p>
          )}
        </section>

        {/* Images Section */}
        <section>
          <h2>画像一覧</h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "アップロード中..." : "アップロード"}
            </button>
          </div>
          {isLoadingImages ? (
            <div>読み込み中...</div>
          ) : images && images.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>行番号</th>
                  <th>画像</th>
                  <th>ファイル名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image, index) => (
                  <tr key={image.id}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={image.url}
                        alt={image.originalName}
                        width="50"
                        height="50"
                      />
                    </td>
                    <td>{image.originalName}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>画像が登録されていません</p>
          )}
        </section>
      </main>
    </div>
  );
}
