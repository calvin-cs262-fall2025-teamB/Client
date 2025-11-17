# WayFind API Implementation Checklist

Complete step-by-step guide for implementing the WayFind backend API and integrating it with the frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Database Setup](#database-setup)
4. [Authentication Implementation](#authentication-implementation)
5. [Core API Endpoints](#core-api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Post-Launch](#post-launch)

---

## Prerequisites

### Required Tools & Accounts

- [ ] **Azure Account** - Create free account at [portal.azure.com](https://portal.azure.com)
- [ ] **Node.js** - Version 18+ installed
- [ ] **PostgreSQL** - Local installation for development
- [ ] **Git** - Version control
- [ ] **Postman/Insomnia** - API testing
- [ ] **VS Code** - Recommended editor with extensions:
  - REST Client
  - PostgreSQL
  - Azure Tools

### Knowledge Requirements

- [ ] JavaScript/TypeScript basics
- [ ] Express.js framework
- [ ] PostgreSQL/SQL queries
- [ ] JWT authentication
- [ ] RESTful API design

---

## Backend Setup

### Phase 1: Project Initialization

**Estimated Time:** 1-2 hours

#### 1.1 Create Backend Project

```bash
# Create project directory
mkdir wayfind-backend
cd wayfind-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet dotenv
npm install bcrypt jsonwebtoken
npm install pg # PostgreSQL client

# Install dev dependencies
npm install --save-dev typescript @types/express @types/node
npm install --save-dev ts-node nodemon
npm install --save-dev eslint prettier

# Initialize TypeScript
npx tsc --init
```

- [ ] Project directory created
- [ ] Dependencies installed
- [ ] TypeScript configured

#### 1.2 Project Structure

Create the following directory structure:

```
wayfind-backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Database connection
│   │   └── auth.ts          # JWT config
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification
│   │   ├── validation.ts    # Request validation
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   ├── users.ts         # User routes
│   │   ├── adventures.ts    # Adventure routes
│   │   ├── regions.ts       # Region routes
│   │   ├── tokens.ts        # Token routes
│   │   └── gameplay.ts      # Gameplay routes
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── adventureController.ts
│   │   └── ...
│   ├── models/
│   │   ├── User.ts
│   │   ├── Adventure.ts
│   │   └── ...
│   ├── utils/
│   │   ├── distance.ts      # GPS distance calculation
│   │   └── validators.ts    # Input validators
│   └── index.ts             # Entry point
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

- [ ] Directory structure created
- [ ] File templates prepared

#### 1.3 Environment Configuration

Create `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wayfind
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Azure Blob Storage (add later)
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=profile-images

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
```

- [ ] `.env` file created
- [ ] Environment variables configured
- [ ] `.env` added to `.gitignore`

#### 1.4 Database Connection

Create `src/config/database.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
```

- [ ] Database config file created
- [ ] Connection tested locally

---

## Database Setup

### Phase 2: Database Schema

**Estimated Time:** 2-3 hours

#### 2.1 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wayfind;

# Connect to database
\c wayfind;
```

- [ ] Database created
- [ ] Connected successfully

#### 2.2 Create Tables

Run the following SQL (from `BACKEND_INTEGRATION.md`):

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  boundaries JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adventures table
CREATE TABLE adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  description TEXT,
  image_url TEXT,
  region_id UUID REFERENCES regions(id),
  difficulty VARCHAR(50),
  estimated_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tokens table
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sequence_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Adventures tracking
CREATE TABLE user_adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  unlocked BOOLEAN DEFAULT TRUE,
  tokens_earned INT DEFAULT 0,
  progress_percentage INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, adventure_id)
);

-- User stats
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_tokens INT DEFAULT 0,
  adventures_completed INT DEFAULT 0,
  adventures_total INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  completion_rate INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_adventures_status ON adventures(status);
CREATE INDEX idx_adventures_region ON adventures(region_id);
CREATE INDEX idx_user_adventures_user ON user_adventures(user_id);
CREATE INDEX idx_user_adventures_adventure ON user_adventures(adventure_id);
CREATE INDEX idx_tokens_adventure ON tokens(adventure_id);
```

- [ ] All tables created
- [ ] Indexes created
- [ ] Foreign keys configured

#### 2.3 Seed Sample Data

```sql
-- Sample region
INSERT INTO regions (name, center_lat, center_lng)
VALUES ('North Campus', 42.9301, -85.5883);

-- Sample adventure
INSERT INTO adventures (title, summary, description, region_id, difficulty, estimated_time, status)
VALUES (
  'Campus History Tour',
  'Discover the rich history of Calvin University',
  'Embark on a journey through time as you explore the historic landmarks of Calvin University campus.',
  (SELECT id FROM regions WHERE name = 'North Campus'),
  'Easy',
  '30-45 minutes',
  'published'
);
```

- [ ] Sample data inserted
- [ ] Data verified with SELECT queries

---

## Authentication Implementation

### Phase 3: User Authentication

**Estimated Time:** 4-6 hours

#### 3.1 JWT Middleware

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing authentication token',
      },
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    req.user = payload; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
};
```

- [ ] Auth middleware created
- [ ] JWT verification implemented

#### 3.2 Auth Controller

Create `src/controllers/authController.ts`:

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  try {
    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required',
        },
      });
    }

    // Check if email exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'An account with this email already exists',
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [fullName, email, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create user_stats entry
    await pool.query(
      'INSERT INTO user_stats (user_id) VALUES ($1)',
      [user.id]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during signup',
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password',
        },
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password',
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          profileImageUrl: user.profile_image_url,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
};
```

- [ ] Signup endpoint implemented
- [ ] Login endpoint implemented
- [ ] Password hashing with bcrypt
- [ ] JWT token generation

#### 3.3 Auth Routes

Create `src/routes/auth.ts`:

```typescript
import express from 'express';
import { signup, login } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

