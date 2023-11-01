from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.utils import timezone

from .models import LinkListProfile, List, Media
from .serializers import ListSerializer

from .json_handler import ListTransformer
from hashlib import sha256

from json import loads as from_json
from json import dumps as to_json

def check_permissions(user, list_id, session_auth, wants_editing):
        try:
            list = List.objects.get(id=list_id)
        except List.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)
        
        if list.user == user:
            return True

        try:
            if list.public_list != "false":
                if not list.public_list_passwd or \
                    session_auth.get(list_id, '') == list.public_list_passwd:
                    
                    if wants_editing and list.public_list != "rw":
                        raise PermissionError("List is read only")
                    return True
                
                raise PermissionError("Wrong password")
            
            raise PermissionError("List is private")
        
        except PermissionError as e:
            return False


@method_decorator(login_required, name='dispatch')
class Lists(APIView):
    @staticmethod
    def list_passwd_hash(list_passwd):
        return sha256(list_passwd.encode('utf-8')).hexdigest()

    def get(self, request, *args, **kwargs):
        self.user = request.user

        user_tags = from_json(LinkListProfile.objects.get(user=self.user).tags)
        
        lists = List.objects.filter(user=self.user)
        serializedLists = ListSerializer(lists, many=True, exclude_fields=["content"]).data
        for json, db  in zip(serializedLists, lists):
            json['public_list_passwd'] = True if db.public_list_passwd else False
            json['owner'] = db.user.username
            json['creation_date'] = timezone.localtime(db.creation_date).strftime("%d.%m.%Y %H:%M")
        return JsonResponse({"metaLists": serializedLists, "metaTags": user_tags, "setMetaUser": self.user.username }, safe=False)
    
    def post(self, request, *args, **kwargs):
        self.user = request.user
        self.id = request.POST.get('id', None)
        self.name = request.POST.get('name', '')
        self.color = request.POST.get('color', None)
        self.tag = request.POST.get('tag', None)
        self.public_read_only = request.POST.get('read_only', None)
        self.public_list_passwd = request.POST.get('passwd', None)

        self.name = self.generate_unused_name() if self.name == "" else self.name

        if self.id:
            self.update_list()
            return HttpResponse(status=status.HTTP_202_ACCEPTED)
        else:
            self.create_list()
            return HttpResponse(status=status.HTTP_201_CREATED)

    def generate_unused_name(self):
        i, unamed_list_name = 1, "UnamedList"
        while List.objects.filter(user=self.user, name=f"{unamed_list_name}{i}").exists():
        # While the name is already used, increment the number
            i += 1
        return f"{unamed_list_name}{i}"

    def handel_publication(self):
        self.list.public_list = 'r' if self.public_read_only == 'true' else self.public_read_only 
        
        if self.public_list_passwd != '':
            self.list.public_list_passwd = self.list_passwd_hash(self.public_list_passwd) if self.public_list_passwd != 'undefined' \
                                    else self.list.public_list_passwd
        else:
            self.list.public_list_passwd = ''
        
        if self.list.public_list != "false":
            self.list.url = f"/qLinkList?li={self.list.id}"
        else:
            self.list.url = ""
        return

    def update_list(self):
        #Update existing list
        try:
            self.list = List.objects.get(id=self.id, user=self.user)
        except List.DoesNotExist:
            return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

        if self.color == "del":
            for embeded_element in ListContent.get_embeded_locals(from_json(self.list.content)):
                ListContent.remove_list_refrence(embeded_element, self.list.id)
            self.list.delete()
            return HttpResponse(status=status.HTTP_202_ACCEPTED)

        self.list.name = self.name
        self.list.color = self.color 
        self.list.tag = self.tag 
        
        if self.public_read_only != None:
            self.handel_publication()
        self.list.save()
        return
    
    def create_list(self):
        #Create new list
        list = List.objects.create(name=self.name, color=self.color, tag=self.tag, user=self.user)
        list.save()
        return

