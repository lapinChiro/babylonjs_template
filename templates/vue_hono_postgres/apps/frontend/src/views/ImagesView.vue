<template>
  <div class="min-h-screen bg-background">
    <!-- ヘッダー -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4 flex-between">
        <div class="flex items-center gap-6">
          <h1 class="text-2xl font-bold">サンプルシステム</h1>
          <nav class="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" class="gap-2" @click="router.push('/items')">
              <Package class="size-4" />
              アイテム
            </Button>
            <Button variant="default" size="sm" class="gap-2">
              <ImageIcon class="size-4" />
              画像
            </Button>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground hidden sm:inline">
            {{ authStore.currentUser?.email }}
          </span>
          <DarkModeToggle />
          <Button variant="outline" @click="handleLogout" class="gap-2">
            <LogOut class="size-4" />
            <span class="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>画像一覧</CardTitle>
            <CardDescription>
              システムに登録されている画像を管理します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageList />
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
import { LogOut, Package, ImageIcon } from 'lucide-vue-next';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';
import { useAuthStore } from '@/stores';

const ImageList = defineAsyncComponent(() => import('@/components/ImageList.vue'));

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
