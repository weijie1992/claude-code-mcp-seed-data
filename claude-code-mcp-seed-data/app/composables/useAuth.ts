import type { LoginCredentials, RegisterCredentials } from '~/types/auth';

export function useAuth() {
  // Use nuxt-auth-utils composable for reactive user session
  const { user, fetch: fetchSession, clear: clearSession } = useUserSession();

  // Loading state
  const loading = ref(false);

  /**
   * Register a new user
   */
  async function register(
    email: string,
    password: string,
    confirmPassword: string
  ) {
    loading.value = true;
    try {
      const credentials: RegisterCredentials = {
        email,
        password,
        confirmPassword
      };

      await $fetch('/api/auth/register', {
        method: 'POST',
        body: credentials
      });

      // Refresh session after successful registration
      await fetchSession();
    } finally {
      loading.value = false;
    }
  }

  /**
   * Log in an existing user
   */
  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const credentials: LoginCredentials = { email, password };

      await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      });

      // Refresh session after successful login
      await fetchSession();
    } finally {
      loading.value = false;
    }
  }

  /**
   * Log out the current user
   */
  async function logout() {
    loading.value = true;
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      });

      // Clear local session state
      await clearSession();
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch current user data
   */
  async function fetchUser() {
    loading.value = true;
    try {
      await fetchSession();
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading: readonly(loading),
    register,
    login,
    logout,
    fetchUser
  };
}


