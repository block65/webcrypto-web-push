interface ImportMetaEnv {
  // WARN: these keys are not secure, generate your own!
  VITE_SERVER_VAPID_PUBLIC_KEY: string;
  VITE_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
