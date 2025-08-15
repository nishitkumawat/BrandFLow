from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('chatbot.urls')),
    path('authentication/', include('authentication.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('utilities/', include('utilities.urls')),
    
]
