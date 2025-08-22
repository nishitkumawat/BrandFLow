from datetime import timezone
from decimal import Decimal, InvalidOperation
import json
import os
import requests

from django.conf import settings
from django.core.mail import send_mail, BadHeaderError, EmailMessage
from django.db import transaction
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_GET
from django.db.models import Sum


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from dotenv import load_dotenv

from .models import (
    Employee, Team, Task, Checkpoint,
    CompletedTask, Budget, Client
)

import currentUser


# Load environment variables
load_dotenv()

  
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


# Replace this with your actual logged-in user's email logic
def get_current_user_email(request):
    # For testing, you can hardcode
    return currentUser.email
    # return 'nishit1060@gmail.com'
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
@require_http_methods(["GET", "POST"])  # Allow both GET and POST
def task_list_create(request):
    current_email = get_current_user_email(request)
    
    if request.method == "GET":
        # Fetch data
        tasks = Task.objects.filter(login_email=current_email)
        teams = Team.objects.filter(login_email=current_email)
        employees = Employee.objects.filter(login_email=current_email)
        completed_tasks = CompletedTask.objects.filter(login_email=current_email)
        
        # Process tasks with checkpoints
        task_data = []
        for task in tasks:
            checkpoints = Checkpoint.objects.filter(task=task, login_email=current_email)
            
            # Include client details if linked
            client_data = None
            if task.client:
                client_data = model_to_dict(task.client)
            
            task_data.append({
                **model_to_dict(task),
                "expense": str(task.expense or 0.00),  # always return expense
                "checkpoints": [model_to_dict(cp) for cp in checkpoints],
                "completion_percentage": task.completion_percentage(),
                "team__name": task.team.name if task.team else None,
                "client": client_data
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
            
            # Create the task with expense default = 0
            task = Task.objects.create(
                title=data['title'],
                description=data.get('description', ''),
                team=team,
                login_email=current_email,
                total_checkpoints=len(data.get('checkpoints', [])),
                expense=data.get('expense', 0.00)  # ✅ expense default = 0
            )
            
            # Link client to this task
            client = None
            if data.get('client_id'):
                client = Client.objects.filter(
                    id=data['client_id'],
                    login_email=current_email
                ).first()
                if client:
                    client.project = task
                    client.save()
                    task.client = client   # ✅ add client to Task also
                    task.save()
                else:
                    return JsonResponse({"error": "Client not found"}, status=404)
            
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
                "task": {
                    **model_to_dict(task),
                    "expense": str(task.expense or 0.00),
                    "client": model_to_dict(client) if client else None
                },
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
            login_email=current_email,
            expense=task.expense
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


@csrf_exempt
@require_http_methods(["GET"])
def completed_tasks_list(request):
    current_email = get_current_user_email(request)
    completed_tasks = CompletedTask.objects.filter(
        login_email=current_email
    ).select_related('team')
    
    data = []
    for task in completed_tasks:
        data.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'team__name': task.team.name if task.team else "Unassigned",
            'completed_on': task.completion_date.isoformat() if task.completion_date else None,
        })
    
    return JsonResponse({"completed_tasks": data})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def client_management(request):
    current_email = get_current_user_email(request)
    
    if request.method == "GET":
        try:
            clients = Client.objects.filter(login_email=current_email).order_by('name')
            clients_data = [{
                'id': client.id,
                'name': client.name,
                'email': client.email,
                'contact_number': client.contact_number,
                'org_name': client.org_name,
                'project': client.project.title if client.project else None

            } for client in clients]
            return JsonResponse(clients_data, safe=False)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            client_id = data.get('id', None)
            
            # Common validation for both create and update
            required_fields = ['name', 'email', 'contact_number', 'org_name']
            if not client_id:  # Only validate all fields for new clients
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return JsonResponse({
                        'error': f'Missing required fields: {", ".join(missing_fields)}',
                        'missing_fields': missing_fields
                    }, status=400)
            
            # Email validation
            if '@' not in data.get('email', ''):
                return JsonResponse({'error': 'Invalid email format'}, status=400)
            
            if client_id:
                # Update existing client
                try:
                    client = Client.objects.get(id=client_id, login_email=current_email)
                except Client.DoesNotExist:
                    return JsonResponse({'error': 'Client not found'}, status=404)
                
                # Check for duplicate email (excluding current client)
                if 'email' in data and Client.objects.filter(
                    email=data['email'], 
                    login_email=current_email
                ).exclude(id=client_id).exists():
                    return JsonResponse({
                        'error': 'A client with this email already exists',
                        'field': 'email'
                    }, status=400)
                
                # Update fields
                client.name = data.get('name', client.name)
                client.email = data.get('email', client.email)
                client.contact_number = data.get('contact_number', client.contact_number)
                client.org_name = data.get('org_name', client.org_name)
                client.save()
                
                return JsonResponse({
                    'id': client.id,
                    'name': client.name,
                    'email': client.email,
                    'message': 'Client updated successfully'
                })
            
            else:
                # Create new client
                if Client.objects.filter(email=data['email'], login_email=current_email).exists():
                    return JsonResponse({
                        'error': 'A client with this email already exists',
                        'field': 'email'
                    }, status=400)
                
                client = Client.objects.create(
                    name=data['name'],
                    email=data['email'],
                    contact_number=data['contact_number'],
                    org_name=data['org_name'],
                    login_email=current_email
                )
                
                return JsonResponse({
                    'id': client.id,
                    'name': client.name,
                    'email': client.email,
                    'message': 'Client created successfully'
                }, status=201)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
        
