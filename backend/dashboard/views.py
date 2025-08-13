from django.core.mail import send_mail, BadHeaderError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Employee
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


@api_view(['GET', 'POST'])
def employee_list_create_update(request):
    if request.method == 'GET':
        employees = Employee.objects.all().values()
        return Response(list(employees))

    elif request.method == 'POST':
        data = request.data
        emp_id = data.get('id')

        # 👇 If `id` exists, it's an update
        if emp_id:
            try:
                employee = Employee.objects.get(id=emp_id)
            except Employee.DoesNotExist:
                return Response({'error': 'Employee not found.'}, status=404)

            # Check if anything has changed
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

            # Update fields
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

        # 👇 If no `id`, create a new employee
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

            # Prepend IMPORTANT if checkbox ticked
            if important:
                subject = f"IMPORTANT: {subject}"

            # Filter employees
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

            # Send email
            email = EmailMessage(
                subject,
                message,
                "youremail@example.com",  # From email
                recipient_list
            )
            email.send()

            return JsonResponse({"success": True, "recipients": recipient_list})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Team, Task
from .models import Employee


# Get all employees
@require_http_methods(["GET"])
def get_employees(request):
    employees = list(Employee.objects.values("id", "name", "role", "salary"))
    return JsonResponse({"employees": employees})


# Get all tasks (first in dashboard)
@require_http_methods(["GET"])
def get_tasks(request):
    tasks = list(Task.objects.select_related("team").values(
        "id", "title", "description", "completed", "team_id", "team__name"
    ))
    return JsonResponse({"tasks": tasks})


# Get all teams
@require_http_methods(["GET"])
def get_teams(request):
    teams = list(Team.objects.values("id", "name", "description", "lead_id", "lead__name"))
    return JsonResponse({"teams": teams})


# Create a new team
@csrf_exempt
@require_http_methods(["POST"])
def create_team(request):
    data = json.loads(request.body)
    name = data.get("name")
    description = data.get("description")
    lead_id = data.get("lead_id")
    member_ids = data.get("member_ids", [])

    team = Team.objects.create(
        name=name,
        description=description,
        lead=Employee.objects.get(id=lead_id) if lead_id else None
    )
    if member_ids:
        team.members.set(Employee.objects.filter(id__in=member_ids))

    return JsonResponse({"message": "Team created", "id": team.id})


# Create a new task
@csrf_exempt
@require_http_methods(["POST"])
def create_task(request):
    data = json.loads(request.body)
    title = data.get("title")
    description = data.get("description")
    team_id = data.get("team_id")
    completed = data.get("completed", False)

    task = Task.objects.create(
        title=title,
        description=description,
        team=Team.objects.get(id=team_id),
        completed=completed
    )

    return JsonResponse({"message": "Task created", "id": task.id})


def dashboard_data(request):
    employees = list(Employee.objects.values())
    tasks = list(Task.objects.values())
    teams = list(Team.objects.values())
    
    return JsonResponse({
        "employees": employees,
        "tasks": tasks,
        "teams": teams
    })