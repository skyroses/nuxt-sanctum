<template>
  <div>
    <ClientOnly>
      <div v-if="$auth.loggedIn">
        <p>Hello, {{ $auth.user.first_name }}</p>
      </div>
      <form v-else @submit.prevent="onSubmit">
        <input v-model="form.email" type="email" placeholder="Enter email">
        <input v-model="form.password" type="password" placeholder="Enter password">

        <button>Submit</button>
      </form>
    </ClientOnly>
  </div>
</template>

<script setup>
definePageMeta({
  auth: 'guest'
});

const { $auth } = useNuxtApp();

const form = ref({
  email: '',
  password: ''
});

const onSubmit = async () => {
  await $auth.login(form.value);
};
</script>
