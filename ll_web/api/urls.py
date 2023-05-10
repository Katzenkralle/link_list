from django.urls import path
from .views import create_list

urlpatterns = [
    path("api/createList/", create_list, name="createList"),
]
