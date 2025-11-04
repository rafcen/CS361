<script setup lang ="ts">
	import { useAuthStore } from '~/stores/auth'
	const auth = useAuthStore()

    const username_input = ref("")
    const password_input = ref("")


    async function login() {
      // Validation check
      if (!username_input.value.trim() || !password_input.value.trim()) {
        alert("Please fill in both username and password")
        return
      }

      try {
        const response = await $fetch("/api/confirmlogin", {
          method: "POST",
          body: {
            username: username_input.value,
            password: password_input.value
          }
        })
        auth.login(username_input.value)
        // Handle successful login
        alert("Login successful!")
        console.log("Login response:", response)

        // Redirect to dashboard or clear form
        navigateTo('/user-dashboard')
      } catch (error) {
        console.error("Login error:", error)
        alert("Invalid username or password!")
      }
    }
</script>

<template>
  <form @submit.prevent="login">
    <div class="flex flex-col items-center py-40">
      <div class="border border-gray-300 rounded-lg p-10 shadow-lg text-center">
        <h1 class="text-4xl font-bold pb-10">Login to Financial Tracker</h1>
        <div class="flex flex-col items-center space-y-4">
          <input  
          v-model="username_input"
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="text" placeholder="Username" required>
          <input 
          v-model="password_input" 
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="password" placeholder="Password" required>
          <button class="bg-blue-500 text-white py-2 px-4 rounded w-full max-w-xs" @click="login">Login</button>
          <button class="text-blue-500 underline mt-4" @click="navigateTo('/password-reset-page')">Forgot password?</button>
        </div>
      </div>
    </div>
  </form>
</template>
