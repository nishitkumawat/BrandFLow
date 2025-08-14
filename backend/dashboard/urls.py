from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.employee_list_create_update),
    path('send-notification/', views.send_notification, name='send-notification'),
    path('employees/list/', views.get_employees),
    path('tasks/', views.get_tasks),
    path('teams/', views.get_teams),
    path('teams/create/', views.create_team),
    path('tasks/create/', views.create_task),
    path('data/', views.dashboard_data, name='dashboard_data'),

    # ✅ Checkpoint endpoints
    path('tasks/<int:task_id>/generate_ai_checkpoints/', views.generate_checkpoints),  # For existing task
    path('generate_ai_checkpoints_preview/', views.generate_ai_checkpoints_preview),   # For before task creation
    path('tasks/<int:task_id>/add_checkpoint/', views.add_checkpoint),
    path('tasks/checkpoints/<int:checkpoint_id>/update/', views.update_checkpoint),
    path('tasks/<int:task_id>/checkpoints/', views.get_task_checkpoints, name='get_task_checkpoints'),
]
