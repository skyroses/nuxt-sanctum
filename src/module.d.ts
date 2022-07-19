import type { Auth } from './runtime';
import type { ModuleOptions } from './options';
import type { NuxtModule } from '@nuxt/schema';

declare const module: NuxtModule<ModuleOptions>;

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

declare module "#app" {
  interface NuxtApp {
    $auth: Auth;
  }
}

export { module as default, ModuleOptions } ;
