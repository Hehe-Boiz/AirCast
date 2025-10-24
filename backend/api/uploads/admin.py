from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import UploadedAudio, UploadedImage 

# Register your models here.
admin.site.register(UploadedAudio)
admin.site.register(UploadedImage)