from django.shortcuts import render

from django.http import HttpResponse, JsonResponse
from weather_api.models import WeatherData, WeatherProfile, ForecastWeatherData
from django.views import View
from .open_weather_caller import OpenWeatherCaller
from datetime import datetime, timedelta
from json import loads, dumps
# Create your views here.
from django.db.models import Max
from .serializers import WeatherDataSerializer, ForecastWeatherDataSerializer

from django.db.models import F, Value, IntegerField
from django.db.models.functions import Abs, Least


class SaveData():
    def __init__(self, historical, current_weather, forcast_weather):
        self.historical = historical
        self.current_weather = current_weather
        self.forcast_weather = forcast_weather
        self.createdWeatherObject = None

    def save(self,):
        print(self.current_weather)
        date, time = datetime.utcfromtimestamp(self.current_weather['dt']).strftime('%Y%m%d-%H%M').split("-")
        lat, lon = (round(self.current_weather['coord']['lat'], 1), round(self.current_weather['coord']['lon'], 1))
        alert = self.current_weather.get('alerts', None)
        souce = self.current_weather.get('source', 'openweather')
        self.current_weather = SaveData.remove_keys(self.current_weather, ['coord', 'dt', 'timezone', 'source', 'alerts'])

        self.createdWeatherObject = WeatherData.objects.create(
            lat=lat,
            lon=lon,
            date=date,
            time=time,
            current_weather=dumps(self.current_weather),
            historical=self.historical,
            source= souce,
            alert=dumps(alert) if alert else None,
        )
        if self.forcast_weather:
            self.save_forecast()
        return

    def save_forecast(self):
        for entry in self.forcast_weather['list']:
            date, time = datetime.utcfromtimestamp(entry['dt']).strftime('%Y%m%d-%H%M').split("-")
            source = entry.get('source', 'openweather')
            entry = SaveData.remove_keys(entry, ['dt', 'dt_txt', 'sys', 'source'])
            ForecastWeatherData.objects.create(
                date=date,
                time=time,
                source = source,
                forecast_weather=dumps(entry),
                associated_data=self.createdWeatherObject,
                
            )
        return
    
    @staticmethod
    def remove_keys(dictionary, keys):
        for key in keys:
            if key in dictionary:
                del dictionary[key]
        return dictionary

    

class Data(View, SaveData):
    try:
        with open("default_location.json", "r") as f: 
            default_location = loads(f.read())
    except:
        pass
    
    @staticmethod
    def get_previous_dates(date_str):
    # Convert the input date string to a datetime object
        input_date = datetime.strptime(str(date_str), '%Y%m%d')

        # Initialize a list to store the previous dates
        previous_dates = []

        # Calculate the previous four dates
        for _ in range(4):
            input_date -= timedelta(days=1)
            previous_dates.append(int(input_date.strftime('%Y%m%d')))

        return previous_dates

    def __init__(self, ):
        self.recursion_allowed = True
    
    def fetch_wether_data(self, location, date, user_settings):
        current_weather = OpenWeatherCaller(location, date, user_settings.api_key).get_weather()
        if date == "now":
            forecast_weather = OpenWeatherCaller(location, 'forecast', user_settings.api_key).get_weather()
        save_to_db = SaveData(False if date == 'now' else True, current_weather, forecast_weather).save()
        return
    
    def get_forecast(self, related_data):
        forecasts = ForecastWeatherData.objects.filter(associated_data=related_data.id).order_by("date", "time")
        forecasts = [ForecastWeatherDataSerializer(entry).data for entry in forecasts]
        return forecasts

    def get_backcast(self, related_data):
        backcast_range = Data.get_previous_dates(related_data.date)
        backcasts = []
        backcast_queryset = WeatherData.objects.filter(lat=related_data.lat, lon=related_data.lon, date__in=backcast_range).order_by("date", "time")
        for entry_current in backcast_queryset:
            if entry_current.source == 'open-meteo':
                #replace queryaet with
                for entry in ForecastWeatherData.objects.filter(associated_data=entry_current).order_by("date", "time"):
                    backcasts.append(ForecastWeatherDataSerializer(entry).data)
            else:
                backcasts.append(WeatherDataSerializer(entry_current).data)
        # ^ maby query every date sepratly to find if one is missing, then reqest it
        #backcasts = [WeatherDataSerializer(entry).data for entry in backcasts]

        if backcasts == []:
            formated_center_time = datetime.strptime(str(related_data.date), '%Y%m%d')
            time_range = ((formated_center_time - timedelta(days=5)).strftime('%Y-%m-%d'),  (formated_center_time - timedelta(days=1)).strftime('%Y-%m-%d')) 
            backcasts = OpenWeatherCaller((related_data.lat, related_data.lon), 1, '', time_range).get_weather()
            for dayly, hourly in zip(backcasts['daily'], backcasts['hourly']):
                SaveData(True, dayly, hourly).save()

            if self.recursion_allowed:
                self.recursion_allowed = False
                return self.get_backcast(related_data)
        return backcasts


    def get(self, request):
        location_name = request.GET['loc']
        date = request.GET['date']
        time = request.GET['time']
        user_settings = WeatherProfile.objects.get(user=request.user)

        if location_name == "default":
            location_name = user_settings.default_location

        location = Data.default_location.get(location_name, (location_name, ""))


        if not WeatherData.objects.filter(lat=location[0], lon=location[1], date=datetime.now().strftime('%Y%m%d') if date == 'now' else date).exists():
            self.fetch_wether_data(location, date, user_settings)
 
        if time == "now":
            queryset = WeatherData.objects.aggregate(max_value=Max('time'))['max_value'] #newest data
            current_weather_object = WeatherData.objects.filter(time=queryset).first()
            
        else:
            queryset = WeatherData.objects.annotate(abs_diff=Abs(F('numeric_field') - time))
            current_weather_object = queryset.order_by('abs_diff').first()

        current_weather = WeatherDataSerializer(current_weather_object).data
        current_weather['loc_name'] = location_name
        
        forecast = self.get_forecast(current_weather_object)
        backcast = self.get_backcast(current_weather_object)

        return JsonResponse({"current": current_weather, "forecast": forecast, "backcast": backcast})

    def post(self, request):
        return JsonResponse({"data": "data"})


 
class Settings(View):
    def get(self, request):
        return JsonResponse({"data": "data"})
    
    def post(self, request):
        return JsonResponse({"data": "data"})
    
