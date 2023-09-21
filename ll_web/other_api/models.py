from django.db import models



class AppWideData(models.Model):
    #ToBe reimplemented
    news_baner = models.CharField(max_length=500, default='')
    invatation_codes = models.CharField(max_length=200, default='[]')

