from django.urls import path
from authentication.views import *

urlpatterns = [
    path('login/', loginUser,name='login'),
    path('signup/', signupUser,name='signup'),
    path("company/", company_view, name="company_list_create"),  # GET (all), POST
    path("company/<int:company_id>/", company_view, name="company_detail"),  # GET single, PUT/PATCH
]
