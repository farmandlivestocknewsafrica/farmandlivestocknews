import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

/**
 * Hash a password using scrypt (Node.js native, works in serverless)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false
    
    const hashBuffer = Buffer.from(hash, 'hex')
    const suppliedHashBuffer = scryptSync(password, salt, 64)
    
    return timingSafeEqual(hashBuffer, suppliedHashBuffer)
  } catch {
    return false
  }
}

/**
 * Generate a random token for password reset or email verification
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
