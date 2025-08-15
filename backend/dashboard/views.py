from datetime import timezone
from django.core.mail import send_mail, BadHeaderError, EmailMessage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import *
from django.db import transaction
import currentUser
# # --------------------
# # EMPLOYEE CRUD
# # --------------------
# @api_view(['GET', 'POST'])
# def employee_list_create_update(request):
#     current_email = currentUser.email
    
#     if request.method == 'GET':
#         employees = Employee.objects.filter(email=current_email).values()
#         return Response(list(employees))

#     elif request.method == 'POST':
#         data = request.data
#         emp_id = data.get('id')

#         if emp_id:
#             try:
#                 employee = Employee.objects.get(id=emp_id, email=current_email)
#             except Employee.DoesNotExist:
#                 return Response({'error': 'Employee not found.'}, status=404)

#             # Update fields
#             employee.name = data.get('name', employee.name)
#             employee.role = data.get('role', employee.role)
#             employee.experience = int(data.get('experience', employee.experience))
#             employee.joining_date = data.get('joining_date', employee.joining_date)
#             employee.salary = int(data.get('salary', employee.salary))
#             employee.save()

#             return Response({"message": "Employee updated successfully"}, status=200)

#         # Create employee
#         employee = Employee.objects.create(
#             name=data.get('name'),
#             role=data.get('role'),
#             experience=int(data.get('experience', 0)),
#             joining_date=data.get('joining_date'),
#             salary=int(data.get('salary')),
#             email=current_email,
#         )
#         return Response({"message": "Employee created successfully", "employee_id": employee.id}, status=201)

# # --------------------
# # EMPLOYEE / TASK / TEAM APIs
# # --------------------
# @require_http_methods(["GET"])
# def get_employees(request):
#     employees = list(Employee.objects.filter(email=currentUser.email).values("id", "name", "role", "salary"))
#     return JsonResponse({"employees": employees})

# @require_http_methods(["GET"])
# def get_tasks(request):
#     tasks = list(Task.objects.select_related("team").filter(email=currentUser.email).values(
#         "id", "title", "description", "completed", "team_id", "team__name",
#         "total_checkpoints", "completed_checkpoints"
#     ))
#     return JsonResponse({"tasks": tasks})

# @csrf_exempt
# def create_team(request):
#     if request.method == "POST":
#         data = json.loads(request.body)
#         current_email = currentUser.email
        
#         team = Team.objects.create(
#             name=data.get("name"),
#             description=data.get("description", ""),
#             email=current_email
#         )

#         # Lead
#         lead_id = data.get("lead_id")
#         if lead_id:
#             try:
#                 lead = Employee.objects.get(id=lead_id, email=current_email)
#                 team.lead = lead
#                 team.save()
#             except Employee.DoesNotExist:
#                 return JsonResponse({"error": "Lead not found"}, status=404)

#         # Members
#         member_ids = data.get("member_ids", [])
#         if member_ids:
#             members = Employee.objects.filter(id__in=member_ids, email=current_email)
#             team.members.set(members)

#         return JsonResponse({"message": "Team created successfully", "team_id": team.id}, status=201)

# def get_teams(request):
#     if request.method == "GET":
#         teams = Team.objects.filter(email=currentUser.email).select_related("lead").prefetch_related("members")
#         team_list = []
#         for team in teams:
#             team_list.append({
#                 "id": team.id,
#                 "name": team.name,
#                 "description": team.description,
#                 "lead": {"id": team.lead.id, "name": team.lead.name} if team.lead else None,
#                 "members": list(team.members.values("id", "name"))
#             })
#         return JsonResponse(team_list, safe=False)


# @csrf_exempt
# @require_http_methods(["POST"])
# @transaction.atomic
# def create_task(request):
#     print(currentUser.email)
#     data = json.loads(request.body)
#     current_email = currentUser.email  # make sure currentUser is defined

#     # Handle assigned_to safely
#     assigned_to_employee = None
#     assigned_to_identifier = data.get("assigned_to")  # could be email or username
#     if assigned_to_identifier:
#         # Try by email first
#         assigned_to_employee = Employee.objects.filter(email=assigned_to_identifier).first()
#         # If not found, try by name (optional)
#         if not assigned_to_employee:
#             assigned_to_employee = Employee.objects.filter(name=assigned_to_identifier).first()

