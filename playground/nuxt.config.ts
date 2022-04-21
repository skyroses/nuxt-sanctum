import { defineNuxtConfig } from 'nuxt';
import MyModule from '..';

export default defineNuxtConfig({
  modules: [
    MyModule,
    '@nuxtjs-alt/axios',
    '@pinia/nuxt'
  ],
  axios: {
    baseURL: 'http://api.test',
    credentials: true
  },
  sanctum: {
    redirects: {
      afterLogin: '/',
      afterLogout: '/auth/login',
      toLogin: '/auth/login',
      home: '/'
    },
    tokenScheme: {
      endpoints: {
        login: {
          url: '/api/auth/users/login',
          method: 'post'
        },
        logout: {
          url: '/api/auth/logout',
          method: 'post'
        },
        user: {
          url: '/api/auth/me',
          method: 'post'
        },
        refresh: {
          url: '/api/auth/refresh-tokens',
          method: 'post'
        }
      },
      user: {
        property: false
      },
      token: {
        property: 'access_token',
        headerName: 'Authorization',
        expiredAtProperty: 'expired_at'
      },
      refreshToken: {
        property: 'refresh_token'
      }
    }
  }
});
