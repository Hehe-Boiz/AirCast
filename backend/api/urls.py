from django.urls import path, include # Nhớ include

urlpatterns = [
    path('auth/', include('api.authentication.urls')),
    path('reports/', include('api.reports.urls')),
    path('profiles/', include('api.achievements.urls')),
    path('uploads/', include('api.uploads.urls')),
    path('aqi/', include('api.aqi.urls')),
]