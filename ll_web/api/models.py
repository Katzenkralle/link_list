from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    last_login = models.DateTimeField(default=datetime.now())
    #rights = models.CharField(blank=True)
    #user_settings = models.CharField(blank=True)

class List(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=7)
    content = models.CharField(default='{}', max_length=500)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)


"""
Data Structure LinkListProfile:

[(Maped to: User), Last Login, Rights, usr_colors, usr_settings]
[(Maped to User_Profile), Name of List, Data(in json)]
Json Data: [{'EntryName': {'Contest': 'xxx', 'Color': 'xxx', 'Notes': 'xxx', 'Type': 'xxx'}}]"""
