from rest_framework import serializers
from .models import Achievement, UserAchievement
from ..reports.models import ReportDetailed as Report
from ..authentication.models import User

class UserStatsSerializer(serializers.ModelSerializer):
    accuracy_rate = serializers.FloatField(source='profile.accuracy_rate', read_only=True)
    current_streak = serializers.IntegerField(source='profile.current_streak', read_only=True)
    level = serializers.IntegerField(source='profile.level', read_only=True)
    reputation = serializers.IntegerField(source='profile.reputation', read_only=True)
    total_reports = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('total_reports', 'accuracy_rate', 'current_streak', 'level', 'reputation')

    def get_total_reports(self, obj):
        return Report.objects.filter(user=obj).count()

# Serializer cho một thành tích (phần bên trong mảng)
class AchievementDataSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='achievement.id', read_only=True)
    name = serializers.CharField(source='achievement.name', read_only=True)
    description = serializers.CharField(source='achievement.description', read_only=True)
    emoji = serializers.CharField(source='achievement.emoji', read_only=True)
    unlocked = serializers.SerializerMethodField()
    unlocked_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('id', 'name', 'description', 'emoji', 'unlocked', 'unlocked_at')

    def get_unlocked(self, obj):
        return True
