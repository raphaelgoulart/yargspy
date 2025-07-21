import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import BrowserLngDetector from 'i18next-browser-languagedetector'

i18n
  .use(initReactI18next)
  .use(BrowserLngDetector)
  .init({
    debug: true,
    resources: {
      'en-US': {
        translation: {
          debug_user_login: 'Login',
          debug_user_register: 'User Register',
          debug_user_profile: 'User Profile',
        },
      },
    },
    fallbackLng: 'en-US',
  })

export default i18n
