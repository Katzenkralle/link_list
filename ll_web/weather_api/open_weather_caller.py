import requests
from typing import Dict, Any, Tuple
from datetime import datetime, timedelta
from json import loads

#https://openweathermap.org/current
#https://openweathermap.org/forecast5
#https://open-meteo.com/en/docs/historical-weather-api
#https://openweathermap.org/api/geocoding-api
class OpenWeatherCaller:
    try:
        with open("ll_web/weather_api/default_key.json", "r") as f:
            api_key = loads(f.read())["api_key"]
    except:
        pass

    def __init__(self, location: Tuple[float, float], date: str,  api_key:str, range: Tuple[str, str] = None) -> None:
        #Set default values used for API calls
        self.api_key = api_key
        self.date = date
        self.range = range
        self.api_key = api_key if api_key else OpenWeatherCaller.api_key
        self.location = location

    def get_location(self, str_location) -> Tuple[float, float]:
        #Currently unused and untested, found to be unaccurate
        response = requests.get(f"https://api.openweathermap.org/geo/1.0/direct?q={str_location[0]}&limit=5&appid={self.api_key}")
        response.raise_for_status()
        response = response.json()
        self.location = (response[0]["lat"], response[0]["lon"])
        return

    def __restructure_openmeteo(self):
        #Restructures the response from open-meteo to match the openweathermap format

        formatted_days = []
        dayly = self.response['daily']
        formatted_hours = []

        #For every day (in db master) ad a properly formatted day to the list
        for (time, max_temp, min_temp, sunrise, sunset, rainsum, snowsum) in\
            zip(dayly['time'], dayly['temperature_2m_max'], dayly['temperature_2m_min'], dayly['sunrise'],\
                dayly['sunset'], dayly['rain_sum'], dayly['snowfall_sum']):
            formatted_days.append(\
            {'coord': 
                {'lat': self.response['latitude'], 'lon': self.response['longitude']},
            
            'weather': [{}],
            'base': 'unknown',
            'main': {
                'temp_min': min_temp,
                'temp_max': max_temp,
            },
            'visibility': 'Unknown',
            'wind': {},
            'rain': {'sum': rainsum},
            'snow': {'sum': snowsum},
            'dt': time,
            'sys': {
                'sunrise': sunrise,
                'sunset': sunset,
            },
            'name': 'unknown',
            "source": "open-meteo",
            })
            formatted_hours.append({'list': []})

        #For every hour (in db slave) add a properly formatted hour to the list
        hourly = self.response['hourly']
        day = 0
        for (time, temperature_2m, relativehumidity_2m, apparent_temperature, rain, snowfall, weathercode, pressure_msl,\
            surface_pressure, windspeed_10m, winddirection_10m, windgusts_10m) in zip(hourly['time'], hourly['temperature_2m'],\
            hourly['relativehumidity_2m'], hourly['apparent_temperature'], hourly['rain'], hourly['snowfall'], hourly['weathercode'],\
            hourly['pressure_msl'], hourly['surface_pressure'], hourly['windspeed_10m'], hourly['winddirection_10m'], hourly['windgusts_10m']):
            
            if not len(formatted_days) ==  day+1 and time >= formatted_days[day +1]['dt']:
                day += 1
            
            formatted_hours[day]['list'].append(
                {
                    'dt': time,
                    'main': {
                        'temp': temperature_2m,
                        'feels_like': apparent_temperature,
                        'humidity': relativehumidity_2m,
                        'sea_level': pressure_msl,
                        'grnd_level': surface_pressure,
                    },
                    'weather': [
                        {
                            'id': weathercode,
                        }
                    ],
                    "clouds": {},
                    "wind": {
                        "speed": windspeed_10m,
                        "deg": winddirection_10m,
                        "gust": windgusts_10m,
                    },
                    "visibility": "unknown",
                    "pop": None,
                    "rain": {
                        "1h": rain,
                    },
                    "snow": {
                        "1h": snowfall,
                    },
                    "sys": {
                        "sunrise": formatted_days[day]["sys"]["sunrise"],
                        "sunset": formatted_days[day]["sys"]["sunset"],
                    },
                    "source": "open-meteo",
                }
            )
        #Return the formatted response
        return {'daily': formatted_days, 'hourly': formatted_hours}
    
               

    def __get_current_weather(self) -> Dict[str, Any]:
        #Calls openweathermap API for current weather, no additional information needed
        response = requests.get(f"https://api.openweathermap.org/data/2.5/weather?lat={self.location[0]}&lon={self.location[1]}&units=metric&appid={self.api_key}")
        response.raise_for_status()
        return response.json()

    def __get_forecast_weather(self) -> Dict[str, Any]:
        #Calls openweathermap API for forecast weather, no additional information needed
        response = requests.get(f"https://api.openweathermap.org/data/2.5/forecast?lat={self.location[0]}&lon={self.location[1]}&units=metric&appid={self.api_key}")
        response.raise_for_status()
        return response.json()

    def __get_historical_weather(self) -> Dict[str, Any]:
        #Calls open-meteo API for historical weather, needs a a time range
        #And restructures the response to match the openweathermap format
        response = requests.get(f"https://archive-api.open-meteo.com/v1/archive?latitude={self.location[0]}&longitude={self.location[1]}&start_date={self.range[0]}&end_date={self.range[1]}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,rain,snowfall,weathercode,pressure_msl,surface_pressure,windspeed_10m,winddirection_10m,windgusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum&timeformat=unixtime&timezone=GMT")
        response.raise_for_status()
        self.response = response.json()
        return self.__restructure_openmeteo()

    def get_weather(self):
        #Selects the correct API call based on the date, returns the response
        if self.date == "now":
            return self.__get_current_weather()
        elif self.date == "forecast":
            return self.__get_forecast_weather()
        else:
            return self.__get_historical_weather()
'https://archive-api.open-meteo.com/v1/archive?latitude=53.5453&longitude=9.9953&start_date=2023-09-19&end_date=2023-09-23&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,rain,snowfall,weathercode,pressure_msl,surface_pressure,windspeed_10m,winddirection_10m,windgusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum&timeformat=unixtime&Europe%2FBerlin'