from rest_framework import serializers
from .models import WeatherData, ForecastWeatherData

class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        # List all the fields you want to include in the serializer
        fields = ('lat', 'lon', 'date', 'time', 'current_weather', 'alert')



class ForecastWeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastWeatherData
        # List all the fields you want to include in the serializer
        fields = ('time', 'date', 'forecast_weather')  # Exclude the associated_data field
