import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { ref, computed, watch } from 'vue';
import RegisterPage from '~/pages/register.vue';

// Create mock functions
const mockRegister = vi.fn();
const mockRouterPush = vi.fn();
const mockDefinePageMeta = vi.fn();

// Mock composables
vi.stubGlobal('useAuth', () => ({
  register: mockRegister
}));

vi.stubGlobal('useRouter', () => ({
  push: mockRouterPush
}));

vi.stubGlobal('definePageMeta', mockDefinePageMeta);
vi.stubGlobal('ref', ref);
vi.stubGlobal('computed', computed);
vi.stubGlobal('watch', watch);

// Mock NuxtLink
const NuxtLinkMock = {
  name: 'NuxtLink',
  template: '<a :href="to"><slot /></a>',
  props: ['to']
};

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render registration form', () => {
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      expect(screen.getByRole('heading', { name: /create your account/i })).toBeDefined();
      expect(screen.getByLabelText(/email address/i)).toBeDefined();
      expect(screen.getByLabelText(/^password$/i)).toBeDefined();
      expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
    });

    it('should render link to login page', () => {
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      expect(screen.getByText(/already have an account/i)).toBeDefined();
      expect(screen.getByText(/sign in/i)).toBeDefined();
    });

    it('should have submit button disabled initially', () => {
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should show valid email indicator for correct email', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.getByText(/✓ valid email/i)).toBeDefined();
      });
    });

    it('should show invalid email indicator for incorrect email', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText(/✗ invalid email format/i)).toBeDefined();
      });
    });

    it('should validate email without domain', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@');

      await waitFor(() => {
        expect(screen.getByText(/✗ invalid email format/i)).toBeDefined();
      });
    });
  });

  describe('Password Strength Validation', () => {
    it('should show weak password for simple password', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'abc');

      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeDefined();
      });
    });

    it('should show medium password for partially strong password', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'Password123');

      await waitFor(() => {
        expect(screen.getByText(/medium/i)).toBeDefined();
      });
    });

    it('should show strong password for compliant password', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'Password123!');

      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeDefined();
      });
    });

    it('should display password requirements', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, 'a');

      await waitFor(() => {
        expect(
          screen.getByText(/password must contain.*8\+ characters.*uppercase.*lowercase.*number.*special character/i)
        ).toBeDefined();
      });
    });
  });

  describe('Password Match Validation', () => {
    it('should show passwords match indicator when passwords match', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Password123!');

      await waitFor(() => {
        expect(screen.getByText(/✓ passwords match/i)).toBeDefined();
      });
    });

    it('should show passwords do not match indicator when passwords differ', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'DifferentPassword123!');

      await waitFor(() => {
        expect(screen.getByText(/✗ passwords do not match/i)).toBeDefined();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call register function with valid credentials', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({});

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      // Wait for form validation to complete
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Password123!');
      });
    });

    it('should navigate to home after successful registration', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({});
      mockRouterPush.mockResolvedValue({});

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show loading state during registration', async () => {
      const user = userEvent.setup();
      let resolveRegister: any;
      mockRegister.mockImplementation(() => new Promise(resolve => {
        resolveRegister = resolve;
      }));

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeDefined();
      });

      resolveRegister({});
    });

    it('should not submit when form is invalid', async () => {
      const user = userEvent.setup();
      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
      await user.type(screen.getByLabelText(/^password$/i), 'weak');
      await user.type(screen.getByLabelText(/confirm password/i), 'different');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton.hasAttribute('disabled')).toBe(true);

      await user.click(submitButton);

      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when registration fails', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue({
        data: { statusMessage: 'Email already exists' }
      });

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeDefined();
      });
    });

    it('should show default error message when no statusMessage provided', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue({});

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed\. please try again/i)).toBeDefined();
      });
    });

    it('should not navigate when registration fails', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue({
        data: { statusMessage: 'Registration failed' }
      });

      render(RegisterPage, {
        global: {
          stubs: {
            NuxtLink: NuxtLinkMock
          }
        }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /create account/i });
        expect(button.hasAttribute('disabled')).toBe(false);
      });

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeDefined();
      });

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
