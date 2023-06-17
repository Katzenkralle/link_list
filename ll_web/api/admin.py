from django.contrib import admin
from .models import Profile, List, AppWideData
# Register your models here.
admin.site.register(Profile)
admin.site.register(List)
admin.site.register(AppWideData)