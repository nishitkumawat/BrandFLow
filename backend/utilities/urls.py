from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # ... your existing routes ...
    path("documents/", views.document_list_create, name="document-list"),
    path("documents/<int:doc_id>/", views.document_detail, name="document-detail"),
    path("documents/<int:doc_id>/upload-version/", views.document_upload_version, name="document-upload-version"),
    path('generate-marketing-image/',views.generate_marketing_image)
]


if settings.DEBUG:  # ✅ only for dev
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)