FROM python:latest

#Copy App:
RUN mkdir /LinkList
COPY ll_web /LinkList

#Installing dependencys ||: for ignoring any errors
RUN apt-get update || : && apt install npm -y

WORKDIR /LinkList/frontend
RUN npm i
WORKDIR /LinkList
RUN pip install -r requirements.txt


#Setup
VOLUME /LinkList/data
ENV SECRET_KEY=ONLYFORBUILD
ENV ALLOWED_HOSTS=127.0.0.1
ENV RUN_IN_DEBUG=False
ENV CSRF_TRUSTED_ORIGINS=http://127.0.0.1;
RUN python3 migrate_changes.py



#Start App
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]

