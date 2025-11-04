<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const transactions = ref<any[]>([])
const loading = ref(false)
const isModalOpen = ref(false)
const showDeleteConfirm = ref(false)
const transactionToDelete = ref<number | null>(null)

const transactionForm = ref({
  amount: '',
  date: '',
  description: ''
})

// Add date formatting function
function formatDateInput(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // Remove non-digits
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }
  if (value.length >= 5) {
    value = value.substring(0, 5) + '/' + value.substring(5, 9)
  }
  
  transactionForm.value.date = value
}

function validateUSDate(dateString: string) {
  const usDateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
  return usDateRegex.test(dateString)
}

async function fetchTransactions() {
  if (!auth.currentUser) return

  loading.value = true
  try {
    const response = await $fetch('/api/gettransactions', {
      params: { username: auth.currentUser } // Use params for GET request
    })
    transactions.value = response.transactions || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    alert('Error loading transactions')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
})

async function addTransaction() {
  if (!auth.currentUser) {
    alert('Please log in first')
    return
  }

  // Validation
  if (!transactionForm.value.amount || !transactionForm.value.date || !transactionForm.value.description) {
    alert('Please fill in all fields')
    return
  }

  // Validate US date format if using text input
  if (!validateUSDate(transactionForm.value.date)) {
    alert('Please enter date in MM/DD/YYYY format')
    return
  }

  try {
    const response = await $fetch('/api/addtransaction', {
      method: 'POST',
      body: {
        username: auth.currentUser,
        amount: parseFloat(transactionForm.value.amount),
        date: transactionForm.value.date,
        description: transactionForm.value.description.trim()
      }
    })
    
    // Reset form and close modal
    transactionForm.value = { amount: '', date: '', description: '' }
    isModalOpen.value = false
    
    // Refresh transactions
    await fetchTransactions()
    
    alert('Transaction added successfully!')
    console.log('Success:', response.message)
  } catch (error: any) {
    console.error('Error adding transaction:', error)
    
    // More specific error messages
    if (error.statusCode === 404) {
      alert('User not found. Please log in again.')
      auth.logout()
      navigateTo('/user-login')
    } else if (error.statusCode === 400) {
      alert(error.statusMessage || 'Invalid date format. Please use MM/DD/YYYY')
    } else {
      alert('Error adding transaction. Please try again.')
    }
  }
}

function confirmDelete(transactionId: number) {
  transactionToDelete.value = transactionId
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!transactionToDelete.value) return
  
  try {
    await $fetch('/api/deletetransaction', {
      method: 'POST',
      body: {
        transactionId: transactionToDelete.value,
        username: auth.currentUser
      }
    })
    
    alert('Transaction deleted successfully!')
    await fetchTransactions()
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    alert('Error deleting transaction. Please try again.')
  } finally {
    showDeleteConfirm.value = false
    transactionToDelete.value = null
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  transactionToDelete.value = null
}

const totalAmount = computed(() => {
  return transactions.value.reduce((sum, transaction) => sum + transaction.amount, 0)
})

function openModal() {
  console.log('Opening modal...') // Debug log
  isModalOpen.value = true
}

function closeModal() {
  console.log('Closing modal...') // Debug log
  isModalOpen.value = false
}

// Redirect to login if not logged in
if (process.client && !auth.currentUser) {
  navigateTo('/user-login')
}
</script>

<template>
  <div>
    <div class="flex flex-col pl-10 pt-10">
      <h1 class="text-2xl font-bold">Welcome, {{ auth.currentUser }}</h1>
      <p class="mt-4">This is your dashboard where you can manage your financial data.</p>
      
      <!-- Summary Card -->
      <div class="mt-6 bg-emerald-100 border border-emerald-300 rounded-lg p-4 max-w-md">
        <h3 class="text-lg font-semibold text-emerald-800">Account Summary</h3>
        <div class="mt-2">
          <span class="text-sm text-emerald-600">Total Balance:</span>
          <span :class="totalAmount >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xl font-bold ml-2">
            ${{ Math.abs(totalAmount).toFixed(2) }}
          </span>
        </div>
        <div class="text-sm text-emerald-600 mt-1">
          {{ transactions.length }} transaction(s)
        </div>
      </div>

      <div class="flex justify-between items-center mx-2">
        <h2 class="text-3xl font-semibold mt-8">Transactions</h2>
        <div class="flex justify-between items-center mx-2 space-x-4">
          <button 
            @click="fetchTransactions"
            :disabled="loading"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400">
            {{ loading ? 'Loading...' : 'View Transactions' }}
          </button>
          
          <button 
            @click="openModal"
            class="bg-emerald-800 text-white py-2 px-4 rounded hover:bg-emerald-900 transition-colors">
            +
          </button>
        </div>
      </div>
    </div>

    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Recent Transactions</h2>

      <div v-if="loading" class="text-center py-4">
        Loading transactions...
      </div>

      <div v-else-if="transactions.length === 0" class="text-center py-4 text-gray-500">
        No transactions found
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead class="bg-gray-50">
            <tr>  
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Date</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Description</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Amount</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                Edit
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 border-b text-sm">{{ new Date(transaction.date).toLocaleDateString() }}</td>
              <td class="px-4 py-2 border-b text-sm">{{ transaction.description }}</td>
              <td class="px-4 py-2 border-b text-sm font-medium">
                <span :class="transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ Math.abs(transaction.amount).toFixed(2) }}
                </span>
              </td>
              <td class="px-4 py-2 border-b text-sm">
                <button 
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
                  Edit
                </button>
              </td>
              <td class="px-4 py-2 border-b text-sm">
                <button 
                  @click="confirmDelete(transaction.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button 
        @click="fetchTransactions" 
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Refresh Transactions
      </button>
    </div>


    <!-- Add Transaction Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Add New Transaction
          </h3>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="addTransaction" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              v-model="transactionForm.amount" 
              type="number" 
              step="0.01"
              placeholder="Enter amount (positive for income, negative for expense)"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date (MM/DD/YYYY)</label>
            <input 
              v-model="transactionForm.date" 
              type="text"
              placeholder="MM/DD/YYYY"
              pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$"
              maxlength="10"
              @input="formatDateInput"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required />
            <small class="text-gray-500 text-xs">Enter date in MM/DD/YYYY format</small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="transactionForm.description" 
              placeholder="Enter transaction description"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!transactionForm.amount || !transactionForm.date || !transactionForm.description"
              class="bg-emerald-800 text-white py-2 px-4 rounded hover:bg-emerald-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
        <p class="text-gray-600 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete"
            class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button 
            @click="executeDelete"
            class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>