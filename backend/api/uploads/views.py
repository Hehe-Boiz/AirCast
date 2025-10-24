from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UploadedImage, UploadedAudio
from .serializers import UploadImageSerializer, UploadAudioSerializer
import mutagen

def get_audio_duration(file):
    try:
        audio = mutagen.File(file)
        if audio:
            return audio.info.length
    except Exception as e:
        print(f"Error getting audio duration: {e}")
    return 0.0

class UploadImageView(generics.CreateAPIView):
    serializer_class = UploadImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(report=self.request.report)

class UploadAudioView(generics.CreateAPIView):
    serializer_class = UploadAudioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        audio_file = self.request.data.get('audio')
        duration = 0.0
        
        if audio_file:
            duration = get_audio_duration(audio_file)
            
        serializer.save(report=self.request.report, duration=duration)