#     # Create the task
#     task = Task.objects.create(
#         title=data.get("title"),
#         description=data.get("description", ""),
#         team_id=data.get("team_id"),
#         completed=False,
#         email=current_email,
#         assigned_to=assigned_to_employee
#     )

#     # Add checkpoints if provided
#     for cp in data.get("checkpoints", []):
#         if cp.get("title"):
#             Checkpoint.objects.create(
#                 task=task,
#                 title=cp["title"],
#                 completed=cp.get("completed", False),
#                 email=current_email
#             )

#     # Update checkpoint counts
#     task.total_checkpoints = task.checkpoints.count()
#     task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
#     task.save()

#     return JsonResponse({"message": "Task created successfully", "task_id": task.id}, status=201) 
    
# def dashboard_data(request):
#     employees = list(Employee.objects.filter(email=currentUser.email).values())
#     tasks = list(Task.objects.select_related("team").values(
#         "id", "title", "description", "completed", "team_id", "team__name",
#         "total_checkpoints", "completed_checkpoints"
#     ))
#     teams = []
#     for team in Team.objects.all().select_related("lead").prefetch_related("members"):
#         teams.append({
#             "id": team.id,
#             "name": team.name,
#             "description": team.description,
#             "lead": {"id": team.lead.id, "name": team.lead.name} if team.lead else None,
#             "members": list(team.members.values("id", "name"))
#         })

#     return JsonResponse({
#         "employees": employees,
#         "tasks": tasks,
#         "teams": teams
#     })

# # --------------------
# # CHECKPOINT APIs
# # --------------------
# @require_http_methods(["GET"])
# def get_task_checkpoints(request, task_id):
#     try:
#         task = Task.objects.get(id=task_id)
#         checkpoints = list(task.checkpoints.values("id", "title", "completed"))
#         return JsonResponse({
#             "task_id": task_id,
#             "checkpoints": checkpoints,
#             "count": len(checkpoints)
#         })
#     except Task.DoesNotExist:
#         return JsonResponse({"error": "Task not found"}, status=404)

# @require_http_methods(["GET"])
# def get_checkpoint_details(request, checkpoint_id):
#     try:
#         checkpoint = Checkpoint.objects.get(id=checkpoint_id)
#         return JsonResponse({
#             "id": checkpoint.id,
#             "title": checkpoint.title,
#             "completed": checkpoint.completed,
#             "task_id": checkpoint.task_id,
#             "created_at": checkpoint.created_at,
#             "updated_at": checkpoint.updated_at
#         })
#     except Checkpoint.DoesNotExist:
#         return JsonResponse({"error": "Checkpoint not found"}, status=404)

# @csrf_exempt
# @require_http_methods(["POST"])
# def generate_checkpoints(request, task_id):
#     try:
#         task = Task.objects.get(id=task_id)

#         # Delete existing checkpoints if you want to regenerate
#         task.checkpoints.all().delete()

#         checkpoints = [Checkpoint(task=task, title=f"Point {i}") for i in range(1, 11)]
#         Checkpoint.objects.bulk_create(checkpoints)

#         task.total_checkpoints = task.checkpoints.count()
#         task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
#         task.save()

#         return JsonResponse({
#             "message": "Checkpoints created successfully",
#             "task_id": task.id,
#             "checkpoints": list(task.checkpoints.values("id", "title", "completed"))
#         })

#     except Task.DoesNotExist:
#         return JsonResponse({"error": "Task not found"}, status=404)

# @csrf_exempt
# @require_http_methods(["POST"])
# def add_checkpoint(request, task_id):
#     data = json.loads(request.body)
#     current_email = currentUser.email

#     try:
#         task = Task.objects.get(id=task_id, email=current_email)
#     except Task.DoesNotExist:
#         return JsonResponse({"error": "Task not found"}, status=404)

#     checkpoint = Checkpoint.objects.create(
#         task=task,
#         title=data.get("title"),
#         email=current_email
#     )

#     task.total_checkpoints = task.checkpoints.count()
#     task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
#     task.save()

#     return JsonResponse({"message": "Checkpoint added successfully", "checkpoint_id": checkpoint.id})


# import json
# import traceback
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods
# from .models import Task, Checkpoint, CompletedTask


# @csrf_exempt
# @require_http_methods(["POST"])
# def update_checkpoint(request, checkpoint_id):
#     try:
#         checkpoint = Checkpoint.objects.get(id=checkpoint_id)
#         data = json.loads(request.body)

#         if "completed" not in data:
#             return JsonResponse({"error": "Completed status is required"}, status=400)

#         # Update checkpoint completion
#         checkpoint.completed = data["completed"]
#         checkpoint.save()

#         task = checkpoint.task
#         if not task:
#             return JsonResponse({"error": "Task not found for this checkpoint"}, status=404)

#         # Update checkpoint stats
#         task.total_checkpoints = task.checkpoints.count()
#         task.completed_checkpoints = task.checkpoints.filter(completed=True).count()

#         completion_percentage = task.completion_percentage()

#         if completion_percentage == 100:
#             task.completed = True
#             task.status = "Completed"
#             task.save()

#             # Copy task to CompletedTask
#             completed_task = CompletedTask.objects.create(
#                 title=task.title,
#                 description=task.description,
#                 team=task.team,
#                 email = task.email
#             )

#             response_data = {
#                 "message": "Task completed successfully!",
#                 "task_completed": True,
#                 "completed_task": {
#                     "id": completed_task.id,
#                     "title": completed_task.title,
#                     "completion_date": completed_task.completion_date
#                 }
#             }

#             # Delete original task
#             task.delete()

#             return JsonResponse(response_data)

#         else:
#             task.status = f"{completion_percentage}% Completed"
#             task.completed = False
#             task.save()

#             return JsonResponse({
#                 "message": "Checkpoint updated successfully",
#                 "task_completed": False,
#                 "task_status": {
#                     "completed": task.completed,
#                     "status": task.status,
#                     "completion_percentage": completion_percentage,
#                     "completed_checkpoints": task.completed_checkpoints,
#                     "total_checkpoints": task.total_checkpoints
#                 }
#             })

#     except Checkpoint.DoesNotExist:
#         return JsonResponse({"error": "Checkpoint not found"}, status=404)
#     except Exception as e:
#         print("ERROR in update_checkpoint:", e)
#         traceback.print_exc()
#         return JsonResponse({"error": str(e)}, status=500)



# @csrf_exempt
# @require_http_methods(["POST"])
# def generate_ai_checkpoints_preview(request):
#     try:
#         data = json.loads(request.body)
#         title = data.get("title", "")
#         description = data.get("description", "")

#         # More realistic sample checkpoints based on task details
#         checkpoints = [
#             {"title": f"Research and gather requirements for {title}"},
#             {"title": f"Create project plan for {title}"},
#             {"title": f"Design solution architecture for {title}"},
#             {"title": f"Implement core functionality for {title}"},
#             {"title": f"Develop user interface for {title}"},
#             {"title": f"Write unit tests for {title}"},
#             {"title": f"Conduct internal testing for {title}"},
#             {"title": f"Gather user feedback on {title}"},
#             {"title": f"Implement final revisions for {title}"},
#             {"title": f"Prepare deployment package for {title}"}
#         ]

#         return JsonResponse({
#             "checkpoints": checkpoints,
#             "generated_from": {
#                 "title": title,
#                 "description": description
#             }
#         })
#     except json.JSONDecodeError:
#         return JsonResponse({"error": "Invalid JSON data"}, status=400)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)
    
# @csrf_exempt
# @require_http_methods(["POST"])
# def mark_task_completed(request, task_id):
#     try:
#         with transaction.atomic():
#             task = Task.objects.get(id=task_id)
            
#             # Check if task is 100% completed
#             if task.completion_percentage == 100 and not task.is_moved_to_completed:
#                 # Create completed task record
#                 completed_task = CompletedTask.objects.create(
#                     original_task=task,
#                     title=task.title,
#                     description=task.description,
#                     team=task.team
#                 )
                
#                 # Mark original task as moved
#                 task.is_moved_to_completed = True
#                 task.save()
                
#                 return JsonResponse({
#                     "success": True,
#                     "message": "Task moved to completed tasks",
#                     "completed_task_id": completed_task.id
#                 })
            
#             return JsonResponse({
#                 "success": False,
#                 "message": "Task not ready to be marked as completed"
#             })
            
#     except Task.DoesNotExist:
#         return JsonResponse({"error": "Task not found"}, status=404)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)
    
# @require_http_methods(["GET"])
# def get_completed_tasks(request):
#     completed_tasks = CompletedTask.objects.select_related('team').filter(email=currentUser.email).values(
#         'id',
#         'title',
#         'description',
#         'completion_date',
#         'team__name'
#     )
#     return JsonResponse({
#         "completed_tasks": list(completed_tasks)
#     })
  
# import requests
# from django.http import JsonResponse
# from django.views.decorators.http import require_http_methods
# from .models import Task, CompletedTask

# GEMINI_API_KEY = "AIzaSyB-tGExkleTwNnsCXkXXSV-nBuTgfubRjA"

# def generate_short_checkpoints(task_title):
#     """
#     Calls Gemini API to generate 10 short one-line checkpoints for a task.
#     """
#     url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
#     headers = {"Content-Type": "application/json"}
#     params = {"key": GEMINI_API_KEY}

#     data = {
#         "contents": [
#             {
#                 "parts": [
#                     {
#                         "text": (
#                             f"Task: {task_title}\n"
#                             "Please provide 10 concise, one-line checkpoints to complete this task. "
#                             "Return as a numbered list, each step no longer than one line."
#                         )
#                     }
#                 ]
#             }
#         ]
#     }

#     try:
#         response = requests.post(url, headers=headers, params=params, json=data)
#         response.raise_for_status()
#         result_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
#         checkpoints = [line.strip() for line in result_text.split("\n") if line.strip()]
#         return checkpoints[:10]  # Ensure exactly 10 steps
#     except Exception as e:
#         print("Gemini API error:", e)
#         return []  # Return empty list if something fails


# @require_http_methods(["GET"])
# def get_task_details(request, task_id):
#     try:
#         # First try to find active task
#         try:
#             task = Task.objects.get(id=task_id)
#             # Get user-specific checkpoints from DB
#             checkpoints_qs = task.checkpoints.filter(email=currentUser.email)
#             if checkpoints_qs.exists():
#                 checkpoints = list(checkpoints_qs.values('id', 'title', 'completed'))
#             else:
#                 # If no checkpoints exist in DB, generate them using Gemini
#                 generated_titles = generate_short_checkpoints(task.title)
#                 checkpoints = [{"title": title, "completed": False} for title in generated_titles]

#             return JsonResponse({
#                 "id": task.id,
#                 "title": task.title,
#                 "description": task.description,
#                 "completed": task.completed,
#                 "team_id": task.team_id,
#                 "team_name": task.team.name if task.team else None,
#                 "total_checkpoints": task.total_checkpoints,
#                 "completed_checkpoints": task.completed_checkpoints,
#                 "completion_percentage": task.completion_percentage(),
#                 "checkpoints": checkpoints,
#                 "is_completed": False,
#                 "status": task.status
#             })

#         except Task.DoesNotExist:
#             # Check if task was moved to completed
#             completed_task = CompletedTask.objects.get(original_task_id=task_id)
#             return JsonResponse({
#                 "id": completed_task.original_task_id,
#                 "title": completed_task.title,
#                 "description": completed_task.description,
#                 "team_id": completed_task.team.id if completed_task.team else None,
#                 "team_name": completed_task.team.name if completed_task.team else None,
#                 "completion_date": completed_task.completion_date,
#                 "is_completed": True
#             })

#     except CompletedTask.DoesNotExist:
#         return JsonResponse({"error": "Task not found"}, status=404)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)
  
  
  
  
# BULK EMAIL
# --------------------
@api_view(['POST'])
def send_group_emails(request):
    role = request.data.get("selectedRole", "")
    min_salary = int(request.data.get("minSalary", 0))
    max_salary = int(request.data.get("maxSalary", 99999999))
    subject = request.data.get("subject", "")
    message = request.data.get("message", "")

    if not subject or not message:
        return Response({"error": "Subject and message are required."}, status=400)

    filters = {}
    if role:
        filters["role"] = role
    filters["salary__gte"] = min_salary
    filters["salary__lte"] = max_salary

    employees = Employee.objects.filter(**filters)
    emails = [e.email for e in employees]

    if not emails:
        return Response({"error": "No employees matched your filters."}, status=404)

    try:
        send_mail(
            subject,
            message,
            from_email=None,
            recipient_list=emails,
            fail_silently=False,
        )
        return Response({"success": f"Emails sent to {len(emails)} employee(s)."})
    except BadHeaderError:
        return Response({"error": "Invalid email header."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# --------------------
# NOTIFICATION
# --------------------
@csrf_exempt
def send_notification(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            role = data.get("selectedRole")
            min_salary = data.get("minSalary")
            max_salary = data.get("maxSalary")
            subject = data.get("subject", "")
            message = data.get("message", "")
            important = data.get("important", False)

            if important:
                subject = f"IMPORTANT: {subject}"

            employees = Employee.objects.all()
            if role and role != "All":
                employees = employees.filter(role=role)
            if min_salary:
                employees = employees.filter(salary__gte=min_salary)
            if max_salary:
                employees = employees.filter(salary__lte=max_salary)

            recipient_list = list(employees.values_list("email", flat=True))
            if not recipient_list:
                return JsonResponse({"error": "No recipients found"}, status=400)

            email = EmailMessage(
                subject,
                message,
                "youremail@example.com",
                recipient_list
            )
            email.send()

            return JsonResponse({"success": True, "recipients": recipient_list})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from .models import Employee
import currentUser

# Replace this with your actual logged-in user's email logic
def get_current_user_email(request):
    # For testing, you can hardcode
    return currentUser.email
    # In real scenario, use request.user.email or your auth system

@csrf_exempt
@require_http_methods(["GET", "POST"])
def employee_list_create(request):
    current_email = get_current_user_email(request)
    print(current_email)
    print("hii")
    if request.method == "GET":
        employees = Employee.objects.filter(login_email=current_email)
        data = [model_to_dict(emp) for emp in employees]
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        data = json.loads(request.body)
        emp_id = data.get("id", None)

        if emp_id:
            # Update existing employee, make sure it belongs to current user
            try:
                emp = Employee.objects.get(id=emp_id, login_email=current_email)
            except Employee.DoesNotExist:
                return JsonResponse({"error": "Employee not found"}, status=404)

            emp.name = data.get("name", emp.name)
            emp.role = data.get("role", emp.role)
            emp.experience = data.get("experience", emp.experience)
            emp.joining_date = data.get("joining_date", emp.joining_date)
            emp.salary = data.get("salary", emp.salary)
            emp.email = data.get("email", emp.email)
            emp.save()
            return JsonResponse(model_to_dict(emp))

        else:
            # Create new employee and attach current user's login_email
            emp = Employee.objects.create(
                name=data.get("name"),
                role=data.get("role"),
                experience=data.get("experience"),
                joining_date=data.get("joining_date"),
                salary=data.get("salary"),
                email=data.get("email"),
                login_email=current_email,  # important!
            )
            return JsonResponse(model_to_dict(emp))

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from .models import Employee, Team, Task, Checkpoint, CompletedTask

# -------------------- Teams --------------------
@csrf_exempt
@require_http_methods(["GET", "POST"])
def team_list_create(request):
    current_email = get_current_user_email(request)

    if request.method == "GET":
        teams = Team.objects.filter(login_email=current_email)
        data = []
        for team in teams:
            data.append({
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "lead": model_to_dict(team.lead) if team.lead else None,
                "members": [model_to_dict(m) for m in team.members.all()]
            })
        return JsonResponse({"teams": data})

    elif request.method == "POST":
        data = json.loads(request.body)
        lead_id = data.get("lead_id")
        member_ids = data.get("member_ids", [])
        lead = Employee.objects.filter(id=lead_id, login_email=current_email).first()
        team = Team.objects.create(
            name=data.get("name"),
            description=data.get("description", ""),
            lead=lead,
            login_email=current_email
        )
        members = Employee.objects.filter(id__in=member_ids, login_email=current_email)
        team.members.set(members)
        return JsonResponse({"id": team.id})
@csrf_exempt
@require_http_methods(["GET", "POST"])  # Changed to allow both GET and POST
def task_list_create(request):
    current_email = get_current_user_email(request)
    
    if request.method == "GET":
        # Your existing GET handling code
        tasks = Task.objects.filter(login_email=current_email)
        teams = Team.objects.filter(login_email=current_email)
        employees = Employee.objects.filter(login_email=current_email)
        completed_tasks = CompletedTask.objects.filter(login_email=current_email)
        
        # Process tasks with checkpoints
        task_data = []
        for task in tasks:
            checkpoints = Checkpoint.objects.filter(task=task, login_email=current_email)
            task_data.append({
                **model_to_dict(task),
                "checkpoints": [model_to_dict(cp) for cp in checkpoints],
                "completion_percentage": task.completion_percentage(),
                "team__name": task.team.name if task.team else None
            })
        
        # Process teams with members
        team_data = []
        for team in teams:
            team_data.append({
                **model_to_dict(team),
                "members": [model_to_dict(m) for m in team.members.all()],
                "lead": model_to_dict(team.lead) if team.lead else None
            })
        
        return JsonResponse({
            "tasks": task_data,
            "teams": team_data,
            "employees": [model_to_dict(emp) for emp in employees],
            "completed_tasks": [model_to_dict(ct) for ct in completed_tasks]
        })

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            if not data.get('title'):
                return JsonResponse({"error": "Task title is required"}, status=400)
            
            # Get the team (if specified)
            team = None
            if data.get('team_id'):
                team = Team.objects.filter(
                    id=data['team_id'], 
                    login_email=current_email
                ).first()
                if not team:
                    return JsonResponse({"error": "Team not found"}, status=404)
            
            # Create the task
            task = Task.objects.create(
                title=data['title'],
                description=data.get('description', ''),
                team=team,
                login_email=current_email,
                total_checkpoints=len(data.get('checkpoints', []))
            )
            
            # Create checkpoints
            checkpoints = []
            for cp in data.get('checkpoints', []):
                if cp.get('title'):  # Only create checkpoints with titles
                    checkpoint = Checkpoint.objects.create(
                        task=task,
                        title=cp['title'],
                        login_email=current_email
                    )
                    checkpoints.append(model_to_dict(checkpoint))
            
            return JsonResponse({
                "task": model_to_dict(task),
                "checkpoints": checkpoints
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
# -------------------- Checkpoints --------------------
@csrf_exempt
@require_http_methods(["POST"])
def checkpoint_update(request, checkpoint_id):
    current_email = get_current_user_email(request)
    data = json.loads(request.body)

    try:
        cp = Checkpoint.objects.get(id=checkpoint_id, login_email=current_email)
    except Checkpoint.DoesNotExist:
        return JsonResponse({"error": "Checkpoint not found"}, status=404)

    cp.completed = data.get("completed", cp.completed)
    cp.save()

    task = cp.task
    # Update task completion
    task.completed_checkpoints = task.checkpoints.filter(completed=True, login_email=current_email).count()
    if task.completed_checkpoints == task.total_checkpoints:
        # move to completed
        CompletedTask.objects.create(
            title=task.title,
            description=task.description,
            team=task.team,
            login_email=current_email
        )
        task.delete()
        return JsonResponse({"task_completed": True})

    task.save()
    return JsonResponse({
        "task_completed": False,
        "task_status": {
            "completed_checkpoints": task.completed_checkpoints,
            "completion_percentage": task.completion_percentage(),
            "status": task.status
        }
    })


# -------------------- Completed Tasks --------------------
@csrf_exempt
@require_http_methods(["GET"])
def completed_tasks_list(request):
    current_email = get_current_user_email(request)
    completed_tasks = CompletedTask.objects.filter(login_email=current_email)
    data = [model_to_dict(task) for task in completed_tasks]
    return JsonResponse({"completed_tasks": data})
