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
subprocess.run(mange_py + ['makemigrations', 'api'])
subprocess.run(mange_py + ['migrate', 'api'])
subprocess.run(mange_py + ['makemigrations', ])
subprocess.run(mange_py + ['migrate',])

"""
if input("Create new Superuser?(1)") == str(1):
    subprocess.run(mange_py + ['createsuperuser']) 
    """