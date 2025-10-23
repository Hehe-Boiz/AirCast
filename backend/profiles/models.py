import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    accuracy_rate = models.FloatField(default=0.0)
    current_streak = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    reputation = models.IntegerField(default=0)

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Achievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    emoji = models.CharField(max_length=10, blank=True)

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')


