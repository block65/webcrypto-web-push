import type { Config } from 'drizzle-kit';

export default {
  schema: './schema.ts',
  out: './migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
} satisfies Config;
