from django.core.mail import send_mail, BadHeaderError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee

@api_view(['GET', 'POST'])
def employee_list_create(request):
    if request.method == 'GET':
        # ✅ Return all employee records
        employees = Employee.objects.all().values()
        return Response(list(employees))

    elif request.method == 'POST':
        data = request.data
        try:
            employee = Employee.objects.create(
                name=data.get('name'),
                role=data.get('role'),
                experience=int(data.get('experience', 0)),
                joining_date=data.get('joining_date'),
                salary=int(data.get('salary')),
                email=data.get('email'),
            )

            # ✅ Send welcome email
            try:
                send_mail(
                    subject='Welcome to the Company!',
                    message=f"Hello {employee.name},\n\nYou have been successfully added as a {employee.role}.",
                    from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings.py
                    recipient_list=[employee.email],
                    fail_silently=False,
                )
            except BadHeaderError:
                return Response({"error": "Invalid email header found."}, status=400)
            except Exception as e:
                return Response({"error": f"Email failed: {str(e)}"}, status=400)

            return Response({
                "id": employee.id,
                "name": employee.name,
                "role": employee.role,
                "experience": employee.experience,
                "joining_date": str(employee.joining_date),
                "salary": employee.salary,
                "email": employee.email
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
