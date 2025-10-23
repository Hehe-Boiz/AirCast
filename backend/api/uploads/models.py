import uuid
from django.db import models
from ..reports.models import ReportDetailed as Report

class UploadedImage(models.Model):
    file_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Report, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/reports/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class UploadedAudio(models.Model):
    file_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Report, on_delete=models.CASCADE)
    audio = models.FileField(upload_to='audio/reports/')
    duration = models.FloatField(default=0.0) 
    uploaded_at = models.DateTimeField(auto_now_add=True)