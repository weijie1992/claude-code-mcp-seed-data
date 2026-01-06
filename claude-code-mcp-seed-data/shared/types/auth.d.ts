/**
 * Type augmentation for nuxt-auth-utils
 * Defines the shape of the user session data
 */
declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name?: string
  }

  interface UserSession {
    // Add any extra session data here if needed
  }
}

export {}
