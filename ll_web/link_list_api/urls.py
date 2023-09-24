from django.urls import path
from .views import manage_lists, manage_tags, get_data_for_home, manage_interactive_elements, list_right_managment, get_large_viewer_data

urlpatterns = [
    #Path to the api, api/ is the root
    path("manageLists/", manage_lists, name="manageLists"), 
    path("manageTags/", manage_tags, name="manageTags"),
    path("getMetaHome/", get_data_for_home, name="getMetaHome"),
    path("interactiveElements/", manage_interactive_elements, name="interactiveElements"),
    path("listPublicationChanges/",list_right_managment , name="listPublicationChanges"),
    path("getDataViewerLarge/", get_large_viewer_data, name="manageLists")
]