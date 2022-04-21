<template>
  <div>
    <ClientOnly>
      <div v-if="$auth.loggedIn">
        <p>Hello, {{ $auth.user.first_name }}</p> | <button @click="() => $auth.logout()">
          Выйти
        </button>
      </div>
      <div>
        <NuxtLink to="/auth/login">
          войти
        </NuxtLink> в аккаунт
      </div>
    </ClientOnly>
  </div>
</template>
