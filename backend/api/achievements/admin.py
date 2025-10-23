from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Achievement, UserAchievement

# Register your models here.
admin.site.register(Achievement)
admin.site.register(UserAchievement)