# React Frontend Migration: Firebase → PostgreSQL

Complete guide to understanding the Firebase to PostgreSQL migration in the SmartRent React frontend.

---

## 🚀 What Changed

### Before (Firebase/Firestore)
```javascript
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const apartments = await getDocs(collection(db, "apartments"));
```

### After (PostgreSQL API)
```javascript
import { apiGet, apiPost } from "@/lib/api";

const response = await apiGet("/apartments");
```

---

## 📋 Files Modified

### 1. **src/lib/api.ts** ✨ NEW
Generic API wrapper with fetch helper functions:
- `apiGet()` - GET requests
- `apiPost()` - POST requests  
- `apiPut()` - PUT requests
- `apiPatch()` - PATCH requests
- `apiDelete()` - DELETE requests
- `apiFetch()` - Generic fetch with error handling

### 2. **src/services/apartmentService.ts** ✏️ UPDATED
Migrated all apartment operations from Firebase to API:

| Firebase Call | New API Call | HTTP Method |
|--------------|-------------|------------|
| `addDoc()` | `apiPost('/apartments', data)` | POST |
| `getDoc()` | `apiGet('/apartments/:id')` | GET |
| `getDocs(query())` | `apiGet('/apartments')` | GET |
| `updateDoc()` | `apiPut('/apartments/:id', data)` | PUT |
| `deleteDoc()` | `apiDelete('/apartments/:id')` | DELETE |

**New Data Interface:**
```typescript
interface Apartment {
  id: string;                  // UUID (primary key)
  firebase_id?: string;        // Original Firestore ID
  title: string;
  description: string;
  images: string[];           // Array from JSONB
  price: number;
  price_unit: 'day' | 'week' | 'month';
  wilaya: string;
  wilaya_id: number;
  municipality: string;
  rooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];         // Array from JSONB
  is_featured: boolean;
  is_active: boolean;
  views: number;
  phone_clicks: number;
  created_at: string;         // ISO timestamp
  landlord_id: string;        // User UID
  landlord_phone: string;
  landlord_name: string;
  status: 'approved' | 'pending' | 'rejected';
}
```

**Key Helper Functions:**
```typescript
// Map PostgreSQL response to frontend format
mapApartmentToFrontend(data)

// Map frontend data to API format (snake_case)
mapApartmentToDB(data)
```

### 3. **src/services/favoritesService.ts** ✏️ UPDATED
Migrated all favorite operations:

| Firebase Call | New API Call |
|--------------|-------------|
| `addDoc()` | `apiPost('/favorites')` |
| `deleteDoc()` | `apiDelete('/favorites/:userId/:apartmentId')` |
| `getDocs(query())` | `apiGet('/favorites/:userId')` |

**New Functions:**
```typescript
// Add to favorites
await addToFavorites(userId, apartmentId): Promise<string>

// Remove from favorites  
await removeFromFavorites(userId, apartmentId): Promise<void>

// Check if favorited
await isApartmentFavorited(userId, apartmentId): Promise<boolean>

// Get all user favorites (IDs only)
await getUserFavorites(userId): Promise<string[]>

// Get full apartment details for favorites ✨ NEW
await getUserFavoritesWithDetails(userId): Promise<Apartment[]>
```

### 4. **src/contexts/AuthContext.tsx** ✏️ UPDATED
Updated to sync Firebase Auth with PostgreSQL:

**Architecture:**
- **Authentication:** Still uses Firebase Auth (password management)
- **User Data:** Stored in PostgreSQL, fetched via API

**Key Changes:**
```typescript
// Register: Create Firebase Auth account + PostgreSQL user
await register(email, password, name, phone, type)
  ├─ createUserWithEmailAndPassword(Firebase)
  └─ apiPost('/users', userData)

// Login: Firebase Auth + fetch from backend
await login(email, password)
  ├─ signInWithEmailAndPassword(Firebase)
  └─ fetchUserData(user)

// fetchUserData: Get user info from PostgreSQL
const userData = await apiGet(`/users/${uid}`)
```

**New User Interface:**
```typescript
interface UserData {
  uid: string;                 // Firebase Auth UID
  email: string;
  name: string;
  phone: string;
  type: 'renter' | 'landlord';
  created_at?: string;         // ISO timestamp
}
```

### 5. **src/pages/Settings.tsx** ✏️ UPDATED
Updated profile management to use API:

**Changes:**
```typescript
// OLD: updateDoc(doc(db, "users", uid), data)
// NEW: apiPut(`/users/${uid}`, data)
await apiPut(`/users/${currentUser.uid}`, {
  name: formData.name,
  phone: formData.phone,
})

// OLD: deleteDoc(doc(db, "users", uid))
// NEW: apiDelete(`/users/${uid}`)
await apiDelete(`/users/${currentUser.uid}`)
```

---

## 🔄 Data Mapping Between Firestore and PostgreSQL

### Field Name Conversions

When data comes from the API, field names use snake_case:

| Firestore (camelCase) | PostgreSQL (snake_case) |
|----------------------|------------------------|
| `priceUnit` | `price_unit` |
| `wilayaId` | `wilaya_id` |
| `isFeatured` | `is_featured` |
| `isActive` | `is_active` |
| `phoneClicks` | `phone_clicks` |
| `landlordId` | `landlord_id` |
| `landlordPhone` | `landlord_phone` |
| `landlordName` | `landlord_name` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

**Automatic Conversion:**
The service has helper functions that handle this automatically:

```typescript
// PostgreSQL response (snake_case)
const dbResponse = {
  wilaya_id: 16,
  price_unit: "month",
  is_featured: true,
}

// Converted to frontend format (camelCase-compatible)
const apartment = mapApartmentToFrontend(dbResponse)
// Result still uses snake_case names compatible with interfaces
```