@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def task_detail(request, task_id):
    current_email = get_current_user_email(request)
    
    try:
        task = Task.objects.get(id=task_id, login_email=current_email)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    
    if request.method == "GET":
        checkpoints = Checkpoint.objects.filter(task=task, login_email=current_email)
        return JsonResponse({
            **model_to_dict(task),
            "checkpoints": [model_to_dict(cp) for cp in checkpoints],
            "completion_percentage": task.completion_percentage(),
            "team__name": task.team.name if task.team else None
        })
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            if 'title' in data:
                task.title = data['title']
            if 'description' in data:
                task.description = data['description']
            # Add other fields as needed
            task.save()
            return JsonResponse(model_to_dict(task))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    elif request.method == "DELETE":
        task.delete()
        return JsonResponse({"message": "Task deleted successfully"}, status=204)

@csrf_exempt
@require_http_methods(["GET"])
def task_checkpoints(request, task_id):
    current_email = get_current_user_email(request)
    
    try:
        task = Task.objects.get(id=task_id, login_email=current_email)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    
    checkpoints = Checkpoint.objects.filter(task=task, login_email=current_email)
    return JsonResponse({
        "checkpoints": [model_to_dict(cp) for cp in checkpoints]
    })



from django.db.models import Sum
from decimal import Decimal

@csrf_exempt
@require_http_methods(["GET"])
def budget_summary(request):
    try:
        login_email = get_current_user_email(request)
        
        if not login_email:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        # Safely handle Budget retrieval
        try:
            budget = Budget.objects.get(login_email=login_email)
            total_budget = budget.total_budget
        except Budget.DoesNotExist:
            total_budget = Decimal('0.00')
        except Exception as e:
            print(f"Budget retrieval error: {str(e)}")
            total_budget = Decimal('0.00')
        
        # Calculate salaries
        try:
            salary_agg = Employee.objects.filter(login_email=login_email).aggregate(
                total_salaries=Sum('salary')
            )
            salaries = salary_agg['total_salaries'] or Decimal('0.00')
            if not isinstance(salaries, Decimal):
                salaries = Decimal(str(salaries))
        except Exception as e:
            print(f"Salary calculation error: {str(e)}")
            salaries = Decimal('0.00')
        
        # Calculate total project expenses (both active and completed tasks)
        try:
         # Active tasks expenses
            expense_agg = Task.objects.filter(login_email=login_email).aggregate(
                total_expenses=Sum('expense')
            )
            task_expenses = expense_agg['total_expenses'] or Decimal('0.00')

            # Completed tasks expenses
            c_agg = CompletedTask.objects.filter(login_email=login_email).aggregate(
                total_expenses=Sum('expense')
            )
            completed_expenses = c_agg['total_expenses'] or Decimal('0.00')

            # Ensure both are Decimal before summing
            project_expenses = Decimal(str(task_expenses)) + Decimal(str(completed_expenses))

        except Exception as e:
            print(f"Project expense calculation error: {str(e)}")
            project_expenses = Decimal('0.00')
        
        # Perform calculations with Decimal values
        total_expenses = salaries + project_expenses
        remaining = total_budget - total_expenses
        
        return JsonResponse({
            'budget': str(total_budget),
            'salaries': str(salaries),
            'project_expenses': str(project_expenses),  # Combined active + completed
            'total_expenses': str(total_expenses),
            'remaining': str(remaining),
        })
    except Exception as e:
        print(f"Unexpected error in budget_summary: {str(e)}")
        return JsonResponse({
            'error': 'Internal server error',
            'details': str(e),
            'type': type(e).__name__
        }, status=500)
        
