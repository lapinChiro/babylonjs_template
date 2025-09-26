import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/oauth',
    name: 'oauth',
    component: () => import('../views/OAuthView.vue')
  },
  {
    path: '/memos',
    name: 'memos',
    component: () => import('../views/MemoListView.vue')
  },
  {
    path: '/memos/new',
    name: 'memo-create',
    component: () => import('../views/MemoCreateView.vue')
  },
  {
    path: '/memos/:uuid/edit',
    name: 'memo-edit',
    component: () => import('../views/MemoEditView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router