from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status

from .models import Profile, List

from .json_handler import from_json, to_json
# Create your views here.

@login_required(login_url='login')
def create_list(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    new_list_name = request.POST['list_name']
    new_list_color = request.POST['list_color']
    new_list_tag = request.POST['list_tag']

    if List.objects.all().filter(user=request.user, name=new_list_name).exists():
        return HttpResponse("Already exists", status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        List.objects.create(user = request.user,
                            name = new_list_name,
                            tag = new_list_tag,
                            color = new_list_color).save()
        return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def manage_tags(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    user_tags = from_json(Profile.objects.all().get(user = request.user).tags)
    match request.POST['action']:
        case "add":
            new_tag = request.POST['tag_name']
            if new_tag in user_tags:
                return HttpResponse("Already present", status=status.HTTP_304_NOT_MODIFIED)
            elif new_tag == 'default':
                return HttpResponse("Forbidden value", status=status.HTTP_400_BAD_REQUEST)
            else:    
                user_tags.append(new_tag)
                working_entry = Profile.objects.all().get(user = request.user)
                working_entry.tags = to_json(user_tags)
                working_entry.save()
        case "del": 
            user_tags.remove(request.POST['tag_name'])
            working_entry = Profile.objects.all().get(user = request.user)
            working_entry.tags = to_json(user_tags)
            working_entry.save()
        case _: pass
    return HttpResponse("Success", status=status.HTTP_201_CREATED)

@login_required(login_url='login')
def get_data_for_home(request):
    user = request.user

    user_tags = Profile.objects.all().get(user=user).tags
    return JsonResponse({'metaTags': user_tags}, safe=False)