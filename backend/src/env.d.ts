declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEV?: string
      PORT: string
      MONGODB_URI: string
      JWT_SECRET: string
      PUBLIC_CHART_FILE_ACCESS_KEY: string
    }
  }
}

export {}
