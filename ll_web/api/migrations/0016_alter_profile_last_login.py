# Generated by Django 4.2 on 2023-04-21 15:26

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_alter_profile_last_login'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='last_login',
            field=models.DateTimeField(default=datetime.datetime(2023, 4, 21, 17, 26, 2, 905646)),
        ),
    ]