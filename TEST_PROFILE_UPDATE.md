# Test Requests for Profile Update API

## Setup
1. Pastikan server berjalan di http://localhost:3000
2. Dapatkan JWT token dengan login terlebih dahulu
3. Gunakan token tersebut untuk test endpoint update profile

## 1. Login untuk mendapatkan token
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Response akan memberikan JWT token yang digunakan untuk request selanjutnya.

## 2. Test Update Profile - Full Update
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "username": "new_username",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "phone_number": "+6281234567890"
  }'
```

## 3. Test Update Profile - Partial Update (Username only)
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "username": "updated_username"
  }'
```

## 4. Test Update Profile - Address only
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "address": "New Address Here"
  }'
```

## 5. Test Update Profile - Phone Number only
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "phone_number": "+6281987654321"
  }'
```

## 6. Test Change Password
```bash
curl -X POST http://localhost:3000/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "TestPassword123!",
    "newPassword": "NewPassword456@",
    "confirmPassword": "NewPassword456@"
  }'
```

## 7. Test Error Cases

### Invalid Username (too short)
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "username": "ab"
  }'
```

### Invalid Phone Number Format
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "phone_number": "invalid-phone"
  }'
```

### Invalid Password (missing requirements)
```bash
curl -X POST http://localhost:3000/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "TestPassword123!",
    "newPassword": "weak",
    "confirmPassword": "weak"
  }'
```

### Wrong Current Password
```bash
curl -X POST http://localhost:3000/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "WrongPassword",
    "newPassword": "NewPassword456@",
    "confirmPassword": "NewPassword456@"
  }'
```

### No Authorization Token
```bash
curl -X PUT http://localhost:3000/me-profile \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user"
  }'
```

## Expected Responses

### Successful Profile Update
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "US001",
    "username": "new_username",
    "email": "test@example.com",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "phone_number": "+6281234567890",
    "role": "user",
    "profile_picture": null,
    "auth_provider": "local",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z"
  }
}
```

### Successful Password Change
```json
{
  "message": "Password changed successfully."
}
```

### Validation Error
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters long"
    }
  ]
}
```

### Username Already Taken
```json
{
  "message": "Username is already taken",
  "error": "Username already taken by another user."
}
```

### Unauthorized Access
```json
{
  "message": "Access token required",
  "error": "No token provided in Authorization header"
}
```

## Thunder Client (VS Code Extension) Collection

Jika menggunakan Thunder Client extension di VS Code, buat collection dengan request berikut:

1. **Login** (POST /login)
2. **Update Profile Full** (PUT /me-profile)
3. **Update Username Only** (PUT /me-profile)
4. **Change Password** (POST /change-password)
5. **Get Current Profile** (GET /me-profile)

Set environment variable untuk JWT token agar mudah digunakan di semua request.
