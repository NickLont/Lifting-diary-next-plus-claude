import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '@/app/env'
import * as schema from '@/app/db/schema'

const db = drizzle(env.DATABASE_URL, { schema })

export { db }
export * from '@/app/db/schema'
