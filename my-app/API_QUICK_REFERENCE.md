# WayFind API Quick Reference

**Base URL:** `https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net`
**Auth:** JWT Bearer Token (except where noted)

---

## 📋 Endpoint Index

| Status | Method | Endpoint | Description | Auth |
|--------|--------|----------|-------------|------|
| 🚧 | POST | `/api/auth/signup` | Register new user | ❌ |
| 🚧 | POST | `/api/auth/login` | Login user | ❌ |
| 🚧 | POST | `/api/auth/logout` | Logout user | ✅ |
| 🚧 | GET | `/api/users/{userId}` | Get user profile | ✅ |
| 🚧 | PATCH | `/api/users/{userId}` | Update profile | ✅ |
| 🚧 | GET | `/api/users/{userId}/stats` | Get user stats | ✅ |
| 🚧 | POST | `/api/users/{userId}/image` | Upload profile image | ✅ |
| 🚧 | GET | `/api/users/{userId}/adventures` | Get user adventures | ✅ |
| ✅ | GET | `/adventures` | Get all adventures (LIVE) | ❌ |
| 🚧 | GET | `/api/adventures` | Get adventures (improved) | ❌ |
| 🚧 | POST | `/api/adventures` | Create adventure | ✅ |
| 🚧 | GET | `/api/adventures/{id}` | Get adventure details | ❌ |
| 🚧 | PATCH | `/api/adventures/{id}` | Update adventure | ✅ |
| 🚧 | DELETE | `/api/adventures/{id}` | Delete adventure | ✅ |
| 🚧 | GET | `/api/regions` | Get all regions | ❌ |
| 🚧 | POST | `/api/regions` | Create region | ✅ |
| 🚧 | GET | `/api/regions/{id}` | Get region details | ❌ |
| 🚧 | GET | `/api/adventures/{id}/tokens` | Get tokens | ❌ |
| 🚧 | POST | `/api/adventures/{id}/tokens` | Create token | ✅ |
| 🚧 | PATCH | `/api/tokens/{id}` | Update token | ✅ |
| 🚧 | DELETE | `/api/tokens/{id}` | Delete token | ✅ |
| 🚧 | POST | `/api/users/{userId}/adventures/{id}/start` | Start adventure | ✅ |
| 🚧 | POST | `/api/users/{userId}/tokens/{id}/collect` | Collect token | ✅ |
| 🚧 | PATCH | `/api/users/{userId}/adventures/{id}` | Update progress | ✅ |
| 🚧 | POST | `/api/users/{userId}/adventures/{id}/complete` | Complete adventure | ✅ |

**Legend:** ✅ Live | 🚧 Planned | ✅ Required | ❌ Optional

---

## 🔐 Authentication

### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

→ 201 { "success": true, "data": { "user": {...}, "token": "jwt..." } }
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

→ 200 { "success": true, "data": { "user": {...}, "token": "jwt..." } }
```

### Using Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👤 User Profile

### Get User Stats
```http
GET /api/users/{userId}/stats
Authorization: Bearer {token}

→ 200 {
  "success": true,
  "data": {
    "totalTokens": 125,
    "adventuresCompleted": 8,
    "adventuresTotal": 12,
    "upvotes": 42,
    "completionRate": 67
  }
}
```

**Frontend:** `app/(tabs)/profile.tsx:77`

### Update Profile
```http
PATCH /api/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{ "fullName": "Jane Doe" }

→ 200 { "success": true, "data": { "id": "...", "fullName": "Jane Doe" } }
```

**Frontend:** `contexts/AuthContext.jsx:106`

### Upload Profile Image
```http
POST /api/users/{userId}/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: [binary file]

→ 200 { "success": true, "data": { "imageUrl": "https://..." } }
```

**Frontend:** `app/(tabs)/profile.tsx:37`

### Get User Adventures
```http
GET /api/users/{userId}/adventures?status=completed
Authorization: Bearer {token}

→ 200 {
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Downtown Explorer",
      "completed": true,
      "tokensEarned": 25,
      "progress": 100
    }
  ]
}
```

**Frontend:** `components/profile/AdventureRecord.tsx:19`

---

## 🗺️ Adventures

### Get All Adventures (LIVE)

**Current API:**
```http
GET /adventures

→ 200 [
  {
    "id": 1,
    "name": "Campus History Tour",
    "regionid": 1,
    "location": { "x": 42.9301, "y": -85.5883 },
    "numtokens": 5
  }
]
```

**Issues:** Missing fields (`summary`, `description`, `difficulty`, `estimatedTime`, `imageUrl`)

**Frontend:** `app/(tabs)/home.tsx:155`, `contexts/HomeContext.jsx:50`

---

### Get All Adventures (Improved)
```http
GET /api/adventures?status=published&difficulty=Easy&page=1&limit=20

→ 200 {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Campus History Tour",
      "summary": "Discover the rich history...",
      "imageUrl": "https://...",
      "region": {
        "id": "uuid",
        "name": "North Campus",
        "center": { "lat": 42.9301, "lng": -85.5883 }
      },
      "tokenCount": 5,
      "difficulty": "Easy",
      "estimatedTime": "30-45 minutes",
      "status": "published"
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20 }
}
```

**Query Params:**
- `status`: `published` | `draft` | `archived` (default: `published`)
- `difficulty`: `Easy` | `Medium` | `Hard`
- `regionId`: UUID
- `page`: integer (default: 1)
- `limit`: integer (default: 20, max: 100)

---

### Get Adventure Details
```http
GET /api/adventures/{adventureId}
Authorization: Bearer {token} (optional)

