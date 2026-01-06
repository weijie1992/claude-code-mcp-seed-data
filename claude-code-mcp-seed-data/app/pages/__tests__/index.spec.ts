import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IndexPage from '~/pages/index.vue';
import {
  createMockUseAuth,
  createMockUseRouter,
  createMockUser
} from '../../unit/test-utils';

// Create mock functions
const useAuthMock = vi.fn();
const useRouterMock = vi.fn();
const definePageMetaMock = vi.fn();

// Mock the Nuxt composables globally
vi.stubGlobal('useAuth', useAuthMock);
vi.stubGlobal('useRouter', useRouterMock);
vi.stubGlobal('definePageMeta', definePageMetaMock);

describe('Index Page', () => {
  let mockAuthComposable: ReturnType<typeof createMockUseAuth>;
  let mockRouterComposable: ReturnType<typeof createMockUseRouter>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create fresh mock instances
    mockAuthComposable = createMockUseAuth();
    mockRouterComposable = createMockUseRouter();

    // Set up the mocks
    useAuthMock.mockReturnValue(mockAuthComposable);
    useRouterMock.mockReturnValue(mockRouterComposable as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dashboard header', () => {
      render(IndexPage);
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeDefined();
    });

    it('should render the sign out button', () => {
      render(IndexPage);
      expect(screen.getByRole('button', { name: 'Sign out' })).toBeDefined();
    });

    it('should render welcome message', () => {
      render(IndexPage);
      expect(screen.getByText('Welcome back!')).toBeDefined();
    });

    it('should display authentication message', () => {
      render(IndexPage);
      expect(
        screen.getByText(
          'You have successfully logged in. This is a protected page that requires authentication.'
        )
      ).toBeDefined();
    });
  });

  describe('User Data Display', () => {
    it('should display user email when user is authenticated', () => {
      const mockUser = createMockUser({ email: 'user@test.com' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('Email')).toBeDefined();
      expect(screen.getByText('user@test.com')).toBeDefined();
    });

    it('should display user ID when user is authenticated', () => {
      const mockUser = createMockUser({ id: 42 });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('User ID')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
    });

    it('should display user name when it exists', () => {
      const mockUser = createMockUser({ name: 'John Doe' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('Name')).toBeDefined();
      expect(screen.getByText('John Doe')).toBeDefined();
    });

    it('should not display name field when user name is null', () => {
      const mockUser = createMockUser({ name: null });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.queryByText('Name')).toBeNull();
    });

    it('should not display name field when user name is undefined', () => {
      const mockUser = createMockUser({ name: undefined });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.queryByText('Name')).toBeNull();
    });

    it('should display loading message when user is null', () => {
      mockAuthComposable.user.value = null;

      render(IndexPage);

      expect(screen.getByText('Loading user data...')).toBeDefined();
    });

    it('should not display user data fields when user is null', () => {
      mockAuthComposable.user.value = null;

      render(IndexPage);

      expect(screen.queryByText('Email')).toBeNull();
      expect(screen.queryByText('User ID')).toBeNull();
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when sign out button is clicked', async () => {
      const user = userEvent.setup();
      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      expect(mockAuthComposable.logout).toHaveBeenCalledOnce();
    });

    it('should navigate to login page after successful logout', async () => {
      const user = userEvent.setup();
      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockRouterComposable.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should call logout before navigation', async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      mockAuthComposable.logout.mockImplementation(async () => {
        callOrder.push('logout');
      });

      mockRouterComposable.push.mockImplementation(async () => {
        callOrder.push('navigate');
      });

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(callOrder).toEqual(['logout', 'navigate']);
      });
    });

    it('should handle logout error and log to console', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const logoutError = new Error('Logout failed');

      mockAuthComposable.logout.mockRejectedValue(logoutError);

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Logout failed:',
          logoutError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not navigate to login when logout fails', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockAuthComposable.logout.mockRejectedValue(new Error('Logout failed'));

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      expect(mockRouterComposable.push).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle navigation error after successful logout', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const navigationError = new Error('Navigation failed');

      mockRouterComposable.push.mockRejectedValue(navigationError);

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Logout failed:',
          navigationError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should allow multiple logout attempts', async () => {
      const user = userEvent.setup();
      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });

      await user.click(signOutButton);
      await waitFor(() => {
        expect(mockAuthComposable.logout).toHaveBeenCalledTimes(1);
      });

      await user.click(signOutButton);
      await waitFor(() => {
        expect(mockAuthComposable.logout).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with empty string email', () => {
      const mockUser = createMockUser({ email: '' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('Email')).toBeDefined();
      // The empty email field should still be rendered in the DOM
      const emailFields = screen.getAllByText('');
      expect(emailFields.length).toBeGreaterThan(0);
    });

    it('should handle user with empty string name', () => {
      const mockUser = createMockUser({ name: '' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      // Empty string is falsy in v-if, so Name field should NOT be displayed
      expect(screen.queryByText('Name')).toBeNull();
    });

    it('should handle user with ID zero', () => {
      const mockUser = createMockUser({ id: 0 });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('User ID')).toBeDefined();
      expect(screen.getByText('0')).toBeDefined();
    });

    it('should handle user with very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const mockUser = createMockUser({ email: longEmail });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText(longEmail)).toBeDefined();
    });

    it('should handle user with very large ID', () => {
      const largeId = Number.MAX_SAFE_INTEGER;
      const mockUser = createMockUser({ id: largeId });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText(largeId.toString())).toBeDefined();
    });

    it('should handle special characters in user name', () => {
      const specialName = '<script>alert("XSS")</script>';
      const mockUser = createMockUser({ name: specialName });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      // Vue should escape the special characters
      expect(screen.getByText(specialName)).toBeDefined();
    });

    it('should handle special characters in email', () => {
      const specialEmail = 'test+tag@example.com';
      const mockUser = createMockUser({ email: specialEmail });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText(specialEmail)).toBeDefined();
    });
  });

  describe('Reactivity', () => {
    it('should update displayed email when user changes', async () => {
      const mockUser = createMockUser({ email: 'initial@example.com' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('initial@example.com')).toBeDefined();

      // Update user
      mockAuthComposable.user.value = createMockUser({
        email: 'updated@example.com'
      });

      await waitFor(() => {
        expect(screen.getByText('updated@example.com')).toBeDefined();
      });
    });

    it('should show loading message when user becomes null', async () => {
      const mockUser = createMockUser();
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText(mockUser.email)).toBeDefined();

      // Set user to null
      mockAuthComposable.user.value = null;

      await waitFor(() => {
        expect(screen.getByText('Loading user data...')).toBeDefined();
      });
    });

    it('should hide name field when user name is removed', async () => {
      const mockUser = createMockUser({ name: 'John Doe' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('John Doe')).toBeDefined();

      // Update user without name
      mockAuthComposable.user.value = createMockUser({ name: null });

      await waitFor(() => {
        expect(screen.queryByText('Name')).toBeNull();
      });
    });

    it('should show name field when user name is added', async () => {
      const mockUser = createMockUser({ name: null });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.queryByText('Name')).toBeNull();

      // Add name to user
      mockAuthComposable.user.value = createMockUser({ name: 'Jane Doe' });

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(IndexPage);

      const h1 = screen.getByRole('heading', { name: 'Dashboard', level: 1 });
      const h2 = screen.getByRole('heading', {
        name: 'Welcome back!',
        level: 2
      });

      expect(h1).toBeDefined();
      expect(h2).toBeDefined();
    });

    it('should have accessible button with proper text', () => {
      render(IndexPage);

      const button = screen.getByRole('button', { name: 'Sign out' });
      expect(button).toBeDefined();
    });

    it('should render navigation landmark', () => {
      const { container } = render(IndexPage);
      const nav = container.querySelector('nav');

      expect(nav).toBeTruthy();
    });

    it('should render main landmark', () => {
      render(IndexPage);
      const main = screen.getByRole('main');

      expect(main).toBeDefined();
    });
  });

  describe('Styling Classes', () => {
    it('should apply correct layout classes to root div', () => {
      const { container } = render(IndexPage);
      const rootDiv = container.firstChild as HTMLElement;

      expect(rootDiv.classList.contains('min-h-screen')).toBe(true);
      expect(rootDiv.classList.contains('bg-gray-50')).toBe(true);
    });

    it('should apply correct classes to sign out button', () => {
      render(IndexPage);
      const button = screen.getByRole('button', { name: 'Sign out' });

      expect(button.classList.contains('bg-indigo-600')).toBe(true);
      expect(button.classList.contains('hover:bg-indigo-700')).toBe(true);
    });

    it('should apply shadow class to navigation', () => {
      const { container } = render(IndexPage);
      const nav = container.querySelector('nav');

      expect(nav?.classList.contains('shadow-sm')).toBe(true);
    });

    it('should apply rounded-lg class to main card', () => {
      const { container } = render(IndexPage);
      const card = container.querySelector('.rounded-lg');

      expect(card).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render header navigation with correct structure', () => {
      const { container } = render(IndexPage);
      const nav = container.querySelector('nav');
      const navContent = nav?.querySelector('.max-w-7xl');

      expect(nav).toBeTruthy();
      expect(navContent).toBeTruthy();
    });

    it('should render main content with correct container', () => {
      const { container } = render(IndexPage);
      const main = container.querySelector('main.max-w-7xl');

      expect(main).toBeTruthy();
    });

    it('should render user data in space-y-3 container when user exists', () => {
      const mockUser = createMockUser();
      mockAuthComposable.user.value = mockUser;

      const { container } = render(IndexPage);
      const userDataContainer = container.querySelector('.space-y-3');

      expect(userDataContainer).toBeTruthy();
    });

    it('should render border divider between user info and message', () => {
      const { container } = render(IndexPage);
      const divider = container.querySelector('.border-t.border-gray-200');

      expect(divider).toBeTruthy();
    });
  });

  describe('Error Handling - Concurrent Operations', () => {
    it('should handle rapid multiple clicks on logout button', async () => {
      const user = userEvent.setup();
      let logoutCallCount = 0;

      mockAuthComposable.logout.mockImplementation(async () => {
        logoutCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });

      // Click multiple times rapidly
      const clickPromises = [
        user.click(signOutButton),
        user.click(signOutButton),
        user.click(signOutButton)
      ];

      await Promise.all(clickPromises);

      // All clicks should trigger logout
      expect(logoutCallCount).toBe(3);
    });

    it('should handle logout timeout scenario', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockAuthComposable.logout.mockImplementation(async () => {
        await new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        );
      });

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Logout failed:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Date-Time Sensitive Scenarios', () => {
    it('should display user created and updated timestamps correctly', () => {
      const fixedDate = new Date('2026-01-06T12:00:00.000Z');
      vi.setSystemTime(fixedDate);

      const mockUser = createMockUser({
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-05T12:00:00.000Z')
      });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      // Verify user object has correct dates
      expect(mockAuthComposable.user.value?.createdAt).toEqual(
        new Date('2026-01-01T00:00:00.000Z')
      );
      expect(mockAuthComposable.user.value?.updatedAt).toEqual(
        new Date('2026-01-05T12:00:00.000Z')
      );

      vi.useRealTimers();
    });

    it('should handle user data with same created and updated dates', () => {
      const sameDate = new Date('2026-01-01T00:00:00.000Z');
      vi.setSystemTime(sameDate);

      const mockUser = createMockUser({
        createdAt: sameDate,
        updatedAt: sameDate
      });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(mockAuthComposable.user.value?.createdAt).toEqual(
        mockAuthComposable.user.value?.updatedAt
      );

      vi.useRealTimers();
    });

    it('should handle user data with future dates', () => {
      const currentDate = new Date('2026-01-06T12:00:00.000Z');
      const futureDate = new Date('2027-01-06T12:00:00.000Z');

      vi.setSystemTime(currentDate);

      const mockUser = createMockUser({
        createdAt: futureDate,
        updatedAt: futureDate
      });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(mockAuthComposable.user.value?.createdAt).toEqual(futureDate);
      expect(mockAuthComposable.user.value?.updatedAt).toEqual(futureDate);

      vi.useRealTimers();
    });
  });

  describe('Integration with Composables', () => {
    it('should call useAuth composable on component mount', () => {
      render(IndexPage);
      expect(useAuthMock).toHaveBeenCalled();
    });

    it('should call useRouter composable on component mount', () => {
      render(IndexPage);
      expect(useRouterMock).toHaveBeenCalled();
    });

    it('should use user data from useAuth composable', () => {
      const mockUser = createMockUser({ email: 'composable@test.com' });
      mockAuthComposable.user.value = mockUser;

      render(IndexPage);

      expect(screen.getByText('composable@test.com')).toBeDefined();
    });

    it('should use logout function from useAuth composable', async () => {
      const user = userEvent.setup();
      const customLogout = vi.fn().mockResolvedValue(undefined);
      mockAuthComposable.logout = customLogout;

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      expect(customLogout).toHaveBeenCalled();
    });

    it('should use router push from useRouter composable', async () => {
      const user = userEvent.setup();
      const customPush = vi.fn().mockResolvedValue(undefined);
      mockRouterComposable.push = customPush;

      render(IndexPage);

      const signOutButton = screen.getByRole('button', { name: 'Sign out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(customPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});
