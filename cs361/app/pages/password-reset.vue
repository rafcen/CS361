<script lang="ts">
</script>

<template>
  <div class="flex flex-col items-center py-40">
    <div class="border border-gray-300 rounded-lg p-10 shadow-lg text-center">
      <h1 class="text-4xl font-bold pb-10">Reset Your Password</h1>
      <div class="flex flex-col items-center space-y-4">
        <input  
        class="border border-gray-300 rounded p-2 w-full max-w-xs" 
        type="password" placeholder="Enter your new password" required>
        <input  
        class="border border-gray-300 rounded p-2 w-full max-w-xs" 
        type="password" placeholder="Confirm your new password" required>
        <button class="bg-blue-500 text-white py-2 px-4 rounded w-full max-w-xs">reset password</button>
        <<button 
          @click="cancelReset()"
          class="bg-red-500 text-white py-3 px-6 rounded w-full hover:bg-red-600 transition-colors">
          Cancel
        </button>
        <p class="text-red-500">Warning: </p>
      </div>
    </div>
  </div>
</template>