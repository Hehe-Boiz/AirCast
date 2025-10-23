from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Achievement, UserAchievement, User

class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'content', 'active']
    list_filter = ['id', 'subject']
    readonly_fields = ['image_view']
    search_fields = ['subject']

    def image_view(self, course):
        if course.image:
            return mark_safe(f'<img src="/static/{course.image.name}"/>')

    class Media:
        css = {
            'all': ('css/style.css',)
        }


# Register your models here.
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(User)