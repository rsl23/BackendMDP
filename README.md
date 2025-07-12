# Backend MDP - Node.js Authentication System

Comprehensive backend authentication system untuk aplikasi Android menggunakan Node.js, Express, Firebase Firestore, dengan fitur lengkap termasuk user management, email services, dan sistem keamanan yang robust.

## 🚀 Features

### ✅ Authentication & Authorization
- [x] **JWT Middleware** untuk route protection
- [x] **Role-based Access Control** (user/admin roles)

### ✅ User Profile Management
- [x] **Get Own Profile** (`GET /me-profile`)
- [x] **Update Profile** (`PUT /me-profile`) - username, address, phone_number
- [x] **Get User by ID** (`GET /user/:userId`) dengan privacy controls
- [x] **Search Users** (`GET /search-users`) berdasarkan username
- [x] **Public vs Private Profile Data** berdasarkan relationship

### ✅ Email Services
- [x] **Password Reset Email** dengan HTML template
- [x] **Password Change Confirmation** email
- [x] **Password Reset Success Confirmation** email
- [x] **Email Service Error Handling** dengan fallback mechanisms

### ✅ Security Features
- [x] **Password Hashing** menggunakan bcrypt dengan salt
- [x] **JWT Token** dengan expiry time dan secret key
- [x] **Input Validation** menggunakan Joi schemas
- [x] **SQL Injection Prevention** (menggunakan Firestore)
- [x] **Sensitive Data Exclusion** dari API responses
- [x] **Reset Token Expiry** (1 hour) dengan automatic cleanup
- [x] **Username Uniqueness** validation

### ✅ Database Integration
- [x] **Firebase Firestore** sebagai primary database
- [x] **User Model** dengan complete CRUD operations
- [x] **Soft Delete** support untuk user accounts
- [x] **Timestamp Tracking** (created_at, updated_at, deleted_at)
- [x] **Google Authentication Data** storage (google_uid, profile_picture)

## 📋 API Endpoints

### Authentication Routes
```
POST   /signup                    - User registration
POST   /login                     - User login
POST   /logout                    - User logout (requires auth)
POST   /request-password-reset    - Request password reset via email
POST   /reset-password           - Reset password with token
```

### Profile Management Routes
```
GET    /me-profile               - Get own profile (requires auth)
PUT    /me-profile               - Update own profile (requires auth)
POST   /change-password          - Change password (requires auth)
GET    /user/:userId             - Get user profile by ID (requires auth)
GET    /search-users             - Search users by username (requires auth)
```

### Product Management Routes
```
GET    /products                 - Get all products with pagination
POST   /add-product              - Add new product
GET    /product/:product_id      - Get product by ID
PUT    /product/:product_id      - Update product by ID
DELETE /product/:product_id      - Delete product by ID (soft delete)
GET    /product/search/:name     - Search products by name
```

### Transaction Routes
```
POST   /create-transaction       - Create new transaction
```

### Chat Routes
```
POST   /chat/start                      - Start a new chat with a user
GET    /chat/conversations              - Get all conversations for current user
GET    /chat/conversation/:user_id      - Get conversation with specific user
PUT    /chat/:chat_id/status            - Update message status (delivered/read)
DELETE /chat/:chat_id                   - Delete a chat message (soft delete)
```

### Utility Routes
```
GET    /db-status                - Check database connection status
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT + Firebase Admin SDK
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer (Gmail SMTP)
- **Validation**: Joi
- **Environment**: dotenv
- **Testing**: Jest + Supertest (configured)

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd BackendMDP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `template.env` to `.env` dan configure:

```env
# App Configuration
APP_ENV=DEV
APP_PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
APP_NAME=Your App Name
FRONTEND_URL=http://localhost:3000

# JWT Secret
SECRET_KEY=your-jwt-secret-key
```

### 4. Firebase Setup
1. Create Firebase project di [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate service account key
4. Copy credentials ke `.env` file

### 5. Gmail SMTP Setup
1. Enable 2-factor authentication di Gmail account
2. Generate App Password untuk SMTP
3. Use App Password di `SMTP_PASS` environment variable

### 6. Run Application
```bash
# Development mode dengan nodemon
npm run dev

# Production mode
npm start

# Basic run
node app.js
```

Server akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### User Collection (Firestore)
```javascript
{
  id: "US001",                          // Auto-generated ID format
  email: "user@example.com",            // Unique email
  password: "hashed_password",          // bcrypt hashed
  username: "username",                 // Unique username
  address: "User address",              // Optional
  phone_number: "+1234567890",          // Optional
  role: "user",                         // user | admin
  access_token: "jwt_token",            // Current JWT token
  reset_password_token: "crypto_token", // Password reset token
  reset_password_expires: "iso_date",   // Token expiry time
  google_uid: "google_user_id",         // Google authentication
  profile_picture: "url",               // Profile picture URL
  auth_provider: "local",               // local | google | both
  created_at: "iso_date",               // Creation timestamp
  updated_at: "iso_date",               // Last update timestamp
  deleted_at: null                      // Soft delete timestamp
}
```

## 🔒 Security Implementation

### Password Security
- **Minimum Requirements**: 8 karakter, huruf besar, huruf kecil, angka, simbol
- **Hashing**: bcrypt dengan salt rounds 10
- **Reset Tokens**: Crypto-secure random dengan 1 hour expiry

### JWT Security
- **Secret Key**: Environment variable dengan minimum 32 karakter
- **Expiry Time**: 1 hour default
- **Token Storage**: Server-side di user document untuk invalidation

### Input Validation
- **Joi Schemas**: Comprehensive validation untuk semua inputs
- **Email Validation**: Format dan domain validation
- **Phone Number**: International format validation
- **Username**: Alphanumeric + underscore/hyphen only

### API Security
- **Authentication Middleware**: JWT verification untuk protected routes
- **Data Sanitization**: Sensitive fields excluded dari responses
- **Error Handling**: Generic error messages untuk security

## 🧪 Testing

### Manual Testing
```bash
# Test dengan curl atau Thunder Client
# See TEST_PROFILE_UPDATE.md untuk detailed examples

