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
          content_type: 'Content Type',
          created_at: 'Created At',
          debug_is_user_active: 'Is User Active?',
          debug_is_user_admin: 'Is User Admin?',
          debug_make_first_req_message: 'Make your first request, the response data will be shown here',
          debug_not_logged_message: 'You must be logged to retrieve your user profile data',
          debug_route_not_logged_message: 'You must be logged to retrieve any data from this route',
          header_auth_message: 'Sending User Token as Bearer Token',
          formdata: 'FormData',
          json: 'JSON',
          last_response: 'Last Response',
          logged: 'Logged',
          login: 'Login',
          not_available: 'Not Available',
          not_logged: 'Not Logged',
          password: 'Password',
          received_token: 'Received Token',
          register: 'Register',
          req_details: 'Request Details',
          res_json: 'Response JSON',
          song_leaderboard: 'Song Leaderboard',
          status: 'Status',
          token_copy: 'Copy Token',
          token_delete: 'Delete Token',
          updated_at: 'Updated At',
          upload_replay_file: 'Upload REPLAY File',
          url: 'URL',
          user_login: 'User Login',
          user_profile: 'User Profile',
          user_register: 'User Register',
          username_short: 'Username',
          username: 'User name',
          // pagination
          page_number: 'Page Number',
          page_size: 'Page Size',
          // song leaderboard
          song_id: "Song ID",
          instrument: "Instrument",
          difficulty: "Difficulty",
          engine: "Engine",
          allowed_modifiers: "Allowed Modifiers",
          allow_slowdowns: "Allow Slowdowns",
          sort_by_notes_hit: "Sort by Notes Hit"
        },
      },
    },
    fallbackLng: 'en-US',
  })

export default i18n
