from django.db import models
from django.contrib.auth.models import User
from datetime import datetime


class Profile(models.Model):
    #Profile of a user, contains all user specific data except lists
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tags = models.CharField(default='[]', max_length=500)
    last_login = models.DateTimeField(default=datetime.now()) #TODO: Implement
    foreign_lists = models.CharField(default='[]', max_length=500)

class List(models.Model):
    #Lists of a user, contains all lists of a user and their data
    name = models.CharField(max_length=20)
    color = models.CharField(max_length=7, unique=False)
    tag = models.CharField(max_length=24, unique=False)
    content = models.CharField(default='[]', max_length=500, unique=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    url = models.CharField(max_length=30, default='')
    creation_date = models.DateTimeField(default=datetime.now())
    public_list = models.CharField(max_length=20, default='False')
    public_list_passwd = models.CharField(max_length=20, default='', null=True)

class AppWideData(models.Model):
    #ToBe reimplemented
    news_baner = models.CharField(max_length=500, default='')
    invatation_codes = models.CharField(max_length=200, default='[]')


