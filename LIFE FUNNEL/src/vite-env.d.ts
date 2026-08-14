/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUSINESS_PHONE: string;
  readonly VITE_CALENDAR_URL: string;
  readonly VITE_LEAD_WEBHOOK_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
