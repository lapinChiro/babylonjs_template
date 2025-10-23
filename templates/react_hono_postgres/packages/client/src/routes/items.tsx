import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/items")({
  component: ItemsPage,
  beforeLoad: () => {
    return { pageTitle: "アイテム管理" };
  },
});

function ItemsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editItemName, setEditItemName] = useState("");

  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.items.getAll.useQuery();

  const createMutation = trpc.items.create.useMutation({
    onSuccess: () => {
      utils.items.getAll.invalidate();
      setIsAddDialogOpen(false);
      setNewItemName("");
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
    },
  });

  const updateMutation = trpc.items.update.useMutation({
    onSuccess: () => {
      utils.items.getAll.invalidate();
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const deleteMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      utils.items.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newItemName.trim()) {
      toast.error("アイテム名を入力してください");
      return;
    }
    createMutation.mutate({ name: newItemName });
  };

  const handleUpdate = () => {
    if (!selectedItem || !editItemName.trim()) {
      toast.error("アイテム名を入力してください");
      return;
    }
    updateMutation.mutate({ id: selectedItem.id, name: editItemName });
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    deleteMutation.mutate({ id: selectedItem.id });
  };

  const openEditDialog = (item: { id: number; name: string }) => {
    setSelectedItem(item);
    setEditItemName(item.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: { id: number; name: string }) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>アイテム一覧</CardTitle>
              <CardDescription>
                システムに登録されているアイテムを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="size-4" />
                  アイテム追加
                </Button>
              </div>
              {isLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : (
                <div className="card-container">
                  <div className="sm:overflow-x-auto sm:whitespace-nowrap">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-20 font-semibold">行番号</TableHead>
                          <TableHead className="font-semibold">アイテム名</TableHead>
                          <TableHead className="w-32 font-semibold">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items && items.length > 0 ? (
                          items.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(item)}
                                    className="size-8 p-0"
                                  >
                                    <Edit className="size-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog(item)}
                                    className="size-8 p-0"
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Package className="size-12 opacity-20" />
                                <p className="text-lg">アイテムが登録されていません</p>
                                <p className="text-sm">「アイテム追加」ボタンから新しいアイテムを追加してください</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>アイテム追加</DialogTitle>
            <DialogDescription>
              新しいアイテムの情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">アイテム名</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="アイテム名を入力"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newItemName.trim() || createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  追加中...
                </>
              ) : (
                "追加"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>アイテム編集</DialogTitle>
            <DialogDescription>
              アイテム情報を編集してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">アイテム名</Label>
              <Input
                id="edit-name"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder="アイテム名を入力"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editItemName.trim() || updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                "更新"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>アイテム削除確認</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p>
              アイテム「<span className="font-medium">{selectedItem?.name}</span>」を削除しますか？
              この操作は取り消せません。
            </p>
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
