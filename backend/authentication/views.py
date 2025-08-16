from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.database import MongoService
import re
import currentUser
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Company



@csrf_exempt
def company_view(request, company_id=None):
    if request.method == "GET":  # ✅ Fetch companies
        try:
            if company_id:  # fetch single company for current user
                company = Company.objects.get(id=company_id, login_email=currentUser.email)
                
                currentUser.comapny_name = company.company_name
                return JsonResponse({
                    "id": company.id,
                    "email": company.email,
                    "username": company.username,
                    "company_name": company.company_name,
                    "phone_no": company.phone_no,
                    "company_phone_no": company.company_phone_no,
                    "company_address": company.company_address,
                }, status=200)

            # fetch only this user's companies
            companies = list(
                Company.objects.filter(login_email=currentUser.email).values(
                    "id", "email", "username", "company_name",
                    "phone_no", "company_phone_no", "company_address"
                )
            )
            return JsonResponse(companies, safe=False, status=200)

        except Company.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Company not found"}, status=404)

    elif request.method == "POST":  # ✅ Create
        try:
            data = json.loads(request.body)
            company = Company.objects.create(
                email=data.get("email"),
                username=data.get("username"),
                company_name=data.get("company_name", ""),
                phone_no=data.get("phone_no"),
                company_phone_no=data.get("company_phone_no"),
                company_address=data.get("company_address", ""),
                login_email=currentUser.email,
            )
            currentUser.comapny_name = company.company_name
            return JsonResponse(
                {"status": "success", "message": "Company created", "company_id": company.id},
                status=201,
            )
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    elif request.method in ["PUT", "PATCH"]:  # ✅ Update
        if not company_id:
            return JsonResponse({"status": "error", "message": "Company ID required"}, status=400)
        try:
            data = json.loads(request.body)
            company = Company.objects.get(id=company_id, login_email=currentUser.email)  # scoped to user
            currentUser.comapny_name = company.company_name
            for field in ["email", "username", "company_name", "phone_no", "company_phone_no", "company_address"]:
                if field in data:
                    setattr(company, field, data[field])
            company.save()

            return JsonResponse({"status": "success", "message": "Company updated"}, status=200)
        except Company.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Company not found"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    else:
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)


@api_view(["POST"])
def loginUser(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required."})

    db = MongoService()
    user = db.find("users", {"email": email, "password": password})
    if user:
        currentUser.email = email
        company = Company.objects.get(login_email=email)
        currentUser.comapny_name = company.company_name
        if currentUser.comapny_name == "":
            return Response({"message": "Login successful", "user": user[0],"firstLogin":"true"})
        return Response({"message": "Login successful", "user": user[0]})
    else:
        return Response({"error": "Invalid email or password"})
    
    
  
def is_valid_password(password):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
    return re.match(pattern, password)

@api_view(["POST"])
def signupUser(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response({"error": "Name, email, and password are required."})

    if not is_valid_password(password):
        return Response({
            "error": "Password must be at least 8 characters long and include a number, a lowercase letter, and an uppercase letter."
        }, status=400)

    db = MongoService()
    existing_user = db.find("users", {"email": email})
    if existing_user:
        return Response({"error": "User with this email already exists."})

    db.insert("users", {
        "name": name,
        "email": email,
        "password": password  # plain password, as requested
    })
    currentUser.email = email
    return Response({"message": "Signup successful"})