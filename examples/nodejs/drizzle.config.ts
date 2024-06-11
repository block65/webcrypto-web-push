import type { Config } from 'drizzle-kit';

export default {
  schema: './schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
  dbCredentials: {
    url: new URL('./data/sqlite.db', import.meta.url).toString(),
  },
} satisfies Config;
