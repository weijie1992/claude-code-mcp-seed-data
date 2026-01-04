import { compare } from 'bcrypt';
import { prisma } from '../../utils/prisma';
import { validateEmail } from '../../utils/validation';
import type { LoginCredentials } from '../../../app/types/auth';

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<LoginCredentials>(event);
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Timing-safe response: Use the same error message whether user doesn't exist or password is wrong
    // This prevents user enumeration attacks
    if (!user) {
      // Still perform a hash comparison to maintain consistent timing
      await compare(
        password,
        '$2b$12$dummyHashToPreventTimingAttack1234567890123456'
      );

      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      });
    }

    // Compare password with bcrypt (constant-time comparison)
    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      });
    }

    // Create session (store only id and email, not password)
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email
      }
    });

    // Return user data (exclude password)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  } catch (error) {
    // If it's already an H3Error (from createError), rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // Otherwise, it's an unexpected error
    console.error('Login error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login'
    });
  }
});
