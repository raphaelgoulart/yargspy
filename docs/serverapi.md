<h1>Server API</h1>

- [Interfaces](#interfaces)
  - [Server Responses](#server-responses)
  - [User Tokens](#user-tokens)
- [`GET` server](#get-server)
- [`POST` user/register](#post-userregister)
- [`POST` user/login](#post-userlogin)
- [`POST` user/profile](#post-userprofile)

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
}
```

### User Tokens

User tokens are signed JSON objects where it holds the `ObjectID` of the user that owns the token.

```ts
interface GenericServerUserTokenObject {
  /**
   * The `ObjectID` of the user, encoded in Base64 string.
   */
  _id: string;
  /**
   * Tells if the user has admin privileges
   */
  admin: boolean;
}
```

---

## `GET` server

**Description:**  
Retrieve the status of the server.

**Response (Status Only):**

- `200 OK`
  - On success.
- `503 Service Unavailable`

## `POST` user/register

**Description:**  
Register a new user.

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
- `501 Not Implemented`
  - On not implemented errors.

## `POST` user/login

**Description:**  
Authenticate a user login

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
- `501 Not Implemented`
  - On not implemented errors.

**Response Body**:

```ts
interface IUserLoginResponse extends GenericServerResponseObject {
  token: string;
}
```

## `POST` user/profile

**Description:**  
Retrieve the user profile data by its token.

**Headers:**  
Authorization required with valid login token.

**Responses**:

- `200 OK`
  - On success.
- `401 Unauthorized`
  - Invalid token (wrong format, expired token), inactive user register.
- `501 Not Implemented`
  - On not implemented errors.

**Response Body**:

```ts
interface IUserProfileResponse extends GenericServerResponseObject {
  user: string;
}
```
