from django.urls import path
from .views import UploadImageView, UploadAudioView

urlpatterns = [
    path('image/', UploadImageView.as_view(), name='upload-image'),
    path('audio/', UploadAudioView.as_view(), name='upload-audio'),
]