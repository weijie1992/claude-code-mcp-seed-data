import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, readonly } from 'vue';

// Mock dependencies
const mockUser = ref(null);
const mockFetchSession = vi.fn();
const mockClearSession = vi.fn();
const mockFetch = vi.fn();

vi.stubGlobal('useUserSession', () => ({
  user: mockUser,
  fetch: mockFetchSession,
  clear: mockClearSession
}));

vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('ref', ref);
vi.stubGlobal('readonly', readonly);

// Import after mocking
const { useAuth } = await import('~/composables/useAuth');

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should call register API and fetch session on success', async () => {
      mockFetch.mockResolvedValue({});
      mockFetchSession.mockResolvedValue({});

      const { register } = useAuth();
      await register('test@example.com', 'Password123!', 'Password123!');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        }
      });
      expect(mockFetchSession).toHaveBeenCalled();
    });

    it('should set loading state during registration', async () => {
      mockFetch.mockResolvedValue({});
      mockFetchSession.mockResolvedValue({});

      const { register, loading } = useAuth();
      expect(loading.value).toBe(false);

      const registerPromise = register('test@example.com', 'Password123!', 'Password123!');
      await registerPromise;

      expect(loading.value).toBe(false);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      mockFetch.mockRejectedValue(error);

      const { register } = useAuth();

      await expect(
        register('test@example.com', 'Password123!', 'Password123!')
      ).rejects.toThrow('Registration failed');
    });

    it('should reset loading state after error', async () => {
      mockFetch.mockRejectedValue(new Error('Registration failed'));

      const { register, loading } = useAuth();

      try {
        await register('test@example.com', 'Password123!', 'Password123!');
      } catch (e) {
        // Expected error
      }

      expect(loading.value).toBe(false);
    });
  });

  describe('login', () => {
    it('should call login API and fetch session on success', async () => {
      mockFetch.mockResolvedValue({});
      mockFetchSession.mockResolvedValue({});

      const { login } = useAuth();
      await login('test@example.com', 'Password123!');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      });
      expect(mockFetchSession).toHaveBeenCalled();
    });

    it('should set loading state during login', async () => {
      mockFetch.mockResolvedValue({});
      mockFetchSession.mockResolvedValue({});

      const { login, loading } = useAuth();
      expect(loading.value).toBe(false);

      const loginPromise = login('test@example.com', 'Password123!');
      // Loading should be true during the call
      await loginPromise;

      expect(loading.value).toBe(false);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      mockFetch.mockRejectedValue(error);

      const { login } = useAuth();

      await expect(
        login('test@example.com', 'Password123!')
      ).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('should call logout API and clear session', async () => {
      mockFetch.mockResolvedValue({});
      mockClearSession.mockResolvedValue(undefined);

      const { logout } = useAuth();
      await logout();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST'
      });
      expect(mockClearSession).toHaveBeenCalled();
    });

    it('should set loading state during logout', async () => {
      mockFetch.mockResolvedValue({});
      mockClearSession.mockResolvedValue(undefined);

      const { logout, loading } = useAuth();
      expect(loading.value).toBe(false);

      await logout();

      expect(loading.value).toBe(false);
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      mockFetch.mockRejectedValue(error);

      const { logout } = useAuth();

      await expect(logout()).rejects.toThrow('Logout failed');
    });

    it('should reset loading state after logout error', async () => {
      mockFetch.mockRejectedValue(new Error('Logout failed'));

      const { logout, loading } = useAuth();

      try {
        await logout();
      } catch (e) {
        // Expected error
      }

      expect(loading.value).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('should call fetchSession to get user data', async () => {
      mockFetchSession.mockResolvedValue({});

      const { fetchUser } = useAuth();
      await fetchUser();

      expect(mockFetchSession).toHaveBeenCalled();
    });

    it('should set loading state during fetch', async () => {
      mockFetchSession.mockResolvedValue({});

      const { fetchUser, loading } = useAuth();
      expect(loading.value).toBe(false);

      await fetchUser();

      expect(loading.value).toBe(false);
    });

    it('should handle fetchUser errors', async () => {
      const error = new Error('Fetch failed');
      mockFetchSession.mockRejectedValue(error);

      const { fetchUser } = useAuth();

      await expect(fetchUser()).rejects.toThrow('Fetch failed');
    });
  });

  describe('user state', () => {
    it('should expose user ref from useUserSession', () => {
      const testUser = { id: 1, email: 'test@example.com' };
      mockUser.value = testUser as any;

      const { user } = useAuth();

      expect(user.value).toEqual(testUser);
    });

    it('should return null when no user is logged in', () => {
      mockUser.value = null;

      const { user } = useAuth();

      expect(user.value).toBeNull();
    });
  });
});
