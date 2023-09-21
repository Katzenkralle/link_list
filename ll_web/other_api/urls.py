from django.urls import path
from .views import modify_account

urlpatterns = [
    path("accountCreation/", modify_account, name="accountCreation"),
]
