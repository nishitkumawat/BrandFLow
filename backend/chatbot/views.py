import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

@api_view(["POST"])
def gemini_chat_view(request):
    message = request.data.get("message", "")
    if not message:
        return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create a BrandFlow-specific prompt to guide the AI responses
        brandflow_context = """
        You are BrandFlow Assistant, an AI helper for the BrandFlow content creation platform. 
        BrandFlow helps businesses create marketing content, social media posts, blog articles, 
        ad copy, and brand messaging using AI technology.
        
        Key features of BrandFlow:
        - AI-powered content generation
        - Tone and style customization
        - Marketing content expertise
        - Brand voice consistency
        - Social media content creation
        - Blog and article writing
        - Ad copy generation
        - Email campaign content
        
        Always respond in a helpful, professional manner focused on content creation and marketing.
        Be concise but informative. If users ask about non-content topics, gently steer them back
        to how BrandFlow can help with their content needs.
        """
        
        full_prompt = f"{brandflow_context}\n\nUser question: {message}"
        
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
           "key":  os.getenv('GEMINI_API_KEY')
           }
        data = {
            "contents": [
                {
                    "parts": [{"text": full_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }

        response = requests.post(url, headers=headers, params=params, json=data)
        response.raise_for_status()

        # Extract the response text
        response_data = response.json()
        
        # Handle different response formats from Gemini API
        if "candidates" in response_data and response_data["candidates"]:
            candidate = response_data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                reply = candidate["content"]["parts"][0]["text"]
            else:
                reply = "I understand your question about BrandFlow. How can I help you with content creation today?"
        else:
            reply = "Thank you for your message. As your BrandFlow assistant, I'm here to help with all your content creation needs!"
        
        return Response({"reply": reply}, status=status.HTTP_200_OK)

    except requests.exceptions.RequestException as e:
        print("Requests error:", str(e))
        # Return a BrandFlow-specific error message
        return Response({
            "error": "I'm having trouble connecting right now. Please try again or contact BrandFlow support at support@brandflow.com for assistance with your content needs."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        print("Unexpected error:", str(e))
        return Response({
            "error": "Something went wrong on our end. The BrandFlow team has been notified. In the meantime, you can explore our content templates or try again shortly."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)