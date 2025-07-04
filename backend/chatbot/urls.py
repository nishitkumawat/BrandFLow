from django.urls import path
from .views import gemini_chat_view

urlpatterns = [
    path("chat/", gemini_chat_view),  # Note: NOT /api/chat/ here, just /chat/
]
