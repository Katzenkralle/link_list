#!/bin/bash
cd /
python ll_web/manage.py cronloop &
#python ll_web/manage.py runserver 0.0.0.0:8000 --insecure 
gunicorn --bind 127.0.0.1:8000  ll_web.wsgi:application --pythonpath ll_web &
nginx -g "daemon off;"