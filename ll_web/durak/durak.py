from random import randint
class Room():
    existing_rooms = {}

    def __init__(self, creator) -> None:
        self.__players = [creator]
        self.__playing = False
        self.__settings = {
            "maxPlayers": 2,
            "decks_to_use": 3,
            "push": "on",
        }
        self.__settings_locked = False
        e = True
        while e:
            self.__room_id = str(randint(1, 9999)).zfill(4)
            e = self.__room_id in Room.existing_rooms.keys()
        Room.existing_rooms[self.__room_id] = self

    def updateSettings(self, settings):
        if self.__settings_locked:
            return False
        self.__settings.update(settings)
        return True
    
    def toggleLockSettings(self):
        self.__settings_locked = not self.__settings_locked
        return self.__settings_locked
    
    def addPlayer(self, player):
        if len(self.__players) >= self.__settings["maxPlayers"]:
            return False
        self.__players.append(player)
        return True
    
    def removePlayer(self, player):
        if player in self.__players:
            self.__players.remove(player)
            return True
        return False
    
    def getInfo(self):
        return {
            "players": self.__players,
            "room_id": self.__room_id,
            "playing": self.__playing,
            "settings": self.__settings,
            "settings_locked": self.__settings_locked,
        }

    
    def close(self):
        Room.existing_rooms.remove(self.__room_id)
        del self