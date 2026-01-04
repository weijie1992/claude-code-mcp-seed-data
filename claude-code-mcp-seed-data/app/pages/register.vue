<script setup lang="ts">
const { register } = useAuth();
const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

// Validation state
const emailValid = ref(false);
const passwordStrength = ref({ valid: false, strength: '' });
const passwordsMatch = ref(false);

// Validate email on input
watch(email, (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailValid.value = emailRegex.test(value) && value.length <= 254;
});

// Validate password strength on input
watch(password, (value) => {
  const hasMinLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value);

  const criteriaCount = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  if (criteriaCount === 5) {
    passwordStrength.value = { valid: true, strength: 'strong' };
  } else if (criteriaCount >= 3) {
    passwordStrength.value = { valid: false, strength: 'medium' };
  } else {
    passwordStrength.value = { valid: false, strength: 'weak' };
  }
});

// Validate password match on input
watch([password, confirmPassword], ([pwd, confirm]) => {
  passwordsMatch.value = pwd === confirm && confirm.length > 0;
});

// Computed property to check if form is valid
const formValid = computed(() => {
  return (
    emailValid.value && passwordStrength.value.valid && passwordsMatch.value
  );
});

async function handleRegister() {
  if (!formValid.value) {
    error.value = 'Please fix the validation errors';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await register(email.value, password.value, confirmPassword.value);
    await router.push('/');
  } catch (e: any) {
    error.value =
      e.data?.statusMessage || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <div class="auth-container">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account?
          <NuxtLink
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email Field -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-green-500': emailValid && email.length > 0,
                'border-red-500': !emailValid && email.length > 0
              }"
              placeholder="you@example.com"
            />
            <p
              v-if="emailValid && email.length > 0"
              class="mt-1 text-sm text-green-600"
            >
              ✓ Valid email
            </p>
            <p
              v-if="!emailValid && email.length > 0"
              class="mt-1 text-sm text-red-600"
            >
              ✗ Invalid email format
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-green-500':
                  passwordStrength.valid && password.length > 0,
                'border-yellow-500':
                  passwordStrength.strength === 'medium' && password.length > 0,
                'border-red-500':
                  passwordStrength.strength === 'weak' && password.length > 0
              }"
              placeholder="••••••••"
            />
            <div v-if="password.length > 0" class="mt-2 space-y-1">
              <div class="flex items-center space-x-2">
                <div
                  class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full transition-all"
                    :class="{
                      'bg-red-500 w-1/3': passwordStrength.strength === 'weak',
                      'bg-yellow-500 w-2/3':
                        passwordStrength.strength === 'medium',
                      'bg-green-500 w-full':
                        passwordStrength.strength === 'strong'
                    }"
                  ></div>
                </div>
                <span
                  class="text-xs font-medium"
                  :class="{
                    'text-red-600': passwordStrength.strength === 'weak',
                    'text-yellow-600': passwordStrength.strength === 'medium',
                    'text-green-600': passwordStrength.strength === 'strong'
                  }"
                >
                  {{ passwordStrength.strength }}
                </span>
              </div>
              <p class="text-xs text-gray-500">
                Password must contain: 8+ characters, uppercase, lowercase,
                number, and special character
              </p>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label
              for="confirm-password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="{
                'border-green-500': passwordsMatch,
                'border-red-500': !passwordsMatch && confirmPassword.length > 0
              }"
              placeholder="••••••••"
            />
            <p v-if="passwordsMatch" class="mt-1 text-sm text-green-600">
              ✓ Passwords match
            </p>
            <p
              v-if="!passwordsMatch && confirmPassword.length > 0"
              class="mt-1 text-sm text-red-600"
            >
              ✗ Passwords do not match
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !formValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
