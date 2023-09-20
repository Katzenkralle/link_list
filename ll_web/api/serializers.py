#Convert complex Data type to types that Responce can work with

from rest_framework import serializers
from .models import Profile, List

#Currently not used, to be implemented
#Currently manualy converted in json_handler.py and directly in views.py; no extended validation

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'