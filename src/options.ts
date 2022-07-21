import { AxiosError, AxiosRequestConfig } from 'axios';
import { TokenSchemeOptions } from './runtime';

export interface ModuleOptions {
  baseURL?: string;
  globalMiddleware?: boolean;
  fingerprint?: {
    enabled?: boolean;
    property?: string;
    ipService?: {
      endpoint: AxiosRequestConfig;
      property?: string | false;
    }
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
  tokenScheme: TokenSchemeOptions;
  onError?: (error: AxiosError) => void;
};

export const defaultOptions: ModuleOptions = {
  globalMiddleware: true,
  tokenScheme: {
    token: {
      headerName: 'Authorization',
      property: 'access_token'
    }
  },
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
