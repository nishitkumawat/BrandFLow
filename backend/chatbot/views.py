import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

@api_view(["POST"])
def gemini_chat_view(request):
    message = request.data.get("message", "")
    if not message:
        return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key":'AIzaSyB-tGExkleTwNnsCXkXXSV-nBuTgfubRjA' # Make sure this is set correctly!
        }
        data = {
            "contents": [
                {
                    "parts": [{"text": message}]
                }
            ]
        }

        response = requests.post(url, headers=headers, params=params, json=data)
        print("Gemini response:", response.text)
        response.raise_for_status()

        reply = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return Response({"reply": reply}, status=status.HTTP_200_OK)

    except requests.exceptions.RequestException as e:
        print("Requests error:", str(e))
        return Response({"error": "Failed to reach Gemini API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        print("Unexpected error:", str(e))
        return Response({"error": "Unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
