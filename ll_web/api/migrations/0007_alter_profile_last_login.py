# Generated by Django 4.2 on 2023-04-20 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_profile_last_login'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='last_login',
            field=models.DateTimeField(default=1681974598.847852),
        ),
    ]