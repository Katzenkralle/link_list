
from django.urls import path
from .views import index, login_page, logout_page, index_no_login, large_viewer

urlpatterns = [
    #Path to the frontend, frontend/ is the root
    path('linkList', index),
    path('view', index),
    path('', index, name='index'),
    path('qLinkList', large_viewer),
    path('settings', index),
    path('account-creation', index_no_login),
    path('login/', login_page, name='login'),
    path('logout/', logout_page, name='logout'),

    path('weather', index),
    path('asciiColor', index),
    path('durak', index_no_login)
]
