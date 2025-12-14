# Social Media API

A versioned REST API built with Node.js, Express, MongoDB, and Socket.io for real-time features.

## Project Structure

```
social-media-api/
├── src/
│   ├── api/                      # API versions
│   │   └── v1/                   # Version 1 API
│   │       ├── controllers/      # Request handlers
│   │       │   ├── auth.controller.js
│   │       │   ├── user.controller.js
│   │       │   └── post.controller.js
│   │       ├── routes/           # Route definitions
│   │       │   ├── auth.routes.js
│   │       │   ├── user.routes.js
│   │       │   └── post.routes.js
│   │       ├── services/         # Business logic
│   │       │   └── auth.service.js
│   │       ├── validators/       # Request validation schemas
│   │       │   ├── auth.validator.js
│   │       │   ├── user.validator.js
│   │       │   └── post.validator.js
│   │       └── index.js          # V1 routes aggregator
│   │
│   ├── shared/                   # Shared across all versions
│   │   ├── config/               # Configuration files
│   │   │   └── db.js
│   │   ├── middleware/           # Shared middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/               # Database models
│   │   │   ├── User.js
│   │   │   └── Post.js
│   │   └── utils/                # Utility functions
│   │       ├── ApiError.js
│   │       ├── asyncHandler.js
│   │       └── tokens.js
│   │
│   └── app.js                    # Express app configuration
│
├── tests/                        # Test files
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── server.js                     # Entry point + Socket.io setup
```

## Architecture Overview

### API Versioning

The API uses URL-based versioning (e.g., `/api/v1/auth/login`). This allows:
- Multiple API versions to coexist
- Gradual migration of clients to newer versions
- Backward compatibility maintenance

### Shared Resources

The `src/shared/` folder contains resources used across all API versions:
- **Models**: Database schemas (User, Post)
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions and utilities
- **Config**: Database and other configurations

### Version-Specific Code

Each API version (`src/api/v1/`, `src/api/v2/`, etc.) contains:
- **Controllers**: Handle HTTP requests/responses
- **Routes**: Define API endpoints
- **Services**: Business logic specific to that version
- **Validators**: Input validation schemas for that version

## API Endpoints

### Version 1 (v1)

All v1 endpoints are prefixed with `/api/v1`

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (protected)

#### Users
- `GET /api/v1/users/profile` - Get current user profile (protected)
- `GET /api/v1/users/:id` - Get user by ID (protected)
- `PATCH /api/v1/users/profile` - Update profile (protected)

#### Posts
- `POST /api/v1/posts` - Create post (protected)
- `GET /api/v1/posts` - Get all posts with pagination (protected)
- `GET /api/v1/posts/:id` - Get single post (protected)
- `PATCH /api/v1/posts/:id` - Update post (protected)
- `DELETE /api/v1/posts/:id` - Delete post (protected)
- `POST /api/v1/posts/:id/like` - Like/unlike post (protected)
- `POST /api/v1/posts/:id/comments` - Add comment (protected)
- `DELETE /api/v1/posts/:id/comments/:commentId` - Delete comment (protected)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `PORT` - Server port (default: 5000)

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

### 4. Run the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## Testing with Postman

The project includes a complete Postman collection with all API endpoints.

### Import Collection

1. **Import Collection**:
   - Open Postman
   - Click "Import" button
   - Select `Social-Media-API.postman_collection.json`

2. **Import Environment** (Optional but recommended):
   - Click "Import" button
   - Select `Social-Media-API.postman_environment.json`
   - Select "Social Media API - Development" from the environment dropdown

### Using the Collection

1. **Start with Authentication**:
   - Run "Register" to create a new user
   - Run "Login" - this automatically saves the access and refresh tokens to your environment

2. **Access Protected Endpoints**:
   - All protected endpoints automatically use `{{accessToken}}` from the environment
   - No need to manually copy/paste tokens

3. **Token Management**:
   - When access token expires, use "Refresh Token" to get a new one
   - The new token is automatically saved to your environment

### Collection Features

- **Automatic Token Management**: Login and Refresh endpoints auto-save tokens
- **Environment Variables**: Pre-configured baseUrl, accessToken, refreshToken
- **Request Examples**: All endpoints include example request bodies
- **Organized Folders**: Endpoints grouped by feature (Auth, Users, Posts)
- **Path Variables**: Dynamic segments like `:postId` and `:userId` for easy testing

## Adding a New API Version

To create v2 of the API:

### 1. Create Version Folder Structure

```bash
mkdir -p src/api/v2/controllers src/api/v2/routes src/api/v2/services src/api/v2/validators
```

### 2. Copy Base Files from v1 (Optional)

```bash
cp -r src/api/v1/* src/api/v2/
```

### 3. Create v2 Index File

`src/api/v2/index.js`:
```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

module.exports = router;
```

### 4. Update app.js

Add the new version route:

```javascript
const v1Routes = require('./api/v1');
const v2Routes = require('./api/v2');

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

### 5. Implement Changes

Make your version-specific changes in the v2 controllers, routes, services, and validators while keeping v1 intact.

## Socket.io Events

The server supports real-time features via Socket.io:

- `connection` - Client connected
- `disconnect` - Client disconnected
- `join_room` - Join a specific room
- `leave_room` - Leave a room
- `new_post` - Broadcast new post to all clients
- `new_like` - Notify post room about new like
- `new_comment` - Notify post room about new comment

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Cross-origin resource sharing
- **Mongo Sanitize**: Prevent MongoDB injection
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing
- **Joi**: Input validation

## Error Handling

Centralized error handling with custom `ApiError` class:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Development

The project uses:
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Joi**: Validation
- **Socket.io**: Real-time communication
- **Nodemon**: Auto-restart during development
