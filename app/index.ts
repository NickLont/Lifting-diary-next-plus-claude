import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'
import { env } from '@/app/env'
import * as schema from '@/app/db/schema'

const pool = new Pool({ connectionString: env.DATABASE_URL })
const db = drizzle(pool, { schema })

export { db }
export * from '@/app/db/schema'
