import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))

// Next.js uses .env.local; Prisma CLI only auto-loads .env — load .env.local explicitly.
config({ path: path.join(root, '.env.local') })
config({ path: path.join(root, '.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
})
