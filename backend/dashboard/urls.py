from django.urls import path
from .views import employee_list_create

urlpatterns = [
    path('employees/', employee_list_create),
]
