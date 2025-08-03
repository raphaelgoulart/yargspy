export interface GenericServerResponseObject {
  /**
   * The status code number.
   */
  statusCode: number
  /**
   * The status code name.
   */
  statusName: string
  /**
   * The status code number and name.
   */
  statusFullName: string
  /**
   * Internal code string that represents the status of the response.
   */
  code: string
  /**
   * A generic message of the response status (in English).
   */
  message: string
  /**
   * An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  messageValues?: Record<string, string>
  requestTime: number
}

export interface DebugUserLoginResponseDecorators extends GenericServerResponseObject {
  token?: string
}

export interface DebugUserProfileResponseDecorators extends GenericServerResponseObject {
  user?: {
    _id: string
    username: string
    active: boolean
    admin: boolean
    createdAt: Date
    updatedAt: Date
  }
}
export {}
