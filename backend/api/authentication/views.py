from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        })

class ProfileView(generics.RetrieveAPIView):
     serializer_class = UserSerializer
     permission_classes = (permissions.IsAuthenticated,)
     def get_object(self):
         return self.request.user

class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({"detail": "An error occurred during logout."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)