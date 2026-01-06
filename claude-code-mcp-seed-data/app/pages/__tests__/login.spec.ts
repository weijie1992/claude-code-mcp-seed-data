import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { ref } from 'vue';
import LoginPage from '~/pages/login.vue';

// Create mock functions
const mockLogin = vi.fn();
const mockRouterPush = vi.fn();
const mockDefinePageMeta = vi.fn();

// Mock composables
vi.stubGlobal('useAuth', () => ({
  login: mockLogin
}));

vi.stubGlobal('useRouter', () => ({
  push: mockRouterPush
}));

vi.stubGlobal('useRoute', () => ({
  query: {}
}));

vi.stubGlobal('definePageMeta', mockDefinePageMeta);
vi.stubGlobal('ref', ref);

// Mock NuxtLink
const NuxtLinkMock = {
  name: 'NuxtLink',
  template: '<a :href="to"><slot /></a>',
  props: ['to']
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeDefined();
      expect(screen.getByLabelText(/email address/i)).toBeDefined();
      expect(screen.getByLabelText(/password/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
    });

    it('should render link to register page', () => {
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      expect(screen.getByText(/don't have an account/i)).toBeDefined();
      expect(screen.getByText(/create one/i)).toBeDefined();
    });

    it('should not show error message initially', () => {
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('Form Input', () => {
    it('should update email field when user types', async () => {
      const user = userEvent.setup();
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password field when user types', async () => {
      const user = userEvent.setup();
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      await user.type(passwordInput, 'Password123!');

      expect(passwordInput.value).toBe('Password123!');
    });

    it('should have required attribute on email field', () => {
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput.hasAttribute('required')).toBe(true);
    });

    it('should have required attribute on password field', () => {
      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput.hasAttribute('required')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({});

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('should navigate to home after successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({});
      mockRouterPush.mockResolvedValue({});

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      let resolvLogin: any;
      mockLogin.mockImplementation(() => new Promise(resolve => {
        resolvLogin = resolve;
      }));

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeDefined();
      });

      resolvLogin({});
    });

    it('should disable submit button during login', async () => {
      const user = userEvent.setup();
      let resolvLogin: any;
      mockLogin.mockImplementation(() => new Promise(resolve => {
        resolvLogin = resolve;
      }));

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton.hasAttribute('disabled')).toBe(true);
      });

      resolvLogin({});
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({
        data: { statusMessage: 'Invalid credentials' }
      });

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeDefined();
      });
    });

    it('should show default error message when no statusMessage provided', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({});

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/login failed\. please try again/i)).toBeDefined();
      });
    });

    it('should clear error message on new submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce({
        data: { statusMessage: 'Invalid credentials' }
      });

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeDefined();
      });

      // Try again
      mockLogin.mockResolvedValue({});
      await user.type(screen.getByLabelText(/password/i), 'CorrectPassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).toBeNull();
      });
    });

    it('should not navigate when login fails', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue({
        data: { statusMessage: 'Invalid credentials' }
      });

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeDefined();
      });

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('Redirect Handling', () => {
    it('should redirect to original destination after login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({});
      mockRouterPush.mockResolvedValue({});

      // Mock useRoute with redirect query
      vi.stubGlobal('useRoute', () => ({
        query: { redirect: '/dashboard' }
      }));

      render(LoginPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
