# Generated by Django 4.2 on 2023-06-17 20:09

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_appwidedata_alter_profile_last_login'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='last_login',
            field=models.DateTimeField(default=datetime.datetime(2023, 6, 17, 22, 9, 35, 634094)),
        ),
    ]
