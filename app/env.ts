/**
 * Environment variables validation
 * Validates required environment variables at startup
 */

function getEnvVar (key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  CLERK_SECRET_KEY: getEnvVar('CLERK_SECRET_KEY'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
} as const
