from rest_framework import serializers
from .models import ReportDetailed
class ReportDetailedListSerializers(serializers.ModelSerializer):
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
            "lng",
            "air_quality",
            "noise_level",
            "timestamp"
        ]


class PaginatedReportDetailedSerializers(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    reports = ReportDetailedListSerializers(many=True)