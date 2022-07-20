import { useNuxtApp } from '#app';
import { Auth } from '../core/auth';

export const useAuth = () => {
  const { $auth } = useNuxtApp();

  return $auth as Auth;
};
