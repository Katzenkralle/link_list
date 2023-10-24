from django.urls import path
from .views import imgToAscii

urlpatterns = [
    path("imgToAscii/", imgToAscii.as_view(), name="weatherData")
]
