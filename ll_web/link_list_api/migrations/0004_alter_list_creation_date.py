# Generated by Django 4.2.1 on 2023-09-23 21:55

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('link_list_api', '0003_alter_list_creation_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='list',
            name='creation_date',
            field=models.DateTimeField(default=datetime.datetime(2023, 9, 23, 23, 55, 38, 728081)),
        ),
    ]
