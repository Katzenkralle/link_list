FROM python:latest

#Copy App:
RUN mkdir /LinkList
COPY ll_web /LinkList

#Installing dependencys ||: for ignoring any errors
RUN apt-get update || : && apt install npm nginx -y

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /LinkList/frontend
RUN npm i
WORKDIR /LinkList
RUN pip install -r requirements.txt


#Setup
VOLUME /LinkList/data
RUN python3 migrate_changes.py



#Start App
CMD ["bash","kickoff.sh"]

