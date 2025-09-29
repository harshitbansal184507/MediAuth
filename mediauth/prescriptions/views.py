from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Prescription, PrescriptionItem
from .serializers import PrescriptionSerializer, PrescriptionCreateSerializer, UserBasicSerializer

User = get_user_model()

class PrescriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'doctor':
            return Prescription.objects.filter(doctor=user).order_by('-created_at')
        elif user.user_type == 'patient':
            return Prescription.objects.filter(patient=user).order_by('-created_at')
        elif user.user_type == 'pharmacist':
            return Prescription.objects.filter(status='issued').order_by('-created_at')
        return Prescription.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer
    
    def perform_create(self, serializer):
        if self.request.user.user_type != 'doctor':
            raise PermissionError("Only doctors can create prescriptions")
        
        # Debug: Print the data being validated
        print("Request data:", self.request.data)
        
        serializer.save(doctor=self.request.user)

class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'doctor':
            return Prescription.objects.filter(doctor=user)
        elif user.user_type == 'patient':
            return Prescription.objects.filter(patient=user)
        elif user.user_type == 'pharmacist':
            return Prescription.objects.all()
        return Prescription.objects.none()
    
    def perform_update(self, serializer):
        prescription = self.get_object()
        user = self.request.user
        
        # Only doctors can edit their own prescriptions
        if user.user_type == 'doctor' and prescription.doctor == user:
            serializer.save()
        # Only pharmacists can fill prescriptions
        elif user.user_type == 'pharmacist' and 'status' in serializer.validated_data:
            if serializer.validated_data['status'] == 'filled':
                from django.utils import timezone
                serializer.save(filled_by=user, filled_date=timezone.now())
            else:
                serializer.save()
        else:
            raise PermissionError("Permission denied")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patients(request):
    """Get list of patients for doctors to create prescriptions"""
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can access patient list'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    patients = User.objects.filter(user_type='patient')
    serializer = UserBasicSerializer(patients, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def issue_prescription(request, pk):
    """Issue a prescription (change status from draft to issued)"""
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can issue prescriptions'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    prescription = get_object_or_404(Prescription, pk=pk, doctor=request.user)
    
    if prescription.status != 'draft':
        return Response({'error': 'Only draft prescriptions can be issued'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    from django.utils import timezone
    prescription.status = 'issued'
    prescription.issued_date = timezone.now()
    prescription.save()
    
    serializer = PrescriptionSerializer(prescription)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fill_prescription(request, pk):
    """Fill a prescription (pharmacist action)"""
    if request.user.user_type != 'pharmacist':
        return Response({'error': 'Only pharmacists can fill prescriptions'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    prescription = get_object_or_404(Prescription, pk=pk, status='issued')
    
    from django.utils import timezone
    prescription.status = 'filled'
    prescription.filled_by = request.user
    prescription.filled_date = timezone.now()
    prescription.save()
    
    serializer = PrescriptionSerializer(prescription)
    return Response(serializer.data)