export default router;
```

- [ ] Auth routes configured

#### 3.4 Test Authentication

Using Postman or cURL:

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

- [ ] Signup tested successfully
- [ ] Login tested successfully
- [ ] JWT token received and valid

---

## Core API Endpoints

### Phase 4: Adventures & Gameplay

**Estimated Time:** 8-12 hours

#### 4.1 Adventure Endpoints

**Priority Order:**

1. ✅ GET /adventures (Already live - improve schema)
2. GET /api/adventures/{id}
3. POST /api/adventures
4. PATCH /api/adventures/{id}

**Implementation Steps:**

- [ ] Create `src/controllers/adventureController.ts`
- [ ] Implement `getAdventures()` with filters
- [ ] Implement `getAdventureById()` with tokens
- [ ] Implement `createAdventure()`
- [ ] Implement `updateAdventure()`
- [ ] Add pagination support
- [ ] Test with Postman

**File Location:** See `API_DOCUMENTATION.md` for detailed implementation

#### 4.2 User Profile Endpoints

**Priority Order:**

1. GET /api/users/{userId}/stats
2. PATCH /api/users/{userId}
3. POST /api/users/{userId}/image
4. GET /api/users/{userId}/adventures

- [ ] Create `src/controllers/userController.ts`
- [ ] Implement stats aggregation query
- [ ] Implement profile update
- [ ] Configure Azure Blob Storage
- [ ] Implement image upload
- [ ] Test all endpoints

#### 4.3 Region Endpoints

- [ ] GET /api/regions
- [ ] POST /api/regions
- [ ] GET /api/regions/{id}
- [ ] Test endpoints

#### 4.4 Token Endpoints

- [ ] GET /api/adventures/{id}/tokens
- [ ] POST /api/adventures/{id}/tokens
- [ ] PATCH /api/tokens/{id}
- [ ] DELETE /api/tokens/{id}
- [ ] Test endpoints

#### 4.5 Gameplay Endpoints

**Critical Features:**

1. Start adventure
2. Collect token (with proximity check)
3. Update progress
4. Complete adventure

**Proximity Verification:**

Create `src/utils/distance.ts`:

```typescript
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const PROXIMITY_THRESHOLD = 50; // 50 meters
```

- [ ] Distance calculation utility created
- [ ] Start adventure endpoint
- [ ] Collect token with proximity check
- [ ] Update progress endpoint
- [ ] Complete adventure endpoint
- [ ] Test full gameplay flow

---

## Frontend Integration

### Phase 5: Replace Mock Data

**Estimated Time:** 6-10 hours

#### 5.1 Setup API Client

Create `utils/api.ts` (from API_QUICK_REFERENCE.md):

- [ ] API client utility created
- [ ] Base URL configured
- [ ] Token management implemented
- [ ] Error handling added

#### 5.2 Authentication Integration

**Files to Update:**

1. `contexts/AuthContext.jsx`
   - [ ] Replace mock `signup()` (line 55)
   - [ ] Replace mock `login()` (line 77)
   - [ ] Implement `logout()` (line 100+)
   - [ ] Add token storage with SecureStore

2. `components/authentication/Login.tsx`
   - [ ] Update to use real API
   - [ ] Add error handling
   - [ ] Add loading states

3. `components/authentication/Signup.tsx`
   - [ ] Update to use real API
   - [ ] Add validation feedback
   - [ ] Add loading states

#### 5.3 Home Screen Integration

**File:** `app/(tabs)/home.tsx`

- [ ] Update fetchAdventures() (line 149)
- [ ] Remove transformation logic (if API schema matches)
- [ ] Update error handling
- [ ] Test search & filters

#### 5.4 Profile Integration

**File:** `app/(tabs)/profile.tsx`

- [ ] Replace hardcoded userStats (line 77)
- [ ] Implement fetchUserStats()
- [ ] Update image upload (line 37)
- [ ] Add loading states

**File:** `components/profile/AdventureRecord.tsx`

- [ ] Replace mock completedAdventures (line 35)
- [ ] Fetch from API
- [ ] Handle empty states

#### 5.5 Adventure Details Integration

**File:** `app/(gameplay pages)/adventurePage.tsx`

- [ ] Replace mock fetchAdventureData() (line 38)
- [ ] Fetch from API
- [ ] Handle user progress data
- [ ] Implement "Start Adventure" button

#### 5.6 Creator Integration

**File:** `app/creator/adventure.tsx`

- [ ] Replace mock handleCreate() (line 31)
- [ ] Implement real adventure creation
- [ ] Add form validation
- [ ] Handle success/error states

#### 5.7 Map Integration

**File:** `app/(tabs)/map.tsx`

- [ ] Implement region creation API call
- [ ] Implement token creation API call
- [ ] Add error handling

---

## Testing

### Phase 6: Quality Assurance

**Estimated Time:** 4-6 hours

#### 6.1 Unit Testing

- [ ] Install testing framework (Jest/Mocha)
- [ ] Test authentication logic
- [ ] Test distance calculation
- [ ] Test data validation

#### 6.2 Integration Testing

- [ ] Test complete authentication flow
- [ ] Test adventure creation flow
- [ ] Test gameplay flow (start → collect → complete)
- [ ] Test error scenarios

#### 6.3 API Testing with Postman

- [ ] Import `WayFind.postman_collection.json`
- [ ] Test all endpoints
- [ ] Verify response schemas
- [ ] Test error responses

#### 6.4 Frontend Testing

- [ ] Test signup/login on mobile device
- [ ] Test adventure browsing
- [ ] Test token collection with GPS simulation
- [ ] Test offline behavior
- [ ] Test on iOS and Android

---

## Deployment

### Phase 7: Production Deployment

**Estimated Time:** 3-5 hours

#### 7.1 Azure App Service Setup

```bash
# Install Azure CLI
npm install -g azure-cli

