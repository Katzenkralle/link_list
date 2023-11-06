from django.db import models
from django.contrib.auth.models import User

class DurakProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='durak_profile')
    saved_games = models.TextField(max_length=1000, default='{}', blank=True, null=True)
    