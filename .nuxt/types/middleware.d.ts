import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth" | "central-auth" | "cms-auth"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}