import { hash } from 'bcrypt';
import { prisma } from '../../utils/prisma';
import { validateEmail, validatePassword } from '../../utils/validation';
import type { RegisterCredentials } from '../../../app/types/auth';

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<RegisterCredentials>(event);
    const { email, password, confirmPassword } = body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors.join(', ')
      });
    }

    // Check password confirmation match
    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwords do not match'
      });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already registered'
      });
    }

    // Hash password with bcrypt (salt rounds: 12)
    const hashedPassword = await hash(password, 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword
      }
    });

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
    console.error('Registration error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during registration'
    });
  }
});