@csrf_exempt
@require_http_methods(["POST"])
def budget_update(request):
    try:
        data = json.loads(request.body)
        login_email = get_current_user_email(request)
        
        if not login_email:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        action = data.get('action')
        if action not in ['increase', 'decrease', 'update']:
            return JsonResponse({'error': 'Invalid action'}, status=400)

        try:
            amount = Decimal(str(data.get('amount', '0')))
            # Validate the number isn't too large for our field
            if abs(amount.as_tuple().exponent) > 2:
                return JsonResponse({'error': 'Maximum 2 decimal places allowed'}, status=400)
            if len(str(amount).replace('.', '').replace('-', '')) > 28:  # Fixed this line
                return JsonResponse({'error': 'Number too large'}, status=400)
        except (InvalidOperation, ValueError):
            return JsonResponse({'error': 'Invalid amount'}, status=400)

        with transaction.atomic():
            budget, created = Budget.objects.get_or_create(
                login_email=login_email,
                defaults={'total_budget': Decimal('0.00')}
            )
            
            current = Decimal(str(budget.total_budget))
            
            if action == 'increase':
                new_amount = current + amount
            elif action == 'decrease':
                new_amount = current - amount//2
            elif action == 'update':
                new_amount = amount

            # Final validation
            try:
                validated = Decimal(str(new_amount))
                if len(str(validated).replace('.', '').replace('-', '')) > 28:
                    return JsonResponse({'error': 'Resulting number too large'}, status=400)
            except InvalidOperation:
                return JsonResponse({'error': 'Invalid calculation result'}, status=400)

            budget.total_budget = validated
            budget.save()

            return JsonResponse({
                'success': True,
                'new_budget': str(validated),
                'previous_budget': str(current),
                'operation': action
            })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({
            'error': 'Internal server error',
            'details': str(e)
        }, status=500)
        

@require_GET
def dashboard_summary(request):
    login_email = get_current_user_email(request)
    if not login_email:
        return JsonResponse({"error": "login_email is required"}, status=400)

    # Counts
    clients_count = Client.objects.filter(login_email=login_email).count()
    employees_count = Employee.objects.filter(login_email=login_email).count()
    teams_count = Team.objects.filter(login_email=login_email).count()
    tasks_count = Task.objects.filter(login_email=login_email).count()
    completed_tasks_count = CompletedTask.objects.filter(login_email=login_email).count()

    # Budget
    budget = Budget.objects.filter(login_email=login_email).first()
    total_budget = str(budget.total_budget) if budget else "0.00"

    # Task details (with % completion)
    tasks = list(Task.objects.filter(login_email=login_email).values(
        "id", "title", "description", "status", "completed",
        "deadline", "expense", "total_checkpoints", "completed_checkpoints"
    ))

    # Add percentage calculation manually
    for t in tasks:
        total = t["total_checkpoints"] or 0
        done = t["completed_checkpoints"] or 0
        t["completion_percentage"] = int((done / total) * 100) if total > 0 else 0

    print(clients_count,employees_count,teams_count,tasks_count,completed_tasks_count,total_budget,tasks)

    return JsonResponse({
    "employees": employees_count,
    "clients": clients_count,
    "tasks": tasks_count,
    "teams": teams_count,  # or whatever makes sense
    "emails": 0,  # add if needed
    "budget": total_budget,
    "completed_tasks":completed_tasks_count,
    "tasks_list": tasks }, safe=False)


@require_GET
def get_clients(request):
    login_email = get_current_user_email(request)
    clients = list(Client.objects.filter(login_email=login_email).values())
    return JsonResponse(clients, safe=False)


@require_GET
def get_employees(request):
    login_email = get_current_user_email(request)
    employees = list(Employee.objects.filter(login_email=login_email).values())
    return JsonResponse(employees, safe=False)


@require_GET
def get_teams(request):
    login_email = get_current_user_email(request)
    teams = list(Team.objects.filter(login_email=login_email).values("id", "name", "description"))
    return JsonResponse(teams, safe=False)



