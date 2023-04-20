from django.shortcuts import render, redirect
from django.http import HttpResponse    #Temp

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required(login_url='login')
def home(reqest):
    return HttpResponse("Hello")


def login_page(request):
    if request.method == 'POST':
        account = request.POST.get('account')
        token = request.POST.get('token')

        user = authenticate(request, username=account, password=token)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.info(request, 'Token is incorrect!')
    return render(request, 'login.html')

@login_required(login_url='login')
def logout_page(request):
    logout(request)
    return redirect('login')
