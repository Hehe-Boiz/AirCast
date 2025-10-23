# 📡 API Endpoints Summary

## 🔐 Authentication Endpoints

| Method | Endpoint | Description | Service Function |
|--------|----------|-------------|------------------|
| POST | `/api/auth/login/` | Đăng nhập | `authService.login()` |
| POST | `/api/auth/register/` | Đăng ký tài khoản mới | `authService.register()` |
| POST | `/api/auth/logout/` | Đăng xuất | `authService.logout()` |
| POST | `/api/auth/refresh/` | Làm mới access token | `authService.refreshToken()` |
| GET | `/api/auth/profile/` | Lấy thông tin profile | `authService.getUserProfile()` |

---

## 👤 User Profile Management Endpoints ⭐ NEW

| Method | Endpoint | Description | Service Function |
|--------|----------|-------------|------------------|
| PUT | `/api/users/profile/` | Cập nhật thông tin cá nhân (tên, email) | `usersService.updateProfile()` |
| POST | `/api/users/change-password/` | Đổi mật khẩu | `usersService.changePassword()` |
| POST | `/api/users/avatar/` | Upload avatar | `usersService.uploadAvatar()` |

### Request/Response Examples:

#### 1. Update Profile
```typescript
// Frontend usage
import { usersService } from './services';

const updatedUser = await usersService.updateProfile({
  name: 'Nguyễn Văn A',
  email: 'newemail@example.com',
});
```

**Request:**
```json
PUT /api/users/profile/
{
  "name": "Nguyễn Văn A",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Nguyễn Văn A",
    "email": "newemail@example.com",
    "reputation": 85,
    "avatar": "https://cdn.example.com/avatars/user1.jpg"
  },
  "message": "Cập nhật thông tin thành công"
}
```

#### 2. Change Password
```typescript
// Frontend usage
await usersService.changePassword({
  old_password: 'oldpassword123',
  new_password: 'newpassword456',
  new_password_confirm: 'newpassword456',
});
```

**Request:**
```json
POST /api/users/change-password/
{
  "old_password": "oldpassword123",
  "new_password": "newpassword456",
  "new_password_confirm": "newpassword456"
}
```

**Response:**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Error Response:**
```json
{
  "error": "Mật khẩu hiện tại không đúng"
}
```

#### 3. Upload Avatar
```typescript
// Frontend usage
const file = document.querySelector('input[type="file"]').files[0];
const avatarUrl = await usersService.uploadAvatar(file);
```

**Request:**
```
POST /api/users/avatar/
Content-Type: multipart/form-data

avatar: [File]
```

**Response:**
```json
{
  "avatar_url": "https://cdn.example.com/avatars/user1.jpg",
  "message": "Cập nhật avatar thành công"
}
```

---

## 📊 User Stats & Achievements Endpoints

| Method | Endpoint | Description | Service Function |
|--------|----------|-------------|------------------|
| GET | `/api/users/stats/` | Lấy thống kê người dùng | `usersService.getUserStats()` |
| GET | `/api/users/achievements/` | Lấy danh sách thành tích | `usersService.getUserAchievements()` |

---

## 📝 Reports Endpoints

| Method | Endpoint | Description | Service Function |
|--------|----------|-------------|------------------|
| GET | `/api/reports/` | Lấy danh sách báo cáo (có filters) | `reportsService.getReports()` |
| POST | `/api/reports/` | Tạo báo cáo mới | `reportsService.createReport()` |
| GET | `/api/reports/{id}/` | Lấy chi tiết 1 báo cáo | `reportsService.getReportById()` |
| POST | `/api/reports/by-location/` | Lấy báo cáo theo vị trí | `reportsService.getReportsByLocation()` |

---

## 📤 Upload Endpoints

| Method | Endpoint | Description | Service Function |
|--------|----------|-------------|------------------|
| POST | `/api/uploads/image/` | Upload ảnh | Manual `FormData` |
| POST | `/api/uploads/audio/` | Upload audio | Manual `FormData` |

---

## 🔑 Authentication Headers

Tất cả endpoints (trừ login/register) đều cần JWT token:

