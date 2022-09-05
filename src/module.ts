import { defineNuxtModule, addPluginTemplate, createResolver, addImports } from '@nuxt/kit';
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

    const resolver = createResolver(import.meta.url);

    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));
    nuxt.options.alias['#sanctumruntime'] = resolver.resolve('./runtime');

    addImports([
      {
        from: resolver.resolve('./runtime/composables/use-auth'), name: 'useAuth'
      }
    ]);

    addPluginTemplate({
      src: resolver.resolve('./runtime/templates/plugin.mjs'),
      options: {
        ...options
      }
    });

    nuxt.hook('app:resolve', (app) => {
      app.middleware.push({
        name: 'auth',
        path: resolver.resolve('./runtime/core/middleware'),
        global: options.globalMiddleware
      });
    });
  }
});
