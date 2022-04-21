import { defineNuxtRouteMiddleware } from 'nuxt/app';
import { routeOption } from '../utils';
import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  if (!auth) {
    return;
  }

  const guestMode = routeOption(to, 'auth', ['guest', false]);

  if (auth.loggedIn) {
    const { tokenExpired } = auth.scheme.check();

    if (tokenExpired) {
      await auth.scheme.refreshToken().catch(async () => {
        auth.scheme.reset();
        await auth.redirectTo('toLogin');
      });

      return;
    }

    if (guestMode) {
      await auth.redirectTo('home');
    }
  } else if (!guestMode) {
    await auth.redirectTo('toLogin');
  }
});
