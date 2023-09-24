from django.contrib import admin
from .models import WeatherData, WeatherProfile, ForecastWeatherData
# Register your models here.

admin.site.register(WeatherData)
admin.site.register(WeatherProfile)
admin.site.register(ForecastWeatherData)