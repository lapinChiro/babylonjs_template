<template>
  <div class="w-full">
    <!-- ヘッダー -->
    <div class="mb-6">
      <Button @click="showAddDialog = true" class="gap-2">
        <Plus class="size-4" />
        アイテム追加
      </Button>
    </div>

    <!-- アイテムテーブル -->
    <div class="card-container">
      <div class="sm:overflow-x-auto sm:whitespace-nowrap">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50">
              <TableHead class="w-20 font-semibold">行番号</TableHead>
              <TableHead class="font-semibold">アイテム名</TableHead>
              <TableHead class="w-32 font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TransitionGroup
            name="list"
            tag="tbody"
            class="divide-y"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform translate-x-4"
            enter-to-class="opacity-100 transform translate-x-0"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 transform translate-x-0"
            leave-to-class="opacity-0 transform -translate-x-4"
            move-class="transition-transform duration-300"
          >
            <TableRow
              v-for="(item, index) in currentItems"
              :key="item.id"
              class="hover:bg-muted/30 transition-colors duration-150"
            >
              <TableCell class="font-mono text-sm">
                {{ generateRowNumber(index) }}
              </TableCell>
              <TableCell class="font-medium">
                {{ item.name }}
              </TableCell>
              <TableCell>
                <div class="flex gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleEditItem(item)"
                    class="button-action size-8 p-0"
                    :aria-label="`${item.name}を編集`"
                  >
                    <Edit class="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleDeleteButtonClick(item)"
                    class="button-destructive-action"
                    :aria-label="`${item.name}を削除`"
                  >
                    <Trash2 class="size-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="currentItems.length === 0" key="empty">
              <TableCell colspan="3" class="text-center py-12">
                <div class="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package class="size-12 opacity-20" />
                  <p class="text-lg">アイテムが登録されていません</p>
                  <p class="text-sm">「アイテム追加」ボタンから新しいアイテムを追加してください</p>
                </div>
              </TableCell>
            </TableRow>
          </TransitionGroup>
        </Table>
      </div>
    </div>

    <!-- ページネーション -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-4"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-4"
    >
      <div v-if="totalPages > 1" class="responsive-flex-container mt-6">
        <div class="flex-center gap-2 text-sm text-muted-foreground">
          <span>ページ {{ currentPage }} / {{ totalPages }}</span>
          <span>（全 {{ itemsStore.filteredItems.length }} 件）</span>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="handlePreviousPage"
            :disabled="currentPage === 1"
            class="button-action gap-2"
          >
            <ChevronLeft class="size-4" />
            前へ
          </Button>

          <div class="flex items-center gap-1">
            <TransitionGroup
              name="pagination"
              tag="div"
              class="flex items-center gap-1"
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0"
            >
              <Button
                v-for="page in pageNumbers"
                :key="`page-${page}`"
                :variant="page === currentPage ? 'default' : 'outline'"
                size="sm"
                @click="setCurrentPage(page)"
                class="size-8 p-0 transition-all duration-200"
                :class="{
                  'scale-110 shadow-md': page === currentPage,
                  'hover:scale-105': page !== currentPage
                }"
              >
                {{ page }}
              </Button>
            </TransitionGroup>
          </div>

          <Button
            variant="outline"
            size="sm"
            @click="handleNextPage"
            :disabled="currentPage === totalPages"
            class="button-action gap-2"
          >
            次へ
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>
    </Transition>

    <!-- アイテム追加ダイアログ -->
    <ItemAddDialog
      :open="showAddDialog"
      @close="showAddDialog = false"
      @add="handleAddItem"
    />

    <!-- アイテム編集ダイアログ -->
    <ItemEditDialog
      :open="showEditDialog"
      :item="selectedItem"
      @close="handleCloseEditDialog"
      @update="handleUpdateItem"
    />

    <!-- アイテム削除確認ダイアログ -->
    <ItemDeleteDialog
      :open="showDeleteDialog"
      :item="selectedItem"
      @close="handleCloseDeleteDialog"
      @delete="handleDeleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useItemsStore } from '@/stores';
import type { Item } from '@/types';

// ダイアログコンポーネントの動的インポート
const ItemAddDialog = defineAsyncComponent(() =>
  import('./ItemAddDialog.vue')
);
const ItemEditDialog = defineAsyncComponent(() =>
  import('./ItemEditDialog.vue')
);
const ItemDeleteDialog = defineAsyncComponent(() =>
  import('./ItemDeleteDialog.vue')
);

const itemsStore = useItemsStore();

// ダイアログの表示状態
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref<Item | null>(null);

// ページネーション
const itemsPerPage = 10;
const currentPage = ref(1);

const totalPages = computed(() =>
  Math.ceil(itemsStore.filteredItems.length / itemsPerPage)
);

const currentItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return itemsStore.filteredItems.slice(startIndex, endIndex);
});

const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => i + 1)
);

// ページ遷移処理
const setCurrentPage = (page: number) => {
  currentPage.value = page;
};

const handlePreviousPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1);
};

const handleNextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
};

// 行番号生成
const generateRowNumber = (index: number) => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return startIndex + index + 1;
};

// アイテム操作ハンドラー
const handleEditItem = (item: Item) => {
  selectedItem.value = item;
  showEditDialog.value = true;
};

const handleAddItem = (_name: string) => {
  // ItemAddDialogが直接storeを呼び出すため、このハンドラーは不要
  // ただし、emit定義との互換性のために残しておく
};

const handleUpdateItem = (_id: string, _name: string) => {
  // ItemEditDialogが直接storeを呼び出すため、このハンドラーは不要
  // ただし、emit定義との互換性のために残しておく
};

const handleDeleteItem = async (id: string) => {
  await itemsStore.deleteItem(id);
};

const handleCloseEditDialog = () => {
  showEditDialog.value = false;
  selectedItem.value = null;
};

const handleCloseDeleteDialog = () => {
  showDeleteDialog.value = false;
  selectedItem.value = null;
};

// テーブルの削除ボタンクリックハンドラー
const handleDeleteButtonClick = (item: Item) => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};
</script>