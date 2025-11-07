# Backend Integration Guide

This document outlines all the mock data points in the WayFind mobile app that need to be replaced with actual Azure/PostgreSQL backend integration.

## Technology Stack

- **Frontend**: Expo / React Native
- **Database**: PostgreSQL
- **Web Services**: Azure (Azure App Service, Azure Blob Storage)
- **API Pattern**: RESTful API with JWT authentication

---

## Database Schema

### Recommended PostgreSQL Tables

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
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tokens table (collectibles in adventures)
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

-- User stats (could be a materialized view or computed)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_tokens INT DEFAULT 0,
  adventures_completed INT DEFAULT 0,
  adventures_total INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  completion_rate INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints to Implement

### Authentication Endpoints

#### 1. Sign Up
**Endpoint**: `POST https://your-app.azurewebsites.net/api/auth/signup`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

**File Location**: `contexts/AuthContext.jsx` - `signup()` function (line 55)

---

#### 2. Login
**Endpoint**: `POST https://your-app.azurewebsites.net/api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profileImageUrl": "https://blob.storage.url/image.jpg"
  },
  "token": "jwt-token-here"
}
```

**File Location**: `contexts/AuthContext.jsx` - `login()` function (line 77)

**Security Note**: Use bcrypt or similar for password hashing. Store JWT tokens in `expo-secure-store`.

---

### User Profile Endpoints

#### 3. Get User Stats
**Endpoint**: `GET https://your-app.azurewebsites.net/api/users/{userId}/stats`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "totalTokens": 125,
  "adventuresCompleted": 8,
  "adventuresTotal": 12,
  "upvotes": 42,
  "completionRate": 67
}
```

**File Location**: `app/(tabs)/profile.tsx` - `userStats` variable (line 84)

**PostgreSQL Query Example**:
```sql
SELECT
  COALESCE(SUM(ua.tokens_earned), 0) as total_tokens,
  COUNT(CASE WHEN ua.completed = true THEN 1 END) as adventures_completed,
  COUNT(ua.id) as adventures_total,
  COALESCE(u.upvotes, 0) as upvotes,
  CASE
    WHEN COUNT(ua.id) > 0
    THEN (COUNT(CASE WHEN ua.completed = true THEN 1 END)::FLOAT / COUNT(ua.id)::FLOAT * 100)::INT
    ELSE 0
  END as completion_rate
FROM user_adventures ua
JOIN users u ON ua.user_id = u.id
WHERE ua.user_id = $1;
```

---

#### 4. Update Username
**Endpoint**: `PATCH https://your-app.azurewebsites.net/api/users/{userId}`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "fullName": "Jane Doe"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe"
  }
}
```

**File Location**: `contexts/AuthContext.jsx` - `editUsername()` function (line 106)

---

#### 5. Upload Profile Image
**Endpoint**: `POST https://your-app.azurewebsites.net/api/users/{userId}/image`

**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body**: FormData with image file

**Response**:
```json
{
  "success": true,
  "imageUrl": "https://your-blob-storage.blob.core.windows.net/profile-images/user-uuid.jpg"
}
```

**File Location**:
- `app/(tabs)/profile.tsx` - `pickImageAsync()` function (line 37)
- `contexts/AuthContext.jsx` - `editImage()` function (line 127)

**Azure Blob Storage Setup**:
1. Create Azure Storage Account
2. Create container named `profile-images`
3. Set public access level to "Blob"
4. Use Azure SDK for Node.js to handle uploads

---

#### 6. Get User Adventures
**Endpoint**: `GET https://your-app.azurewebsites.net/api/users/{userId}/adventures`

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
[
  {
    "id": 1,
    "title": "Downtown Explorer",
    "completed": true,
    "tokens": 25,
    "progress": 100
  },
  {
    "id": 4,
    "title": "Campus Quest",
    "completed": false,
    "tokens": 0,
    "progress": 60
  }
]
```

**File Location**: `components/profile/CompletedAdventuresButtons.tsx` - `completedAdventures` variable (line 35)

**PostgreSQL Query Example**:
```sql
SELECT
  a.id,
  a.title,
  ua.completed,
  ua.tokens_earned as tokens,
  ua.progress_percentage as progress
FROM user_adventures ua
JOIN adventures a ON ua.adventure_id = a.id
WHERE ua.user_id = $1
ORDER BY ua.last_updated DESC;
```

---

### Adventure Endpoints

#### 7. Get Published Adventures (Home Page)
**Endpoint**: `GET https://your-app.azurewebsites.net/api/adventures?status=published`

