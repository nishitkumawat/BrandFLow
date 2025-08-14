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

# --------------------
# EMPLOYEE CRUD
# --------------------
@api_view(['GET', 'POST'])
def employee_list_create_update(request):
    if request.method == 'GET':
        employees = Employee.objects.all().values()
        return Response(list(employees))

    elif request.method == 'POST':
        data = request.data
        emp_id = data.get('id')

        # Update case
        if emp_id:
            try:
                employee = Employee.objects.get(id=emp_id)
            except Employee.DoesNotExist:
                return Response({'error': 'Employee not found.'}, status=404)

            unchanged = (
                employee.name == data.get('name') and
                employee.role == data.get('role') and
                employee.experience == int(data.get('experience', 0)) and
                str(employee.joining_date) == data.get('joining_date') and
                employee.salary == int(data.get('salary')) and
                employee.email == data.get('email')
            )

            if unchanged:
                return Response({'message': 'No fields were changed.'}, status=200)

            employee.name = data.get('name')
            employee.role = data.get('role')
            employee.experience = int(data.get('experience', 0))
            employee.joining_date = data.get('joining_date')
            employee.salary = int(data.get('salary'))
            employee.email = data.get('email')
            employee.save()

            return Response({
                "message": "Employee updated successfully.",
                "employee": {
                    "id": employee.id,
                    "name": employee.name,
                    "role": employee.role,
                    "experience": employee.experience,
                    "joining_date": str(employee.joining_date),
                    "salary": employee.salary,
                    "email": employee.email
                }
            }, status=200)

        # Create case
        try:
            employee = Employee.objects.create(
                name=data.get('name'),
                role=data.get('role'),
                experience=int(data.get('experience', 0)),
                joining_date=data.get('joining_date'),
                salary=int(data.get('salary')),
                email=data.get('email'),
            )

            try:
                send_mail(
                    subject='Welcome to the Company!',
                    message=f"Hello {employee.name},\n\nYou have been successfully added as a {employee.role}.",
                    from_email=None,
                    recipient_list=[employee.email],
                    fail_silently=False,
                )
            except BadHeaderError:
                return Response({"error": "Invalid email header found."}, status=400)
            except Exception as e:
                return Response({"error": f"Email failed: {str(e)}"}, status=400)

            return Response({
                "message": "Employee created successfully.",
                "employee": {
                    "id": employee.id,
                    "name": employee.name,
                    "role": employee.role,
                    "experience": employee.experience,
                    "joining_date": str(employee.joining_date),
                    "salary": employee.salary,
                    "email": employee.email
                }
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

# --------------------
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

# --------------------
# EMPLOYEE / TASK / TEAM APIs
# --------------------
@require_http_methods(["GET"])
def get_employees(request):
    employees = list(Employee.objects.values("id", "name", "role", "salary"))
    return JsonResponse({"employees": employees})

@require_http_methods(["GET"])
def get_tasks(request):
    tasks = list(Task.objects.select_related("team").values(
        "id", "title", "description", "completed", "team_id", "team__name",
        "total_checkpoints", "completed_checkpoints"
    ))
    return JsonResponse({"tasks": tasks})

@csrf_exempt
def create_team(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            name = data.get("name")
            description = data.get("description")
            lead_id = data.get("lead_id")
            member_ids = data.get("member_ids", [])

            if not name:
                return JsonResponse({"error": "Team name is required"}, status=400)

            team = Team.objects.create(name=name, description=description or "")

            if lead_id:
                try:
                    lead = Employee.objects.get(id=lead_id)
                    team.lead = lead
                    team.save()
                except Employee.DoesNotExist:
                    return JsonResponse({"error": "Lead not found"}, status=404)

            if member_ids:
                members = Employee.objects.filter(id__in=member_ids)
                team.members.set(members)

            return JsonResponse({
                "message": "Team created successfully",
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "lead": {"id": team.lead.id, "name": team.lead.name} if team.lead else None,
                "members": list(team.members.values("id", "name"))
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_teams(request):
    if request.method == "GET":
        teams = Team.objects.all().select_related("lead").prefetch_related("members")
        team_list = []
        for team in teams:
            team_list.append({
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "lead": {"id": team.lead.id, "name": team.lead.name} if team.lead else None,
                "members": list(team.members.values("id", "name"))
            })
        return JsonResponse(team_list, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
@transaction.atomic
def create_task(request):
    try:
        data = json.loads(request.body)
        title = data.get("title")
        description = data.get("description")
        team_id = data.get("team_id")
        checkpoints = data.get("checkpoints", [])  # Get checkpoints from request

        if not title:
            return JsonResponse({"error": "Task title is required"}, status=400)

        # Create the task
        task = Task.objects.create(
            title=title,
            description=description,
            team_id=team_id,
            completed=False
        )

        # Add checkpoints if provided
        created_checkpoints = []
        for cp in checkpoints:
            if cp.get("title"):
                checkpoint = Checkpoint.objects.create(
                    task=task,
                    title=cp["title"],
                    completed=cp.get("completed", False)
                )
                created_checkpoints.append({
                    "id": checkpoint.id,
                    "title": checkpoint.title,
                    "completed": checkpoint.completed
                })

        # Update task checkpoint counts
        task.total_checkpoints = task.checkpoints.count()
        task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
        task.save()

        return JsonResponse({
            "message": "Task created successfully",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "team_id": task.team_id,
                "completed": task.completed,
                "total_checkpoints": task.total_checkpoints,
                "completed_checkpoints": task.completed_checkpoints
            },
            "checkpoints": created_checkpoints
        })

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
def dashboard_data(request):
    employees = list(Employee.objects.values())
    tasks = list(Task.objects.select_related("team").values(
        "id", "title", "description", "completed", "team_id", "team__name",
        "total_checkpoints", "completed_checkpoints"
    ))
    teams = []
    for team in Team.objects.all().select_related("lead").prefetch_related("members"):
        teams.append({
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "lead": {"id": team.lead.id, "name": team.lead.name} if team.lead else None,
            "members": list(team.members.values("id", "name"))
        })

    return JsonResponse({
        "employees": employees,
        "tasks": tasks,
        "teams": teams
    })

# --------------------
# CHECKPOINT APIs
# --------------------
@require_http_methods(["GET"])
def get_task_checkpoints(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        checkpoints = list(task.checkpoints.values("id", "title", "completed"))
        return JsonResponse({
            "task_id": task_id,
            "checkpoints": checkpoints,
            "count": len(checkpoints)
        })
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

@require_http_methods(["GET"])
def get_checkpoint_details(request, checkpoint_id):
    try:
        checkpoint = Checkpoint.objects.get(id=checkpoint_id)
        return JsonResponse({
            "id": checkpoint.id,
            "title": checkpoint.title,
            "completed": checkpoint.completed,
            "task_id": checkpoint.task_id,
            "created_at": checkpoint.created_at,
            "updated_at": checkpoint.updated_at
        })
    except Checkpoint.DoesNotExist:
        return JsonResponse({"error": "Checkpoint not found"}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def generate_checkpoints(request, task_id):
    try:
        task = Task.objects.get(id=task_id)

        # Delete existing checkpoints if you want to regenerate
        task.checkpoints.all().delete()

        checkpoints = [Checkpoint(task=task, title=f"Point {i}") for i in range(1, 11)]
        Checkpoint.objects.bulk_create(checkpoints)

        task.total_checkpoints = task.checkpoints.count()
        task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
        task.save()

        return JsonResponse({
            "message": "Checkpoints created successfully",
            "task_id": task.id,
            "checkpoints": list(task.checkpoints.values("id", "title", "completed"))
        })

    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def add_checkpoint(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        data = json.loads(request.body)
        title = data.get("title")

        if not title:
            return JsonResponse({"error": "Checkpoint title required"}, status=400)

        checkpoint = Checkpoint.objects.create(task=task, title=title)

        task.total_checkpoints = task.checkpoints.count()
        task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
        task.save()

        return JsonResponse({
            "message": "Checkpoint added successfully",
            "checkpoint": {
                "id": checkpoint.id,
                "title": checkpoint.title,
                "completed": checkpoint.completed,
                "task_id": task.id
            },
            "task": {
                "id": task.id,
                "total_checkpoints": task.total_checkpoints,
                "completed_checkpoints": task.completed_checkpoints
            }
        })

    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_checkpoint(request, checkpoint_id):
    try:
        # First validate the checkpoint_id
        if not checkpoint_id or checkpoint_id == "undefined":
            return JsonResponse({"error": "Invalid checkpoint ID"}, status=400)

        checkpoint = Checkpoint.objects.get(id=checkpoint_id)
        data = json.loads(request.body)
        
        # Validate the completed status is provided
        if "completed" not in data:
            return JsonResponse({"error": "Completed status is required"}, status=400)
            
        checkpoint.completed = data["completed"]
        checkpoint.save()

        # Update task completion status
        task = checkpoint.task
        task.total_checkpoints = task.checkpoints.count()
        task.completed_checkpoints = task.checkpoints.filter(completed=True).count()
        
        # Calculate completion percentage
        completion_percentage = 0
        if task.total_checkpoints > 0:
            completion_percentage = int((task.completed_checkpoints / task.total_checkpoints) * 100)
        
        # Update task status based on completion
        if completion_percentage == 100:
            task.completed = True
            task.status = "Completed"
        else:
            task.completed = False
            task.status = f"{completion_percentage}% Completed"
        
        task.save()

        return JsonResponse({
            "message": "Checkpoint updated successfully",
            "checkpoint": {
                "id": checkpoint.id,
                "title": checkpoint.title,
                "completed": checkpoint.completed,
                "task_id": task.id
            },
            "task_status": {
                "completed": task.completed,
                "status": task.status,
                "completion_percentage": completion_percentage
            }
        })

    except Checkpoint.DoesNotExist:
        return JsonResponse({"error": "Checkpoint not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generate_ai_checkpoints_preview(request):
    try:
        data = json.loads(request.body)
        title = data.get("title", "")
        description = data.get("description", "")

        # More realistic sample checkpoints based on task details
        checkpoints = [
            {"title": f"Research and gather requirements for {title}"},
            {"title": f"Create project plan for {title}"},
            {"title": f"Design solution architecture for {title}"},
            {"title": f"Implement core functionality for {title}"},
            {"title": f"Develop user interface for {title}"},
            {"title": f"Write unit tests for {title}"},
            {"title": f"Conduct internal testing for {title}"},
            {"title": f"Gather user feedback on {title}"},
            {"title": f"Implement final revisions for {title}"},
            {"title": f"Prepare deployment package for {title}"}
        ]

        return JsonResponse({
            "checkpoints": checkpoints,
            "generated_from": {
                "title": title,
                "description": description
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt
@require_http_methods(["POST"])
def mark_task_completed(request, task_id):
    try:
        with transaction.atomic():
            task = Task.objects.get(id=task_id)
            
            # Check if task is 100% completed
            if task.completion_percentage == 100 and not task.is_moved_to_completed:
                # Create completed task record
                completed_task = CompletedTask.objects.create(
                    original_task=task,
                    title=task.title,
                    description=task.description,
                    team=task.team
                )
                
                # Mark original task as moved
                task.is_moved_to_completed = True
                task.save()
                
                return JsonResponse({
                    "success": True,
                    "message": "Task moved to completed tasks",
                    "completed_task_id": completed_task.id
                })
            
            return JsonResponse({
                "success": False,
                "message": "Task not ready to be marked as completed"
            })
            
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@require_http_methods(["GET"])
def get_completed_tasks(request):
    completed_tasks = CompletedTask.objects.select_related('team').values(
        'id',
        'title',
        'description',
        'completion_date',
        'team__name'
    )
    return JsonResponse({
        "completed_tasks": list(completed_tasks)
    })