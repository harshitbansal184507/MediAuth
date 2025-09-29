from django.urls import path
from . import views

urlpatterns = [
    path('', views.PrescriptionListCreateView.as_view(), name='prescription-list-create'),
    path('<int:pk>/', views.PrescriptionDetailView.as_view(), name='prescription-detail'),
    path('patients/', views.get_patients, name='get-patients'),
    path('<int:pk>/issue/', views.issue_prescription, name='issue-prescription'),
    path('<int:pk>/fill/', views.fill_prescription, name='fill-prescription'),
]