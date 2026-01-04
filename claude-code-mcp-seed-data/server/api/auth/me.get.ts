import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get session
    const session = await getUserSession(event)

    // Check if session exists
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Fetch user from database to verify they still exist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // User not found (might have been deleted)
    if (!user) {
      // Clear the invalid session
      await clearUserSession(event)

      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // Return user data (exclude password)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  } catch (error) {
    // If it's already an H3Error (from createError), rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Otherwise, it's an unexpected error
    console.error('Get current user error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred fetching user data'
    })
  }
})
