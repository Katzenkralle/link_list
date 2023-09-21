from django.contrib import admin
from .models import LinkListProfile, List

from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


class CustomUserAdmin(UserAdmin):
    # Specify the database router for the User model
    using = 'users'  # Use the alias of your main database defined in settings.py

admin.site.register(LinkListProfile)
admin.site.register(List)
admin.site.unregister(User)  # Unregister the default User admin
admin.site.register(User, CustomUserAdmin)  # Register the User model with the custom admin class