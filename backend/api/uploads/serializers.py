from rest_framework import serializers
from .models import UploadedImage, UploadedAudio

class UploadImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=True)
    url = serializers.ImageField(source='image', read_only=True)
    file_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = UploadedImage
        fields = ('url', 'file_id', 'image')

class UploadAudioSerializer(serializers.ModelSerializer):
    audio = serializers.FileField(write_only=True, required=True)
    url = serializers.FileField(source='audio', read_only=True)
    file_id = serializers.UUIDField(read_only=True)
    duration = serializers.FloatField(read_only=True)

    class Meta:
        model = UploadedAudio
        fields = ('url', 'file_id', 'duration', 'audio')