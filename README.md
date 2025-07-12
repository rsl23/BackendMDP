# Backend MDP - Node.js Full-Stack Backend System

Comprehensive backend system for Android applications using Node.js, Express, Firebase Firestore, with complete features including user management, product management, chat system, transaction processing, payment integration, and robust security system.

## 🚀 Features

### ✅ Authentication & Authorization
- [x] **Firebase Authentication Integration** with JWT middleware
- [x] **Role-based Access Control** (user/admin roles)
- [x] **Firebase Token Verification** for modern authentication

### ✅ User Profile Management
- [x] **Get Own Profile** (`GET /me-profile`)
- [x] **Update Profile** (`PUT /me-profile`) - username, address, phone_number
- [x] **Profile Picture Upload** (`POST /update-profile-picture`) with Supabase integration
- [x] **Get User by ID** (`GET /user/:userId`) with privacy controls
- [x] **Get User by Firebase UID** (`GET /user/firebase/:firebase_uid`)
- [x] **Search Users** (`GET /search-users`) by username
- [x] **Public vs Private Profile Data** based on relationship

### ✅ Product Management
- [x] **Product CRUD Operations** with image upload support
- [x] **Product Search** by name and ID
- [x] **Pagination Support** for product listing
- [x] **Soft Delete** for products
- [x] **Image Upload** to Supabase Storage
- [x] **User Authorization** for product operations

### ✅ Transaction & Payment System
- [x] **Transaction Creation** with Midtrans integration
- [x] **Transaction History** for buyers and sellers
- [x] **Transaction Status Management**
- [x] **Midtrans Webhook Handling** for payment notifications
- [x] **Payment Status Checking** via Midtrans API
- [x] **Automatic Product Removal** after transaction created

### ✅ Chat System
- [x] **Real-time Chat** between users
- [x] **Conversation Management** with pagination
- [x] **Message Status Tracking** (sent/delivered/read)
- [x] **Message Soft Delete**
- [x] **User Conversation List** with last message info

### ✅ Email Services
- [x] **Password Reset Email** with HTML template
- [x] **Password Change Confirmation** email
- [x] **Password Reset Success Confirmation** email
- [x] **Email Service Error Handling** with fallback mechanisms

### ✅ Security Features
- [x] **Password Hashing** using bcrypt with salt
- [x] **JWT Token** with expiry time and secret key
- [x] **Firebase Authentication** integration
- [x] **Input Validation** using Joi schemas
- [x] **File Upload Security** with type validation
- [x] **Sensitive Data Exclusion** from API responses
- [x] **Reset Token Expiry** (1 hour) with automatic cleanup
- [x] **User Authorization** per resource access

### ✅ Database Integration
- [x] **Firebase Firestore** as primary database
- [x] **Multiple Models** (User, Product, Transaction, Chat)
- [x] **Soft Delete** support for all entities
- [x] **Timestamp Tracking** (created_at, updated_at, deleted_at)
- [x] **Firebase Authentication Data** storage
- [x] **Supabase Storage** for file/image management

## 📋 API Endpoints

### Authentication Routes
```
POST   /verify-token             - Verification firebase token
POST   /signup                   - User registration (backward compatibility)
POST   /login                    - User login (backward compatibility)
POST   /logout                   - User logout (requires auth)
```

### Profile Management Routes
```
GET    /me-profile               - Get own profile (requires auth)
PUT    /me-profile               - Update own profile (requires auth)
POST   /update-profile-picture   - Update profile picture (requires auth)
POST   /change-password          - Change password (requires auth)
POST   /request-password-reset   - Request password reset email
POST   /reset-password           - Reset password using token
GET    /user/:userId             - Get user profile by ID (requires auth)
GET    /user/firebase/:firebase_uid - Get user by Firebase UID (requires auth)
GET    /search-users             - Search users by username (requires auth)
```

### Product Management Routes
```
GET    /products                 - Get all products with pagination
POST   /add-product              - Add new product (requires auth, with image upload)
GET    /product/:product_id      - Get product by ID
PUT    /product/:product_id      - Update product by ID (requires auth, with image upload)
DELETE /product/:product_id      - Delete product by ID (soft delete, requires auth)
GET    /product/search/:name     - Search products by name
```

