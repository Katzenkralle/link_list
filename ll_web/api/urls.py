from django.urls import path
from .views import manage_lists, manage_tags, get_data_for_home, modify_account, manage_interactive_elements

urlpatterns = [
    path("manageLists/", manage_lists, name="manageLists"),
    path("manageTags/", manage_tags, name="manageTags"),
    path("getMetaHome/", get_data_for_home, name="getMetaHome"),
    path("accountCreation/", modify_account, name="accountCreation"),
    path("interactiveElements/", manage_interactive_elements, name="interactiveElements")
]