# Login
az login

# Create resource group
az group create --name wayfind-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name wayfind-plan \
  --resource-group wayfind-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group wayfind-rg \
  --plan wayfind-plan \
  --name wayfind-api \
  --runtime "NODE|18-lts"
```

- [ ] Azure resources created
- [ ] App Service configured

#### 7.2 Database Deployment

- [ ] Create Azure Database for PostgreSQL
- [ ] Run migration scripts
- [ ] Seed production data
- [ ] Configure connection string

#### 7.3 Environment Variables

Configure in Azure Portal:

- [ ] Set `JWT_SECRET` (generate new secure key)
- [ ] Set database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Set CORS origins

#### 7.4 Blob Storage Setup

- [ ] Create Azure Storage Account
- [ ] Create container: `profile-images`
- [ ] Set access level to Blob
- [ ] Configure connection string

#### 7.5 Deploy Backend

```bash
# Deploy to Azure
az webapp up \
  --resource-group wayfind-rg \
  --name wayfind-api \
  --runtime "NODE|18-lts"
```

- [ ] Backend deployed
- [ ] Health check endpoint responds
- [ ] Test API with production URL

#### 7.6 Update Frontend

Update `utils/api.ts`:

```typescript
const API_BASE_URL =
  __DEV__
    ? 'http://localhost:3000'
    : 'https://wayfind-api.azurewebsites.net';
```

- [ ] Production URL configured
- [ ] Test frontend with production backend

---

## Post-Launch

### Phase 8: Monitoring & Optimization

**Ongoing**

#### 8.1 Monitoring Setup

- [ ] Configure Azure Application Insights
- [ ] Set up error logging
- [ ] Monitor API performance
- [ ] Track user metrics

#### 8.2 Security Hardening

- [ ] Enable HTTPS only
- [ ] Configure rate limiting
- [ ] Add input sanitization
- [ ] Regular security audits
- [ ] Update dependencies regularly

#### 8.3 Performance Optimization

- [ ] Add database indexes
- [ ] Implement caching (Redis)
- [ ] Optimize SQL queries
- [ ] Add CDN for images

#### 8.4 Feature Enhancements

- [ ] Leaderboards
- [ ] Social features (following, comments)
- [ ] Push notifications
- [ ] Adventure ratings/reviews
- [ ] Offline mode support

---

## Progress Tracking

**Overall Progress:**

- [ ] Phase 1: Backend Setup (1-2 hours)
- [ ] Phase 2: Database Setup (2-3 hours)
- [ ] Phase 3: Authentication (4-6 hours)
- [ ] Phase 4: Core Endpoints (8-12 hours)
- [ ] Phase 5: Frontend Integration (6-10 hours)
- [ ] Phase 6: Testing (4-6 hours)
- [ ] Phase 7: Deployment (3-5 hours)
- [ ] Phase 8: Post-Launch (Ongoing)

**Total Estimated Time:** 28-44 hours (3-5 full work days)

---

## Resources

### Documentation References

- **openapi.yaml** - OpenAPI/Swagger specification
- **API_DOCUMENTATION.md** - Complete API reference with SQL queries
- **API_QUICK_REFERENCE.md** - Quick lookup guide
- **BACKEND_INTEGRATION.md** - Database schemas
- **WayFind.postman_collection.json** - Postman collection for testing

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [JWT.io](https://jwt.io/) - JWT debugger
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## Support

For questions or issues during implementation:

1. Review architecture diagrams in `API_DOCUMENTATION.md`
2. Check endpoint details in `API_QUICK_REFERENCE.md`
3. Test with Postman collection
4. Consult frontend file locations in documentation

**Last Updated:** January 2025
