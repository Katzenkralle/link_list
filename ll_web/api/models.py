from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tags = models.CharField(default='[]', max_length=500)
    last_login = models.DateTimeField(default=datetime.now())
    
    #rights = models.CharField(blank=True)
    #user_settings = models.CharField(blank=True)

class List(models.Model):
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=7, unique=False)
    tag = models.CharField(max_length=24, unique=False)
    content = models.CharField(default='[]', max_length=500, unique=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class AppWideData(models.Model):
    news_baner = models.CharField(max_length=500, default='')
    invatation_codes = models.CharField(max_length=200, default='[]')

"""
Data Structure LinkListProfile:

[(Maped to: User), Last Login, Rights, usr_colors, usr_settings]
[(Maped to User_Profile), Name of List, Data(in json)]
Json Data: [{'EntryName': {'Contest': 'xxx', 'Color': 'xxx', 'Notes': 'xxx', 'Type': 'xxx'}}]"""
