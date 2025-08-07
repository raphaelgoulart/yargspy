// #region Server Responses and internal objects
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
}

export interface GenericServerUserTokenObject {
  /**
   * The `ObjectID` of the user, encoded in Base64 string.
   */
  _id: string
  /**
   * Tells if the user has admin privileges.
   */
  admin: boolean
}
