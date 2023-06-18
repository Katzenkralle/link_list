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
RUN bash migrate_changes.sh



#Start App
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]

