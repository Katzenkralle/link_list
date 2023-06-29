
from django.urls import path
from .views import index, login_page, logout_page, index_no_login, index_public_lists

urlpatterns = [
    path('', index, name='index'),
    path('view', index),
    path('settings', index),
    path('q', index_public_lists),
    path('account-creation', index_no_login),
    path('login/', login_page, name='login'),
    path('logout/', logout_page, name='logout'),
]
