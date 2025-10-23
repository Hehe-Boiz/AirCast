from django.urls import path
from . import views

urlpatterns = [
    path('image/', views.UploadImageView.as_view(), name='upload-image'),
    path('audio/', views.UploadAudioView.as_view(), name='upload-audio'),
]