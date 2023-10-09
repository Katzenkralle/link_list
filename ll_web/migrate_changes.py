"""
migrate_changes
#!/bin/bash
python manage.py makemigrations api
python manage.py migrate api

python manage.py makemigrations
python manage.py migrate

"""
import subprocess
mange_py = ['python', 'manage.py']
subprocess.run(mange_py + ['makemigrations', 'link_list_api'])
subprocess.run(mange_py + ['migrate', 'link_list_api'])
subprocess.run(mange_py + ['makemigrations', 'other_api' ])
subprocess.run(mange_py + ['migrate', 'other_api'])
subprocess.run(mange_py + ['makemigrations', 'weather_api'])
subprocess.run(mange_py + ['migrate', 'weather_api'])
subprocess.run(mange_py + ['makemigrations'])
subprocess.run(mange_py + ['migrate'])

try:
    if input("Create new Superuser?(1)") == str(1):
        subprocess.run(mange_py + ['createsuperuser']) 
except:
    print("No Superuser created")