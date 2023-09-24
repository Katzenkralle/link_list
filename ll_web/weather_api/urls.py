from django.urls import path
from .views import Data, Settings

urlpatterns = [
    path("data/", Data.as_view(), name="accountCreation"),
    path("settings/", Settings.as_view(), name="accountCreation"),
]
