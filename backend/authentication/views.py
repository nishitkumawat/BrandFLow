from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.database import MongoService
import re



@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required."})

    db = MongoService()
    user = db.find("users", {"email": email, "password": password})
    if user:
        return Response({"message": "Login successful", "user": user[0]})
    else:
        return Response({"error": "Invalid email or password"})
    
    
  
def is_valid_password(password):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
    return re.match(pattern, password)

@api_view(["POST"])
def signup(request):
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

    return Response({"message": "Signup successful"})