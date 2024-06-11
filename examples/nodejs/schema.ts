import {
  customType,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return 'jsonb';
    },
    toDriver(value: TData): string {
      return JSON.stringify(value);
    },
    fromDriver(value) {
      return JSON.parse(value);
    },
  })(name);

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  endpoint: text('endpoint').notNull(),
  expirationTime: integer('expirationTime'),
  keys: customJsonb<{
    auth: string;
    p256dh: string;
  }>('keys').notNull(),
});