```typescript
Headers: {
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/json'
}
```

Cho multipart uploads:
```typescript
Headers: {
  'Authorization': 'Bearer {access_token}',
  // Không set Content-Type, browser tự động set với boundary
}
```

---

## 📂 File Structure

```
/services
├── api.ts           # Base API service (GET, POST, PUT, PATCH, DELETE, upload)
├── auth.ts          # Authentication: login, register, logout, refresh
├── users.ts         # User profile, stats, achievements ⭐ NEW
├── reports.ts       # Reports CRUD operations
└── index.ts         # Central export

/config
└── api.ts           # API_CONFIG với BASE_URL và ENDPOINTS

/types
└── api.ts           # TypeScript types cho requests/responses ⭐ UPDATED
```

---

## 🚀 Quick Start

### 1. Import Service
```typescript
import { usersService } from './services';
```

### 2. Update Profile
```typescript
try {
  const updatedUser = await usersService.updateProfile({
    name: 'New Name',
    email: 'new@email.com',
  });
  console.log('Updated:', updatedUser);
} catch (error) {
  console.error('Error:', error);
}
```

### 3. Change Password
```typescript
try {
  await usersService.changePassword({
    old_password: 'current',
    new_password: 'newsecure123',
    new_password_confirm: 'newsecure123',
  });
  toast.success('Password changed!');
} catch (error) {
  toast.error(error.message);
}
```

### 4. Upload Avatar
```typescript
const handleAvatarUpload = async (file: File) => {
  try {
    const avatarUrl = await usersService.uploadAvatar(file);
    setUser({ ...user, avatar: avatarUrl });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## 🎯 Components Using These Endpoints

### SettingsModal.tsx
- ✅ `usersService.updateProfile()` - Cập nhật name/email
- ✅ `usersService.changePassword()` - Đổi mật khẩu
- ✅ `usersService.uploadAvatar()` - Upload avatar

### Sidebar.tsx
- ✅ Hiển thị avatar từ `user.avatar`
- ✅ Hiển thị stats từ `usersService.getUserStats()`
- ✅ Hiển thị achievements từ `usersService.getUserAchievements()`

### App.tsx
- ✅ `handleUserUpdate()` - Callback để update user state khi profile thay đổi

---

## 🔄 Mock vs Real API

### Mock Mode (Development)
```typescript
// config/api.ts
export const API_CONFIG = {
  USE_MOCK_DATA: true, // ⬅️ Mock mode
  BASE_URL: 'http://localhost:8000/api',
};
```

Khi `USE_MOCK_DATA: true`:
- Không gọi real API
- Trả về mock data sau 300-1000ms delay
- Lưu vào localStorage để persist data
- Không cần Django backend

### Real API Mode (Production)
```typescript
// config/api.ts
export const API_CONFIG = {
  USE_MOCK_DATA: false, // ⬅️ Real API
  BASE_URL: 'https://your-backend.com/api',
};
```

Khi `USE_MOCK_DATA: false`:
- Gọi real Django backend
- Cần JWT tokens
- Cần CORS configuration
- Xử lý real errors

---

## ⚠️ Important Notes

1. **Avatar Field**: User type giờ có `avatar?: string` field
2. **Password Length**: Mật khẩu mới phải ≥ 8 ký tự
3. **File Size**: Avatar max 5MB
4. **File Types**: Chỉ accept image/* types
5. **Token Refresh**: Tự động refresh khi 401 error

---

## 🐛 Error Handling

All services throw errors với format:
```typescript
{
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
}
```

Frontend handling:
```typescript
try {
  await usersService.updateProfile(data);
} catch (error: any) {
  toast.error(error.message || 'Unknown error');
  console.error('Details:', error.errors);
}
```

---

## 📝 TypeScript Types

### User Type (Updated)
```typescript
export type User = {
  id: string;
  name: string;
  email: string;
  reputation: number;
  avatar?: string; // ⭐ NEW
};
```

### Request Types
```typescript
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}
```

### Response Types
```typescript
export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UploadAvatarResponse {
  avatar_url: string;
  message: string;
}
```