@api_view(["POST"])
def generate_ai_checkpoints_preview(request):
    title = request.data.get("title", "")
    description = request.data.get("description", "")
    
    if not title:
        return Response({"error": "Title is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get API key from environment
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
    
    if not GEMINI_API_KEY:
        return Response({
            "error": "API configuration error. Please contact support."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        # Create prompt for generating checkpoints
        prompt = f"""
        As a project management AI assistant, generate exactly 10 clear, actionable checkpoints 
        for the following task. Return ONLY a numbered list of checkpoints without any additional text.
        
        Task Title: {title}
        Task Description: {description}
        
        The checkpoints should be:
        1. Specific and measurable
        2. Action-oriented
        3. Sequential (logical order)
        4. Relevant to the task
        5. Concise but descriptive
        
        Generate exactly 10 checkpoints:
        """
        
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": GEMINI_API_KEY
        }
        data = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "topK": 20,
                "topP": 0.9,
                "maxOutputTokens": 1024,
            }
        }

        response = requests.post(url, headers=headers, params=params, json=data)
        response.raise_for_status()

        # Extract the response text
        response_data = response.json()
        
        if "candidates" in response_data and response_data["candidates"]:
            candidate = response_data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                ai_response = candidate["content"]["parts"][0]["text"]
                
                # Parse the AI response into individual checkpoints
                checkpoints = parse_checkpoints(ai_response)
                
                # If we got less than 10 checkpoints, fill in generic ones
                while len(checkpoints) < 10:
                    checkpoints.append(f"Checkpoint {len(checkpoints) + 1}: Complete this phase")
                
                # Limit to exactly 10 checkpoints
                checkpoints = checkpoints[:10]
                
                return Response({
                    "checkpoints": checkpoints,
                    "ai_generated": True
                }, status=status.HTTP_200_OK)
        
        # Fallback if AI response parsing fails
        default_checkpoints = generate_default_checkpoints(title)
        return Response({
            "checkpoints": default_checkpoints,
            "ai_generated": False
        }, status=status.HTTP_200_OK)

    except requests.exceptions.RequestException as e:
        print("AI API error:", str(e))
        # Return default checkpoints if AI fails
        default_checkpoints = generate_default_checkpoints(title)
        return Response({
            "checkpoints": default_checkpoints,
            "ai_generated": False,
            "error": "AI generation failed, using default checkpoints"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("Unexpected error:", str(e))
        default_checkpoints = generate_default_checkpoints(title)
        return Response({
            "checkpoints": default_checkpoints,
            "ai_generated": False,
            "error": "Unexpected error, using default checkpoints"
        }, status=status.HTTP_200_OK)


def parse_checkpoints(ai_response):
    """Parse AI response into individual checkpoints"""
    checkpoints = []
    lines = ai_response.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if line and any(char.isdigit() for char in line) and ('.' in line or ':' in line or ')' in line):
            # Remove numbering (1., 2), etc.)
            if '. ' in line:
                checkpoint = line.split('. ', 1)[1]
            elif ') ' in line:
                checkpoint = line.split(') ', 1)[1]
            elif ': ' in line:
                checkpoint = line.split(': ', 1)[1]
            else:
                checkpoint = line
            
            checkpoints.append(checkpoint)
    
    return checkpoints if checkpoints else generate_default_checkpoints("Task")


def generate_default_checkpoints(title):
    """Generate default checkpoints if AI fails"""
    return [
        f"Research and gather information about {title}",
        f"Define scope and requirements for {title}",
        f"Create initial plan and timeline for {title}",
        f"Develop first draft/prototype of {title}",
        f"Review and get feedback on {title}",
        f"Implement changes based on feedback for {title}",
        f"Test and validate {title} deliverables",
        f"Finalize and prepare {title} for completion",
        f"Document results and learnings from {title}",
        f"Complete final review and submit {title}"
    ]
    
    
def latest_tasks(request):
    login_email = get_current_user_email(request)  # 🔑 filter by user
    tasks = Task.objects.filter(login_email=login_email).order_by("-id")[:5]

    data = [
        {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "completed": task.completed,
            "deadline": task.deadline,
            "completion_percentage": task.completion_percentage(),
        }
        for task in tasks
    ]
    print(data)
    return JsonResponse(data, safe=False)
