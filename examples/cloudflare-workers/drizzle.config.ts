import type { Config } from 'drizzle-kit';

export default {
  schema: './schema.ts',
  driver: 'd1-http',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
  dbCredentials: {
    accountId: 'dev',
    databaseId: 'dev',
    token: 'dev',
  },
} satisfies Config;
