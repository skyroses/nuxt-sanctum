import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineNuxtModule, addPluginTemplate, addAutoImportDir, createResolver } from '@nuxt/kit';
import { defaultOptions, ModuleOptions } from './options';

export const moduleName = '@plenexy/nuxt-sanctum';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: moduleName,
    configKey: 'sanctum'
  },
  defaults: defaultOptions,
  setup (_options, nuxt) {
    const options: ModuleOptions = {
      ...defaultOptions,
      ..._options
    };

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));

    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.alias['#sanctumruntime'] = runtimeDir;

    addAutoImportDir(resolve(runtimeDir, 'composables'));

    addPluginTemplate({
      src: resolve(runtimeDir, 'templates/plugin.mjs'),
      options: {
        ...options
      }
    });

    nuxt.hook('app:resolve', (app) => {
      app.middleware.push({
        name: 'auth',
        path: resolve(runtimeDir, 'core/middleware'),
        global: options.globalMiddleware
      });
    });
  }
});
