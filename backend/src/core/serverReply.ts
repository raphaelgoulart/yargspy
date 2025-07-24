import type { FastifyReply } from 'fastify'
import type { LiteralUnion } from 'type-fest'

// #region Enums

export const httpCodes = {
  // 1xx: Informational
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',

  // 2xx: Success
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',

  // 3xx: Redirection
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',

  // 4xx: Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx: Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
} as const

export const codeMap = {
  err_auth_required: [401, 'No authorization string found on request headers'],
  err_empty_json_body: [400, "Body cannot be empty when content-type is set to 'application/json'"],
  err_invalid_auth_format: [401, 'Invalid authorization string format found on request headers'],
  err_invalid_auth: [401, 'The provided authorization token is not valid. Please logout this session, validate a new login and try again'],
  err_invalid_input: [401, 'Some request validation method on the server declined your request due to validation errors on fields'],
  err_not_implemented: [501, 'Not implemented error: {{resolution}}'],
  err_syntax_json_body: [400, 'Response body JSON has a syntax error: {{additionalMessage}}'],
  err_unknown: [500, 'An unknown error occurred, please try again later'],
  ok: [200, 'Request completed'],

  // user/register
  err_user_register_duplicated_username_typo: [409, 'Provided username {{username}} is a typo of another registered user'],
  err_user_register_duplicated_username: [409, 'Provided username {{username}} is already being used'],
  err_user_register_no_body: [400, 'No body response provided for user registering route'],
  err_user_register_no_password: [400, 'No password provided for user registering'],
  err_user_register_no_username: [400, 'No username provided for user registering'],
  err_user_register_password_nolowercase: [400, 'Provided password must contain at least one lowercase character'],
  err_user_register_password_nonumber: [400, 'Provided password must contain at least one numeric digit'],
  err_user_register_password_nospecialchar: [400, 'Provided password must contain at least one special character'],
  err_user_register_password_nouppercase: [400, 'Provided password must contain at least one uppercase character'],
  err_user_register_password_toobig: [400, "Provided password can't have more than 48 characters"],
  err_user_register_password_toosmall: [400, 'Provided password must have at least 8 characters'],
  err_user_register_username_invalid_type1: [400, 'Provided username is not valid due to forbidden symbols: # % +'],
  err_user_register_username_invalid_type2: [400, "Provided username can't start or end with period, underscore, or hyphen"],
  err_user_register_username_nospace: [400, "Provided username can't have space characters"],
  err_user_register_username_toobig: [400, "Provided username can't have more than 32 characters"],
  err_user_register_username_toosmall: [400, 'Provided username must have at least 3 characters'],
  success_user_register: [201, 'Your profile was created successfully'],

  // user/login
  err_login_password_validation: [401, "The provided password and the registered user's password don't match"],
  err_login_user_inactive: [401, 'The registered user has been deactivated and is unable to login'],
  err_login_user_notfound: [400, 'The provided username {{username}} is not registered'],
  err_user_login_no_body: [400, 'No body response provided for user login validation route'],
  err_user_login_no_password: [400, 'No password provided for user login validation'],
  err_user_login_no_username: [400, 'No username provided for user login validation'],
  suceess_user_login: [200, "You're logged in"],

  // user/profile
  success_user_profile: [200, 'Profile data from user {{username}} has been retrieved successfully'],

  // replay/register
  err_replay_nofileuploaded: [400, 'No YARG Replay file provided on the request body to register'],
  err_replay_invalid_replay_magic: [400, 'Provided YARG Replay file is invalid'],
  err_replay_invalid_midi_magic: [400, 'Provided MIDI file is invalid'],
  err_replay_invalid_chart_magic: [400, "Provided CHART file is invalid"],
  err_replay_missing_chart: [406, 'The MIDI/CHART file of the song is required to validate replay'],
  err_replay_invalid_chart: [406, "The provided CHART/MIDI file can't validate the provided REPLAY file"],
  success_replay_register: [201, 'Your score was registered successfully'],
} as const

export type ReplyCodeNames = keyof typeof codeMap
export type HTTPCodes = keyof typeof httpCodes
export type HTTPCodeNames = (typeof httpCodes)[HTTPCodes]
export type DirectMessage = [HTTPCodes, string]

// #region Function

/**
 * Builds and sends stardardized replies to user's requests throughout the server routes.
 * - - - -
 * @param {FastifyReply} reply The reply instance of the request.
 * @param {LiteralUnion<ReplyCodeNames, string> | DirectMessage} codeOrMessage A code of the error (status code and message will be retrieved from the internal code map), or an array with the status code and the custom message.
 * @param {Record<string, any> | null} [data] `OPTIONAL` Values that will be placed on the reply JSON object.
 * @param {Record<string, string>} [messageValues] `OPTIONAL` An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
 * @returns {FastifyReply}
 */
export const serverReply = (reply: FastifyReply, codeOrMessage: LiteralUnion<ReplyCodeNames, string> | DirectMessage, data?: Record<string, any> | null, messageValues?: Record<string, string>): FastifyReply => {
  let statusCode: HTTPCodes = 500
  let statusName: HTTPCodeNames = 'Internal Server Error'
  let message: string = 'An unknown error occurred'
  if (Array.isArray(codeOrMessage)) {
    statusCode = codeOrMessage[0]
    statusName = httpCodes[codeOrMessage[0]]
    message = codeOrMessage[1]
  } else if (codeMap[codeOrMessage as ReplyCodeNames]) {
    statusCode = codeMap[codeOrMessage as ReplyCodeNames][0]
    statusName = httpCodes[statusCode]
    message = codeMap[codeOrMessage as ReplyCodeNames][1]
  }

  if (messageValues) {
    const allKeys = Object.keys(messageValues)
    for (const key of allKeys) {
      message = message.replaceAll(`\{\{${key}\}\}`, messageValues[key])
    }
  }
  const send = {
    statusCode,
    statusName,
    statusFullName: `${statusCode} ${statusName}`,
    code: Array.isArray(codeOrMessage) ? 'unknown' : codeOrMessage,
    message,
    ...data,
  }
  return reply.status(statusCode).send(send)
}
