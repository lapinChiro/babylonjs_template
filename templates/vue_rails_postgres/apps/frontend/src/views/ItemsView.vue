<template>
  <div class="min-h-screen bg-background">
    <!-- ヘッダー -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4 flex-between">
        <div class="flex items-center gap-6">
          <h1 class="text-2xl font-bold">サンプルシステム</h1>
          <nav class="hidden sm:flex items-center gap-1">
            <Button variant="default" size="sm" class="gap-2">
              <Package class="size-4" />
              アイテム
            </Button>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground hidden sm:inline">
            {{ authStore.currentUser?.email }}
          </span>
          <DarkModeToggle />
          <Button variant="outline" @click=" handleLogout " class="gap-2">
            <LogOut class="size-4" />
            <span class="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>アイテム一覧</CardTitle>
            <CardDescription>
              システムに登録されているアイテムを管理します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemList />
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Package } from 'lucide-vue-next';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';
import { useAuthStore } from '@/stores';

const ItemList = defineAsyncComponent(() => import('@/components/ItemList.vue'));

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>