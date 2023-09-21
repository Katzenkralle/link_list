from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status

from .models import LinkListProfile, List
from other_api.models import AppWideData

from .json_handler import content_for_db
from hashlib import sha256

from json import loads as from_json
from json import dumps as to_json

#TODO: rewrite to class based views
#TODO: look into decorators
#TODO: add json example to docstrings

def manage_lists(request):
    #Login not required, because the user can be authed by get_large_viewer_data --> Safty untested!!!
    #Checks if the request is a POST request, if not, return 204
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)

    #Get list name and color from the request
    #TODO: Rename variables
    new_list_name = request.POST['list_name']
    new_list_color = request.POST['list_color']

    if new_list_color == 'del':
        #Code to delete a list, works if the user is the owner, from frontend instead of color
        List.objects.all().get(user = request.user, name=new_list_name).delete()
        return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)
    
    #Get list tag from the request
    #Separate from the other, because when deleting a list, the tag is not needed
    new_list_tag = request.POST['list_tag']

    try:
        #Code to modify a list
        #Get list content from the request and convert it to a list of dicts
        new_list_content = request.POST['list_content']
        content = content_for_db(new_list_content)

        #Get the list to modify from the database expectet to fail wehen creating a new list
        list_to_modify = List.objects.all().get(id = int(request.POST['list_id']))

        #Check if the user is the owner of the list, or is authed by get_large_viewer_data
        if list_to_modify.user != request.user and not request.session.get('auth', False) == request.user.username + list_to_modify.id:
            return HttpResponse("Not allowed", status=status.HTTP_403_FORBIDDEN)

        #Update the list, 'undefined' can be sent when using the large viewer and not beening the owner, then the values are not changed 
        list_to_modify.tag = new_list_tag if new_list_tag != 'undefined' else list_to_modify.tag
        list_to_modify.color = new_list_color if new_list_color != 'undefined' else list_to_modify.color
        list_to_modify.content = to_json(content)

        list_to_modify.save()
        return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)

    except:
        #Create a new list
        #Check if the list name is already used
        if List.objects.all().filter(user=request.user, name=new_list_name).exists():
            return HttpResponse("Already exists", status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            #Check if the list name is empty, if so, generate a unused name
            if new_list_name == "":
                i, unamed_list_name = 1, "UnamedList"
                while List.objects.filter(user = request.user, name=f"{unamed_list_name}{i}.").exists():
                    #While the name is already used, increment the number
                    i += 1
                new_list_name = f"{unamed_list_name}{i}."

            #Create the new list
            List.objects.create(user = request.user,
                                name = new_list_name,
                                tag = new_list_tag,
                                color = new_list_color).save()
            return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def manage_tags(request):
    #Checks if the request is a POST request, if not, return 204
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    #Get all existing tags of the user from the database
    user = LinkListProfile.objects.all().get(user = request.user)
    user_tags = from_json(user.tags)
    match request.POST['action']:
        #Check if the action is add or del, if not, return 400
        case "add":
            #Get the new tag from the request, if valid, add it to the list of tags
            new_tag = request.POST['tag_name']
            if new_tag in user_tags:
                return HttpResponse("Already present", status=status.HTTP_304_NOT_MODIFIED)
            elif new_tag == 'default':
                return HttpResponse("Forbidden value", status=status.HTTP_400_BAD_REQUEST)
            elif new_tag == '':
                return HttpResponse("May not be none", status=status.HTTP_400_BAD_REQUEST)
            else:    
                user_tags.append(new_tag)
        case "del": 
            #Get the tag to delete from the request, if no list with this tag exists, delete it from the list of tags
            del_tag = request.POST['tag_name']
            for list in List.objects.all().filter(user=request.user):
                if list.tag == del_tag:
                    return HttpResponse("A list withe this Tak exists!", status=status.HTTP_304_NOT_MODIFIED)
            user_tags.remove(del_tag)
        case _: return HttpResponse("Bad request", status=status.HTTP_400_BAD_REQUEST)
    
    user.tags = to_json(user_tags)
    user.save()
    return HttpResponse("", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def manage_interactive_elements(request):
    #Checks if the request is a POST request, if not, return 204
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    #Get the list to modify from the database and convert its content to a list of dicts
    relevant_list = List.objects.all().get(user=request.user, name=request.POST['list_name'])
    content = from_json(relevant_list.content)
    changes = from_json(request.POST['changes'])
    #Iterate over all changes and apply them to the content (only for interactive elements)
    for element in changes:
        for style in content[element['id']]['style']:
            if style[0] == 'cb':
                style[1] = element['state']
    relevant_list.content = to_json(content)
    relevant_list.save()
    return HttpResponse("Done", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def get_data_for_home(request):
    #Get all tags of the user from the database and convert them to a list metaTags
    #Get all lists of the user and their content from the database and convert them to a list metaLists
    #Also send the username of the user
    user = request.user
    user_tags = LinkListProfile.objects.all().get(user=user).tags

    user_list = []
    user_list_objects = List.objects.all().filter(user = user)
    for object in user_list_objects:
        user_list.append({'name': object.name, 
                          'id': object.id,
                          'color': object.color,
                          'tag': object.tag,
                          'content': object.content,
                          'owner': object.user.username,
                          'url': object.url,
                          'creation_date': object.creation_date.strftime("%d %B %Y"),
                          'is_public': object.public_list,
                          'has_passwd': object.public_list_passwd != ''})
    return JsonResponse({'metaTags': user_tags, 'metaLists': to_json(user_list), 'metaUser': to_json({'name': user.username})}, safe=False)

@login_required(login_url='login')
def list_right_managment(request):
    #Checks if the request is a POST request, if not, return 204
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    #Get the list to modify the public rights from the database
    list_name = request.POST['list']

    #Check if passwd is set, if not, set it to the current passwd, can be none when updating readonly status
    db_entry = List.objects.get(name=list_name) 
    list_public_passwd = sha256(request.POST['passwd']).hexdigest() if request.POST['passwd'] != 'undefined' else db_entry.public_list_passwd
    list_readonly = request.POST['readonly']#Readonly functions a as thristat, it can be False=List not public, True=Public but Readonly and Reitable=Public and editable
    
    #save the changes to the database, create a url for the list and return 202
    if list_readonly == 'false':
        db_entry.url = ''
        db_entry.public_list = 'False'
        db_entry.public_list_passwd = ''
    elif list_readonly == 'true':
        db_entry.public_list = "r"
        db_entry.public_list_passwd = list_public_passwd
    elif list_readonly == 'writable':
        db_entry.public_list = 'rw'
        db_entry.public_list_passwd = list_public_passwd
    db_entry.url = f"/q?li={db_entry.id}"
    db_entry.save()
    return HttpResponse("Done", status=status.HTTP_202_ACCEPTED)

def get_large_viewer_data(request):
    #User can be a guest, so no login required
    #Get list id, passwd if set (default = ''), from url (because get request)
    user = request.user
    list_id = request.GET['li']
    list_passwd = request.session.get('passwd', '')

    #Get requested list from the database, check if the user is the owner or the list is public then passwd must match, when non set '' in DB matches with default
    list_object = List.objects.get(id=list_id) 
    user_is_owner = True if list_object.user_id == user.id else False
    if list_object.public_list == 'False' and not user_is_owner:
        return HttpResponse("List not public", status=status.HTTP_403_FORBIDDEN)
    if not user_is_owner and list_object.public_list_passwd != sha256(list_passwd.encode('utf-8')).hexdigest() and not request.session.get('auth', False) == user.username + list_id:
        return JsonResponse({'passwd_needed': True}, status=status.HTTP_100_CONTINUE)
    
    #Set auth for this session to the username and list id, so the user can view the list without reentering passwd
    request.session['auth'] = user.username + list_id

    #Return the data of the list, with the rights the user has
    list_data = {
        'name': list_object.name,
        'id': list_object.id,
        'content': list_object.content,
        'passwd_needed': False
    }
    if user_is_owner:
        list_data['tag_names'] = from_json(LinkListProfile.objects.get(user=user).tags)
        list_data['color'] = list_object.color
        list_data['tag'] = list_object.tag,
        list_data['is_editable'] = True
    elif list_object.public_list == 'r':
        list_data['is_editable'] = False
    elif list_object.public_list == 'rw':
        list_data['is_editable'] = True

    return JsonResponse(list_data, safe=False)
    
