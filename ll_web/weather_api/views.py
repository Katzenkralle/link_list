from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import HttpResponse, JsonResponse
from weather_api.models import WeatherData, WeatherProfile, ForecastWeatherData
from django.views import View
from .open_weather_caller import OpenWeatherCaller
from datetime import datetime, timedelta
from json import loads, dumps

from django.db.models import Max
from .serializers import WeatherDataSerializer, ForecastWeatherDataSerializer

from django.db.models import F, Value, IntegerField
from django.db.models.functions import Abs, Least

from typing import Tuple, List, Dict, Union
from datetime import datetime, timezone, timedelta

class SaveData():
    def __init__(self, historical, current_weather, forcast_weather, force_save=False):
        #Sets the data to be saved
        self.force_save = force_save
        self.historical = historical
        self.current_weather = current_weather
        self.forcast_weather = forcast_weather
        self.createdWeatherObject = None

    @staticmethod
    def unix_timestamp_to_german_time(unix_timestamp):
        # Convert Unix timestamp to UTC datetime
        utc_datetime = datetime.utcfromtimestamp(unix_timestamp).replace(tzinfo=timezone.utc)

        # Define the time zone offset for Germany
        german_time_offset = timezone(timedelta(hours=2))  # CET (UTC+2) or CEST during daylight saving time

        # Convert UTC datetime to German local time
        german_local_time = utc_datetime.astimezone(german_time_offset)

        return german_local_time.strftime('%Y%m%d-%H%M')

    def save(self,):
        #Saves the data to the database, extracting data from current weather and directly adding it to rows in the database
        #Deleats thes from original data, wether data is saved as JSON
        date, time = SaveData.unix_timestamp_to_german_time(self.current_weather['dt']).split("-")
        lat, lon = (round(self.current_weather['coord']['lat'], 2), round(self.current_weather['coord']['lon'], 2))
        alert = self.current_weather.get('alerts', None)
        souce = self.current_weather.get('source', 'openweather')

        self.current_weather = SaveData.remove_keys(self.current_weather, ['coord', 'dt', 'timezone', 'source', 'alerts'])
        self.current_weather["sys"]["sunrise"] = SaveData.unix_timestamp_to_german_time(self.current_weather["sys"]["sunrise"]).split("-")[1]
        self.current_weather["sys"]["sunset"] = SaveData.unix_timestamp_to_german_time(self.current_weather["sys"]["sunset"]).split("-")[1]

        #Checks if the data already exists in the database, if so, abort
        if WeatherData.objects.filter(lat=lat, lon=lon, date=date, time=time).exists() and not self.force_save:
            print(f"Saving {date, time}; Master for {lat, lon} already exists!")
            return

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
        print(f"Saving {date, time}; Master for {lat, lon}!")
        #If forecast data is provided, save it to the database
        if self.forcast_weather:
            self.save_forecast()
        return self.createdWeatherObject

    def save_forecast(self):
        #Exreacts, deleats and saves the forecast data to the database similar to the current weather data
        for entry in self.forcast_weather['list']:
            date, time = datetime.utcfromtimestamp(entry['dt']).strftime('%Y%m%d-%H%M').split("-")
            source = entry.get('source', 'openweather')
            entry = SaveData.remove_keys(entry, ['dt', 'dt_txt', 'source'])
            if entry.get("sys", None) !=None and entry["sys"].get("sunrise", None) != None:
                entry["sys"]["sunrise"] = SaveData.unix_timestamp_to_german_time(entry["sys"]["sunrise"]).split("-")[1]
                entry["sys"]["sunset"] = SaveData.unix_timestamp_to_german_time(entry["sys"]["sunset"]).split("-")[1]
            ForecastWeatherData.objects.create(
                date=date,
                time=time,
                source = source,
                forecast_weather=dumps(entry),
                associated_data=self.createdWeatherObject   
            )
            print(f"Saving {date, time}; Slave of [{self.createdWeatherObject.id}]!")
        return
    
    @staticmethod
    def remove_keys(dictionary, keys):
        #Removes the provided keys from the dictionary
        #Removes the provided keys from the dictionary
        for key in keys:
            if key in dictionary:
                del dictionary[key]
        return dictionary

