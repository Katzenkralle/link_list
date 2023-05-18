from django.urls import path
from .views import create_list, manage_tags, get_data_for_home

urlpatterns = [
    path("createList/", create_list, name="createList"),
    path("manageTags/", manage_tags, name="manageTags"),
    path("getMetaHome/", get_data_for_home, name="getMetaHome")
]
