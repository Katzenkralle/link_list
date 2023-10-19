FROM python:latest

#Copy App:
RUN mkdir /ll_web
COPY ll_web /ll_web

#Installing dependencys ||: for ignoring any errors
RUN apt-get update || : && apt install npm nginx cron -y

WORKDIR /ll_web/frontend
RUN npm i
RUN npm run build
WORKDIR /ll_web
RUN pip install -r requirements.txt

#Setup LL_WEB
VOLUME /ll_web/data
ENV RUN_IN_DEBUG="0"
RUN python3 migrate_changes.py
RUN python3 manage.py collectstatic --noinput
#Setup Nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN chmod -R o+rx /ll_web/ && chmod -R o+rx /ll_web/frontend/ && chmod -R o+rx /ll_web/frontend/static/

#Start App
CMD ["bash","kickoff.sh"]

