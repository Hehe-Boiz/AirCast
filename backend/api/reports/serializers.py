from rest_framework import serializers
from .models import ReportDetailed

class ReportDetailedListSerializers(serializers.ModelSerializer):
    lng = serializers.FloatField(source='lon', read_only=True)
    userName = serializers.CharField(source='user.username', read_only=True)
    userReputation = serializers.IntegerField(source='user.userprofile.reputation', read_only=True)
    timestamp = serializers.DateTimeField(source='create_at', read_only=True)
    class Meta:
        model = ReportDetailed
        fields = [
            "id",
            "userName", # userId, userName, userReputation
            "userReputation"
            "type",
            "lat",
            "lon",
            "air_quality",
            "noise_level",
            "timestamp"
        ]