**Response**:
```json
[
  {
    "id": "1",
    "title": "Campus History Tour",
    "summary": "Discover the rich history of Calvin University...",
    "image_url": null,
    "region": {
      "id": "1",
      "name": "North Campus",
      "center": { "lat": 42.9301, "lng": -85.5883 }
    },
    "tokenCount": 5,
    "status": "published"
  }
]
```

**File Location**: `app/(tabs)/home.tsx` - `MOCK_ADVENTURES` array (line 62)

**PostgreSQL Query Example**:
```sql
SELECT
  a.id,
  a.title,
  a.summary,
  a.image_url,
  r.id as region_id,
  r.name as region_name,
  r.center_lat,
  r.center_lng,
  COUNT(t.id) as token_count,
  a.status
FROM adventures a
JOIN regions r ON a.region_id = r.id
LEFT JOIN tokens t ON t.adventure_id = a.id
WHERE a.status = 'published'
GROUP BY a.id, r.id
ORDER BY a.created_at DESC;
```

---

#### 8. Get Adventure Details
**Endpoint**: `GET https://your-app.azurewebsites.net/api/adventures/{adventureId}`

**Headers**: `Authorization: Bearer {token}` (optional, for user-specific data)

**Response**:
```json
{
  "id": "1",
  "title": "Campus History Tour",
  "description": "Discover the rich history of Calvin University through iconic landmarks...",
  "image": "https://your-storage.blob.core.windows.net/adventures/campus-tour.jpg",
  "difficulty": "Easy",
  "estimatedTime": "30-45 minutes",
  "rewards": "5 tokens",
  "isCompleted": false,
  "isUnlocked": true
}
```

**File Location**: `app/(gameplay pages)/adventurePage.tsx` - `fetchAdventureData()` function (line 38)

**PostgreSQL Query Example**:
```sql
SELECT
  a.id,
  a.title,
  a.description,
  a.image_url,
  a.difficulty,
  a.estimated_time,
  COUNT(t.id) as token_count,
  COALESCE(ua.completed, false) as is_completed,
  COALESCE(ua.unlocked, true) as is_unlocked
FROM adventures a
LEFT JOIN tokens t ON t.adventure_id = a.id
LEFT JOIN user_adventures ua ON ua.adventure_id = a.id AND ua.user_id = $1
WHERE a.id = $2
GROUP BY a.id, ua.completed, ua.unlocked;
```

---

## Implementation Checklist

### Phase 1: Authentication
- [ ] Set up Azure App Service for API hosting
- [ ] Create PostgreSQL database on Azure
- [ ] Implement JWT authentication
- [ ] Create `users` table
- [ ] Implement signup endpoint
- [ ] Implement login endpoint
- [ ] Update `AuthContext.jsx` with real API calls
- [ ] Store auth tokens in `expo-secure-store`

### Phase 2: Profile Management
- [ ] Set up Azure Blob Storage for images
- [ ] Create `user_stats` table or materialized view
- [ ] Create `user_adventures` table
- [ ] Implement get user stats endpoint
- [ ] Implement update username endpoint
- [ ] Implement profile image upload endpoint
- [ ] Implement get user adventures endpoint
- [ ] Update `profile.tsx` with real API calls
- [ ] Update `CompletedAdventuresButtons.tsx` with real API calls

### Phase 3: Adventures
- [ ] Create `regions` table
- [ ] Create `adventures` table
- [ ] Create `tokens` table
- [ ] Implement get published adventures endpoint
- [ ] Implement get adventure details endpoint
- [ ] Update `home.tsx` with real API calls
- [ ] Update `adventurePage.tsx` with real API calls

### Phase 4: Testing & Deployment
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Add error handling and loading states
- [ ] Implement token refresh logic
- [ ] Add offline support (optional)
- [ ] Deploy to Azure
- [ ] Update app config with production URLs

---

## Environment Variables

Create a `.env` file (or use Expo's app.config.js):

```
AZURE_API_BASE_URL=https://your-app.azurewebsites.net/api
AZURE_BLOB_STORAGE_URL=https://your-storage.blob.core.windows.net
AZURE_BLOB_STORAGE_KEY=your-storage-key
```

---

## Security Best Practices

1. **Password Security**: Use bcrypt with salt rounds ≥ 10
2. **JWT Tokens**: Set reasonable expiration times (e.g., 7 days)
3. **HTTPS Only**: Ensure all API calls use HTTPS
4. **Input Validation**: Validate all user inputs on backend
5. **Rate Limiting**: Implement rate limiting on authentication endpoints
6. **SQL Injection Prevention**: Use parameterized queries (e.g., `$1`, `$2`)
7. **CORS**: Configure CORS properly for your Expo app

---

## Useful Resources

- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Azure App Service Node.js](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Blob Storage SDK](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [PostgreSQL with Node.js](https://node-postgres.com/)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
