from django.db import models

class AqiPoint(models.Model):
    """
    Lưu trữ một điểm dữ liệu AQI tại một tọa độ cụ thể.
    """
    lat = models.FloatField(db_index=True)
    lon = models.FloatField(db_index=True)
    
    aqi = models.IntegerField(default=1)
    pm25 = models.FloatField(null=True, blank=True)
 
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lat', 'lon')
        ordering = ['-updated_at']

    def __str__(self):
        return f"AQI {self.aqi} @ ({self.lat}, {self.lon})"