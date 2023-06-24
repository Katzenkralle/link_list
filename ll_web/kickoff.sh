#!/bin/bash
gunicorn --bind 0.0.0.0:8000 --daemon ll_web.wsgi:application 
nginx -g 'daemon off;'
