<script setup lang="ts">
// Remove this import - it won't work in the frontend
// import { hashPassword } from '~/server/utils/password'

const email_input = ref("")
const username_input = ref("")
const new_password_input = ref("")
const confirm_password_input = ref("")
const accountVerified = ref(false)
const loading = ref(false)

async function verifyAccount() {
    if (!email_input.value.trim() || !username_input.value.trim()) {
        alert("Please fill in both email and username")
        return
    }

    loading.value = true
    try {
        const response = await $fetch("/api/verify-account", {
            method: "POST",
            body: {
                email: email_input.value.trim(),
                username: username_input.value.trim()
            }
        })
        
        accountVerified.value = true
        alert("Account verified! Please enter your new password below.")
        
    } catch (error: any) {
        console.error("Account verification error:", error)
        alert(error.data?.message || "Account verification failed")
    } finally {
        loading.value = false
    }
}

async function resetPassword() {
    // Use similar validation logic as user-register.vue
    if (!new_password_input.value || !confirm_password_input.value) {
        alert("Please fill in all password fields")
        return
    }

    if (new_password_input.value !== confirm_password_input.value) {
        alert("New passwords do not match")
        return
    }

    if (new_password_input.value.length < 8) {
        alert("Password must be at least 8 characters long")
        return
    }

    // Additional password strength checks
    if (!/[A-Z]/.test(new_password_input.value)) {
        alert("Password must contain at least one uppercase letter")
        return
    }

    if (!/[a-z]/.test(new_password_input.value)) {
        alert("Password must contain at least one lowercase letter")
        return
    }

    if (!/[0-9]/.test(new_password_input.value)) {
        alert("Password must contain at least one number")
        return
    }

    loading.value = true
    try {
        // Send the PLAIN password to the API - let the server handle hashing
        const response = await $fetch("/api/reset-password", {
            method: "POST",
            body: {
                email: email_input.value.trim(),
                username: username_input.value.trim(),
                newPassword: new_password_input.value // Plain password
            }
        })
        
        alert(response.message)
        
        // Clear form and reset state
        email_input.value = ""
        username_input.value = ""
        new_password_input.value = ""
        confirm_password_input.value = ""
        accountVerified.value = false
        
        // Optionally redirect to login
        setTimeout(() => {
            navigateTo('/user-login')
        }, 2000)
        
    } catch (error: any) {
        console.error("Password reset error:", error)
        alert(error.data?.message || "Password reset failed")
    } finally {
        loading.value = false
    }
}
  async function cancelReset() {
    navigateTo('/user-login')
  }
</script>

<template>
  <div class="flex flex-col items-center py-20">
    <div class="border border-gray-300 rounded-lg p-10 shadow-lg text-center max-w-md w-full">
      <h1 class="text-3xl font-bold pb-8">Reset Your Password</h1>
      
      <!-- Step 1: Account Verification -->
      <div v-if="!accountVerified" class="space-y-4">
        <h2 class="text-lg font-semibold">Step 1: Verify Your Account</h2>
        <input  
          v-model="email_input"
          class="border border-gray-300 rounded p-3 w-full" 
          type="email" 
          placeholder="Enter your email" 
          required>
        <input  
          v-model="username_input"
          class="border border-gray-300 rounded p-3 w-full" 
          type="text" 
          placeholder="Enter your username" 
          required>
        <button 
          @click="verifyAccount"
          :disabled="loading"
          class="bg-blue-500 text-white py-3 px-6 rounded w-full hover:bg-blue-600 transition-colors disabled:bg-gray-400">
          {{ loading ? 'Verifying...' : 'Verify Account' }}
        </button>
        <button 
          @click="cancelReset()"
          class="bg-red-500 text-white py-3 px-6 rounded w-full hover:bg-red-600 transition-colors">
          Cancel
        </button>
      </div>
      
      <!-- Step 2: New Password -->
      <div v-else class="space-y-4">
        <h2 class="text-lg font-semibold">Step 2: Set New Password</h2>
        <input  
          v-model="new_password_input"
          class="border border-gray-300 rounded p-3 w-full" 
          type="password" 
          placeholder="Enter new password" 
          required>
        <input  
          v-model="confirm_password_input"
          class="border border-gray-300 rounded p-3 w-full" 
          type="password" 
          placeholder="Confirm new password" 
          required>
        <button 
          @click="resetPassword"
          :disabled="loading"
          class="bg-green-500 text-white py-3 px-6 rounded w-full hover:bg-green-600 transition-colors disabled:bg-gray-400">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
        <button 
          @click="cancelReset()"
          class="bg-red-500 text-white py-3 px-6 rounded w-full hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <p class="text-red-500 text-sm">Warning: You will not be able to reuse your old password.</p>
      </div>
    </div>
  </div>
</template>