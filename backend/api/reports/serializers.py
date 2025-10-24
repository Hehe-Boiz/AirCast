# backend/api/reports/serializers.py

from rest_framework import serializers
from .models import ReportDetailed

class ReportDetailedListSerializers(serializers.ModelSerializer):
    # Ánh xạ và đổi tên các trường để khớp với frontend (camelCase)
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_reputation = serializers.IntegerField(source='user.reputation', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    lng = serializers.FloatField(source='lon') #

    class Meta:
        model = ReportDetailed
        # Đảm bảo tất cả các trường mà frontend cần đều có ở đây
        fields = [
            'id',
            'user_id',
            'user_name',
            'user_reputation',
            'lat',
            'lng',
            'type',
            'air_quality',
            'noise_level',
            'comment',
            'image_url',
            'audio_url',
            'timestamp',
            'upvotes',
            'downvotes',
        ]