import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores';

// 遅延読み込みコンポーネント（Webpackマジックコメント付き）
const LoginView = () => import(
  /* webpackChunkName: "login" */
  /* webpackPrefetch: true */
  '@/views/LoginView.vue'
);

const ItemsView = () => import(
  /* webpackChunkName: "items" */
  /* webpackPrefetch: true */
  '@/views/ItemsView.vue'
);

const ImagesView = () => import(
  /* webpackChunkName: "images" */
  /* webpackPrefetch: true */
  '@/views/ImagesView.vue'
);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresGuest: true,
      title: 'ログイン'
    }
  },
  {
    path: '/items',
    name: 'Items',
    component: ItemsView,
    meta: {
      requiresAuth: true,
      title: 'アイテム管理'
    }
  },
  {
    path: '/images',
    name: 'Images',
    component: ImagesView,
    meta: {
      requiresAuth: true,
      title: '画像管理'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // スクロール動作の最適化
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// ナビゲーションガード
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // 認証状態の復元が完了するまで待機
  if (!authStore.isInitialized) {
    await authStore.restoreAuthState();
  }

  const isLoggedIn = authStore.isLoggedIn;


  // 認証が必要なルートのガード
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  }

  // ゲスト専用ルートのガード（ログイン済みユーザーがログインページにアクセスするのを防ぐ）
  if (to.meta.requiresGuest && isLoggedIn) {
    next('/items');
    return;
  }

  // ページタイトルの設定
  if (to.meta.title) {
    document.title = `${ to.meta.title } - サンプルシステム`;
  } else {
    document.title = 'サンプルシステム';
  }

  next();
});

export default router;