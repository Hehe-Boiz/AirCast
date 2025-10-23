from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import UserAchievement
from .serializers import UserStatsSerializer, AchievementDataSerializer

class UserStatsView(generics.RetrieveAPIView):
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserAchievementsView(generics.ListAPIView):
    serializer_class = AchievementDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).select_related('achievement')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'achievements': serializer.data})