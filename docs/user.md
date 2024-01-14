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
  "status": true,
  "statusResponse": 201,
  "message": "User created, please check your email",
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
  "status": false,
  "statusResponse": 400,
  "message": [
    "Email already activated"
  ],
  "data": null
}
```

## Activate User API

Endpoint: GET api-public/users/activate/:email/:userId

Response Body Success:

```json
{
  "status": true,
    "statusResponse": 200,
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
  "status": false,
  "statusResponse": 404,
  "message": "User not found or expired",
  "data": null
}
```


## Get User API

Endpoint: GET /api-public/users

Response Body Success:
```json
{
  "status": true,
  "statusResponse": 200,
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
  "status": false,
  "statusResponse": 404,
  "message": "User is not found",
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
  "status": true,
  "statusResponse": 200,
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
    "status": false,
    "statusResponse": 401,
    "message": "Email or password wrong",
    "data": null
}
```

## Update User API

Request Body:
```json
{
  "email": "abdultalif85@gmail.com",
  "name": "Talif"
}
```

Response Body Success:
```json
{
  "status": true,
  "statusResponse": 200,
  "message": "user update successfully",
  "data": {
      "id": "4e4d7304-01e5-4785-a8a5-7ec4e224c020",
      "name": "Talif",
      "email": "abdultalif55@gmail.com"
  }
}
```

Response Body Error:
```json
{
  "status": false,
  "statusResponse": 404,
  "message": "User is not found",
  "data": null
}
```