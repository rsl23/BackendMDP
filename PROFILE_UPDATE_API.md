# User Profile Update API Documentation

## Overview
Sistem backend sekarang mendukung update profile pribadi user dengan validasi yang ketat dan keamanan yang baik.

## New Endpoints

### 1. Update User Profile
**Endpoint:** `PUT /me-profile`  
**Method:** PUT  
**Authentication:** Required (Bearer Token)  
**Description:** Mengupdate profile pribadi user yang sedang login

#### Request Body
```json
{
  "username": "new_username",        // Optional, string 3-50 chars, alphanumeric + underscore/hyphen
  "address": "New Address",          // Optional, string max 255 chars
  "phone_number": "+1234567890"     // Optional, string 10-15 chars with valid phone format
}
```

#### Validation Rules
- **username**: 3-50 karakter, hanya huruf, angka, underscore, dan hyphen
- **address**: Maksimal 255 karakter, boleh kosong
- **phone_number**: Format nomor telepon valid (10-15 digit), boleh kosong

#### Response Success (200)
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "US001",
    "username": "new_username",
    "email": "user@example.com",
    "address": "New Address",
    "phone_number": "+1234567890",
    "role": "user",
    "profile_picture": null,
    "auth_provider": "local",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z"
  }
}
```

#### Response Error (400 - Validation Error)
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

#### Response Error (409 - Username Taken)
```json
{
  "message": "Username is already taken",
  "error": "Username already taken by another user."
}
```

### 2. Change Password
**Endpoint:** `POST /change-password`  
**Method:** POST  
**Authentication:** Required (Bearer Token)  
**Description:** Mengubah password user yang sedang login

#### Request Body
```json
{
  "currentPassword": "current_password",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

#### Validation Rules
- **currentPassword**: Required, string
- **newPassword**: 8-128 karakter, harus mengandung huruf besar, huruf kecil, angka, dan simbol
- **confirmPassword**: Harus sama dengan newPassword

#### Response Success (200)
```json
{
  "message": "Password changed successfully."
}
```

#### Response Error (400 - Wrong Current Password)
```json
{
  "message": "Current password is incorrect."
}
```

## Security Features

### 1. Field Restrictions
- User hanya bisa mengupdate field yang diizinkan: `username`, `address`, `phone_number`
- Field sensitif seperti `email`, `role`, `id` tidak bisa diubah
- Password harus diubah melalui endpoint terpisah dengan validasi current password

### 2. Username Uniqueness
- System memastikan username baru tidak digunakan oleh user lain
- Validasi dilakukan di level database untuk mencegah race condition

### 3. Authentication
- Semua endpoint memerlukan JWT token yang valid
- User hanya bisa mengupdate profile mereka sendiri

### 4. Input Validation
- Menggunakan Joi schema untuk validasi input yang ketat
- Validasi format phone number, panjang string, dan karakter yang diizinkan

## Usage Examples

### Update Profile dengan JavaScript/Fetch
```javascript
const updateProfile = async (token, profileData) => {
  try {
    const response = await fetch('/me-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Profile updated:', result.user);
    } else {
      console.error('Update failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
updateProfile('your-jwt-token', {
  username: 'new_username',
  address: 'New Address',
  phone_number: '+1234567890'
});
```

### Change Password dengan JavaScript/Fetch
```javascript
const changePassword = async (token, passwords) => {
  try {
    const response = await fetch('/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwords)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Password changed successfully');
    } else {
      console.error('Change password failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
changePassword('your-jwt-token', {
  currentPassword: 'current_password',
  newPassword: 'NewPassword123!',
  confirmPassword: 'NewPassword123!'
});
```

## Integration with Android App

### 1. Update Profile Request
```kotlin
// Kotlin example for Android
class ProfileUpdateRequest(
    val username: String? = null,
    val address: String? = null,
    val phoneNumber: String? = null
)

suspend fun updateProfile(token: String, updateData: ProfileUpdateRequest): Result<User> {
    return try {
        val response = apiService.updateProfile(
            authorization = "Bearer $token",
            updateData = updateData
        )
        Result.success(response.user)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

### 2. Change Password Request
```kotlin
class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String,
    val confirmPassword: String
)

suspend fun changePassword(token: String, passwords: ChangePasswordRequest): Result<String> {
    return try {
        val response = apiService.changePassword(
            authorization = "Bearer $token",
            passwords = passwords
        )
        Result.success(response.message)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

## Testing

### Manual Testing dengan Postman/Thunder Client

1. **Update Profile**
   - Method: PUT
   - URL: http://localhost:3000/me-profile
   - Headers: Authorization: Bearer YOUR_JWT_TOKEN
   - Body: JSON dengan field yang ingin diupdate

2. **Change Password**
   - Method: POST
   - URL: http://localhost:3000/change-password
   - Headers: Authorization: Bearer YOUR_JWT_TOKEN
   - Body: JSON dengan current password dan new password

## Notes

1. **Email Notification**: Sistem akan mengirim email konfirmasi setelah password berhasil diubah
2. **Rate Limiting**: Untuk production, pertimbangkan menambahkan rate limiting untuk endpoint update profile
3. **Audit Log**: Untuk keamanan, pertimbangkan menambahkan audit log untuk perubahan profile
4. **Profile Picture**: Endpoint upload profile picture bisa ditambahkan terpisah dengan multer untuk handle file upload

## Error Handling

Semua endpoint mengembalikan response yang konsisten dengan format error yang jelas. Client application harus handle berbagai kemungkinan error code:

- 400: Validation error
- 401: Unauthorized (token tidak valid/expired)
- 404: User not found
- 409: Conflict (username sudah digunakan)
- 500: Server error