### Transaction Routes
```
POST   /create-transaction       - Create new transaction (requires auth)
GET    /my-transactions          - Get user's transaction history (requires auth)
GET    /transaction/:id          - Get transaction details (requires auth)
PUT    /transaction/:id/status   - Update transaction status (requires auth)
POST   /midtrans-webhook         - Handle Midtrans payment webhook
GET    /midtrans/status/:orderId - Get Midtrans transaction status
```

### Chat Routes
```
POST   /chat                     - Start a new chat with a user (requires auth)
GET    /chat/conversations       - Get all conversations for current user (requires auth)
GET    /chat/conversation/:user_id - Get conversation with specific user (requires auth)
PUT    /chat/:chat_id/status     - Update message status (requires auth)
DELETE /chat/:chat_id            - Delete a chat message (soft delete, requires auth)
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
- **File Upload**: Multer + Supabase Storage
- **Payment Gateway**: Midtrans
- **Validation**: Joi
- **Environment**: dotenv
- **Image Processing**: File upload to Supabase Storage
- **Testing**: Jest + Supertest (configured)

## 📁 Project Structure

```
BackendMDP/
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── template.env              # Environment variables template
├── README.md                 # Project documentation
│
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.js       # Firebase Firestore configuration
│   │   ├── midtransClient.js # Midtrans client configuration
│   │   └── supabase.js       # Supabase client configuration
│   │
│   ├── controllers/          # Business logic controllers
│   │   ├── authController.js # Firebase auth & profile picture
│   │   ├── chatController.js # Chat system management
│   │   ├── productController.js # Product CRUD operations
│   │   ├── transactionController.js # Transaction & payment
│   │   └── userController.js # User management & profile
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── uploadImage.js    # Multer file upload middleware
│   │
│   ├── models/               # Database models (Firestore)
│   │   ├── Chat.js           # Chat message model
│   │   ├── Product.js        # Product model
│   │   ├── Transaction.js    # Transaction model
│   │   └── User.js           # User model
│   │
│   ├── routes/               # API route definitions
│   │   └── Routes.js         # Main router with all endpoints
│   │
│   ├── services/             # External service integrations
│   │   └── emailService.js   # Email service for notifications
│   │
│   └── utils/                # Utility functions
│       ├── responseUtil.js   # Standardized API responses
│       └── validation/       # Joi validation schemas
│           ├── authSchema.js # User authentication validation
│           ├── chatSchema.js # Chat message validation
│           ├── productSchema.js # Product validation
│           └── transactionSchema.js # Transaction validation
│
└── uploads/                  # Temporary file uploads (local)
```

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
Copy `template.env` to `.env` and configure:

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

# Supabase Configuration (for file/image storage)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Midtrans Configuration (for payment processing)
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

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
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password & Google)
4. Generate service account key
5. Copy credentials to `.env` file

### 5. Supabase Setup
1. Create Supabase project at [Supabase Console](https://supabase.com/)
2. Create storage bucket named `images`
3. Set up public access policy for the bucket
4. Copy URL and anon key to `.env` file

### 6. Midtrans Setup
1. Register at [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Get Server Key and Client Key
3. Configure webhook URL for payment notifications
4. Copy keys to `.env` file

### 7. Gmail SMTP Setup
1. Enable 2-factor authentication on Gmail account
2. Generate App Password for SMTP
3. Use App Password in `SMTP_PASS` environment variable

### 8. Run Application
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start

# Basic run
node app.js
```

Server will run at `http://localhost:3000`

## 📊 Database Schema

### User Collection (Firestore)
```javascript
{
  id: "auto-generated-uuid",            // Auto-generated UUID
  email: "user@example.com",            // Unique email
  username: "username",                 // Username
  address: "User address",              // Optional
  phone_number: "+1234567890",          // Optional
  role: "buyer",                        // buyer | seller | admin
  access_token: "jwt_token",            // Current JWT token
  reset_password_token: "crypto_token", // Password reset token
  reset_password_expires: "iso_date",   // Token expiry time
  firebase_uid: "firebase_user_id",     // Firebase authentication UID
  profile_picture: "url",               // Profile picture URL
  auth_provider: "local",               // local | google | firebase
  created_at: "iso_date",               // Creation timestamp
  deleted_at: null                      // Soft delete timestamp
}
```

