/**
 * User interface matching Prisma User model (without password)
 * This is what gets returned to clients and stored in sessions
 */
export interface User {
  id: number
  email: string
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration credentials interface
 */
export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User
}
