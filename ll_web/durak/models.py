from django.db import models
from django.contrib.auth.models import User

class DurakProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room_id = models.CharField(max_length=4, blank=True, null=True)
    room_players = models.TextField(max_length=1000, default='{}', blank=True, null=True)
    room_settings = models.TextField(max_length=1000, default='{}', blank=True, null=True)
    room_settings_locked = models.BooleanField(default=False)
    room_playing = models.BooleanField(default=False)
    room_game_state = models.TextField(max_length=1000, default='{}', blank=True, null=True)

    saved_games = models.TextField(max_length=1000, default='{}', blank=True, null=True)
    