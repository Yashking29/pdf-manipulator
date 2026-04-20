/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LS_CHECKOUT_URL?: string
  readonly VITE_FORMSPREE_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
