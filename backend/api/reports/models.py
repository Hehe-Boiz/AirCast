from django.db import models
from django.conf import settings
from ..authentication.models import User

class ReportType(models.TextChoices):
    AIR = 'air', 'Air Quality'
    NOISE = 'noise', 'Noise Level'

class AirQuality(models.IntegerChoices):
    GOOD = 1, 'Good'
    MODERATE = 2, 'Moderate'
    UNHEALTHY = 3, 'Unhealthy'
    VERY_UNHEALTHY = 4, 'Very Unhealthy'
    HAZARDOUS = 5, 'Hazardous'

class NoiseLevel(models.IntegerChoices):
    QUIET = 1, 'Quiet'
    MODERATE = 2, 'Moderate'
    LOUD = 3, 'Loud'
    VERY_LOUD = 4, 'Very Loud'

class VoteType(models.TextChoices):
    UP = 'up', 'Up'
    DOWN = 'down', 'Down'

class ReportDetailed(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=ReportType.choices)
    lat = models.FloatField()
    lon = models.FloatField()
    air_quality = models.IntegerField(choices=AirQuality.choices, null=True, blank=True)
    noise_level = models.IntegerField(choices=NoiseLevel.choices, null=True, blank=True)
    comment = models.TextField(blank=True)
    image_url = models.URLField(null=True, blank=True)
    audio_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

class UserVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report = models.ForeignKey(ReportDetailed, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VoteType.choices)

    class Meta:
        unique_together = ('user', 'report')

