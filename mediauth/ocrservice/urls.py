from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.PrescriptionUploadListCreateView.as_view(), name='prescription-upload'),
    path('upload/<int:pk>/', views.PrescriptionUploadDetailView.as_view(), name='prescription-upload-detail'),
    path('upload/<int:pk>/reprocess/', views.reprocess_upload, name='reprocess-upload'),
]