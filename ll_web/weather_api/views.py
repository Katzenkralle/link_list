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
        return self.createdWeatherObject

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



class Settings(View):
    try:
        with open("default_location.json", "r") as f: 
            default_location = loads(f.read())
    except:
        default_location = {}
        pass

    @staticmethod
    def getLocations(user_obj):
        return loads(user_obj.custom_coordinates)


    def get(self, request):
        user_settings = WeatherProfile.objects.get(user=request.user)
        
        has_api_key = True if user_settings.api_key else False 
        uneditable_locations = [location for location in Settings.default_location.keys()]
        locations = {**Settings.getLocations(user_settings), **Settings.default_location}
        
        return JsonResponse({"profile": {"locations": locations, 
                                         'uneditable_locations': uneditable_locations,
                                        'default_location': user_settings.default_location,
                                        'has_api_key': has_api_key}})
    
    def post(self, request):
        mode = request.POST['mode']
        location_name = request.POST['location_name']
        api_key = request.POST['api_key']

        try:
            if mode == "add":
                lat, lon = round(float(request.POST['lat']),1), round(float(request.POST['lon']), 1)
            if location_name == "undefined" and mode != "set_api_key":
                raise ValueError
        except ValueError:
            return JsonResponse({"error": "invalid input"})
        

        user_settings = WeatherProfile.objects.get(user=request.user)
        user_coordinates = loads(user_settings.custom_coordinates)

        location_exists = location_name in user_coordinates.keys() or location_name in Settings.default_location.keys()

        match mode:
            case "add":
                if location_exists:
                    return JsonResponse({"error": "location already exists"})
                user_coordinates[location_name] = [lat, lon]
            case "del":
                if not location_exists:
                    return JsonResponse({"error": "location does not exist"})
                del user_coordinates[location_name]
            case "set_default":
                if not location_exists:
                    return JsonResponse({"error": "location does not exist"})
                user_settings.default_location = location_name
            case "set_api_key":
                user_settings.api_key = api_key if api_key != "undefined" else None

        
        user_settings.custom_coordinates = dumps(user_coordinates)
        user_settings.save()
        return JsonResponse(status=200, data={"error": "none"})

