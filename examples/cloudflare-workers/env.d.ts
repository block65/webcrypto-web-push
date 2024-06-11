declare type Env = {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;

  DB: D1Database;
};
