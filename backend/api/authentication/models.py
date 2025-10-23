from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Creating user with email={email}, name={name}, extra_fields={extra_fields}")

        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)

        # Generate a username from email if not provided
        if 'username' not in extra_fields:
            username = email.split('@')[0]
            extra_fields['username'] = username
            logger.debug(f"Generated username: {username}")

        user = self.model(
            email=email,
            name=name,
            **extra_fields
        )
        user.set_password(password)

        try:
            user.save(using=self._db)
            logger.debug(f"User created successfully with ID: {user.id}")
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise

        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    reputation = models.IntegerField(default=50)

    # Profile fields
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='images/avatars/', blank=True, null=True)
    # Statistics
    accuracy_rate = models.FloatField(default=0.0)
    current_streak = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Settings
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = CustomUserManager()

    class Meta:
        db_table = 'auth_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def display_name(self):
        return self.name or self.username

    def increase_reputation(self, amount):
        """Increase user reputation by given amount."""
        self.reputation += amount
        self.save(update_fields=['reputation'])

        # Check for level up
        new_level = self.calculate_level()
        if new_level > self.level:
            self.level = new_level
            self.save(update_fields=['level'])
            return True  # Leveled up
        return False

    def decrease_reputation(self, amount):
        """Decrease user reputation by given amount."""
        self.reputation = max(0, self.reputation - amount)
        self.save(update_fields=['reputation'])

    def calculate_level(self):
        """Calculate user level based on reputation."""
        # Level thresholds
        thresholds = [
            0, 100, 250, 500, 1000, 2000, 5000, 10000
        ]

        for i, threshold in enumerate(thresholds):
            if self.reputation < threshold:
                return i
        return len(thresholds)

    def update_stats(self):
        """Update user statistics based on their reports."""
        from ..reports.models import ReportDetailed as Report

        reports = Report.objects.filter(user=self)
        self.total_reports = reports.count()

        if self.total_reports > 0:
            # Calculate accuracy rate based on upvotes/downvotes
            total_votes = reports.aggregate(
                total_upvotes=models.Sum('upvotes'),
                total_downvotes=models.Sum('downvotes')
            )

            upvotes = total_votes['total_upvotes'] or 0
            downvotes = total_votes['total_downvotes'] or 0
            total = upvotes + downvotes

            if total > 0:
                self.accuracy_rate = (upvotes / total) * 100

        self.save()