from django.urls import path
from authentication.views import *

urlpatterns = [
    path('login/', loginUser,name='login'),
    path('signup/', signupUser,name='signup'),
]
