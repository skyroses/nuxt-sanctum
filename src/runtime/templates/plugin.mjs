import { defineNuxtPlugin } from 'nuxt/app';
import { Auth } from '#sanctumruntime/core/auth';

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
