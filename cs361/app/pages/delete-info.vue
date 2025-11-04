<script setup lang="ts">
    const delete_username_input = ref("")

    async function deleteTable() {
        try {
            const response = await $fetch("/api/deletetable", {
                method: "POST",
                body: {}
            })
            alert(response.message)
        } catch (error) {
            console.error("Error deleting table:", error)
            alert("Error deleting table.")
        }
    }

    async function deleteUser() {
        if (!delete_username_input.value) {
            alert("Please enter a username")
            return
        }

        try {
            const response = await $fetch("/api/deleteuser", {
                method: "POST",
                body: {
                    username: delete_username_input.value
                }
            })
            alert(response.message)
            delete_username_input.value = "" // Clear input after success
        } catch (error) {
            console.error("Error deleting user:", error)
            alert(`Error deleting user: ${error.data?.message || error.message}`)
        }
    }
</script>

<template>
    <div class="p-6">
        <div class="mb-8">
            <h1 class="text-2xl font-bold mb-4">Delete Table</h1>
            <button @click="deleteTable" class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                Delete
            </button>
        </div>

        <div>
            <h1 class="text-2xl font-bold mb-4">Delete User</h1>
            <div class="flex space-x-4 items-center">
                <input 
                    v-model="delete_username_input" 
                    placeholder="Enter username to delete"
                    class="border border-gray-300 rounded px-3 py-2" />
                <button @click="deleteUser" class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                    Delete User
                </button>
            </div>
        </div>
    </div>
</template>