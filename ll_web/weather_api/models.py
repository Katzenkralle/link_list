from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class WeatherData(models.Model):
    lat = models.FloatField(default=0, max_length=10)
    lon = models.FloatField(default=0, max_length=10)
    date = models.IntegerField()
    time = models.IntegerField()
    current_weather = models.TextField(max_length=1000)
    alert = models.TextField(max_length=1000, null=True, blank=True)
    historical = models.BooleanField(default=False)

class ForecastWeatherData(models.Model):
    date = models.IntegerField()
    time = models.IntegerField()
    forecast_weather = models.TextField(max_length=1000)
    associated_data = models.ForeignKey(WeatherData, on_delete=models.CASCADE)

class WeatherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='weather_api_profile')
    api_key = models.CharField(max_length=100, default='', blank=True, null=True)
    custom_coordinates = models.CharField(max_length=100, default='', blank=True, null=True)
    default_location = models.CharField(max_length=100, default='Hamburg')
