<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { a } from '#build/ui/prose'
import { useAuthStore } from '~/stores/auth'
// Redirect to login page when accessing the root
const auth = useAuthStore()

if (process.client && !auth.currentUser) {
  await navigateTo('/user-login')
}
await navigateTo('/user-dashboard')
</script>

<template>
    <!-- This template won't be rendered due to the redirect -->
    <div>
        <h1>loading</h1>
    </div>
</template>