class ListContent(APIView):
    def get(self, request):
        self.user = request.user
        self.id = request.GET.get('id', None)
        self.session_auth = request.session.get('auth', {})

        if not check_permissions(self.user, self.id, self.session_auth, False):
            return HttpResponse(status=status.HTTP_403_FORBIDDEN)
        
        list = List.objects.get(id=self.id)
        content = ListSerializer(list, exclude_fields=["url", "creation_date", "public_list"]).data

        if list.user == self.user:
            content["tagsOfOwner"] = from_json(LinkListProfile.objects.get(user=self.user).tags)

        return JsonResponse(content, safe=False)
    
    def post(self, request):
        self.user = request.user
        self.id = request.POST.get('id', None)
        self.session_auth = request.session.get('auth', {})
        self.content = request.POST.get('content', None)
        self.interactive_changes = request.POST.get('interactive_changes', False)

        if not check_permissions(self.user, self.id, self.session_auth, True):
            return HttpResponse(status=status.HTTP_403_FORBIDDEN)

        self.list = List.objects.get(id=self.id)
        if self.interactive_changes:
            save_msg = self.change_interactive_elements()        
        else:
            save_msg = self.change_content()
        
        if save_msg:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
        return HttpResponse(status=status.HTTP_202_ACCEPTED)

    @staticmethod
    def get_embeded_locals(content):
        return [e['embeded_locals'] for e in content if e.get('embeded_locals', '') != '']

    @staticmethod
    def remove_list_refrence(embeded_element, list_id):
        try:
            media = Media.objects.get(id=embeded_element)
            used_in  = from_json(media.used_in_list)
            used_in.remove(list_id)
            media.used_in_list = to_json(used_in)
            media.save()
        except (ValueError, Media.DoesNotExist):
            pass
        return
    
    @staticmethod
    def add_list_refrence(embeded_element, list_id):
        media = Media.objects.filter(id=embeded_element)
        if media.exists():
            media = media.first()
            #This needs to be so long and ugly because for some obscure reason it wont work otherwise...
            used_in = from_json(media.used_in_list)
            this = list_id

            if this not in used_in:
                used_in.append(this) 
                media.used_in_list = to_json(used_in)
                media.save()
        return


    def change_interactive_elements(self):
        content = from_json(self.list.content)

        for element in from_json(self.interactive_changes):
            for style in content[element['id']]['style']:
                
                if style[0] == 'cb':
                    style[1] = element['state']

        self.list.content = to_json(content)
        self.list.save()
        return

    def change_content(self):
        
        new_json_list_content = ListTransformer(self.content).content_for_db()
        new_embeded_locals = self.get_embeded_locals(new_json_list_content)

        try:
            for embeded_local in new_embeded_locals:
                if self.id in str(from_json(Media.objects.get(id=embeded_local).used_in_list))\
                    or Media.objects.get(id=int(embeded_local)).user == self.user:
                    continue
                else:
                    raise PermissionError("Not premited to use media")
        except (PermissionError, Media.DoesNotExist) as e:
            return "could not save media refrences"
        
        for historic_embeded_local in self.get_embeded_locals(from_json(self.list.content)):
            if historic_embeded_local not in new_embeded_locals:
                self.remove_list_refrence(historic_embeded_local, self.list.id)
        
        for new_embeded_local in new_embeded_locals:
            self.add_list_refrence(new_embeded_local, self.list.id)        
    
        self.list.content = to_json(new_json_list_content)

        self.list.save()
        return


@method_decorator(login_required, name='dispatch')
class ListProfileManager(APIView):

    def tag_editor(self):
        existing_tags = from_json(self.user_profile.tags)
        alphanum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        
        match self.action:
            case "add":
                if self.tag in existing_tags or self.tag == "" or not bool(set(alphanum) & set(self.tag)):
                    #bool(set(alphanum) & set(self.tag)) checks if the tag contains at least one alphanumeric character
                    return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
                existing_tags.append(self.tag)
            
            case "del":
                if self.tag not in existing_tags or self.tag == "Default":
                    return HttpResponse(status=status.HTTP_406_NOT_ACCEPTABLE)
                existing_tags.remove(self.tag)

            case _: return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
        
        self.user_profile.tags = to_json(existing_tags)
        self.user_profile.save()
        return

    def post(self, request):
        self.user = request.user
        self.user_profile = LinkListProfile.objects.get(user=self.user)
        mode = request.POST.get('mode', None)

        match mode:
            case "tag":
                self.action = request.POST.get('action', None)
                self.tag = request.POST.get('tag', None)
                self.tag_editor()
            
            case _: return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

        return HttpResponse(status=status.HTTP_202_ACCEPTED)

def auth_guest(request):
    user = request.user
    list_id = request.POST.get('id', None)
    list_passwd = request.POST.get('passwd', None)

    session_auth = request.session.get('auth', {})

    try:
        list = List.objects.get(id=list_id)
    except List.DoesNotExist:
        return HttpResponse(status=status.HTTP_404_NOT_FOUND)
    if check_permissions(user, list_id, session_auth, False):
        pass

    elif Lists.list_passwd_hash(list_passwd) == list.public_list_passwd:
        session_auth[list_id] = Lists.list_passwd_hash(list_passwd)
        request.session['auth'] = session_auth

    else:
        return HttpResponse(status=status.HTTP_403_FORBIDDEN)
    
    content=list.public_list if user != list.user else "rw" 

    return HttpResponse(status=status.HTTP_202_ACCEPTED, content=content)