@method_decorator(login_required, name='dispatch')
class Settings(View):
    try:
        with open("ll_web/weather_api/default_location.json", "r") as f: 
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
                lat, lon = round(float(request.POST['lat']),2), round(float(request.POST['lon']), 2)
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
                if location_name == user_settings.default_location:
                    user_settings.default_location = Settings.default_location.keys()[0]
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


class WetherCollector(SaveData):
    def __init__(self, date: str, location: Tuple[int, int] | str, api_key:str = "", locations:List[object] = {}\
                 , alow_no_location:bool = False):
        #Sets the location and date and checks if the location is valid
        #Sets the api key if it is provided, sets the current date
        self.available_locations = {**Settings.default_location, **locations}
        self.center_date = date
        self.location = location if type(location) == tuple else self.available_locations.get(location, None)
        self.api_key = api_key
        self.current_date = datetime.now().strftime('%Y%m%d')
        if self.location == None and not alow_no_location:
            raise ValueError("Location not found")

        
    def __data_exists(self):
        #Checks if the data for the center date and location exists in the database
        if WeatherData.objects.filter(lat=self.location[0], lon=self.location[1],\
                                date=self.center_date).exists():
            return True
        else:
            return False
    
    def __get_date_range(self, direction, include_current=False):
        #Gets the previous four dates from the center date or the next four dates
        #if direction is set to "+"
        input_date = datetime.strptime(str(self.center_date), '%Y%m%d')        
        dates = []

        # Calculate the previous four dates
        for _ in range(4):
            if direction == '+':
                input_date += timedelta(days=1)
            else:
                input_date -= timedelta(days=1)
            dates.append(int(input_date.strftime('%Y%m%d')))

        # Add the center date to the list if include_current is set to True
        if include_current:
            dates.append(int(self.center_date))
        return dates

    def __get_forecast(self, force_api=False):
        #Gets the forecast for the center date and location
        #Returns the center date and the forecast

        #Checks if the data exists in the database, if not it gets the data from the api, saves it to the database
        if not self.__data_exists() or force_api:
            #ToDo: Add check if user is allowed to use default api key
            center_date = OpenWeatherCaller(self.location, 'now', self.api_key).get_weather()
            forecasts = OpenWeatherCaller(self.location, 'forecast', self.api_key).get_weather()
            SaveData(False, center_date, forecasts).save()
        
        center_date = WeatherData.objects.filter(lat=self.location[0], lon=self.location[1]).order_by('date', 'time').last()   
        forecasts = ForecastWeatherData.objects.filter(associated_data=center_date.id).order_by("date", "time")
        center_date = WeatherDataSerializer(center_date).data
        forecasts = [ForecastWeatherDataSerializer(entry).data for entry in forecasts]
        return (center_date, forecasts)

    def __get_backcast(self, direction, include_center=False):
        #Gets the backcast (for the center date if selected) and location
        #Returns the backcast (and center date if selected)

        backcast_range = self.__get_date_range(direction, include_center)
        missing_dates = []

        #Checks if the data exists in the database, if not marks the missing dates in new list
        for date in backcast_range:
            if not WeatherData.objects.filter(lat=self.location[0], lon=self.location[1], date=date).exists():
                missing_dates.append(date)

        #Gets the missing data from the api, saves it to the database
        #Dose one Request total, calculates range, multiple entries of same date in db possible, clean up will be done later
        if missing_dates != []:
            start_missing = str(min(missing_dates))
            end_missing = str(max(missing_dates))
            range_start = f"{start_missing[:4]}-{start_missing[4:6]}-{start_missing[6:]}"
            range_end = f"{end_missing[:4]}-{end_missing[4:6]}-{end_missing[6:]}"
            backcasts = OpenWeatherCaller(self.location, 1, '', (range_start, range_end)).get_weather()
            for dayly, hourly in zip(backcasts['daily'], backcasts['hourly']):
                SaveData(True, dayly, hourly).save()
        
        #Gets the data from the database
        backcast_queryset = WeatherData.objects.filter(lat=self.location[0], lon=self.location[1],\
                            date__in=backcast_range).order_by("date", "time")
        
        backcasts = []

        #Checks source of data and serializes it, if source is open-meteo, use child objects
        for entry in backcast_queryset:
            if entry.source == 'open-meteo':
                #replace queryaet with
                for entry in ForecastWeatherData.objects.filter(associated_data=entry).order_by("date", "time"):
                    backcasts.append(ForecastWeatherDataSerializer(entry).data)
            else:
                backcasts.append(WeatherDataSerializer(entry).data)
        
        #If include_center is set to True, get the center date and add it to the list
        if include_center:
            center_date = WeatherData.objects.filter(lat=self.location[0], lon=self.location[1],\
                             date=self.center_date).last()
            center_date = WeatherDataSerializer(center_date).data
            return (center_date, backcasts)
        else:
            return backcasts

        
    def get_forecast_default_locations(self):
        for location in self.available_locations:
            print(location)
            self.location = self.available_locations[location]
            self.__get_forecast(True)
        return


    def with_center_date(self):
        #Gets the forecast and backcast for the center date and location
        if self.center_date == self.current_date:
            center_date, forecast = self.__get_forecast()
            unused_center, backcast = self.__get_backcast("-", True)
        else:
            forecast = self.__get_backcast("+")
            center_date, backcast = self.__get_backcast("-", True)
        

        return (center_date, forecast, backcast)
        
