from django.urls import path
from .views import Lobby, Game

urlpatterns = [
    #Path to the api, api/ is the root
    path("lobbyManager/", Lobby.as_view(), name="lobbyManager"),
    path("gameManager/", Game.as_view(), name="gameManager"),
]
