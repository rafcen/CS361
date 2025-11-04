<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { DropdownMenuItem } from '@nuxt/ui'


const auth = useAuthStore()

function handleLogout() {
    auth.logout()
    navigateTo('/user-login')
}



const dropdownItems: DropdownMenuItem[][] = [
    [
        {
            label: 'Logout',
            icon: 'i-lucide-log-out',
            onSelect: () => handleLogout()
        }
    ]
]

</script>

<template>
    <nav class="bg-emerald-900 py-4">
        <div class="max-w-7xl mx-auto ">
            <div class="flex justify-between items-center mx-2">
                <!-- Logo section -->
                <div class="flex space-x-4 text-slate-300">
                    <div class="flex items-center  font-bold">
                        <svg class="h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                        </svg>
                        <span>Expense Tracker</span>
                    </div>
                    <!-- primary nav -->
                    <div class="flex items-center space-x-3 border border-slate-800 rounded-md px-2 py-1">
                        <NuxtLink v-if="auth.currentUser" to="/user-dashboard" class="hover:text-white">
                            Dashboard
                        </NuxtLink>
                        <NuxtLink v-else to="/" class="hover:text-white">
                            Home
                        </NuxtLink>
                    </div>
                </div>

                <!-- secondary nav - FIXED -->
                <div class="flex items-center justify-end text-slate-300">
                    <div class="flex items-center space-x-3 border p-2 border-slate-800 rounded-md">
                        <UDropdownMenu 
                        v-if="auth.currentUser" :items="dropdownItems" :ui="{
                            content: 'w-48 bg-emerald-900 shadow-lg text-slate-300 border border-black',
                            item: { base: 'text-right' }
                            }" :popper="{
                                placement: 'bottom-end'
                            }">
                            <UButton color="neutral" variant="outline">
                                {{ auth.currentUser }}
                            </UButton>
                        </UDropdownMenu>
                        <NuxtLink v-else to="/user-register" class="hover:text-white py-2 px-3">
                            Register
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>