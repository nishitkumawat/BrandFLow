from django.urls import path
from . import views

urlpatterns = [
    path('send-notification/', views.send_notification, name='send-notification'),
    path('clients/', views.client_management),
    path('employees/', views.employee_list_create),
    path('teams/create/', views.team_list_create),
    path('tasks/create/', views.task_list_create),  # For listing and creating tasks
    path('tasks/<int:task_id>/', views.task_detail),  # For individual task operations
    path('tasks/<int:task_id>/checkpoints/', views.task_checkpoints),  # For task checkpoints
    path('tasks/checkpoints/<int:checkpoint_id>/update/', views.checkpoint_update),
    path('completed-tasks/', views.completed_tasks_list),
    path('data/', views.task_list_create),  # for fetching all tasks + teams + employees
    path("budget-summary/", views.budget_summary, name="get_budget_status"),
    path("budget-update/", views.budget_update, name="update_budget"),
    
     path("dashboard/", views.dashboard_summary, name="dashboard-summary"),
    path("get-clients/", views.get_clients, name="get-clients"),
    path("get-employees/", views.get_employees, name="get-employees"),
    path("get-teams/", views.get_teams, name="get-teams"),
    
]