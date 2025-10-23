from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('achievements/', views.UserAchievementsView.as_view(), name='user-achievements'),
]