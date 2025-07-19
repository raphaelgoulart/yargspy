# API Documentation

**Note:** All routes (except for `/status`) send generic response JSON.

## Base URL

`https://localhost:5000`

---

## 🟩 GET /server

**Description:**  
Retrieve the status of the server.

**Response (Status Only):**

- `200 OK`
  - On success.
- `503 Service Unavailable`

## 🟦 POST /user/register

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

## 🟦 POST /user/login

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
  - When the provided user exists but provided password doesn't match.
- `501 Not Implemented`
  - On not implemented errors.

**Response Body**:

```ts
interface GenericResponseObject {
  statusCode: number;
  statusName: string;
  code: string;
  message: string;
}

interface IUserLoginResponse extends GenericResponseObject {
  payload: string;
}
```

## 🟦 POST /user/profile

**Description:**  
Retrieve the user profile data by its token.

**Headers:**  
Authorization required with valid login token.

**Responses**:

- `200 OK`
  - On success.
- `401 Unauthorized`
  - Invalid token (wrong format, expired token).
- `501 Not Implemented`
  - On not implemented errors.

**Response Body**:

```ts
interface GenericResponseObject {
  statusCode: number;
  statusName: string;
  code: string;
  message: string;
}

interface IUserProfileResponse extends GenericResponseObject {
  user: string;
}
```
