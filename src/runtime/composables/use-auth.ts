import { useNuxtApp } from 'nuxt/app';
import { Auth } from '../core/auth';

export const useAuth = () => {
  const { $auth } = useNuxtApp();

  return $auth as Auth;
};
