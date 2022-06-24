import { defineNuxtRouteMiddleware } from 'nuxt/app';
import { routeOption } from '../utils';
import { useAuth } from '../composables/useAuth';

const middleware = defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  if (!auth) {
    return;
  }

  const guestMode = routeOption(to, 'auth', ['guest', false]);

  if (auth.loggedIn) {
    const { tokenExpired } = auth.scheme.check();

    if (tokenExpired) {
      try {
        await auth.scheme.refreshToken();
      } catch {
        auth.scheme.reset();
        return navigateTo(auth.getRedirectRoute('toLogin'));
      }
    }

    if (guestMode) {
      return navigateTo(auth.getRedirectRoute('home'));
    }
  } else if (!guestMode) {
    return navigateTo(auth.getRedirectRoute('toLogin'));
  }
});

export { middleware as AuthMiddleware, middleware as default };