### Product Collection (Firestore)
```javascript
{
  product_id: "auto-generated-uuid",    // Auto-generated UUID
  name: "Product Name",                 // Product name
  price: 100000,                        // Price in currency
  description: "Product description",    // Product description
  category: "Category Name",            // Product category
  image: "image_url",                   // Product image URL (Supabase)
  user_id: "seller_user_id",            // Reference to seller user
  created_at: "iso_date",               // Creation timestamp
  deleted_at: null                      // Soft delete timestamp
}
```

### Transaction Collection (Firestore)
```javascript
{
  transaction_id: "auto-generated-uuid", // Auto-generated UUID
  user_seller: {                        // Seller user object
    id: "seller_id",
    email: "seller@example.com",
    name: "Seller Name"
  },
  email_buyer: "buyer@example.com",     // Buyer email
  product: {                            // Product object
    product_id: "product_id",
    name: "Product Name",
    price: 100000
  },
  datetime: "iso_date",                 // Transaction timestamp
  payment_id: "payment_id",             // Payment reference ID
  payment_status: "pending",            // pending | success | failed | cancelled
  payment_description: "Payment desc",  // Payment description
  
  // Midtrans Integration
  midtrans_order_id: "order_id",        // Midtrans order ID
  snap_token: "snap_token",             // Midtrans Snap token
  redirect_url: "payment_url",          // Payment redirect URL
  payment_type: "bank_transfer",        // Payment method type
  va_number: "virtual_account_number",  // Virtual account number
  pdf_url: "instruction_pdf_url",       // Payment instruction PDF
  settlement_time: "iso_date",          // Payment settlement time
  expiry_time: "iso_date"               // Payment expiry time
}
```

### Chat Collection (Firestore)
```javascript
{
  id: "auto-generated-uuid",            // Auto-generated UUID
  user_sender: "sender_user_id",        // Sender user ID
  user_receiver: "receiver_user_id",    // Receiver user ID
  chat: "Message content",              // Chat message content
  datetime: "iso_date",                 // Message timestamp
  status: "sent",                       // sent | delivered | read
  created_at: "iso_date",               // Creation timestamp
  updated_at: "iso_date",               // Last update timestamp
  deleted_at: null                      // Soft delete timestamp
}
```

## 🔒 Security Implementation

### Password Security
- **Minimum Requirements**: 8 characters, uppercase, lowercase, number, symbol
- **Hashing**: bcrypt with salt rounds 10
- **Reset Tokens**: Crypto-secure random with 1 hour expiry

### JWT Security
- **Secret Key**: Environment variable with minimum 32 characters
- **Expiry Time**: 1 hour default
- **Token Storage**: Server-side in user document for invalidation

### Input Validation
- **Joi Schemas**: Comprehensive validation for all inputs
- **Email Validation**: Format and domain validation
- **Phone Number**: International format validation
- **Username**: Alphanumeric + underscore/hyphen only

### API Security
- **Authentication Middleware**: JWT verification for protected routes
- **Data Sanitization**: Sensitive fields excluded from responses
- **Error Handling**: Generic error messages for security

## 🧪 Testing

### Manual Testing
```bash
# Basic health check
curl http://localhost:3000/db-status

# Test Firebase token verification
curl -X POST http://localhost:3000/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "your_firebase_token"}'

# Test user profile (with authentication)
curl -X GET http://localhost:3000/me-profile \
  -H "Authorization: Bearer your_jwt_token"

# Test product listing
curl http://localhost:3000/products

# Test chat system (with authentication)
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id": "user_id", "message": "Hello!"}'
```

