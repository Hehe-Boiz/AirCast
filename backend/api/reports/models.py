from django.db import models
from django.conf import settings
class ReportDetailed(models.Model):
    
    TYPE_CHOICES = [('air', 'Air Quality'), ('noise', 'Noise Level')]
    AIR_QUALITY_CHOICES = [
        ('good', 'Good'),
        ('moderate', 'Moderate'),
        ('unhealthy', 'Unhealthy'),
        ('very_unhealthy', 'Very Unhealthy'),
        ('hazardous', 'Hazardous'),
    ]
    NOISE_LEVEL_CHOICES = [
        ('quiet', 'Quiet'),
        ('moderate', 'Moderate'),
        ('loud', 'Loud'),
        ('very_loud', 'Very Loud'),
    ]
    USER_VOTE = [
        ('up', 'Up'),
            ('down', 'Down'),
    ]
    # one to one với user, nếu người dùng bị xóa thì tất cả báo cáo
    # của họ cũng bị xóa

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    lat = models.FloatField()
    lng = models.FloatField()
    air_quality = models.CharField(max_length=25, choices=AIR_QUALITY_CHOICES, null=True, blank=True)
    noise_level = models.CharField(max_length=25, choices=NOISE_LEVEL_CHOICES, null=True, blank=True)
    comment = models.TextField(blank=True)
    image_url = models.URLField(null=True, blank=True)
    audio_url = models.URLField(null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    upvote = models.IntegerField(default=0)
    downvote = models.IntegerField(default=0)
    userVote = models.CharField(max_length=10, choices=USER_VOTE, null = True)
    class Meta:
        # Sắp xếp giảm dần
        ordering = ['-create_at']

# export type Report = {
#   id: string;
#   userId: string;
#   userName: string;
#   userReputation: number;
#   lat: number;
#   lng: number;
#   type: 'air' | 'noise';
#   airQuality?: AirQualityLevel;
#   noiseLevel?: NoiseLevel;
#   comment?: string;
#   imageUrl?: string;
#   audioUrl?: string;
#   timestamp: Date;
#   upvotes: number;
#   downvotes: number;
#   userVote?: 'up' | 'down' | null;
# };