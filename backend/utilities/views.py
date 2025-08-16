from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.conf import settings
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
import currentUser

# Replace this with your actual logged-in user's email logic
def get_current_user_email(request):
    # For testing, you can hardcode
    return currentUser.email
    # return 'nishit1060@gmail.com'
    # In real scenario, use request.user.email or your auth system


# -------------------- Document Management --------------------
@csrf_exempt
@require_http_methods(["GET", "POST"])
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
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description", "")
        file = request.FILES.get("file")

        if not title or not file:
            return JsonResponse({"error": "Title and file are required"}, status=400)

        doc = Document.objects.create(
            title=title,
            description=description,
            file=file,
            login_email=current_email
        )
        return JsonResponse({
            "id": doc.id,
            "title": doc.title,
            "description": doc.description,
            "file": doc.file.url
        }, status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def document_detail(request, doc_id):
    current_email = get_current_user_email(request)

    try:
        doc = Document.objects.get(id=doc_id, login_email=current_email)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)

    if request.method == "GET":
        return JsonResponse({
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
        data = json.loads(request.body)
        doc.title = data.get("title", doc.title)
        doc.description = data.get("description", doc.description)
        doc.save()
        return JsonResponse({"message": "Document updated"})

    elif request.method == "DELETE":
        doc.delete()
        return JsonResponse({"message": "Document deleted"}, status=204)


@csrf_exempt
@require_http_methods(["POST"])
def document_upload_version(request, doc_id):
    current_email = get_current_user_email(request)

    try:
        doc = Document.objects.get(id=doc_id, login_email=current_email)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)

    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "File required"}, status=400)

    version = DocumentVersion.objects.create(document=doc, file=file)
    return JsonResponse({
        "id": version.id,
        "file": version.file.url,
        "uploaded_at": version.uploaded_at
    }, status=201)
