from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
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
