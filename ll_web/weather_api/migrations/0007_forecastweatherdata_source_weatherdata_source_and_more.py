# Generated by Django 4.2.1 on 2023-09-24 17:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('weather_api', '0006_alter_forecastweatherdata_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='forecastweatherdata',
            name='source',
            field=models.TextField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='weatherdata',
            name='source',
            field=models.TextField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='forecastweatherdata',
            name='date',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='forecastweatherdata',
            name='time',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='weatherdata',
            name='date',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='weatherdata',
            name='time',
            field=models.IntegerField(),
        ),
    ]
