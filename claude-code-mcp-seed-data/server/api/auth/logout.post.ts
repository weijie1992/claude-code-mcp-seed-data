export default defineEventHandler(async (event) => {
  try {
    // Clear user session
    await clearUserSession(event)

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during logout'
    })
  }
})
