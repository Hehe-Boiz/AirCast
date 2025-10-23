from django.urls import path
from .views import UserStatsView, UserAchievementsView

urlpatterns = [
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    path('achievements/', UserAchievementsView.as_view(), name='user-achievements'),
]