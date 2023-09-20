from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from rest_framework import status

@login_required(login_url='login')
def index(request, *args, **kwargs):
    #Default Homepage, React rerouts
    return render(request, 'index.html')

def index_no_login(request, *args, **kwargs):
    #Index for account creation, React rerouts
    return render(request, 'index.html')

def login_page(request):
    #Login Page, compleatly handeld by Django, no React
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
    #Jusr logout and redirect to login page 
    logout(request)
    return redirect('login')

def large_viewer(request):
    #Large viewer, React rerouts
    #Check if list id is int, premission check is done in api/views.py (after request from react)
    try: 
        list_id = request.GET['li']
        int(list_id)
        if list_id == '0':
            raise ValueError
    except:
        return HttpResponse("No list wit that id", status=status.HTTP_204_NO_CONTENT)
    return render(request, 'index.html')