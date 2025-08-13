from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('employees/', employee_list_create_update),
    path("send-notification/", send_notification, name="send-notification"),
     path("employees/", views.get_employees),
    path("tasks/", views.get_tasks),
    path("teams/", views.get_teams),
    path("teams/create/", views.create_team),
    path("tasks/create/", views.create_task),
    path("data/", views.dashboard_data, name="dashboard_data")
    ]
