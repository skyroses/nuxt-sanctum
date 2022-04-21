import { TokenSchemeOptions } from './runtime';

export interface ModuleOptions {
  globalMiddleware?: boolean;
  pinia?: {
    namespace?: string;
  };
  redirects: {
    home: string;
    toLogin: string;
    afterLogin: string;
    afterLogout: string;
  },
  tokenScheme?: TokenSchemeOptions
};

export const defaultOptions: ModuleOptions = {
  globalMiddleware: true,
  pinia: {
    namespace: 'auth'
  },
  redirects: {
    home: '/',
    toLogin: '/auth/login',
    afterLogin: '/',
    afterLogout: '/'
  }
};
