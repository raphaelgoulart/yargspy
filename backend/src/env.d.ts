declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEV?: string
      PORT: string
      MONGODB_URI: string
      JWT_SECRET: string
      HCAPTCHA_SECRET_KEY: string
    }
  }
}

export {}