### Automated Testing (Configured)
```bash
# Run tests (when test files are created)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### Key Features Documentation
- **Firebase Authentication**: Complete integration with Firebase Auth SDK
- **File Upload System**: Image upload to Supabase Storage with validation
- **Payment Integration**: Midtrans Snap for payment processing
- **Real-time Chat**: Message system with status tracking
- **Transaction Management**: Complete e-commerce transaction flow
- **Profile Management**: Comprehensive user profile with image upload

### Response Format
All API responses use consistent format from `responseUtil.js`:

**Success Response:**
```json
{
  "status": 200,
  "message": "Success message",
  "data": {
    "user": { ... },
    "product": { ... },
    "transaction": { ... }
  }
}
```

**Error Response:**
```json
{
  "status": 400,
  "message": "Error message",
  "error": "Detailed error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication Headers
For protected routes, use Bearer token:
```bash
Authorization: Bearer <your_jwt_token>
```

### File Upload Format
For endpoints with file upload:
```bash
Content-Type: multipart/form-data
Body: 
  - image: file
  - other_fields: values
```

## 🚀 Deployment

### Environment Setup
1. Set `APP_ENV=PROD` for production
2. Use strong `SECRET_KEY` (32+ characters)
3. Configure production Firebase project
4. Setup production Supabase project
5. Configure production Midtrans account
6. Setup production email SMTP

### Security Checklist
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] Supabase RLS policies enabled
- [ ] Midtrans webhook signature validation
- [ ] HTTPS enabled for all endpoints
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Error monitoring setup
- [ ] File upload size limits
- [ ] Image file type validation

### Performance Optimization
- [ ] Database indexing on frequently queried fields
- [ ] Firestore compound indexes for complex queries
- [ ] Image compression before upload
- [ ] Pagination on all list endpoints
- [ ] Caching for static data

## 🔄 Integration with Android

### Authentication Flow
1. **Firebase Login**: Use Firebase Auth SDK in Android
2. **Token Exchange**: Send Firebase token to `/verify-token` endpoint
3. **JWT Storage**: Store returned JWT in secure storage
4. **API Calls**: Use JWT for all authenticated requests

### File Upload Integration
```kotlin
// Example Retrofit interface for file upload
@Multipart
@POST("add-product")
suspend fun addProduct(
    @Header("Authorization") token: String,
    @Part("name") name: RequestBody,
    @Part("price") price: RequestBody,
    @Part image: MultipartBody.Part
): Response<ApiResponse>
```

### Payment Integration
```kotlin
// Example Midtrans integration
1. Create transaction via API
2. Get snap_token from response
3. Launch Midtrans SDK with snap_token
4. Handle payment result callback
```

## 🔧 Troubleshooting

### Common Issues

#### Firebase Connection Issues
```bash
# Error: Firebase Admin SDK initialization failed
- Check Firebase credentials in .env file
- Ensure private key format is correct (with \n)
- Verify Firebase project ID
```

#### Supabase Upload Errors
```bash
# Error: Failed to upload image
- Check Supabase URL and anon key
- Verify storage bucket 'images' exists
- Check bucket permissions (public access)
```

#### Midtrans Integration Issues
```bash
# Error: Invalid server key
- Verify Midtrans server key and client key
- Check sandbox vs production environment
- Ensure webhook URL is accessible
```

#### JWT Token Issues
```bash
# Error: Token expired or invalid
- Check SECRET_KEY in environment
- Verify token expiry time
- Ensure proper Authorization header format
```

### Development Tips

1. **Logging**: Enable console.log for debugging API calls
2. **Postman/Thunder Client**: Use for testing API endpoints
3. **Firebase Console**: Monitor Firestore data changes
4. **Supabase Dashboard**: Check storage uploads
5. **Midtrans Dashboard**: Monitor payment transactions

## 📞 Support & Documentation

### Helpful Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed with ❤️ for WeCycle Application**
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
3. Commit changes with descriptive messages
4. Push to branch
5. Create Pull Request

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Create GitHub issue with detailed description
3. Include error logs and steps to reproduce

---

**Status**: ✅ Production Ready  
**Last Updated**: July 2025  
**Version**: 1.0.0

**Developed with ❤️ for WeCycle Application**
