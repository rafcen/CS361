<script setup lang="ts">
const email_input = ref("")
const username_input = ref("")
const password_input = ref("")
const confirm_password_input = ref("")
const showTooltip = ref(false)

async function register() {
    if (!email_input.value || !username_input.value || !password_input.value) {
        alert("Please fill in all required fields")
        return
    }

    if (password_input.value !== confirm_password_input.value) {
        alert("Passwords do not match")
        return
    }

    if (password_input.value.length < 8) {
        alert("Password must be at least 8 characters long")
        return
    }

    try {
        // Send PLAIN password to API - let the server handle hashing
        const response = await $fetch("/api/adduser", {
            method: "POST",
            body: {
                email: email_input.value,
                username: username_input.value,
                password: password_input.value  // Plain password
            }
        })
        
        // Clear form
        email_input.value = ""
        username_input.value = ""
        password_input.value = ""
        confirm_password_input.value = ""
        
        // confirm registration and redirect to login
        alert("Registration successful! Please log in.")
        if(confirm("Go to login page?")) {
            navigateTo('/')
        }
    } catch (error: any) {
        console.error("Registration error:", error)
        alert(error.data?.message || "Registration failed")
    }
}

function cancelReset() {
        navigateTo('/')
}
</script>

<template>
  <div class="flex flex-col items-center py-40">
    <div class="border border-gray-300 rounded-lg p-10 shadow-lg text-center">
      <h1 class="text-4xl font-bold pb-10">Register for Financial Tracker</h1>
      <div class="flex flex-col items-center space-y-4">
        <input  
          v-model="email_input"
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="email" 
          placeholder="Email" 
          required>
        <input  
          v-model="username_input"
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="text" 
          placeholder="Username" 
          required>
        <input  
          v-model="password_input"
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="password" 
          placeholder="Password" 
          required>
        <input  
          v-model="confirm_password_input"
          class="border border-gray-300 rounded p-2 w-full max-w-xs" 
          type="password" 
          placeholder="Confirm Password" 
          required>
          <div class="relative inline-block">
            <h4 
              class="cursor-help underline decoration-dotted text-sm text-gray-600"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              What makes a strong password?
            </h4>
            <div 
              v-if="showTooltip" 
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-lg z-50"
            >
              <div class="text-left">
                <strong class="block mb-2">Strong passwords include:</strong>
                <ul class="space-y-1 ml-4 list-disc">
                  <li>At least 8 characters</li>
                  <li>Mix of upper & lowercase</li>
                  <li>Numbers and symbols</li>
                  <li>No common words or patterns</li>
                </ul>
              </div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        <button 
          @click="register"
          class="bg-blue-500 text-white py-2 px-4 rounded w-full max-w-xs hover:bg-blue-600 transition-colors">
          Register
        </button>
        <button 
          @click="cancelReset()"
          class="bg-red-500 text-white py-2 px-4 rounded w-full max-w-xs hover:bg-red-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>