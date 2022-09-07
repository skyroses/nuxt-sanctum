import { defineNuxtPlugin } from '#imports';
import { Auth } from '#sanctum/runtime/core/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const options = JSON.parse('<%= JSON.stringify(options) %>');

  const auth = new Auth(nuxtApp, options);

  await auth.run();

  return {
    provide: {
      auth
    }
  };
});
