from rest_framework import serializers
from .models import DurakProfile

class DurakActiveRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = DurakProfile
        fields = ('room_id', 'room_players', 'room_settings', 'room_settings_locked', 'room_playing', 'user')
