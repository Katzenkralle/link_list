#!/bin/bash
python manage.py makemigrations api
python manage.py migrate api

python manage.py makemigrations
python manage.py migrate