from django.urls import path
from .views import RegisterView, ProfileView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]