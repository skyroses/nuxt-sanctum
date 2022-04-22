# Nuxt Sanctum
<p align="center">✨Easy authorization via Laravel Sanctum for Nuxt 3!</p>

<p align="center">
    <a href="https://npmjs.com/package/@plenexy/nuxt-sanctum">
        <img alt="" src="https://img.shields.io/npm/v/@plenexy/nuxt-sanctum/latest.svg?style=flat-square">
    </a>
</p>

So far, only the token authorization scheme is available.
Please note that in this scheme, only the backend itself sets a cookie with the main token and a refresh token.

## Installation

```
yarn add @plenexy/nuxt-sanctum @nuxtjs-alt/axios axios @pinia/nuxt pinia
```

<details>
<summary>Working example of nuxt.config.ts</summary>

```typescript
export default defineNuxtConfig({
  modules: [
    "@plenexy/nuxt-sanctum", 
    "@nuxtjs-alt/axios", 
    "@pinia/nuxt"
  ],
  axios: {
    credentials: true,
    baseURL: process.env.API_BASE_URL,
  },
  sanctum: {
    baseURL: process.env.AUTH_BASE_URL, // optional
    globalMiddleware: false,
    redirects: {
      afterLogin: "/",
      afterLogout: "/auth/login",
      toLogin: "/auth/login",
      home: "/",
    },
    tokenScheme: {
      endpoints: {
        login: {
          url: "/api/auth/users/login",
          method: "post",
        },
        logout: {
          url: "/api/auth/logout",
          method: "post",
        },
        user: {
          url: "/api/auth/me",
          method: "post",
        },
        refresh: {
          url: "/api/auth/refresh-tokens",
          method: "post",
        },
      },
      user: {
        property: false,
      },
      token: {
        property: "access_token",
        headerName: "Authorization",
        expiredAtProperty: "expired_at",
      },
      refreshToken: {
        property: "refresh_token",
      },
    },
  },
});
```
</details>

<details>
<summary>Available configuration</summary>

```typescript
interface ModuleOptions {
  baseURL?: string;
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
  tokenScheme?: {
    endpoints: {
        login: AxiosRequestConfig;
        user: AxiosRequestConfig;
        refresh?: AxiosRequestConfig | false;
        logout?: AxiosRequestConfig | false;
    },
    user: {
        property?: string | false;
    },
    token: {
        prefix?: string | false;
        property: string;
        headerName?: string;
        expiredAtProperty?: string | false;
    },
    refreshToken?: {
        property: string | false;
    }
  }
}
```
</details>

<details>
<summary>Default configuration values</summary>
The values for the parameters from the configuration that you skip will be taken from the default configuration.

```typescript
{
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
}
```
</details>

## Example

```html
<template>
  <div v-if="!$auth.loggedIn">
    <form @submit.prevent="onLogin">
      <input v-model="form.email" placeholder="Type your email">
      <input v-model="form.password" placeholder="Type your password" type="password">

      <button>Login</button>
    </form>
  </div>
  <div v-else>
    <p>Hello, {{ $auth.user.full_name }}</p>
    <p>Maybe you want <a @click.prevent="onLogout" href="/logout">logout</a>?</p>
  </div>
</template>

<script setup>
const auth = useAuth();
const form = ref({ email: '', password: '' });

// The user will then be redirected to the page specified in the redirects.afterLogin parameter in module configuration
const onLogin = async () => await auth.login(form.value);

// The user will then be redirected to the page specified in the redirects.afterLogout parameter in module configuration
const onLogout = async () => await auth.logout();
</script>
```

## Middleware

Example of a page accessible only to an unauthorized user if you have global middleware enabled:

```html
<script setup>
  definePageMeta({
    auth: "guest" // or auth: false
  });
</script>
```

Example of a page accessible only to an authorized user if you have global middleware disabled:

```html
<script setup>
  definePageMeta({
    middleware: "auth"
  });
</script>
```

## Fingerprint

Nuxt-sanctum generates a unique client ID based on its IP address and user-agent. It can be used to implement multiple authorization sessions and cancel them at the user's choice (for example, to view active sessions).  
You can disable the generation and sending of the parameter to your endpoints or change the name of the parameter using the appropriate configuration (*fingerprint.enabled* and *fingerprint.property*).

## Module Dependencies
* <a href="https://github.com/Teranode/nuxt-module-alternatives/tree/master/%40nuxtjs-alt/axios">@nuxtjs-alt/axios</a>
* <a href="https://pinia.vuejs.org/ssr/nuxt.html">@pinia/nuxt</a>

## Development

- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start [playground](./playground) in development mode.

## License

[MIT License](./LICENSE) - Copyright (c) SKYROSES & Plenexy