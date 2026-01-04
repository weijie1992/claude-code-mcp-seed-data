<script setup lang="ts">
const { user, logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  try {
    await logout();
    await router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome back!</h2>

            <div v-if="user" class="space-y-3">
              <div>
                <p class="text-sm font-medium text-gray-500">Email</p>
                <p class="text-lg text-gray-900">{{ user.email }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-500">User ID</p>
                <p class="text-lg text-gray-900">{{ user.id }}</p>
              </div>

              <div v-if="user.name">
                <p class="text-sm font-medium text-gray-500">Name</p>
                <p class="text-lg text-gray-900">{{ user.name }}</p>
              </div>
            </div>

            <div v-else class="text-gray-500">Loading user data...</div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-500">
                You have successfully logged in. This is a protected page that
                requires authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
