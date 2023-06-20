## Routes

### Login
- URL: `/login`
- Method: POST
- Parameters:
  - email or username
  - password

### GoogleAuth Signup
- URL: `/callback`
- Method: POST
- Headers:
  - accessToken (Google access token)

### GoogleAuth Login
- URL: `/callback`
- Method: POST
- Headers:
  - accessToken (Google access token)
  - ign
  - tag_line
  - username (optional)

### User
- Get User:
  - URL: `/user`
  - Method: GET
  - Query Parameters:
    - id: _id or username
