import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

export default defineConfig({
  schema: './src/main/db/schema.ts',
  out: './src/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: join(process.env.DATA_DIR ?? './data', 'app.db')
  }
})
