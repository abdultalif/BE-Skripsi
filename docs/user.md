# Api Spec User

## Register User API
Endpoint: POST /api-public/users

Request Body:

```json
{
"name": "Abdul Talif Parinduri",
"email": "abdultalif85@gmail.com",
"password": "Talif123!"
}
```


Response Body Success: 

```json
{
  "statusResponse": 201,
  "status": "success",
  "success": "Register Success",
  "message": "User created, please check your email"
  "data": {
    "id": "1f0098ad-9ff1-4f5b-b811-7be320697ee7",
    "name": "Abdul Talif Parinduri",
    "email": "abdultalif85@gmail.com",
    "expireTime": "2024-01-08T11:42:59.961Z"
  }
}
```


Response Body Error:

```json
{
  "statusResponse": 400,
  "status": "error",
  "errors": [
    "Email already activated"
  ],
  "message": "Register Field",
  "data": null
}
```

## Activate User API

Endpoint: GET api-public/users/activate/:email/:userId

Response Body Success:

```json
{
    "statusResponse": 200,
    "status": "success",
    "message": "User Activated",
    "data": {
        "name": "Abdul Talif Parinduri",
        "email": "abdultalif85@gmail.com"
    }
}
```


Response Body Error:

```json
{
    "statusResponse": 404,
    "status": "error",
    "errors": "User not found or expired",
    "message": "Activate User Field",
    "data": null
}
```


## Get User API

Endpoint: GET /api-public/users

Response Body Success:
```json
{
  "statusResponse": 200,
  "status": "success",
  "message": "OK",
  "data": [
    {
      "id": "1f0098ad-9ff1-4f5b-b811-7be320697ee7",
      "name": "Abdul Talif Parinduri",
      "email": "abdultalif85@gmail.com",
      "password": "$2b$10$oq4iDMJ0BPYa3t.QaoMDAeB1KejNuiEcDRQGDasWYa5DePV8sX376",
      "isActive": true,
      "expireTime": null,
      "createdAt": "2024-01-08T10:43:00.000Z",
      "updatedAt": "2024-01-08T11:04:15.000Z"
    },
    {
      "id": "a754f87f-9cce-4b21-8fc1-32c886a7881e",
      "name": "Abdul Talif Parinduri",
      "email": "abdultalif75@gmail.com",
      "password": "$2b$10$A7kauNp6Q0eSgkjzGFQRh..saqaxVfKwMgyDo/iXM8eezKuXQbGCy",
      "isActive": false,
      "expireTime": "2024-01-08T06:24:45.000Z",
      "createdAt": "2024-01-08T05:24:45.000Z",
      "updatedAt": "2024-01-08T05:24:45.000Z"
    }
  ]
}
```


Response Body Error:
```json
{
  "statusResponse": 404,
  "status": "error",
  "errors": "User is not found",
  "message": "",
  "data": null
}
```


## Login User Api

Request Body:
```json
{
  "email": "abdultalif85@gmail.com",
  "password": "Talif414!"
}
```

Response Body Success:
```json
{
  "statusResponse": 200,
  "status": "success",
  "message": "Login successfully",
  "data": {
    "name": "Abdul Talif",
    "email": "abdultalif85@gmail.com"
  },
  "accessToken": "unique-token",
  "refreshToken": "unique-token"
}
```

Response Body Error:

```json
  {
    "statusResponse": 401,
    "status": "error",
    "errors": "Email or password wrong",
    "message": "Login Field",
    "data": null
}
```