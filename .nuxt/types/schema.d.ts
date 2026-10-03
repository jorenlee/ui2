import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   googleClientSecret: string,

   authSecret: string,

   authOrigin: string,

   nitro: {
      envPrefix: string,
   },
  }
  interface SharedPublicRuntimeConfig {
   googleClientId: string,

   apiUrl: string,

   adsenseId: string,

   analyticsId: string,

   googleAdsense: {
      id: string,

      analyticsDomainName: string,

      analyticsUacct: string,

      hideUnfilled: boolean,

      includeQuery: boolean,

      onPageLoad: boolean,

      overlayBottom: boolean,

      pageLevelAds: boolean,

      pauseOnLoad: boolean,

      tag: string,

      test: boolean,
   },

   gtag: {
      enabled: boolean,

      initMode: string,

      id: string,

      initCommands: Array<any>,

      config: any,

      tags: Array<any>,

      loadingStrategy: string,

      url: string,
   },
  }
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["nuxt-lodash"]?: ModuleDependencyMeta<typeof import("nuxt-lodash").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/google-adsense"]?: ModuleDependencyMeta<typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["nuxt-gtag"]?: ModuleDependencyMeta<typeof import("nuxt-gtag").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-lodash`
     */
    ["lodash"]: typeof import("nuxt-lodash").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/google-adsense`
     */
    ["googleAdsense"]: typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-gtag`
     */
    ["gtag"]: typeof import("nuxt-gtag").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-lodash`
     */
    ["lodash"]?: typeof import("nuxt-lodash").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/google-adsense`
     */
    ["googleAdsense"]?: typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-gtag`
     */
    ["gtag"]?: typeof import("nuxt-gtag").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["nuxt-lodash", Exclude<NuxtConfig["lodash"], boolean>] | ["@nuxtjs/google-adsense", Exclude<NuxtConfig["googleAdsense"], boolean>] | ["nuxt-gtag", Exclude<NuxtConfig["gtag"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["nuxt-lodash"]?: ModuleDependencyMeta<typeof import("nuxt-lodash").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxtjs/google-adsense"]?: ModuleDependencyMeta<typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["nuxt-gtag"]?: ModuleDependencyMeta<typeof import("nuxt-gtag").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-lodash`
     * @see https://www.npmjs.com/package/nuxt-lodash
     */
    ["lodash"]: typeof import("nuxt-lodash").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/google-adsense`
     * @see https://www.npmjs.com/package/@nuxtjs/google-adsense
     */
    ["googleAdsense"]: typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-gtag`
     * @see https://www.npmjs.com/package/nuxt-gtag
     */
    ["gtag"]: typeof import("nuxt-gtag").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-lodash`
     * @see https://www.npmjs.com/package/nuxt-lodash
     */
    ["lodash"]?: typeof import("nuxt-lodash").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxtjs/google-adsense`
     * @see https://www.npmjs.com/package/@nuxtjs/google-adsense
     */
    ["googleAdsense"]?: typeof import("@nuxtjs/google-adsense").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `nuxt-gtag`
     * @see https://www.npmjs.com/package/nuxt-gtag
     */
    ["gtag"]?: typeof import("nuxt-gtag").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["nuxt-lodash", Exclude<NuxtConfig["lodash"], boolean>] | ["@nuxtjs/google-adsense", Exclude<NuxtConfig["googleAdsense"], boolean>] | ["nuxt-gtag", Exclude<NuxtConfig["gtag"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }