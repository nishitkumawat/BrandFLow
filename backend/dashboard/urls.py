from django.urls import path
from . import views

urlpatterns = [
    # path('employees/', views.employee_list_create_update),
    path('send-notification/', views.send_notification, name='send-notification'),
    # path('employees/list/', views.get_employees),
    # path('tasks/', views.get_tasks),
    # path('teams/', views.get_teams),
    # path('teams/create/', views.create_team),
    # path('tasks/create/', views.create_task),
    # path('data/', views.dashboard_data, name='dashboard_data'),

    # # Task endpoints
    # path('tasks/<int:task_id>/', views.get_task_details, name='task-detail'),
    # path('tasks/<int:task_id>/mark_completed/', views.mark_task_completed, name='mark-task-completed'),

    # # Checkpoint endpoints
    # path('tasks/<int:task_id>/generate_ai_checkpoints/', views.generate_checkpoints),
    # path('generate_ai_checkpoints_preview/', views.generate_ai_checkpoints_preview),
    # path('tasks/<int:task_id>/add_checkpoint/', views.add_checkpoint),
    # path('tasks/checkpoints/<int:checkpoint_id>/update/', views.update_checkpoint),
    # path('tasks/<int:task_id>/checkpoints/', views.get_task_checkpoints, name='get_task_checkpoints'),

    # # Completed tasks
    # path('completed-tasks/', views.get_completed_tasks),
    
  
    path('employees/', views.employee_list_create),
    path('teams/create/', views.team_list_create),
    path('tasks/create/', views.task_list_create),
    path('tasks/<int:task_id>/checkpoints/', views.task_list_create),  # GET task with checkpoints
    path('tasks/checkpoints/<int:checkpoint_id>/update/', views.checkpoint_update),
    path('completed-tasks/', views.completed_tasks_list),
    path('data/', views.task_list_create),  # for fetching all tasks + teams + employees
]