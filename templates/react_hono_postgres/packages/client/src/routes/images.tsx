import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, X, Trash2, Eye, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/images")({
  component: ImagesPage,
  beforeLoad: () => {
    return { pageTitle: "画像管理" };
  },
});

function ImagesPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    url: string;
    originalName: string;
    size: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const utils = trpc.useUtils();
  const { data: images, isLoading } = trpc.images.getAll.useQuery();

  const requestUploadUrlMutation = trpc.images.requestUploadUrl.useMutation();
  const confirmUploadMutation = trpc.images.confirmUpload.useMutation({
    onSuccess: () => {
      utils.images.getAll.invalidate();
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error(`アップロードに失敗しました: ${error.message}`);
      setUploadProgress(0);
    },
  });

  const deleteMutation = trpc.images.delete.useMutation({
    onSuccess: () => {
      utils.images.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedImage(null);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        toast.error("画像ファイルを選択してください");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("ファイルを選択してください");
      return;
    }

    try {
      setUploadProgress(10);

      // Step 1: Request upload URL
      const { uploadUrl, fileKey } =
        await requestUploadUrlMutation.mutateAsync({
          filename: selectedFile.name,
          contentType: selectedFile.type as any,
          size: selectedFile.size,
        });

      setUploadProgress(30);

      // Step 2: Upload to MinIO
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error("ストレージへのアップロードに失敗しました");
      }

      setUploadProgress(70);

      // Step 3: Confirm upload
      await confirmUploadMutation.mutateAsync({
        fileKey,
        originalName: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
      });

      setUploadProgress(100);
    } catch (error: any) {
      toast.error(`アップロード失敗: ${error.message}`);
      setUploadProgress(0);
    }
  };

  const handleDelete = () => {
    if (!selectedImage) return;
    deleteMutation.mutate({ id: selectedImage.id });
  };

  const openPreviewDialog = (image: any) => {
    setSelectedImage(image);
    setIsPreviewDialogOpen(true);
  };

  const openDeleteDialog = (image: any) => {
    setSelectedImage(image);
    setIsDeleteDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>画像一覧</CardTitle>
              <CardDescription>
                システムに登録されている画像を管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                  <Upload className="size-4" />
                  画像アップロード
                </Button>
              </div>
              {isLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : images && images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => openPreviewDialog(image)}
                >
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreviewDialog(image);
                        }}
                        className="gap-2"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(image);
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.originalName}</p>
                    <p className="text-white/70 text-xs">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="size-24 opacity-20 mb-4" />
              <p className="text-lg mb-2">画像が登録されていません</p>
              <p className="text-sm">「画像アップロード」ボタンから新しい画像を追加してください</p>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>画像アップロード</DialogTitle>
            <DialogDescription>
              アップロードする画像を選択してください（JPEG, PNG, GIF, WebP / 最大10MB）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50",
                selectedFile ? "bg-muted/30" : ""
              )}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="size-12 text-primary" />
                  <p className="text-sm font-medium truncate max-w-full">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-2"
                  >
                    <X className="size-4 mr-2" />
                    選択解除
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="size-12 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    クリックまたはドラッグ＆ドロップ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, GIF, WebP / 最大10MB
                  </p>
                </div>
              )}
            </div>

            {/* プレビュー */}
            {selectedFile && selectedFile.type.startsWith("image/") && (
              <div className="space-y-2">
                <Label>プレビュー</Label>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* アップロード進捗 */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>アップロード中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                setUploadProgress(0);
              }}
              className="flex-1"
              disabled={
                requestUploadUrlMutation.isPending ||
                confirmUploadMutation.isPending
              }
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              onClick={handleUpload}
              className="flex-1"
              disabled={
                !selectedFile ||
                requestUploadUrlMutation.isPending ||
                confirmUploadMutation.isPending
              }
            >
              {requestUploadUrlMutation.isPending ||
              confirmUploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  アップロード中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  アップロード
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>画像プレビュー</DialogTitle>
            <DialogDescription>
              {selectedImage?.originalName}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              {/* 画像プレビュー */}
              <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ maxHeight: '60vh' }}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.originalName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 画像情報 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground">ファイル名</p>
                  <p className="font-medium truncate">{selectedImage.originalName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ファイルサイズ</p>
                  <p className="font-medium">{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">形式</p>
                  <p className="font-medium">{selectedImage.mimeType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">アップロード日時</p>
                  <p className="font-medium">{new Date(selectedImage.createdAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>

              {/* アクション */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewDialogOpen(false)}
                  className="flex-1"
                >
                  閉じる
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.url;
                    link.download = selectedImage.originalName;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="gap-2"
                >
                  <Download className="size-4" />
                  ダウンロード
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                    openDeleteDialog(selectedImage);
                  }}
                  className="gap-2"
                >
                  <Trash2 className="size-4" />
                  削除
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>画像削除確認</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p>
              画像「<span className="font-medium">{selectedImage?.originalName}</span>」を削除しますか？
              この操作は取り消せません。
            </p>
            {selectedImage && (
              <div className="mt-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.originalName}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  削除中...
                </>
              ) : (
                "削除"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
