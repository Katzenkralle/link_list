from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from rest_framework import status

from api.models import Profile, List, AppWideData
# Create your views here.


@login_required(login_url='login')
def index(request, *args, **kwargs):
    return render(request, 'index.html')

def index_no_login(request, *args, **kwargs):
    #this index function is only beeing accest when creating an account
    return render(request, 'index.html')

def login_page(request):
    if request.method == 'POST':
        account = request.POST.get('account')
        token = request.POST.get('token')

        user = authenticate(request, username=account, password=token)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            messages.info(request, 'Username or Password incorrect!')
    return render(request, 'login.html')

@login_required(login_url='login')
def logout_page(request):
    logout(request)
    return redirect('login')

def index_public_lists(request):
    #http://127.0.0.1:8000/q?li=1
    try: 
        list_id = int(request.GET['li'])
    except (KeyError, ValueError):
        return HttpResponse("Invaled Request!", status=status.HTTP_204_NO_CONTENT)
    try:
        list = List.objects.get(id=list_id)
        is_public = list.public_list
        if is_public == 'false': 
            raise PermissionError
        if list.public_list_passwd != '':
            return render(request, 'index.html', {'status': "passwd_req"})
        else:
            return render(request, 'index.html', {'status': "continue"})
    except PermissionError:
        return HttpResponse("List Not Public", status=status.HTTP_403_FORBIDDEN)
    