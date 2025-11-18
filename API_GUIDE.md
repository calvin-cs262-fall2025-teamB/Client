# WayFind API Documentation

**Version:** 1.0
**Base URL:** `https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net`
**Protocol:** HTTPS
**Authentication:** JWT Bearer Token (where required)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [User Profile](#user-profile-endpoints)
   - [Adventures](#adventure-endpoints)
   - [Regions](#region-endpoints)
   - [Tokens](#token-endpoints)
   - [Gameplay](#gameplay-endpoints)
6. [Data Models](#data-models)
7. [Status Codes](#status-codes)
8. [Implementation Examples](#implementation-examples)

---

## Overview

The WayFind API is a RESTful service that powers the WayFind mobile application - a location-based adventure game where users discover and collect tokens at real-world locations.

### Current Implementation Status

- ✅ **Live:** `GET /adventures` - Fetch all adventures
- 🚧 **Planned:** All other endpoints (see BACKEND_INTEGRATION.md)
- 📝 **Mock Data:** Frontend currently uses fallback mock data for most features

### Technology Stack

- **Backend:** Node.js with Express (recommended)
- **Database:** PostgreSQL
- **Hosting:** Azure App Service
- **Storage:** Azure Blob Storage (for images)
- **Authentication:** JWT with bcrypt password hashing

---

## Architecture Diagrams

### System Architecture

```mermaid
graph TB
    subgraph "Frontend - React Native/Expo"
        A[Mobile App]
        B[Web App]
    end

    subgraph "Backend - Azure"
        C[Azure App Service<br/>Node.js/Express API]
        D[Azure Blob Storage<br/>Images]
        E[PostgreSQL Database]
    end

    A -->|HTTPS/REST| C
    B -->|HTTPS/REST| C
    C -->|SQL Queries| E
    C -->|Upload/Retrieve| D

    style A fill:#34c759
    style B fill:#34c759
    style C fill:#007aff
    style D fill:#ff9500
    style E fill:#5856d6
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant SecureStore as Expo SecureStore

    %% Sign Up
    User->>App: Enter signup details
    App->>API: POST /api/auth/signup<br/>{email, password, fullName}
    API->>API: Hash password with bcrypt
    API->>DB: INSERT INTO users
    DB-->>API: User created
    API->>API: Generate JWT token
    API-->>App: {user, token}
    App->>SecureStore: Store JWT token
    App-->>User: Registration successful

    %% Login
    User->>App: Enter credentials
    App->>API: POST /api/auth/login<br/>{email, password}
    API->>DB: SELECT * FROM users WHERE email
    DB-->>API: User data
    API->>API: Verify password with bcrypt
    API->>API: Generate JWT token
    API-->>App: {user, token}
    App->>SecureStore: Store JWT token
    App-->>User: Login successful

    %% Authenticated Request
    User->>App: Access protected resource
    App->>SecureStore: Retrieve token
    SecureStore-->>App: JWT token
    App->>API: GET /api/users/{id}<br/>Authorization: Bearer {token}
    API->>API: Verify JWT token
    API->>DB: Query user data
    DB-->>API: User data
    API-->>App: Response
    App-->>User: Display data
```

### Adventure Gameplay Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant GPS as GPS Sensor
    participant API as Backend API
    participant DB as PostgreSQL

    %% Discovery
    User->>App: Browse adventures
    App->>API: GET /api/adventures?status=published
    API->>DB: Query adventures
    DB-->>API: Adventure list
    API-->>App: Adventures data
    App-->>User: Display adventure cards

    %% Start Adventure
    User->>App: Select adventure
    App->>API: GET /api/adventures/{id}
    API->>DB: Query adventure details + tokens
    DB-->>API: Full adventure data
    API-->>App: Adventure + token locations
    App-->>User: Show adventure details

    User->>App: Start adventure
    App->>API: POST /api/users/{userId}/adventures/{id}/start
    API->>DB: INSERT INTO user_adventures
    DB-->>API: User adventure created
    API-->>App: Adventure started
    App-->>User: Navigate to gameplay

    %% Token Collection
    loop Real-time GPS Tracking
        GPS->>App: Location update
        App->>App: Calculate distance to tokens

        alt Within 50m of token
            App->>App: Trigger haptic feedback
            App-->>User: "Token nearby!"
            User->>App: Collect token
            App->>API: POST /api/users/{userId}/tokens/{tokenId}/collect<br/>{lat, lng, timestamp}
            API->>API: Verify proximity (< 50m)
            API->>DB: Update user_adventures<br/>Increment tokens_earned
            DB-->>API: Progress updated
            API-->>App: {tokensEarned, progress, completed}
            App-->>User: "Token collected! +1"
        end
    end

    %% Completion
    alt All tokens collected
        App->>API: POST /api/users/{userId}/adventures/{id}/complete
        API->>DB: UPDATE user_adventures SET completed=true
        API->>DB: UPDATE user_stats
        DB-->>API: Adventure completed
        API-->>App: {rewards, totalTokens, adventuresCompleted}
        App-->>User: "Congratulations! Adventure completed!"
    end
```

### Data Relationships (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ USER_ADVENTURES : participates
    USERS ||--o{ USER_STATS : has
    USERS {
        uuid id PK
        string fullName
        string email UK
        string passwordHash
        string profileImageUrl
        timestamp createdAt
        timestamp updatedAt
    }

    ADVENTURES ||--o{ TOKENS : contains
    ADVENTURES }o--|| REGIONS : "belongs to"
    ADVENTURES ||--o{ USER_ADVENTURES : "tracked by"
    ADVENTURES {
        uuid id PK
        string title
        string summary
        text description
        string imageUrl
        uuid regionId FK
        string difficulty
        string estimatedTime
        string status
        timestamp createdAt
    }

    REGIONS ||--o{ ADVENTURES : contains
    REGIONS {
        uuid id PK
        string name
        decimal centerLat
        decimal centerLng
        jsonb boundaries
        timestamp createdAt
    }

    TOKENS {
        uuid id PK
        uuid adventureId FK
        string name
        text description
        decimal latitude
        decimal longitude
        int sequenceOrder
        timestamp createdAt
    }

    USER_ADVENTURES {
        uuid id PK
        uuid userId FK
        uuid adventureId FK
        boolean completed
        boolean unlocked
        int tokensEarned
        int progressPercentage
        timestamp startedAt
        timestamp completedAt
    }

    USER_STATS {
        uuid userId PK,FK
        int totalTokens
        int adventuresCompleted
        int adventuresTotal
        int upvotes
        int completionRate
        timestamp updatedAt
    }
```

### Token Collection Proximity Logic

```mermaid
flowchart TD
    A[GPS Location Update] --> B{Calculate Distance<br/>to Each Token}
    B --> C{Distance < 50m?}
    C -->|Yes| D[Trigger Haptic Feedback]
    C -->|No| B
    D --> E[Show Collection UI]
    E --> F{User Taps Collect}
    F -->|Yes| G[Send to API:<br/>POST /collect]
    F -->|No| B
    G --> H{API Verifies<br/>Proximity}
    H -->|Valid| I[Update Database]
    H -->|Invalid| J[Return Error:<br/>Too Far]
    I --> K[Return Success +<br/>Progress Update]
    K --> L[Update UI:<br/>Token Collected]
    L --> M{All Tokens<br/>Collected?}
    M -->|Yes| N[Complete Adventure]
    M -->|No| B
    J --> O[Show Error Message]
    O --> B
```

### API Request Flow

```mermaid
flowchart LR
    A[Client Request] --> B{Auth Required?}
    B -->|Yes| C{JWT Token<br/>Present?}
    B -->|No| H
    C -->|Yes| D{JWT Valid?}
    C -->|No| E[401 Unauthorized]
    D -->|Yes| F{User Has<br/>Permission?}
    D -->|No| E
    F -->|Yes| H[Process Request]
    F -->|No| G[403 Forbidden]
    H --> I{Validation<br/>Passed?}
    I -->|Yes| J[Execute Business Logic]
    I -->|No| K[400 Bad Request]
    J --> L{Database<br/>Operation<br/>Success?}
    L -->|Yes| M[200/201 Success]
    L -->|No| N[500 Server Error]

    style M fill:#34c759
    style E fill:#ff3b30
    style G fill:#ff9500
    style K fill:#ff9500
    style N fill:#ff3b30
```

---

## Authentication

### Authentication Flow

1. User signs up or logs in
2. API returns a JWT token
3. Client stores token in secure storage (`expo-secure-store`)
4. Client includes token in `Authorization` header for protected routes

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Access Token:** 7 days (recommended)
- **Refresh Token:** 30 days (future implementation)

### Security Requirements

- All passwords must be hashed with bcrypt (salt rounds ≥ 10)
- HTTPS only in production
- Rate limiting on auth endpoints (max 5 login attempts per 15 minutes)
- Input validation on all endpoints

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context (optional)"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Incorrect email or password |
| `SERVER_ERROR` | 500 | Internal server error |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": "The 'email' field must be a valid email address"
  }
}
```

---

## API Endpoints

## Authentication Endpoints

### 1. Sign Up

**Endpoint:** `POST /api/auth/signup`
**Authentication:** None
**Description:** Register a new user account

#### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Validation Rules

- `fullName`: Required, 2-255 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, and number

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profileImageUrl": null,
      "createdAt": "2025-01-16T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**409 Conflict** - Email already exists
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "An account with this email already exists"
  }
}
```

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 8 characters"
  }
}
```

#### Frontend Integration

**File:** `contexts/AuthContext.jsx`
**Function:** `signup()`
**Line:** 55

```javascript
const signup = async (fullName, email, password) => {
  try {
    const response = await fetch('https://your-api.azurewebsites.net/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.message);
    }

    // Store token securely
    await SecureStore.setItemAsync('authToken', data.data.token);

    dispatch({
      type: 'SIGNUP',
      payload: {
        user: data.data.user.fullName,
        email: data.data.user.email
      }
    });
  } catch (error) {
    Alert.alert('Signup Failed', error.message);
  }
};
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`
**Authentication:** None
**Description:** Authenticate existing user

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profileImageUrl": "https://blob.storage.url/profiles/user-123.jpg",
      "createdAt": "2025-01-16T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Incorrect email or password"
  }
}
```

#### Frontend Integration

**File:** `contexts/AuthContext.jsx`
**Function:** `login()`
**Line:** 77

---

### 3. Logout

**Endpoint:** `POST /api/auth/logout` *(Optional - can be client-side only)*
**Authentication:** Required
**Description:** Invalidate user session (if using token blacklist)

#### Request Headers

```
Authorization: Bearer {token}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Frontend Integration

Client-side implementation (clear local token):

```javascript
const logout = async () => {
  await SecureStore.deleteItemAsync('authToken');
  dispatch({ type: 'LOGOUT' });
};
```

---

## User Profile Endpoints

### 4. Get User Profile

**Endpoint:** `GET /api/users/{userId}`
**Authentication:** Required
**Description:** Retrieve user profile information

#### Path Parameters

- `userId` (UUID) - User ID

#### Request Headers

```
Authorization: Bearer {token}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profileImageUrl": "https://blob.storage.url/profiles/user-123.jpg",
    "createdAt": "2025-01-16T12:00:00Z",
    "updatedAt": "2025-01-16T14:30:00Z"
  }
}
```

---

### 5. Update User Profile

**Endpoint:** `PATCH /api/users/{userId}`
**Authentication:** Required
**Description:** Update user profile information

#### Request Headers

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "fullName": "Jane Doe"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Jane Doe",
    "email": "john@example.com",
    "updatedAt": "2025-01-16T15:00:00Z"
  }
}
```

#### Frontend Integration

**File:** `contexts/AuthContext.jsx`
**Function:** `editUsername()`
**Line:** 106

---

### 6. Get User Statistics

**Endpoint:** `GET /api/users/{userId}/stats`
**Authentication:** Required
**Description:** Retrieve user's game statistics

#### Request Headers

```
Authorization: Bearer {token}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "totalTokens": 125,
    "adventuresCompleted": 8,
    "adventuresTotal": 12,
    "upvotes": 42,
    "completionRate": 67,
    "lastUpdated": "2025-01-16T12:00:00Z"
  }
}
```

#### PostgreSQL Query

```sql
SELECT
  u.id as user_id,
  COALESCE(SUM(ua.tokens_earned), 0) as total_tokens,
  COUNT(CASE WHEN ua.completed = true THEN 1 END) as adventures_completed,
  COUNT(ua.id) as adventures_total,
  COALESCE(us.upvotes, 0) as upvotes,
  CASE
    WHEN COUNT(ua.id) > 0
    THEN (COUNT(CASE WHEN ua.completed = true THEN 1 END)::FLOAT / COUNT(ua.id)::FLOAT * 100)::INT
    ELSE 0
  END as completion_rate
FROM users u
LEFT JOIN user_adventures ua ON ua.user_id = u.id
LEFT JOIN user_stats us ON us.user_id = u.id
WHERE u.id = $1
GROUP BY u.id, us.upvotes;
```

#### Frontend Integration

**File:** `app/(tabs)/profile.tsx`
**Variable:** `userStats`
**Line:** 77

**Current Implementation:** Hardcoded mock data
```javascript
const userStats = {
  totalTokens: 125,
  adventuresCompleted: 8,
  adventuresTotal: 12,
  upvotes: 42,
  completionRate: 67,
};
```

**Needed Implementation:**
```javascript
const [userStats, setUserStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    setUserStats(data.data);
  };

  fetchStats();
}, [userId]);
```

---

### 7. Upload Profile Image

**Endpoint:** `POST /api/users/{userId}/image`
**Authentication:** Required
**Description:** Upload user profile picture to Azure Blob Storage

#### Request Headers

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Request Body (FormData)

```
image: [binary file]
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://your-storage.blob.core.windows.net/profile-images/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

#### Frontend Integration

**File:** `app/(tabs)/profile.tsx`
**Function:** `pickImageAsync()`
**Line:** 37

**Needed Implementation:**
```javascript
const pickImageAsync = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    const token = await SecureStore.getItemAsync('authToken');

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/image`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await response.json();
    setSelectedImage(data.data.imageUrl);
  }
};
```

#### Azure Blob Storage Configuration

1. Create Storage Account in Azure
2. Create container: `profile-images`
3. Set access level: Blob (anonymous read access)
4. Use `@azure/storage-blob` SDK on backend
5. Generate unique filename: `{userId}-{timestamp}.jpg`

---

### 8. Get User Adventures

**Endpoint:** `GET /api/users/{userId}/adventures`
**Authentication:** Required
**Description:** Get all adventures for a specific user (completed and in-progress)

#### Query Parameters

- `status` (optional) - Filter by status: `completed`, `in-progress`, or `all` (default)

#### Request Headers

```
Authorization: Bearer {token}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "adventureId": "adv-123",
      "title": "Downtown Explorer",
      "completed": true,
      "unlocked": true,
      "tokensEarned": 25,
      "progress": 100,
      "startedAt": "2025-01-10T10:00:00Z",
      "completedAt": "2025-01-10T11:30:00Z",
      "lastUpdated": "2025-01-10T11:30:00Z"
    },
    {
      "id": "2",
      "adventureId": "adv-456",
      "title": "Campus Quest",
      "completed": false,
      "unlocked": true,
      "tokensEarned": 0,
      "progress": 60,
      "startedAt": "2025-01-15T09:00:00Z",
      "completedAt": null,
      "lastUpdated": "2025-01-16T12:00:00Z"
    }
  ]
}
```

#### PostgreSQL Query

```sql
SELECT
  ua.id,
  a.id as adventure_id,
  a.title,
  ua.completed,
  ua.unlocked,
  ua.tokens_earned,
  ua.progress_percentage as progress,
  ua.started_at,
  ua.completed_at,
  ua.last_updated
FROM user_adventures ua
JOIN adventures a ON ua.adventure_id = a.id
WHERE ua.user_id = $1
  AND ($2 IS NULL OR
    ($2 = 'completed' AND ua.completed = true) OR
    ($2 = 'in-progress' AND ua.completed = false))
ORDER BY ua.last_updated DESC;
```

#### Frontend Integration

**File:** `components/profile/AdventureRecord.tsx`
**Variable:** `completedAdventures`
**Line:** 19

---

## Adventure Endpoints

### 9. Get All Adventures

**Endpoint:** `GET /adventures` or `GET /api/adventures`
**Authentication:** Optional
**Description:** Retrieve all published adventures

#### Query Parameters

- `status` (optional) - Filter by status: `published` (default), `draft`, `archived`
- `difficulty` (optional) - Filter by difficulty: `Easy`, `Medium`, `Hard`
- `regionId` (optional) - Filter by region UUID

#### Success Response (200 OK)

**Current API Response Structure:**
```json
[
  {
    "id": 1,
    "name": "Campus History Tour",
    "regionid": 1,
    "location": {
      "x": 42.9301,
      "y": -85.5883
    },
    "numtokens": 5
  }
]
```

**Expected/Recommended API Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Campus History Tour",
      "summary": "Discover the rich history of Calvin University through iconic landmarks",
      "description": "Full description of the adventure...",
      "imageUrl": "https://blob.storage.url/adventures/campus-tour.jpg",
      "region": {
        "id": "region-uuid",
        "name": "North Campus",
        "center": {
          "lat": 42.9301,
          "lng": -85.5883
        }
      },
      "tokenCount": 5,
      "difficulty": "Easy",
      "estimatedTime": "30-45 minutes",
      "status": "published",
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

#### PostgreSQL Query

```sql
SELECT
  a.id,
  a.title,
  a.summary,
  a.description,
  a.image_url,
  r.id as region_id,
  r.name as region_name,
  r.center_lat,
  r.center_lng,
  COUNT(t.id) as token_count,
  a.difficulty,
  a.estimated_time,
  a.status,
  a.created_at
FROM adventures a
JOIN regions r ON a.region_id = r.id
LEFT JOIN tokens t ON t.adventure_id = a.id
WHERE a.status = COALESCE($1, 'published')
  AND ($2 IS NULL OR a.difficulty = $2)
  AND ($3 IS NULL OR a.region_id = $3)
GROUP BY a.id, r.id
ORDER BY a.created_at DESC
LIMIT $4 OFFSET $5;
```

#### Frontend Integration

**Files:**
- `app/(tabs)/home.tsx` (line 155)
- `contexts/HomeContext.jsx` (line 50)

**Current Implementation:**
```javascript
const response = await fetch(
  'https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net/adventures'
);
const data = await response.json();

// Transforms current API structure to expected format
const transformedAdventures = data.map((item) => ({
  id: item.id.toString(),
  title: item.name,
  summary: item.name,
  description: item.name,
  image_url: null,
  region: {
    id: item.regionid?.toString() || '1',
    name: `Region ${item.regionid}`,
    center: {
      lat: item.location?.x || 42.9301,
      lng: item.location?.y || -85.5883,
    },
  },
  tokenCount: item.numtokens || 0,
  difficulty: 'Medium', // Default
  estimatedTime: '30 min', // Default
  status: 'published',
}));
```

#### API Improvements Needed

1. **Add missing fields to database:**
   - `summary` TEXT
   - `description` TEXT
   - `difficulty` VARCHAR(50)
   - `estimated_time` VARCHAR(50)

2. **Update response to include:**
   - Region details (name, coordinates)
   - Proper field names (`title` instead of `name`)
   - Image URLs
   - Consistent coordinate naming (`lat`/`lng` instead of `x`/`y`)

3. **Add pagination support**

---

### 10. Get Adventure Details

**Endpoint:** `GET /api/adventures/{adventureId}`
**Authentication:** Optional (provides user-specific data if authenticated)
**Description:** Get detailed information about a specific adventure

#### Path Parameters

- `adventureId` (UUID) - Adventure ID

#### Request Headers (Optional)

```
Authorization: Bearer {token}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Campus History Tour",
    "summary": "Discover the rich history of Calvin University",
    "description": "Embark on a journey through time as you explore the historic landmarks...",
    "imageUrl": "https://blob.storage.url/adventures/campus-tour.jpg",
    "difficulty": "Easy",
    "estimatedTime": "30-45 minutes",
    "status": "published",
    "region": {
      "id": "region-uuid",
      "name": "North Campus",
      "center": {
        "lat": 42.9301,
        "lng": -85.5883
      }
    },
    "tokens": [
      {
        "id": "token-1",
        "name": "Chapel Bell",
        "description": "Historic bell from 1920",
        "latitude": 42.9305,
        "longitude": -85.5880,
        "sequenceOrder": 1
      }
    ],
    "tokenCount": 5,
    "userProgress": {
      "completed": false,
      "unlocked": true,
      "tokensCollected": 2,
      "progress": 40
    },
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

#### PostgreSQL Query

```sql
SELECT
  a.id,
  a.title,
  a.summary,
  a.description,
  a.image_url,
  a.difficulty,
  a.estimated_time,
  a.status,
  r.id as region_id,
  r.name as region_name,
  r.center_lat,
  r.center_lng,
  json_agg(
    json_build_object(
      'id', t.id,
      'name', t.name,
      'description', t.description,
      'latitude', t.latitude,
      'longitude', t.longitude,
      'sequenceOrder', t.sequence_order
    ) ORDER BY t.sequence_order
  ) FILTER (WHERE t.id IS NOT NULL) as tokens,
  COUNT(t.id) as token_count,
  COALESCE(ua.completed, false) as user_completed,
  COALESCE(ua.unlocked, true) as user_unlocked,
  COALESCE(ua.tokens_earned, 0) as user_tokens_collected,
  COALESCE(ua.progress_percentage, 0) as user_progress,
  a.created_at
FROM adventures a
JOIN regions r ON a.region_id = r.id
LEFT JOIN tokens t ON t.adventure_id = a.id
LEFT JOIN user_adventures ua ON ua.adventure_id = a.id AND ua.user_id = $2
WHERE a.id = $1
GROUP BY a.id, r.id, ua.completed, ua.unlocked, ua.tokens_earned, ua.progress_percentage;
```

#### Frontend Integration

**File:** `app/(gameplay pages)/adventurePage.tsx`
**Function:** `fetchAdventureData()`
**Line:** 47

---

### 11. Create Adventure

**Endpoint:** `POST /api/adventures`
**Authentication:** Required
**Description:** Create a new adventure (draft status by default)

#### Request Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "title": "Downtown Explorer",
  "summary": "Short summary of the adventure",
  "description": "Full description of what users will discover",
  "regionId": "region-uuid",
  "difficulty": "Medium",
  "estimatedTime": "45-60 minutes",
  "status": "draft",
  "imageUrl": null
}
```

#### Validation Rules

- `title`: Required, 3-255 characters
- `regionId`: Required, must exist in regions table
- `difficulty`: Optional, enum: `Easy`, `Medium`, `Hard`
- `status`: Optional, enum: `draft`, `published`, `archived` (default: `draft`)

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Adventure created successfully",
  "data": {
    "id": "new-adventure-uuid",
    "title": "Downtown Explorer",
    "summary": "Short summary of the adventure",
    "description": "Full description of what users will discover",
    "regionId": "region-uuid",
    "difficulty": "Medium",
    "estimatedTime": "45-60 minutes",
    "status": "draft",
    "imageUrl": null,
    "createdAt": "2025-01-16T12:00:00Z"
  }
}
```

#### Frontend Integration

**File:** `app/creator/adventure.tsx`
**Function:** `handleCreate()`
**Line:** 31

**Current Implementation:** Shows mock alert
```javascript
Alert.alert("Adventure Created (sample)", `Region: ${regionLabel}`);
```

**Needed Implementation:**
```javascript
const handleCreate = async () => {
  if (!selectedRegion) {
    Alert.alert("Error", "Please select a region");
    return;
  }

  try {
    const token = await SecureStore.getItemAsync('authToken');

    const response = await fetch(`${API_BASE_URL}/adventures`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: adventureTitle,
        summary: adventureSummary,
        description: adventureDescription,
        regionId: selectedRegion,
        difficulty: selectedDifficulty,
        estimatedTime: estimatedTime,
        status: 'draft',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert("Success", "Adventure created!");
      router.back();
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

---

### 12. Update Adventure

**Endpoint:** `PATCH /api/adventures/{adventureId}`
**Authentication:** Required
**Description:** Update adventure details

#### Request Body

```json
{
  "title": "Updated Title",
  "status": "published"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Adventure updated successfully",
  "data": {
    "id": "adventure-uuid",
    "title": "Updated Title",
    "status": "published",
    "updatedAt": "2025-01-16T12:00:00Z"
  }
}
```

---

### 13. Delete Adventure

**Endpoint:** `DELETE /api/adventures/{adventureId}`
**Authentication:** Required
**Description:** Delete an adventure (soft delete recommended)

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Adventure deleted successfully"
}
```

---

## Region Endpoints

### 14. Get All Regions

**Endpoint:** `GET /api/regions`
**Authentication:** Optional
**Description:** Get all available regions

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "North Campus",
      "center": {
        "lat": 42.9301,
        "lng": -85.5883
      },
      "boundaries": [
        { "lat": 42.9301, "lng": -85.5883 },
        { "lat": 42.9305, "lng": -85.5885 },
        { "lat": 42.9303, "lng": -85.5890 }
      ],
      "adventureCount": 5,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ]
}
```

#### PostgreSQL Query

```sql
SELECT
  r.id,
  r.name,
  r.center_lat,
  r.center_lng,
  r.boundaries,
  COUNT(a.id) as adventure_count,
  r.created_at
FROM regions r
LEFT JOIN adventures a ON a.region_id = r.id AND a.status = 'published'
GROUP BY r.id
ORDER BY r.name;
```

---

### 15. Get Region Details

**Endpoint:** `GET /api/regions/{regionId}`
**Authentication:** Optional
**Description:** Get detailed information about a specific region

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "North Campus",
    "center": {
      "lat": 42.9301,
      "lng": -85.5883
    },
    "boundaries": [
      { "lat": 42.9301, "lng": -85.5883 },
      { "lat": 42.9305, "lng": -85.5885 }
    ],
    "adventures": [
      {
        "id": "adv-uuid",
        "title": "Campus History Tour",
        "tokenCount": 5
      }
    ],
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

---

### 16. Create Region

**Endpoint:** `POST /api/regions`
**Authentication:** Required
**Description:** Create a new region

#### Request Body

```json
{
  "name": "East Campus",
  "center": {
    "lat": 42.9310,
    "lng": -85.5870
  },
  "boundaries": [
    { "lat": 42.9301, "lng": -85.5883 },
    { "lat": 42.9305, "lng": -85.5885 },
    { "lat": 42.9303, "lng": -85.5890 }
  ]
}
```

#### Validation Rules

- `name`: Required, 3-255 characters
- `center`: Required, object with `lat` and `lng`
- `boundaries`: Optional, array of coordinate objects (min 3 points for polygon)

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Region created successfully",
  "data": {
    "id": "new-region-uuid",
    "name": "East Campus",
    "center": {
      "lat": 42.9310,
      "lng": -85.5870
    },
    "boundaries": [...],
    "createdAt": "2025-01-16T12:00:00Z"
  }
}
```

#### Frontend Integration

**File:** `app/(tabs)/map.tsx`
**State:** `currentPoints`, `regions`
**Line:** 82-83

**Needed Implementation:**
```javascript
const handleFinishRegion = async () => {
  if (currentPoints.length < 3) {
    Alert.alert("Error", "Region must have at least 3 points");
    return;
  }

  const center = calculateCenter(currentPoints);

  try {
    const token = await SecureStore.getItemAsync('authToken');

    const response = await fetch(`${API_BASE_URL}/regions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: regionName,
        center: { lat: center.latitude, lng: center.longitude },
        boundaries: currentPoints,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setRegions([...regions, data.data]);
      setCurrentPoints([]);
      setIsDrawing(false);
      Alert.alert("Success", "Region created!");
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};
```

---

## Token Endpoints

### 17. Get Tokens for Adventure

**Endpoint:** `GET /api/adventures/{adventureId}/tokens`
**Authentication:** Optional
**Description:** Get all tokens for a specific adventure

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "token-uuid",
      "adventureId": "adventure-uuid",
      "name": "Chapel Bell",
      "description": "Historic bell from 1920",
      "latitude": 42.9305,
      "longitude": -85.5880,
      "sequenceOrder": 1,
      "isCollected": false,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ]
}
```

---

### 18. Create Token

**Endpoint:** `POST /api/adventures/{adventureId}/tokens`
**Authentication:** Required
**Description:** Add a token to an adventure

#### Request Body

```json
{
  "name": "Historic Landmark",
  "description": "Significant building from the 1800s",
  "latitude": 42.9305,
  "longitude": -85.5880,
  "sequenceOrder": 1
}
```

#### Validation Rules

- `name`: Required, 3-255 characters
- `latitude`: Required, valid latitude (-90 to 90)
- `longitude`: Required, valid longitude (-180 to 180)
- `sequenceOrder`: Optional, integer

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Token created successfully",
  "data": {
    "id": "new-token-uuid",
    "adventureId": "adventure-uuid",
    "name": "Historic Landmark",
    "description": "Significant building from the 1800s",
    "latitude": 42.9305,
    "longitude": -85.5880,
    "sequenceOrder": 1,
    "createdAt": "2025-01-16T12:00:00Z"
  }
}
```

#### Frontend Integration

**File:** `app/(tabs)/map.tsx`
**Function:** `handleAddToken()` (currently inline logic)
**Line:** ~200

---

### 19. Update Token

**Endpoint:** `PATCH /api/tokens/{tokenId}`
**Authentication:** Required
**Description:** Update token details

#### Request Body

```json
{
  "name": "Updated Token Name",
  "latitude": 42.9306,
  "longitude": -85.5881
}
```

---

### 20. Delete Token

**Endpoint:** `DELETE /api/tokens/{tokenId}`
**Authentication:** Required
**Description:** Remove a token from an adventure

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token deleted successfully"
}
```

---

## Gameplay Endpoints

### 21. Start Adventure

**Endpoint:** `POST /api/users/{userId}/adventures/{adventureId}/start`
**Authentication:** Required
**Description:** Begin an adventure for a user

#### Request Headers

```
Authorization: Bearer {token}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Adventure started",
  "data": {
    "userAdventureId": "ua-uuid",
    "adventureId": "adventure-uuid",
    "userId": "user-uuid",
    "completed": false,
    "unlocked": true,
    "tokensEarned": 0,
    "progress": 0,
    "startedAt": "2025-01-16T12:00:00Z"
  }
}
```

#### PostgreSQL Query

```sql
INSERT INTO user_adventures (user_id, adventure_id, completed, unlocked, tokens_earned, progress_percentage, started_at)
VALUES ($1, $2, false, true, 0, 0, NOW())
ON CONFLICT (user_id, adventure_id)
DO UPDATE SET last_updated = NOW()
RETURNING *;
```

#### Frontend Integration

**File:** `app/(gameplay pages)/adventurePage.tsx`
**Component:** "Start Adventure" button
**Line:** 400+

---

### 22. Collect Token

**Endpoint:** `POST /api/users/{userId}/tokens/{tokenId}/collect`
**Authentication:** Required
**Description:** Mark a token as collected when user is within proximity

#### Request Body

```json
{
  "latitude": 42.9305,
  "longitude": -85.5880,
  "timestamp": "2025-01-16T12:30:00Z"
}
```

#### Validation

Backend should verify:
1. User is within acceptable proximity (e.g., 50 meters)
2. Token belongs to an active adventure for this user
3. Token hasn't already been collected

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token collected!",
  "data": {
    "tokenId": "token-uuid",
    "tokensEarned": 1,
    "totalTokens": 3,
    "progress": 60,
    "adventureCompleted": false,
    "collectedAt": "2025-01-16T12:30:00Z"
  }
}
```

#### Proximity Calculation (Backend)

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Check if within 50 meters
const distance = calculateDistance(userLat, userLon, tokenLat, tokenLon);
if (distance > 50) {
  throw new Error("Too far from token location");
}
```

#### Frontend Integration

**File:** New gameplay screen needed
**Feature:** Real-time GPS tracking with proximity detection
**Reference:** `app/(tabs)/map.tsx` has location tracking logic

**Needed Implementation:**
```javascript
useEffect(() => {
  const subscription = Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
    },
    async (location) => {
      // Check proximity to uncollected tokens
      for (const token of tokens) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          token.latitude,
          token.longitude
        );

        if (distance < 50 && !token.isCollected) {
          // Trigger haptic feedback
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );

          // Collect token
          await collectToken(token.id, location.coords);
        }
      }
    }
  );

  return () => subscription.remove();
}, [tokens]);
```

---

### 23. Update Adventure Progress

**Endpoint:** `PATCH /api/users/{userId}/adventures/{adventureId}`
**Authentication:** Required
**Description:** Update user's progress in an adventure

#### Request Body

```json
{
  "tokensEarned": 3,
  "progress": 60,
  "completed": false
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "userAdventureId": "ua-uuid",
    "tokensEarned": 3,
    "progress": 60,
    "completed": false,
    "lastUpdated": "2025-01-16T12:30:00Z"
  }
}
```

---

### 24. Complete Adventure

**Endpoint:** `POST /api/users/{userId}/adventures/{adventureId}/complete`
**Authentication:** Required
**Description:** Mark an adventure as completed

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Adventure completed! Congratulations!",
  "data": {
    "userAdventureId": "ua-uuid",
    "adventureId": "adventure-uuid",
    "completed": true,
    "tokensEarned": 5,
    "progress": 100,
    "completedAt": "2025-01-16T13:00:00Z",
    "rewards": {
      "totalTokens": 130,
      "adventuresCompleted": 9
    }
  }
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string; // UUID
  fullName: string;
  email: string;
  passwordHash: string; // Never returned in API responses
  profileImageUrl: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Adventure

```typescript
interface Adventure {
  id: string; // UUID
  title: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  regionId: string; // UUID
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

### Region

```typescript
interface Region {
  id: string; // UUID
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  boundaries?: Array<{ lat: number; lng: number }>;
  createdAt: string;
}
```

### Token

```typescript
interface Token {
  id: string; // UUID
  adventureId: string; // UUID
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  createdAt: string;
}
```

### UserAdventure

```typescript
interface UserAdventure {
  id: string; // UUID
  userId: string; // UUID
  adventureId: string; // UUID
  completed: boolean;
  unlocked: boolean;
  tokensEarned: number;
  progress: number; // 0-100
  startedAt: string;
  completedAt: string | null;
  lastUpdated: string;
}
```

### UserStats

```typescript
interface UserStats {
  userId: string; // UUID
  totalTokens: number;
  adventuresCompleted: number;
  adventuresTotal: number;
  upvotes: number;
  completionRate: number; // 0-100
  updatedAt: string;
}
```

---

## Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Implementation Examples

### Setting Up API Client

**File:** `utils/api.ts` (create this file)

```typescript
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !options.headers?.['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
```

### Usage Example

```typescript
import { api } from '@/utils/api';

// Get adventures
const adventures = await api.get('/adventures');

// Login
const loginData = await api.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

// Get user stats
const stats = await api.get(`/api/users/${userId}/stats`);
```

---

## Next Steps

### Immediate Priorities

1. **Standardize Current API Response**
   - Update `/adventures` endpoint to match expected schema
   - Add missing fields to database schema
   - Use consistent naming conventions

2. **Implement Authentication**
   - Create signup/login endpoints
   - Add JWT token generation
   - Set up secure password hashing

3. **Add Missing Endpoints**
   - User profile management
   - User statistics
   - Adventure details

4. **Frontend Integration**
   - Replace all mock data with API calls
   - Implement error handling
   - Add loading states

### Future Enhancements

- [ ] Pagination for adventure lists
- [ ] Search and filtering
- [ ] Image upload to Azure Blob Storage
- [ ] Real-time token proximity detection
- [ ] Leaderboards and social features
- [ ] Adventure ratings and reviews
- [ ] Push notifications for nearby adventures
- [ ] Offline support with local caching

---

## Support & Resources

- **BACKEND_INTEGRATION.md** - Database schemas and migration guide
- **TECH_STACK.md** - Technology stack overview
- **CLAUDE.md** - Development guidelines

For questions or issues, consult the development team or create an issue in the project repository.
