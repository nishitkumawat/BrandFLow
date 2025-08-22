import os
import json
import base64
import requests
from tempfile import NamedTemporaryFile
from dotenv import load_dotenv
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.mail import send_mail, BadHeaderError, EmailMessage

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import *
from authentication.models import Company

import currentUser

# Load environment variables from .env file
load_dotenv()

# Replace this with your actual logged-in user's email logic
def get_current_user_email(request):
    return currentUser.email # Replace with actual auth logic


# -------------------- Document Management --------------------
@api_view(["GET", "POST"])
def document_list_create(request):
    current_email = get_current_user_email(request)

    if request.method == "GET":
        docs = Document.objects.filter(login_email=current_email).order_by("-uploaded_at")
        data = []
        for d in docs:
            data.append({
                "id": d.id,
                "title": d.title,
                "description": d.description,
                "file": d.file.url if d.file else None,
                "uploaded_at": d.uploaded_at,
                "versions": [
                    {
                        "id": v.id,
                        "file": v.file.url,
                        "uploaded_at": v.uploaded_at,
                    }
                    for v in d.versions.all().order_by("-uploaded_at")
                ]
            })
        return Response(data)

    elif request.method == "POST":
        title = request.data.get("title")
        description = request.data.get("description", "")
        file = request.FILES.get("file")

        if not title or not file:
            return Response({"error": "Title and file are required"}, status=status.HTTP_400_BAD_REQUEST)

        doc = Document.objects.create(
            title=title,
            description=description,
            file=file,
            login_email=current_email
        )
        return Response({
            "id": doc.id,
            "title": doc.title,
            "description": doc.description,
            "file": doc.file.url
        }, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "DELETE"])
def document_detail(request, doc_id):
    current_email = get_current_user_email(request)

    try:
        doc = Document.objects.get(id=doc_id, login_email=current_email)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response({
            "id": doc.id,
            "title": doc.title,
            "description": doc.description,
            "file": doc.file.url,
            "uploaded_at": doc.uploaded_at,
            "versions": [
                {
                    "id": v.id,
                    "file": v.file.url,
                    "uploaded_at": v.uploaded_at,
                }
                for v in doc.versions.all().order_by("-uploaded_at")
            ]
        })

    elif request.method == "PUT":
        doc.title = request.data.get("title", doc.title)
        doc.description = request.data.get("description", doc.description)
        doc.save()
        return Response({"message": "Document updated"})

    elif request.method == "DELETE":
        doc.delete()
        return Response({"message": "Document deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def document_upload_version(request, doc_id):
    current_email = get_current_user_email(request)

    try:
        doc = Document.objects.get(id=doc_id, login_email=current_email)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

    file = request.FILES.get("file")
    if not file:
        return Response({"error": "File required"}, status=status.HTTP_400_BAD_REQUEST)

    version = DocumentVersion.objects.create(document=doc, file=file)
    return Response({
        "id": version.id,
        "file": version.file.url,
        "uploaded_at": version.uploaded_at
    }, status=status.HTTP_201_CREATED)




CLIPDROP_API_KEY = os.getenv('CLIPDROP_API_KEY')
CLIPDROP_API_URL = "https://clipdrop-api.co/text-to-image/v1"

import base64
from django.http import JsonResponse

@csrf_exempt
def generate_marketing_image(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        # Accept both JSON and form-data
        if request.content_type == "application/json":
            body = json.loads(request.body.decode("utf-8"))
            prompt = body.get("prompt")
        else:
            prompt = request.POST.get("prompt")
    except Exception:
        prompt = None

    if not prompt:
        return JsonResponse({'error': 'Prompt is required'}, status=400)

    try:
        login_email = get_current_user_email(request)
        company = Company.objects.filter(login_email=login_email).first()
        if not company:
            return JsonResponse({'error': 'Company not found'}, status=404)

        # ✅ Build prompt with company details
        company_details = f"""
        Company Name: {company.company_name}
        Username: {company.username}
        Email: {company.email}
        Company Phone: {company.company_phone_no}
        Personal Phone: {company.phone_no}
        Address: {company.company_address}
        """

        full_prompt = f"{prompt}\n\nUse the following company details:\n{company_details} and use only ENGLISH"

        
        # Call ClipDrop API
        files = {'prompt': (None, full_prompt)}
        headers = {'x-api-key': CLIPDROP_API_KEY}
        response = requests.post(CLIPDROP_API_URL, files=files, headers=headers)
        response.raise_for_status()

        # Read response bytes
        image_bytes = b''.join(response.iter_content(chunk_size=8192))

        # Convert to base64 string
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        return JsonResponse({
            "image": image_base64,
            "caption": generate_ai_caption(prompt,company_details)
        })

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"ClipDrop error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Unexpected error: {str(e)}"}, status=500)


def generate_ai_caption(prompt: str, company_details: str = "") -> str:
    """
    Generate a catchy caption using Gemini AI.
    Returns a plain string (caption).
    """

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None)
    if not GEMINI_API_KEY:
        return "AI configuration error. Please contact support."

    try:
        caption_prompt = f"""
        You are a creative marketing AI assistant.
        Write one engaging, concise, and catchy caption for the following marketing prompt.

        Prompt: {prompt}

        Company Details:
        {company_details}

        The caption should:
        - Be 1 to 2 sentences maximum
        - Sound professional but appealing
        - Avoid hashtags or emojis
        - Be directly usable as a social media caption

        Caption:
        """

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}
        data = {
            "contents": [{"parts": [{"text": caption_prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.9,
                "maxOutputTokens": 128,
            }
        }

        response = requests.post(url, headers=headers, params=params, json=data)
        response.raise_for_status()
        response_data = response.json()

        if "candidates" in response_data and response_data["candidates"]:
            candidate = response_data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                return candidate["content"]["parts"][0]["text"].strip()

        return f"Discover more with {prompt}!"

    except Exception:
        return f"Explore {prompt} with us!"
