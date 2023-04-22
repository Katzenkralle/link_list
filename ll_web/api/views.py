from django.contrib.auth.decorators import login_required

from .models import Profile

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import ProfileSerializer

# Create your views here.
@api_view(['GET', 'PUT', 'DELETE'])
@login_required(login_url='login')
def home(reqest):
    if reqest.method == 'PUT':
        serializer = ProfileSerializer(Profile.objects.get(user=reqest.user), data=reqest.data)
        if serializer.is_valid(): 
            serializer.save()
    serializer = ProfileSerializer(Profile.objects.all().filter(user = reqest.user), many=True)
    return Response(serializer.data)