# Basic health check
curl http://localhost:3000/db-status
```

### Automated Testing (Configured)
```bash
# Run tests (ketika test files sudah dibuat)
npm test

# Run tests dengan coverage
npm run test:coverage

# Run tests dalam watch mode
npm run test:watch
```

## 📚 API Documentation

### Detailed Endpoint Documentation
- **Authentication APIs**: See inline comments dalam userController.js
- **Profile Update APIs**: See `PROFILE_UPDATE_API.md`
- **Test Examples**: See `TEST_PROFILE_UPDATE.md`

### Response Format
Semua API responses menggunakan consistent format:

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... },
  "token": "jwt_token" // untuk auth endpoints
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "error": "Detailed error info",
  "errors": [ ... ] // untuk validation errors
}
```

## 🚀 Deployment

### Environment Setup
1. Set `APP_ENV=PROD` untuk production
2. Use strong `SECRET_KEY` (32+ characters)
3. Configure production Firebase project
4. Setup production email SMTP

### Security Checklist
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Error monitoring setup

## 🔄 Integration dengan Android

### Kotlin/Java Integration
1. **HTTP Client**: Retrofit atau OkHttp untuk API calls
2. **Authentication**: Store JWT token di SharedPreferences/DataStore
3. **Error Handling**: Handle berbagai HTTP status codes
4. **Data Models**: Create data classes yang match dengan API responses

### Example Android Integration
```kotlin
// User data class
data class User(
    val id: String,
    val username: String,
    val email: String,
    val address: String?,
    val phoneNumber: String?,
    val profilePicture: String?,
    val authProvider: String,
    val createdAt: String
)

// API service interface
interface ApiService {
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @PUT("me-profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): Response<UpdateProfileResponse>
}
```

## 💬 Chat API Documentation

### Start Chat
Start a new chat conversation with another user.

**Endpoint:** `POST /chat/start`

**Request Body:**
```json
{
    "receiver_id": "US001",
    "message": "Hi, is this product still available?"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Chat started successfully",
    "data": {
        "chat_id": "CH001",
        "sender_id": "US002",
        "receiver_id": "US001",
        "message": "Hi, is this product still available?",
        "datetime": "2024-01-15T10:30:00.000Z",
        "status": "sent"
    }
}
```

### Get User Conversations
Get all conversation list for the current user.

**Endpoint:** `GET /chat/conversations`

**Response:**
```json
{
    "success": true,
    "message": "Conversations retrieved successfully",
    "data": {
        "conversations": [
            {
                "otherUserId": "US001",
                "lastMessage": "Thank you for your interest!",
                "lastMessageTime": "2024-01-15T10:35:00.000Z",
                "lastMessageStatus": "read",
                "lastMessageSender": "US001",
                "otherUser": {
                    "id": "US001",
                    "name": "John Doe",
                    "email": "john@example.com",
                    "profile_picture": "https://example.com/profile.jpg"
                }
            }
        ],
        "total": 1
    }
}
```

### Get Conversation with User
Get chat messages between current user and specific user.

**Endpoint:** `GET /chat/conversation/:user_id?page=1&limit=50`

**Response:**
```json
{
    "success": true,
    "message": "Conversation retrieved successfully",
    "data": {
        "messages": [
            {
                "id": "CH001",
                "user_sender": "US002",
                "user_receiver": "US001",
                "chat": "Hi, is this product still available?",
                "datetime": "2024-01-15T10:30:00.000Z",
                "status": "read"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalMessages": 1,
            "hasNext": false,
            "hasPrev": false,
            "limit": 50
        },
        "otherUser": {
            "id": "US001",
            "name": "John Doe",
            "email": "john@example.com",
            "profile_picture": "https://example.com/profile.jpg"
        }
    }
}
```

### Update Message Status
Update message status to 'delivered' or 'read' (only by receiver).

**Endpoint:** `PUT /chat/:chat_id/status`

**Request Body:**
```json
{
    "status": "read"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Message status updated successfully",
    "data": {
        "chat_id": "CH001",
        "status": "read",
        "updated_at": "2024-01-15T10:35:00.000Z"
    }
}
```

### Delete Message
Soft delete a chat message (only by sender).

**Endpoint:** `DELETE /chat/:chat_id`

**Response:**
```json
{
    "success": true,
    "message": "Message deleted successfully",
    "data": {
        "chat_id": "CH001",
        "deleted_at": "2024-01-15T10:40:00.000Z"
    }
}
```
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes dengan descriptive messages
4. Push ke branch
5. Create Pull Request



## 📞 Support

Untuk pertanyaan atau issues:
1. Check existing documentation
2. Create GitHub issue dengan detailed description
3. Include error logs dan steps to reproduce

---

**Status**: ✅ Production Ready  
**Last Updated**: December 2024  
**Version**: 1.0.0
