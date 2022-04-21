import type { Auth } from './runtime';
import type { ModuleOptions } from './options';

declare module 'nuxt/app' {
  interface NuxtApp {
    $auth: Auth;
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    sanctum?: ModuleOptions
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: Auth;
  }
}

export { };
