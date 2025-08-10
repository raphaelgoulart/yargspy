<h1>Server API</h1>

- [Interfaces](#interfaces)
  - [Server Responses](#server-responses)
  - [User Tokens](#user-tokens)
- [`GET` server](#get-server)
- [`POST` user/register](#post-userregister)
- [`POST` user/login](#post-userlogin)
- [`POST` user/profile](#post-userprofile)
- [`PATCH` user/update](#patch-userupdate)
- [`POST` user/all](#post-userall)
- [`POST` replay/register](#post-replayregister)

## Interfaces

### Server Responses

The server sends `GenericServerResponseObject` JSON object on all routes except for `/status`.

```ts
export interface GenericServerResponseObject {
  /**
   * The status code number.
   */
  statusCode: number;
  /**
   * The status code name.
   */
  statusName: string;
  /**
   * The status code number and name.
   */
  statusFullName: string;
  /**
   * Internal code string that represents the status of the response.
   */
  code: string;
  /**
   * A generic message of the response status (in English).
   */
  message: string;
  /**
   * An object with key values that can be replaced parameters inside the message string by using `{{paramName}}` flags inside the string.
   */
  messageValues?: Record<string, string>;
}
```

### User Tokens

User tokens are signed JSON objects where it holds the `ObjectID` of the user that owns the token.

```ts
export interface GenericServerUserTokenObject {
  /**
   * The `ObjectID` of the user, encoded in Base64 string.
   */
  _id: string;
  /**
   * Tells if the user has admin privileges.
   */
  admin: boolean;
}
```

---

## `GET` server

**Description:**  
Retrieves the status of the server.

**Response (Status Only):**

- `200 OK`
  - On success.
- `503 Service Unavailable`

## `POST` user/register

**Description:**  
Registers a new user.

**Body Schema:**

```ts
interface IUserRegisterBodySchema {
  username: string;
  password: string;
}
```

**Responses**:

- `201 Created`
  - On success.
- `400 Bad Request`
  - On incomplete requests, response body JSON syntax errors, invalid body inputs.
- `409 Conflict`
  - When a user tries to register a username that's already registered.
- `500 Internal Server Error`
  - On not implemented errors.

## `POST` user/login

**Description:**  
Authenticates a user login.

**Body Schema:**

```ts
interface IUserLoginBodySchema {
  username: string;
  password: string;
}
```

**Responses**:

- `200 OK`
  - On success.
- `400 Bad Request`
  - On incomplete requests, response body JSON syntax errors, invalid body inputs, unregistered user.
- `401 Unauthorized`
  - When the provided user exists but provided password doesn't match, inactive user register.
- `500 Internal Server Error`
  - On not implemented errors.

**Response Body**:

```ts
interface IUserLoginResponse extends GenericServerResponseObject {
  token: string;
}
```

## `POST` user/profile

**Description:**  
Retrieves the user profile data by its token.

**Headers:**  
Authorization required with valid user token.

**Responses**:

- `200 OK`
  - On success.
- `401 Unauthorized`
  - Invalid token (wrong format, expired token), inactive user.
- `500 Internal Server Error`
  - On not implemented errors.

**Response Body**:

```ts
interface UserSchemaDocument {
  _id: string;
  username: string;
  active: boolean;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserProfileResponse extends GenericServerResponseObject {
  user?: UserSchemaDocument;
}
```

## `PATCH` user/update

**Description:**  
Edits an user entry from the database. Admin users can also update an user entry from any other user.

**Headers:**  
Authorization required with valid user token.

**Body Schema:**

```ts
interface IUserLoginBodySchema {
  profilePhotoURL?: string;
}
```

## `POST` user/all

**Description:**  
Retrieves all user entries from the database.

**Headers:**  
Authorization required with valid user token.

**Query Strings Values:**

| KEY     | TYPE   | DESCRIPTION                                                                |
| ------- | ------ | -------------------------------------------------------------------------- |
| `page`  | number | Specifies the page number of the results to retrieve. Default is `1`.      |
| `limit` | number | Specifies the maximum number of users to return per page. Default is `15`. |

**Responses**:

- `200 OK`
  - On success.
- `401 Unauthorized`
  - Invalid token (wrong format, expired token), inactive user.
- `500 Internal Server Error`
  - On not implemented errors.

**Response Body**:

```ts
interface UserSchemaDocument {
  _id: string;
  username: string;
  active: boolean;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserProfileResponse extends GenericServerResponseObject {
  // Information about the user, only is assigned a
  // value when the server is in development mode
  user?: UserSchemaDocument;
  totalEntries: number;
  totalPages: number;
  page: number;
  limit: number;
  entries: UserSchemaDocument[];
}
```

## `POST` replay/register

**Description:**  
Sends a REPLAY file to the server.

**Headers:**  
Authorization required with valid user token.

**Form Data Values:**

| KEY          | TYPE                         | DESCRIPTION                                                                                                                                   |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| replayFile   | `File`                       | The YARG REPLAY file to be registered                                                                                                         |
| chartFile    | `File?`                      | `OPTIONAL` The chart file (.chart/.mid) of the REPLAY song to register and validate. _Only required when setting `'complete'` as `reqType`_   |
| songDataFile | `File?`                      | `OPTIONAL` The song data file (.ini/.dta) of the REPLAY song to register and validate. _Only required when setting `'complete'` as `reqType`_ |
| reqType      | `'replayOnly' \| 'complete'` | The type of the request.                                                                                                                      |

**Responses**:

- `201 Created`
  - On success.
- `400 Bad Request`
  - Invalid file extension for any file extension accepted, invalid form data keys and values, invalid or missing `reqType` value, no YARG REPLAY value in form data,
- `409 Conflict`
  - When a user tries to register a YARG REPLAY Score that's already registered.
- `422 Unprocessable Entity`
  - Invalid file signature for any uploaded files, wrong chart file for YARG REPLAY file.
  - _For `replayOnly` request types:_ Song entry of provided YARG REPLAY file not registered in the database.
- `500 Internal Server Error`
  - On not implemented errors.
