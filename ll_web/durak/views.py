from django.shortcuts import render
from django.views import View
from django.http import JsonResponse, HttpResponse

from .serializers import DurakActiveRoomSerializer
from .durak import Room

from json import loads, dumps

class Lobby(View):
   
    def get(self, request):
        user = request.user
        user_session = request.session
        room_id = request.GET.get("joiningRoomId", "create")
        guest_name = request.GET.get("guestName", "")
        am_i_anonymous = request.GET.get("amIAnonymous", False)
        if am_i_anonymous:
            return JsonResponse({"state": "success", "result": not user.is_authenticated})

        if room_id and room_id != "create":
            if room_id in Room.existing_rooms.keys():
                room = Room.existing_rooms[room_id]
                if not user.is_authenticated and not guest_name:
                    return JsonResponse({"state": "reqestName"})
                
                done = room.addPlayer(guest_name if not user.is_authenticated else user.username)
                if not done:
                    return JsonResponse({"state": "Room is full"})
                
        else:
            if not user.is_authenticated:
                return JsonResponse({"state": "User is not authenticated"})
            room = Room(user.username)

            serialized = DurakActiveRoomSerializer(data={**room.getInfo(), "user": user.id})
            if serialized.is_valid():
                serialized.save()
            else:
                print("Error: ", serialized.errors)

        response_content ={"state": "success", "room_info": room.getInfo()}
        return JsonResponse(response_content, safe=False)


    def post(self, request):
        pass




class Game(View):
    def post(self, request):
        pass
    
    
    def get(self, request):
        pass