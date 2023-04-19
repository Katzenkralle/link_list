from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)


"""
Data Structure LinkListProfile:

[(Maped to: User), Last Login, Rights, usr_colors, usr_settings]
[(Maped to User_Profile), Name of List, Data(in json)]
Json Data: [{'EntryName': {'Contest': 'xxx', 'Color': 'xxx', 'Notes': 'xxx', 'Type': 'xxx'}}]"""