# Backend Integration Guide

## 📋 Tổng quan

Ứng dụng này đã được cấu trúc để dễ dàng tích hợp với Django backend. Tất cả API calls được tách biệt thành service layer riêng biệt.

## 🏗️ Kiến trúc

```
├── config/
│   └── api.ts              # API configuration & endpoints
├── services/
│   ├── api.ts              # Base API service với fetch wrapper
│   ├── auth.ts             # Authentication service
│   ├── reports.ts          # Reports service
│   ├── users.ts            # Users service
│   └── index.ts            # Central export
├── types/
│   └── api.ts              # TypeScript types cho API requests/responses
```

## 🔧 Cách chuyển từ Mock sang Real API

### Bước 1: Cấu hình API URL

Sửa file `/config/api.ts`:

```typescript
export const API_CONFIG = {
  // Thay đổi URL này theo Django backend của bạn
  BASE_URL: 'https://your-backend.com/api',
  
  // Tắt mock mode
  USE_MOCK_DATA: false,
};
```

### Bước 2: Environment Variables (Optional)

Tạo file `.env`:

```bash
REACT_APP_API_URL=http://localhost:8000/api
```

## 📡 Django Backend Requirements

### API Endpoints cần implement:

#### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Register  
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile

#### Reports
- `GET /api/reports/` - Get all reports (with filters)
- `POST /api/reports/` - Create new report
- `GET /api/reports/{id}/` - Get single report
- `POST /api/reports/by-location/` - Get reports by location

#### Users
- `GET /api/users/stats/` - Get user statistics
- `GET /api/users/achievements/` - Get user achievements

#### Uploads
- `POST /api/uploads/image/` - Upload image
- `POST /api/uploads/audio/` - Upload audio file

### Request/Response Examples:

#### 1. Login

**Request:**
```json
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "1",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "reputation": 85
  }
}
```

#### 2. Create Report

**Request:**
```json
POST /api/reports/
Headers: Authorization: Bearer {access_token}
{
  "type": "air",
  "lat": 10.7769,
  "lng": 106.7009,
  "air_quality": "moderate",
  "comment": "Không khí hơi khó thở",
  "image_url": "https://...",
  "audio_url": null
}
```

**Response:**
```json
{
  "id": "report_123",
  "message": "Báo cáo đã được tạo thành công",
  "reputation_gained": 5
}
```

#### 3. Get Reports

**Request:**
```
GET /api/reports/?lat=10.7769&lng=106.7009&radius=5&type=air&limit=20&offset=0
Headers: Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "count": 45,
  "next": "http://api.com/reports/?offset=20",
  "previous": null,
  "results": [
    {
      "id": "1",
      "userId": "2",
      "userName": "Nguyễn Văn A",
      "userReputation": 92,
      "lat": 10.7769,
      "lng": 106.7009,
      "type": "air",
      "airQuality": "moderate",
      "comment": "Không khí hơi khó thở",
      "imageUrl": "https://...",
      "timestamp": "2024-01-20T10:30:00Z"
    }
  ]
}
```

#### 4. Upload Image

**Request:**
```
POST /api/uploads/image/
Headers: 
  Authorization: Bearer {access_token}
  Content-Type: multipart/form-data

FormData:
  image: <File>
```

**Response:**
```json
{
  "url": "https://cdn.example.com/uploads/image_123.jpg",
  "file_id": "img_123"
}
```

## 🔐 Authentication Flow

1. User login → Frontend gọi `authService.login()`
2. Backend trả về `access_token` và `refresh_token`
3. Frontend lưu tokens vào `localStorage`
4. Mỗi API request kèm theo header: `Authorization: Bearer {access_token}`
5. Khi access_token hết hạn (401), tự động gọi refresh endpoint
6. Nếu refresh thất bại, redirect về login

## 📝 Django Models Gợi ý

```python
# models.py

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reputation = models.IntegerField(default=0)
    total_reports = models.IntegerField(default=0)
    accuracy_rate = models.FloatField(default=0.0)
    current_streak = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

class Report(models.Model):
    TYPE_CHOICES = [('air', 'Air Quality'), ('noise', 'Noise Level')]
    AIR_QUALITY_CHOICES = [
        ('good', 'Good'),
        ('moderate', 'Moderate'),
        ('unhealthy', 'Unhealthy'),
        ('very_unhealthy', 'Very Unhealthy'),
        ('hazardous', 'Hazardous'),
    ]
    NOISE_LEVEL_CHOICES = [
        ('quiet', 'Quiet'),
        ('moderate', 'Moderate'),
        ('loud', 'Loud'),
        ('very_loud', 'Very Loud'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    lat = models.FloatField()
    lng = models.FloatField()
    air_quality = models.CharField(max_length=20, choices=AIR_QUALITY_CHOICES, null=True, blank=True)
    noise_level = models.CharField(max_length=20, choices=NOISE_LEVEL_CHOICES, null=True, blank=True)
    comment = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    audio_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
```

## 🚀 Django Views/Serializers Gợi ý

```python
# serializers.py

from rest_framework import serializers
from .models import Report, UserProfile

class ReportSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.username', read_only=True)
    userReputation = serializers.IntegerField(source='user.userprofile.reputation', read_only=True)
    userId = serializers.CharField(source='user.id', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    airQuality = serializers.CharField(source='air_quality', required=False)
    noiseLevel = serializers.CharField(source='noise_level', required=False)
    imageUrl = serializers.URLField(source='image_url', required=False)
    audioUrl = serializers.URLField(source='audio_url', required=False)
    
    class Meta:
        model = Report
        fields = ['id', 'userId', 'userName', 'userReputation', 'lat', 'lng', 
                  'type', 'airQuality', 'noiseLevel', 'comment', 'imageUrl', 
                  'audioUrl', 'timestamp']

# views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Report.objects.all()
        
        # Filter by location
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius')
        
        if lat and lng and radius:
            # Implement geospatial filtering
            # Using django.contrib.gis or manual calculation
            pass
        
        # Filter by type
        report_type = self.request.query_params.get('type')
        if report_type:
            queryset = queryset.filter(type=report_type)
            
        return queryset
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(user=request.user)
        
        # Update user reputation
        profile = request.user.userprofile
        profile.reputation += 5
        profile.total_reports += 1
        profile.save()
        
        return Response({
            'id': report.id,
            'message': 'Báo cáo đã được tạo thành công',
            'reputation_gained': 5
        }, status=status.HTTP_201_CREATED)
```

## 📦 Django Packages Gợi ý

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt  # JWT authentication
pip install django-cors-headers            # CORS support
pip install pillow                         # Image processing
pip install django-storages                # S3/Cloud storage
pip install geopy                          # Location calculations
```

## 🔒 CORS Configuration

```python
# settings.py

INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "https://your-frontend.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## ✅ Testing

Sau khi setup Django backend:

1. Set `USE_MOCK_DATA: false` trong `/config/api.ts`
2. Đảm bảo Django server đang chạy
3. Test login flow
4. Test create report với image/audio upload
5. Test get reports with filters

## 🐛 Debugging

- Check browser console cho API errors
- Check Network tab để xem request/response
- Verify JWT tokens trong localStorage
- Check Django logs cho backend errors

## 📞 Support

Nếu gặp vấn đề khi tích hợp, kiểm tra:
- API endpoint URLs có khớp không
- Response format có đúng với TypeScript types không
- CORS có được cấu hình đúng không
- JWT tokens có hợp lệ không