class Data(View, SaveData):
   
    @staticmethod
    def is_last_week_or_future(date_str):
        try:
            input_date = datetime.strptime(date_str, "%Y%m%d")
            current_date = datetime.now()
            
            # Calculate the date one week ago from today
            last_week = current_date - timedelta(days=5)
            
            # Check if the input date is within the last week or in the future
            if input_date >= current_date: #or (last_week <= input_date <= current_date)
                return True
            else:
                return False
        except ValueError:
            # Handle invalid date strings
            return False

    @staticmethod
    def get_previous_dates(date_str, direction):
    # Convert the input date string to a datetime object
        input_date = datetime.strptime(str(date_str), '%Y%m%d')

        # Initialize a list to store the previous dates
        previous_dates = []

        # Calculate the previous four dates
        for _ in range(4):
            if direction == '+':
                input_date += timedelta(days=1)
            else:
                input_date -= timedelta(days=1)
            previous_dates.append(int(input_date.strftime('%Y%m%d')))

        return previous_dates

    def __init__(self, ):
        self.recursion_allowed = 2
    
    def get_forecast(self, related_data):
        forecasts = ForecastWeatherData.objects.filter(associated_data=related_data.id).order_by("date", "time")
        forecasts = [ForecastWeatherDataSerializer(entry).data for entry in forecasts]
        return forecasts

    def get_backcast(self, related_data, direction, include_current=False):
        backcast_range = Data.get_previous_dates(related_data.date, direction)
        if include_current:
            backcast_range.append(related_data.date)
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
        formated_center_time = datetime.strptime(str(related_data.date), '%Y%m%d')
        if direction == '+':
            days_in_time_range = [(formated_center_time + timedelta(days=i)).strftime('%Y%m%d') for i in range(1,5)]
        else:
            days_in_time_range = [(formated_center_time - timedelta(days=i)).strftime('%Y%m%d') for i in range(1,5)]
        
        if include_current:
            days_in_time_range.append(str(related_data.date))

        for entry in backcasts:
            if str(entry['date']) in days_in_time_range:
                days_in_time_range.remove(str(entry['date']))
             
        if days_in_time_range != []:
            range_start = f"{min(days_in_time_range)[:4]}-{min(days_in_time_range)[4:6]}-{min(days_in_time_range)[6:]}"
            range_end = f"{max(days_in_time_range)[:4]}-{max(days_in_time_range)[4:6]}-{max(days_in_time_range)[6:]}"
            backcasts = OpenWeatherCaller((related_data.lat, related_data.lon), 1, '', (range_start, range_end)).get_weather()
            for dayly, hourly in zip(backcasts['daily'], backcasts['hourly']):
                SaveData(True, dayly, hourly).save()

            if self.recursion_allowed != 0:
                self.recursion_allowed -= 1
                return self.get_backcast(related_data, direction, include_current)
        return backcasts

    def fetch_historical_weather(self, location, date, mode="else"):
        #if mode == "get_center":
        historical_weather = OpenWeatherCaller(location, 0, "", (f"{date[:4]}-{date[4:6]}-{date[6:]}", f"{date[:4]}-{date[4:6]}-{date[6:]}")).get_weather()
        historical_weather['daily'] = SaveData(True, historical_weather['daily'][0], historical_weather['hourly'][0]).save()
        
        #else:
        #    historical_weather = self.get_backcast(OpenWeatherCaller(location, date).get_weather(), "+")
        return #historical_weather['daily'] #, historical_weather['hourly'][0])
    
    def fetch_current_weather(self, location, date):
        current_weather = OpenWeatherCaller(location, date, self.user_settings.api_key).get_weather()
        if date == "now":
            forecast_weather = OpenWeatherCaller(location, 'forecast', self.user_settings.api_key).get_weather()
        save_to_db = SaveData(False if date == 'now' else True, current_weather, forecast_weather).save()
        return

        
    def get_coordinates(self):
        if self.location_name == "default":
            self.location_name = self.user_settings.default_location

        all_locations = {**Settings.default_location, **Settings.getLocations(self.user_settings)}
        location = all_locations.get(self.location_name, ("", ""))
        if location[1] == "":
            return JsonResponse({"error": "location not found"})
        return location, all_locations
            #Bugged fix later location = OpenWeatherCaller(location_name, 0, user_settings.api_key).get_location(location[0])
    

    def get(self, request):
        #Possible bug that sets tim by 2? hours back resulting in a api request at every request, even if data is in db
        self.location_name = request.GET['loc']
        date = request.GET['date']
        time = request.GET['time']
        self.user_settings = WeatherProfile.objects.get(user=request.user)

        if Data.is_last_week_or_future(date) and date != datetime.now().strftime('%Y%m%d'):
            return JsonResponse({"error": "date out of range"})

        location, all_locations = self.get_coordinates()

        weather_object = WeatherData.objects.filter(lat=location[0], lon=location[1], date=datetime.now().strftime('%Y%m%d') if date == 'now' else date)

 
        if date == "now" or date == datetime.now().strftime('%Y%m%d'):
            date = "now"
            if not weather_object.exists():
                self.fetch_current_weather(location, date)
            current_weather_object = WeatherData.objects.filter(lat=location[0], lon=location[1]).order_by('date', 'time').last() #.last get highest date and time
            current_weather = WeatherDataSerializer(current_weather_object).data
            forecast = self.get_forecast(current_weather_object)
        else:
            if not weather_object.exists():
                #current_weather_object, current_weather = 
                self.fetch_historical_weather(location, date, mode = "get_center")
                weather_object = WeatherData.objects.filter(lat=location[0], lon=location[1], date=date)
                #current_weather = WeatherDataSerializer(current_weather_object).data
                #forecast = self.get_backcast(current_weather_object, "+", True)
            
            forecast = self.get_backcast(weather_object.order_by('date', 'time').last(), "+", True)
            current_weather_object = weather_object.order_by('date', 'time').last()
            current_weather = WeatherDataSerializer(weather_object.order_by('date', 'time').last()).data
            
            #get centerdat wether time + 4days (forcast)

        current_weather['loc_name'] = self.location_name

        backcast = self.get_backcast(current_weather_object, "-")

        profile = {"locations": all_locations}
        return JsonResponse({"current": current_weather, "forecast": forecast, "backcast": backcast, "profile": profile})

    def post(self, request):
        return JsonResponse({"data": "data"})
