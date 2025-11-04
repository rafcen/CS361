import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<string | null>(null)

  // Only read from localStorage on the client
  if (process.client) {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) currentUser.value = savedUser
  }

  function login(username: string) {
    currentUser.value = username
    if (process.client) localStorage.setItem('currentUser', username)
  }

  function logout() {
    currentUser.value = null
    if (process.client) localStorage.removeItem('currentUser')
  }

  return { currentUser, login, logout }
})