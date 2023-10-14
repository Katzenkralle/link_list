from django.core.management.base import BaseCommand
from weather_api.models import WeatherData

class Command(BaseCommand):
    help = 'Deletes all weather data from the database'

    def handle(self, *args, **kwargs):
        WeatherData.objects.all()
        for entry in WeatherData.objects.all():
            match entry.lat:
                case 52.9:
                    entry.lat = 52.96
                    entry.lon = 9.01
                case 53:
                    entry.lat = 53.07
                    entry.lon = 8.80
                case 53.5:
                    entry.lat = 53.55
                    entry.lon = 9.99
            self.stdout.write(self.style.SUCCESS(f"Replaced {entry.lat} {entry.lon}"))
            entry.save()
        self.stdout.write(self.style.SUCCESS('Successfully replaced all locations'))
