from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models import Q

from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status

from .models import Media
from .serializers import MediaSerializer

from json import loads as from_json
from json import dumps as to_json

import os
import base64
from PIL import Image
from io import BytesIO

def compress_img(image_data, max_wh=(200, 200)):
    # Open the image from binary data
    img = Image.open(BytesIO(image_data))

    # Resize the image while preserving the aspect ratio
    img.thumbnail(max_wh)

    # Save the resized image to a BytesIO buffer
    output_buffer = BytesIO()
    img.save(output_buffer, format="WEBP")
    
    # Get the binary data from the buffer
    compressed_data = output_buffer.getvalue()

    return compressed_data

@method_decorator(login_required, name='dispatch')
class SaveMedia(APIView):
    
    def post(self, request, *args, **kwargs):
        user = request.user
        uploaded_files = request.FILES.getlist('files[]')
        path_to_fodler = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media")

        status_for_file = {}
        for file in uploaded_files:
            try: 
                path_to_file = os.path.join(path_to_fodler, file.name)
                with open(path_to_file, 'xb') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                Media(user=user, name=file.name, type=file.content_type).save()
                status_for_file[file.name] = 'created'
            except FileExistsError:
                status_for_file[file.name] = 'exists'
            
        return JsonResponse({'status': status_for_file})
        # Rest of your code for handling the POST request

@method_decorator(login_required, name='dispatch')
class GetMedia(APIView):
    
    def get(self, request, *args, **kwargs):
        user = request.user
        max_entries = int(request.GET.get('datasets', 24))
        start_at = int(request.GET.get('next', 0))
        content_type = request.GET.get('type', all)
        name = request.GET.get('name', None)
        
        if name:
            db_entry = Media.objects.filter(user=user, name=name).first()
            path_to_fodler = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media")
            with open(path_to_fodler + '/' + name, 'rb') as file:
                return HttpResponse(file, content_type=db_entry.type)

        if type(content_type) != list:
            content_type = [content_type]

        query = Q()
        for part in [item.split('/')[0] for item in content_type if '/' in item]:
            query |= Q(user = user, type__contains=part)
        # Filter objects in the database
        filtered_objects = Media.objects.filter(query).order_by('-uploaded_date')
        media = MediaSerializer(filtered_objects[start_at:start_at+max_entries], many=True).data

        path_to_fodler = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media")
        for entry in media:
            with open(path_to_fodler + '/' + entry["name"], 'rb') as file:
                img = compress_img(file.read(), max_wh=(400, 400))
                entry["file"] = base64.b64encode(img).decode('utf-8')
            
        possition = {"start": start_at, "end": start_at + len(media), "total": len(filtered_objects)}

        return JsonResponse({'content': media, "possition": possition})
    
    def post(self,request):
        user = request.user
        mode = request.POST.get('mode', None)
        name = request.POST.get('name', None)
        match mode:
            case 'delete':
                path_to_file = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media/{name}")
                os.remove(path_to_file)
                Media.objects.filter(user=user, name=name).delete()
                return JsonResponse({'status': 'done'})
            case 'rename':
                new_name = request.POST.get('new_name', None)
                if Media.objects.filter(user=user, name=new_name).exists():
                    return JsonResponse({'status': 'error, name already exists'})
                path_to_file = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media/{name}")
                new_path_to_file = os.path.join(os.getcwd(), f"ll_web/data/{user.id}/media/{new_name}")
                os.rename(path_to_file, new_path_to_file)
                Media.objects.filter(user=user, name=name).update(name=new_name)
                return JsonResponse({'status': 'done'})
            case _: 
                return JsonResponse({'status': 'error, no mode specified'})