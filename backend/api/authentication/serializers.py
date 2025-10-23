from .models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, source='username')

    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(username=attrs['username']).exists():
             raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['username'],
            password=validated_data['password'],
            name=validated_data['name']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
     name = serializers.CharField()
     class Meta:
         model = User
         fields = ('id', 'name', 'email', 'reputation')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Bạn có thể thêm các thông tin tùy chỉnh vào token payload ở đây nếu muốn
        # Ví dụ: token['name'] = user.name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        user_serializer = UserSerializer(self.user)

        data['user'] = user_serializer.data
        data['access_token'] = data.pop('access')
        data['refresh_token'] = data.pop('refresh')


        return data