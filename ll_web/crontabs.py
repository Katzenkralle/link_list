from django_cron import CronJobBase, Schedule
from weather_api.views import WetherCollector
from datetime import datetime

class CurrentWeatherCron(CronJobBase):
    RUN_EVERY_MINS = 60
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'weather_api.current_weather_cron'

    def do(self):
        print('Fetching current weather data...')
        WetherCollector(date=datetime.now().strftime('%Y%m%d'), location=None, alow_no_location=True).get_forecast_default_locations()
        print('Done')
        return
