from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path("documents/", views.document_list_create, name="document-list"),
    path("documents/<int:doc_id>/", views.document_detail, name="document-detail"),
    path("documents/<int:doc_id>/upload-version/", views.document_upload_version, name="document-upload-version"),
    path('generate-marketing-image/', views.generate_marketing_image, name='generate-marketing-image'),
]

# Serve static files during development
urlpatterns += staticfiles_urlpatterns()

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)