import { vi } from 'vitest';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { User } from '~/types/auth';

/**
 * Create a mock user object for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides
  };
}

/**
 * Create mock useAuth composable
 */
export function createMockUseAuth(overrides?: {
  user?: Ref<User | null>;
  loading?: Ref<boolean>;
  logout?: () => Promise<void>;
}) {
  const defaultUser = ref<User | null>(createMockUser());
  const defaultLoading = ref(false);
  const defaultLogout = vi.fn().mockResolvedValue(undefined);

  return {
    user: overrides?.user ?? defaultUser,
    loading: overrides?.loading ?? defaultLoading,
    logout: overrides?.logout ?? defaultLogout,
    register: vi.fn(),
    login: vi.fn(),
    fetchUser: vi.fn()
  };
}

/**
 * Create mock useRouter composable
 */
export function createMockUseRouter(overrides?: {
  push?: (path: string) => Promise<void>;
}) {
  const defaultPush = vi.fn().mockResolvedValue(undefined);

  return {
    push: overrides?.push ?? defaultPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    currentRoute: ref({ path: '/' })
  };
}
