# Generated by Django 4.2.1 on 2023-09-23 21:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('weather_api', '0003_remove_weatherdata_forecast_time_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='forecastweatherdata',
            name='lat',
        ),
        migrations.RemoveField(
            model_name='forecastweatherdata',
            name='lon',
        ),
    ]
