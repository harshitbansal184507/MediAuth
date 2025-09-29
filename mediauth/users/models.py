
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = (
        ('doctor', 'Doctor'),
        ('pharmacist', 'Pharmacist'),
        ('patient', 'Patient'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"