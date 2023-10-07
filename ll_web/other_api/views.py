from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework import status
from json import loads as from_json
from json import dumps as to_json

from link_list_api.models import LinkListProfile
from weather_api.models import WeatherProfile
from other_api.models import AppWideData
def has_letter(string: str) -> bool:
    #Check if string contains a letter
    for char in string:
        if char.isalpha():
            return True  
    return False


def modify_account(request): 
    #Checks if the request is a POST request, if not, return 204
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    
    action = request.POST['action']

    #Cock if acount creation or removal is requested else return 400
    if action == 'account_creation':

        #Check if the user name is already used and the password is valid, if so, return 226
        #Also check if the invatation code is valid, if not, return 423
        user = request.POST['user']
        invatation_code = request.POST['invatation_code']

        if User.objects.filter(username=user).exists():
            return HttpResponse("already used", status=status.HTTP_226_IM_USED)
        elif invatation_code not in from_json(AppWideData.objects.get(id=1).invatation_codes):
            return HttpResponse("not invited", status=status.HTTP_423_LOCKED)
        
        new_passwd = request.POST['passwd']
        
    
        if not has_letter(user) or not has_letter(new_passwd):
            return HttpResponse("invalid user name", status=status.HTTP_406_NOT_ACCEPTABLE)
    
        #Create the new user and profile
        user = User.objects.create_user(username=user, password=new_passwd)
        
        LinkListProfile(user=user).save()
        WeatherProfile(user=user).save()
        return HttpResponse('created', status=status.HTTP_201_CREATED)
    elif action == 'account_removal':
        #Remove the user, that requested it, from the database, profile and lists are deleated by on_delete=CASCADE
        User.objects.get(username=request.user).delete()
        return HttpResponse("Removed User", status=status.HTTP_202_ACCEPTED)
