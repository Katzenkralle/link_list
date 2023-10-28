from django.urls import path
from .views import Lists, ListContent, ListProfileManager, auth_guest
from .media_content_views import SaveMedia, GetMedia

urlpatterns = [
    #Path to the api, api/ is the root
    path("lists/", Lists.as_view(), name="lists"),
    path("listContent/", ListContent.as_view(), name="listContent"),
    path("listProfileManager/", ListProfileManager.as_view(), name="listProfileManager"),

    path("authGuest/", auth_guest, name="authGuest"),

    path("saveMedia/", SaveMedia.as_view(), name="saveMedia"),
    path("mediaContent/", GetMedia.as_view(), name="mediaContent")
]
