
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from universities.models import University

for u in University.objects.all():
    print(f"ID: {u.id} | Name: {u.name} | City: {u.city} | Lat: {u.latitude} | Lon: {u.longitude}")
