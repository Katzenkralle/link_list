from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required(login_url='login')
def create_list(request):
    pass


