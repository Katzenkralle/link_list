#Convert complex Data type to types that Responce can work with

from rest_framework import serializers
from .models import LinkListProfile, List, Media

#Currently not used, to be implemented
#Currently manualy converted in json_handler.py and directly in views.py; no extended validation
class ListSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        # Get the parameter value from the context
        exclude_field = kwargs.pop('exclude_fields', [])

        # Call the parent class's __init__ method
        super(ListSerializer, self).__init__(*args, **kwargs)

        # Dynamically exclude the specified field
        for field in exclude_field:
            self.fields.pop(field)
        self.fields.pop("public_list_passwd")
        self.fields.pop("content_history")
    
    class Meta:
        model = List
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkListProfile
        fields = '__all__'

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = '__all__'