from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status

from .models import Profile, List, AppWideData

from .json_handler import from_json, to_json, content_for_db, has_letter
# Create your views here.

def manage_lists(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)

    new_list_name = request.POST['list_name']
    new_list_color = request.POST['list_color']

    if new_list_color == 'del':
        #Chech if Command to delaead list: list_color = del
        List.objects.all().get(user = request.user, name=new_list_name).delete()
        return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)
    
    new_list_tag = request.POST['list_tag']

    try:
        #Code to edit an exsisting List
        new_list_content = request.POST['list_content']
        content = content_for_db(new_list_content)
        list_to_modify = List.objects.all().get(id = int(request.POST['list_id']))

        if list_to_modify.user != request.user and not request.session.get('auth', False):
            return HttpResponse("Not allowed", status=status.HTTP_403_FORBIDDEN)

        list_to_modify.tag = new_list_tag if new_list_tag != 'undefined' else list_to_modify.tag
        list_to_modify.color = new_list_color if new_list_color != 'undefined' else list_to_modify.color
        list_to_modify.content = to_json(content)

        list_to_modify.save()
        return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)

    except:
        #Code to Create a new List
        if List.objects.all().filter(user=request.user, name=new_list_name).exists():
            return HttpResponse("Already exists", status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            #Creates UnnamedListx, wehen name == ''
            if new_list_name == "":
                i, unamed_list_name = 1, "UnamedList"
                while List.objects.filter(user = request.user, name=f"{unamed_list_name}{i}.").exists():
                    i += 1
                new_list_name = f"{unamed_list_name}{i}."

            List.objects.create(user = request.user,
                                name = new_list_name,
                                tag = new_list_tag,
                                color = new_list_color).save()
            return HttpResponse("Saved", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def manage_tags(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    user_tags = from_json(Profile.objects.all().get(user = request.user).tags)
    match request.POST['action']:
        case "add":
            new_tag = request.POST['tag_name']
            if new_tag in user_tags:
                return HttpResponse("Already present", status=status.HTTP_304_NOT_MODIFIED)
            elif new_tag == 'default':
                return HttpResponse("Forbidden value", status=status.HTTP_400_BAD_REQUEST)
            elif new_tag == '':
                return HttpResponse("May not be none", status=status.HTTP_400_BAD_REQUEST)
            else:    
                user_tags.append(new_tag)
                working_entry = Profile.objects.all().get(user = request.user)
                working_entry.tags = to_json(user_tags)
                working_entry.save()
                return HttpResponse("Success", status=status.HTTP_201_CREATED)
        case "del": 
            del_tag = request.POST['tag_name']
            #user_lists = List.objects.all().filter(user=request.user)
            for list in List.objects.all().filter(user=request.user):
                if list.tag == del_tag:
                    return HttpResponse("A list withe this Tak exists!", status=status.HTTP_304_NOT_MODIFIED)
            user_tags.remove(del_tag)
            working_entry = Profile.objects.all().get(user = request.user)
            working_entry.tags = to_json(user_tags)
            working_entry.save()
            return HttpResponse("", status=status.HTTP_202_ACCEPTED)
        

        case _: pass

@login_required(login_url='login')
def manage_interactive_elements(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    relevant_list = List.objects.all().get(user=request.user, name=request.POST['list_name'])
    content = from_json(relevant_list.content)
    changes = from_json(request.POST['changes'])
    for element in changes:
        for style in content[element['id']]['style']:
            if style[0] == 'cb':
                style[1] = element['state']
    relevant_list.content = to_json(content)
    relevant_list.save()
    return HttpResponse("Done", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def get_data_for_home(request):
    user = request.user
    user_tags = Profile.objects.all().get(user=user).tags

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

def modify_account(request): 
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    
    action = request.POST['action']

    if action == 'account_creation':
        user = request.POST['user']
        invatation_code = request.POST['invatation_code']

        if User.objects.filter(username=user).exists():
            return HttpResponse("already used", status=status.HTTP_226_IM_USED)
        elif invatation_code not in from_json(AppWideData.objects.get(id=1).invatation_codes):
            return HttpResponse("not invited", status=status.HTTP_423_LOCKED)
        #At this point, all chanlanges have been passed, an the creation prosses can start 
        new_passwd = request.POST['passwd']
        
        #Check validety of username and passed
        if not has_letter(user) or not has_letter(new_passwd):
            return HttpResponse("invalid user name", status=status.HTTP_406_NOT_ACCEPTABLE)
    
        #Create user and profile
        user = User.objects.create_user(username=user, password=new_passwd)
        Profile(user=user).save()
        return HttpResponse('created', status=status.HTTP_201_CREATED)
    elif action == 'account_removal':
        User.objects.get(username=request.user).delete()
        return HttpResponse("Removed User", status=status.HTTP_202_ACCEPTED)

@login_required(login_url='login')
def list_right_managment(request):
    if request.method != 'POST':
        return HttpResponse("Post domain", status=status.HTTP_204_NO_CONTENT)
    
    list_name = request.POST['list']

    db_entry = List.objects.get(name=list_name) 
    list_public_passwd = request.POST['passwd'] if request.POST['passwd'] != 'undefined' else db_entry.public_list_passwd
    list_readonly = request.POST['readonly']#Readonly functions a as thristat, it can be False=List not public, True=Public but Readonly and Reitable=Public and editable
    

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
    user = request.user
    list_id = request.GET['li']
    if 'passwd' in request.GET:
        list_passwd = request.GET['passwd']
    else:
        list_passwd = ""
    list_object = List.objects.get(id=list_id) 
    user_is_owner = True if list_object.user_id == user.id else False
    if list_object.public_list == 'False' and not user_is_owner:
        return HttpResponse("List not public", status=status.HTTP_403_FORBIDDEN)
    if not user_is_owner and list_object.public_list_passwd != list_passwd and not request.session.get('auth', False):
        return JsonResponse({'passwd_needed': True}, status=status.HTTP_100_CONTINUE)
    
    request.session['auth'] = True

    list_data = {
        'name': list_object.name,
        'id': list_object.id,
        'content': list_object.content,
        'passwd_needed': False
    }
    if user_is_owner:
        list_data['tag_names'] = from_json(Profile.objects.get(user=user).tags)
        list_data['color'] = list_object.color
        list_data['tag'] = list_object.tag,
        list_data['is_editable'] = True
    elif list_object.public_list == 'r':
        list_data['is_editable'] = False
    elif list_object.public_list == 'rw':
        list_data['is_editable'] = True

    return JsonResponse(list_data, safe=False)
    
"""
            created_list.url = f"/q?li={created_list.id}"
            created_list.save()"
"""
def get_data_for_public_list(request):
    if request.method == 'POST':
        pass
    else:
        pass