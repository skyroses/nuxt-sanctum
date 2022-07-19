import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineNuxtModule, addPluginTemplate, createResolver, addAutoImport } from '@nuxt/kit';
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

    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime');

    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.alias['#sanctumruntime'] = runtimeDir;

    const composables = resolver.resolve(runtimeDir, 'composables');

    addAutoImport([
      {
        from: composables, name: 'useAuth'
      }
    ]);

    addPluginTemplate({
      src: resolver.resolve(runtimeDir, 'templates/plugin.mjs'),
      options: {
        ...options
      }
    });

    nuxt.hook('app:resolve', (app) => {
      app.middleware.push({
        name: 'auth',
        path: resolver.resolve(runtimeDir, 'core/middleware'),
        global: options.globalMiddleware
      });
    });
  }
});