@method_decorator(login_required, name='dispatch')
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

    def fit_to_max_datasets(self, data, max_datasets):
        #Fits amount of datasets to max_datasets

        #Sorts the data by date, each date is a key in the dictionary
        datasets_in_days = {}
        for entry in data:
            date = entry['date']
            if not date in datasets_in_days.keys():
                datasets_in_days[date] = []
            datasets_in_days[date].append(entry)
        
        #For each day, if amount of datasets is smaller than max_datasets, add all datasets
        finished_data = []
        for day in datasets_in_days:
            if len(datasets_in_days[day]) <= int(max_datasets):
                finished_data += datasets_in_days[day]
            else:
                #Sorts the datasets by time
                datasets_in_days[day] = sorted(datasets_in_days[day], key=lambda x: x['time'])
                
                #Calculates the time between each dataset, sorts them by time between datasets (lowest first)
                #Enumerates the list to keep track of the index in the original list (datasets_in_days)
                time_between_datasets = [datasets_in_days[day][x+1]['time'] - datasets_in_days[day][x]['time']\
                                         for x in range(len(datasets_in_days[day])-1)]
                enumerate_time = list(enumerate(time_between_datasets))
                time_between_datasets = sorted(enumerate_time, key=lambda x: x[1])
                
                #Gets the index of the datasets to delete
                datasets_to_delete = []
                for _ in range(len(datasets_in_days[day]) - int(max_datasets)):
                    index = time_between_datasets.pop(0)[0]
                    datasets_to_delete.append(index)
                
                #Deletes the datasets from the original list
                #Must be done in reverse order to not mess up the indexes
                for index in sorted(datasets_to_delete, reverse=True):
                    del datasets_in_days[day][index]
                finished_data += datasets_in_days[day]

        return finished_data

    def get(self, request):
        #Possible bug that sets tim by 2? hours back resulting in a api request at every request, even if data is in db
        #Gets request data and user settings, converts it to the correct format and calls the WeatherCollector
        location_name = request.GET['loc']
        date = request.GET['date']
        try:
            max_datasets_dayly = request.GET['dayly_datasets']
        except KeyError:
            max_datasets_dayly = None
        self.user_settings = WeatherProfile.objects.get(user=request.user)

        user_locations = loads(self.user_settings.custom_coordinates)


        if Data.is_last_week_or_future(date) and date != datetime.now().strftime('%Y%m%d'):
            return JsonResponse({"error": "date out of range"})
        else:
            date = datetime.now().strftime('%Y%m%d') if date == "now" else date

        if location_name == "default":
            location_name = self.user_settings.default_location
        

        current_weather, forecast, backcast = WetherCollector(date, location_name, self.user_settings.api_key,\
                                                           user_locations).with_center_date()

        
        #Adds the location name to the current weather data, front end needs it
        current_weather['loc_name'] = location_name 

        if max_datasets_dayly != None:
            #Note it is possible that max_datasets is exceeded if the same date is in backcast and forecast
            forecast = self.fit_to_max_datasets(forecast, max_datasets_dayly)
            backcast = self.fit_to_max_datasets(backcast, max_datasets_dayly)
    
        profile = {"locations": {**Settings.default_location, **user_locations}}
        return JsonResponse({"current": current_weather, "forecast": forecast, "backcast": backcast, "profile": profile})

    def post(self, request):
        return JsonResponse({"error": "not implemented"})