→ 200 {
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Campus History Tour",
    "description": "Embark on a journey...",
    "difficulty": "Easy",
    "estimatedTime": "30-45 minutes",
    "region": { "id": "uuid", "name": "North Campus", ... },
    "tokens": [
      {
        "id": "token-1",
        "name": "Chapel Bell",
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
    }
  }
}
```

**Frontend:** `app/(gameplay pages)/adventurePage.tsx:47`

---

### Create Adventure
```http
POST /api/adventures
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Downtown Explorer",
  "summary": "Short summary",
  "description": "Full description",
  "regionId": "uuid",
  "difficulty": "Medium",
  "estimatedTime": "45-60 minutes",
  "status": "draft"
}

→ 201 { "success": true, "data": { "id": "uuid", ... } }
```

**Frontend:** `app/creator/adventure.tsx:31`

---

## 🌍 Regions

### Get All Regions
```http
GET /api/regions

→ 200 {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "North Campus",
      "center": { "lat": 42.9301, "lng": -85.5883 },
      "boundaries": [...],
      "adventureCount": 5
    }
  ]
}
```

### Create Region
```http
POST /api/regions
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "East Campus",
  "center": { "lat": 42.9310, "lng": -85.5870 },
  "boundaries": [
    { "lat": 42.9301, "lng": -85.5883 },
    { "lat": 42.9305, "lng": -85.5885 },
    { "lat": 42.9303, "lng": -85.5890 }
  ]
}

→ 201 { "success": true, "data": { "id": "uuid", ... } }
```

**Frontend:** `app/(tabs)/map.tsx:82-83`

---

## 🪙 Tokens

### Get Tokens for Adventure
```http
GET /api/adventures/{adventureId}/tokens

→ 200 {
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chapel Bell",
      "description": "Historic bell from 1920",
      "latitude": 42.9305,
      "longitude": -85.5880,
      "sequenceOrder": 1,
      "isCollected": false
    }
  ]
}
```

### Create Token
```http
POST /api/adventures/{adventureId}/tokens
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Historic Landmark",
  "description": "Significant building",
  "latitude": 42.9305,
  "longitude": -85.5880,
  "sequenceOrder": 1
}

→ 201 { "success": true, "data": { "id": "uuid", ... } }
```

**Frontend:** `app/(tabs)/map.tsx:~200`

---

## 🎮 Gameplay

### Start Adventure
```http
POST /api/users/{userId}/adventures/{adventureId}/start
Authorization: Bearer {token}

→ 201 {
  "success": true,
  "message": "Adventure started",
  "data": {
    "userAdventureId": "uuid",
    "completed": false,
    "tokensEarned": 0,
    "progress": 0,
    "startedAt": "2025-01-16T12:00:00Z"
  }
}
```

**Frontend:** `app/(gameplay pages)/adventurePage.tsx:400+`

---

### Collect Token
```http
POST /api/users/{userId}/tokens/{tokenId}/collect
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 42.9305,
  "longitude": -85.5880,
  "timestamp": "2025-01-16T12:30:00Z"
}

→ 200 {
  "success": true,
  "message": "Token collected!",
  "data": {
    "tokensEarned": 1,
    "totalTokens": 3,
    "progress": 60,
    "adventureCompleted": false
  }
}
```

**Proximity Requirement:** User must be within 50 meters

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "PROXIMITY_ERROR",
    "message": "Too far from token location"
  }
}
```

---

### Complete Adventure
```http
POST /api/users/{userId}/adventures/{adventureId}/complete
Authorization: Bearer {token}

→ 200 {
  "success": true,
  "message": "Adventure completed! Congratulations!",
  "data": {
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

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Additional context (optional)"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `PROXIMITY_ERROR` | 400 | Too far from token |
| `SERVER_ERROR` | 500 | Internal error |

---

## 🔧 Frontend Implementation

### API Client Setup

Create `utils/api.ts`:

```typescript
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net';

export class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

### Usage Examples

```typescript
import { api } from '@/utils/api';

// Login
const { data } = await api.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
await SecureStore.setItemAsync('authToken', data.token);

// Get adventures
const adventures = await api.get('/adventures');

// Get user stats
const stats = await api.get(`/api/users/${userId}/stats`);

// Start adventure
await api.post(`/api/users/${userId}/adventures/${adventureId}/start`);
```

---

## 📚 Related Documentation

- **openapi.yaml** - Complete OpenAPI/Swagger specification
- **API_DOCUMENTATION.md** - Detailed API documentation with SQL queries
- **BACKEND_INTEGRATION.md** - Database schemas and migration guide
- **Postman Collection** - `WayFind.postman_collection.json`
- **IMPLEMENTATION_CHECKLIST.md** - Step-by-step implementation guide

---

## 🚀 Quick Start

1. **View Interactive Docs:**
   - Paste `openapi.yaml` into [Swagger Editor](https://editor.swagger.io/)
   - Or use `npx @redocly/cli preview-docs openapi.yaml`

2. **Import to Postman:**
   - Import `WayFind.postman_collection.json`
   - Set base URL variable
   - Set auth token variable

3. **Test Current API:**
   ```bash
   curl https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net/adventures
   ```

---

**Last Updated:** January 2025
**API Version:** 1.0
