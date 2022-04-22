import { TokenSchemeOptions } from './runtime';

export interface ModuleOptions {
  baseURL?: string;
  globalMiddleware?: boolean;
  fingerprint?: {
    enabled?: boolean;
    property?: string;
  };
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
  fingerprint: {
    enabled: true,
    property: 'fingerprint'
  },
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
