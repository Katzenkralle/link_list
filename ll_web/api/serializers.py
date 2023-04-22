#Convert complex Data type to types that Responce can work with

from rest_framework import serializers
from .models import Profile, List

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'