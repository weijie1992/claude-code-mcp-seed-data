import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';

// Mock dependencies
const mockUser = ref(null);
const mockNavigateTo = vi.fn();
const mockConsoleLog = vi.fn();

vi.stubGlobal('useUserSession', () => ({
  user: mockUser
}));

vi.stubGlobal('navigateTo', mockNavigateTo);
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: any) => fn);

// Mock console.log
const originalLog = console.log;

// Import after mocking
const authMiddleware = (await import('~/middleware/auth')).default;

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = null;
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    console.log = originalLog;
  });

  describe('Protected routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      mockUser.value = null;
      mockNavigateTo.mockReturnValue('redirect-result');

      const to = { path: '/', fullPath: '/' };
      const from = { path: '/login', fullPath: '/login' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/' }
      });
      expect(result).toBe('redirect-result');
    });

    it('should allow access to protected route when authenticated', () => {
      mockUser.value = { id: 1, email: 'test@example.com' };

      const to = { path: '/', fullPath: '/' };
      const from = { path: '/login', fullPath: '/login' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should preserve redirect query parameter', () => {
      mockUser.value = null;

      const to = { path: '/', fullPath: '/?foo=bar' };
      const from = { path: '/login', fullPath: '/login' };

      authMiddleware(to as any, from as any);

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/?foo=bar' }
      });
    });
  });

  describe('Auth routes', () => {
    it('should redirect to home when accessing login while authenticated', () => {
      mockUser.value = { id: 1, email: 'test@example.com' };
      mockNavigateTo.mockReturnValue('redirect-to-home');

      const to = { path: '/login', fullPath: '/login' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).toHaveBeenCalledWith('/');
      expect(result).toBe('redirect-to-home');
    });

    it('should redirect to home when accessing register while authenticated', () => {
      mockUser.value = { id: 1, email: 'test@example.com' };
      mockNavigateTo.mockReturnValue('redirect-to-home');

      const to = { path: '/register', fullPath: '/register' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).toHaveBeenCalledWith('/');
      expect(result).toBe('redirect-to-home');
    });

    it('should allow access to login when not authenticated', () => {
      mockUser.value = null;

      const to = { path: '/login', fullPath: '/login' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should allow access to register when not authenticated', () => {
      mockUser.value = null;

      const to = { path: '/register', fullPath: '/register' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('Logging', () => {
    it('should log middleware check', () => {
      mockUser.value = null;

      const to = { path: '/login', fullPath: '/login' };
      const from = { path: '/', fullPath: '/' };

      authMiddleware(to as any, from as any);

      expect(mockConsoleLog).toHaveBeenCalledWith('Middleware check:', {
        to: '/login',
        isAuthenticated: false
      });
    });

    it('should log correct authentication status', () => {
      mockUser.value = { id: 1, email: 'test@example.com' };

      const to = { path: '/', fullPath: '/' };
      const from = { path: '/login', fullPath: '/login' };

      authMiddleware(to as any, from as any);

      expect(mockConsoleLog).toHaveBeenCalledWith('Middleware check:', {
        to: '/',
        isAuthenticated: true
      });
    });
  });

  describe('Non-protected routes', () => {
    it('should allow access to any non-protected route when authenticated', () => {
      mockUser.value = { id: 1, email: 'test@example.com' };

      const to = { path: '/some-other-page', fullPath: '/some-other-page' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should allow access to any non-protected route when not authenticated', () => {
      mockUser.value = null;

      const to = { path: '/some-other-page', fullPath: '/some-other-page' };
      const from = { path: '/', fullPath: '/' };

      const result = authMiddleware(to as any, from as any);

      expect(mockNavigateTo).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