### Complex Data Types

**Arrays (JSONB in PostgreSQL):**
```typescript
// Firestore: Direct array
apartmentData.images: ["url1", "url2"]

// PostgreSQL: Stored as JSONB, comes back as JSON string or array
// Service automatically converts:
const images = Array.isArray(data.images) 
  ? data.images 
  : JSON.parse(data.images || '[]')
```

---

## 🌐 Environment Configuration

### .env.local (React App)
```env
# Development
REACT_APP_API_URL=http://localhost:3000/api

# Production
REACT_APP_API_URL=https://your-api.com/api
```

### Using in Code
```typescript
// Automatic: api.ts reads from environment
const baseUrl = process.env.REACT_APP_API_URL 
  || 'http://localhost:3000/api'
```

---

## 🔑 Key Differences Summary

### Document IDs
**Firestore:**
```typescript
const apt = await getDoc(doc(db, "apartments", id))
console.log(apt.id)  // Firestore auto-generated ID
```

**PostgreSQL:**
```typescript
const apt = await apiGet(`/apartments/${id}`)
console.log(apt.id)  // UUID (can use both UUID or firebase_id)
```

### Timestamps
**Firestore:**
```typescript
import { Timestamp } from "firebase/firestore"
const t = Timestamp.now()  // Firestore Timestamp object
```

**PostgreSQL:**
```typescript
// ISO string format
const t = "2026-03-08T21:24:22.992Z"
```

### Filters & Queries
**Firestore:**
```typescript
const q = query(
  collection(db, "apartments"),
  where("wilayaId", "==", 16),
  orderBy("createdAt", "desc")
)
const docs = await getDocs(q)
```

**PostgreSQL:**
```typescript
// Query string parameters
const response = await apiGet(
  `/apartments?wilayaId=16&limit=20`
)
```

---

## 📡 API Endpoints Used

### Apartments
- `GET /api/apartments` - List all active apartments
- `GET /api/apartments?wilayaId=16&rooms=2` - List with filters
- `GET /api/apartments/featured` - Featured apartments
- `GET /api/apartments/:id` - Get single apartment
- `GET /api/apartments/landlord/:landlordId` - By landlord
- `GET /api/apartments/wilaya/:wilayaId` - By wilaya
- `POST /api/apartments` - Create new apartment
- `PUT /api/apartments/:id` - Update apartment
- `PATCH /api/apartments/:id/status` - Toggle active status
- `DELETE /api/apartments/:id` - Delete apartment

### Users
- `GET /api/users` - List all users
- `GET /api/users/:uid` - Get user by UID
- `POST /api/users` - Create/sync user
- `PUT /api/users/:uid` - Update user profile
- `DELETE /api/users/:uid` - Delete user

### Favorites
- `GET /api/favorites/:userId` - Get favorite apartment IDs
- `GET /api/favorites/:userId/apartments` - Get favorite apartments (with details)
- `GET /api/favorites/:userId/check/:apartmentId` - Check if favorited
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:userId/:apartmentId` - Remove from favorites

---

## ✅ What You Can Do Now

✅ List all apartments  
✅ Get apartment details  
✅ Create new apartment  
✅ Update apartment info  
✅ Delete apartment  
✅ Mark as favorite  
✅ Update user profile  
✅ Register/Login (hybrid with Firebase)  
✅ Handle error responses  
✅ Pagination & filtering  

---

## 🔮 Future Improvements

1. **Add Authentication Headers** - Implement JWT tokens for API security
2. **Error Boundaries** - Add React error boundaries for better UX
3. **Loading States** - Better loading UI during API calls
4. **Caching** - Implement React Query or SWR for data caching
5. **Image Upload** - Move image management to backend
6. **Real-time Updates** - Implement WebSockets for live data
7. **Offline Support** - Add offline-first data sync

---

## 🧪 Testing the Migration

### Test Creating an Apartment
```typescript
import * as apartmentService from '@/services/apartmentService'

const newApt = await apartmentService.createApartment({
  title: "Test Apartment",
  description: "Test description",
  images: ["https://..."],
  price: 150000,
  price_unit: "month",
  wilaya: "Algiers",
  wilaya_id: 16,
  municipality: "Downtown",
  rooms: 2,
  bathrooms: 1,
  area: 85,
  amenities: ["wifi", "parking"],
  landlord_id: "user123",
  landlord_phone: "+213612345678",
  landlord_name: "John Doe",
})

console.log("Created apartment:", newApt)
```

### Test Fetching Apartments
```typescript
const apartments = await apartmentService.getAllApartments()
console.log("Apartments:", apartments)

const filters = await apartmentService.searchApartments({
  wilaya_id: 16,
  rooms: 2,
  min_price: 100000,
  max_price: 200000,
})
console.log("Filtered:", filters)
```

### Test Favorites
```typescript
const isFavorited = await isApartmentFavorited(userId, apartmentId)
if (!isFavorited) {
  await addToFavorites(userId, apartmentId)
}

const favorites = await getUserFavoritesWithDetails(userId)
console.log("My favorites:", favorites)
```

---

## 📝 Notes

- **Firebase Auth persists** - You still need Firebase setup for authentication
- **No breaking changes** - Components can use services exactly as before
- **Automatic type conversions** - Helper functions handle snake_case ↔ camelCase
- **Error handling** - API errors are thrown, catch them in your components
- **Environment variables** - Update `REACT_APP_API_URL` for different environments

---

**Migration completed:** March 8, 2026  
**Frontend fully migrated to PostgreSQL API** ✅
