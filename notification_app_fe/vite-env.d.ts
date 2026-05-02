/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_SECRET: string;
  readonly VITE_ACCESS_CODE: string;
  readonly VITE_USER_EMAIL: string;
  readonly VITE_USER_NAME: string;
  readonly VITE_ROLL_NO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
