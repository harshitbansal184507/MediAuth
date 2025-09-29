from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import PrescriptionUpload
from .serializers import PrescriptionUploadSerializer, PrescriptionUploadCreateSerializer
from .groq_processor import GroqPrescriptionProcessor

class PrescriptionUploadListCreateView(generics.ListCreateAPIView):
    serializer_class = PrescriptionUploadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type != 'patient':
            return PrescriptionUpload.objects.none()
        return PrescriptionUpload.objects.filter(patient=self.request.user).order_by('-uploaded_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PrescriptionUploadCreateSerializer
        return PrescriptionUploadSerializer
    
    def perform_create(self, serializer):
        if self.request.user.user_type != 'patient':
            raise PermissionError("Only patients can upload prescriptions")
        
        upload = serializer.save()
        
        # Process with Groq API
        self.process_with_groq(upload)
    
    def process_with_groq(self, upload):
        """Process prescription using Groq API"""
        try:
            processor = GroqPrescriptionProcessor()
            result = processor.process_prescription(upload.image.path)
            
            upload.status = result['status']
            upload.extracted_text = result['extracted_text']
            upload.parsed_data = result['parsed_data']
            upload.processed_at = timezone.now()
            upload.save()
            
        except Exception as e:
            upload.status = 'failed'
            upload.extracted_text = f"Processing failed: {str(e)}"
            upload.processed_at = timezone.now()
            upload.save()

class PrescriptionUploadDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = PrescriptionUploadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type != 'patient':
            return PrescriptionUpload.objects.none()
        return PrescriptionUpload.objects.filter(patient=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reprocess_upload(request, pk):
    """Reprocess prescription with Groq API"""
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can reprocess uploads'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        upload = PrescriptionUpload.objects.get(pk=pk, patient=request.user)
    except PrescriptionUpload.DoesNotExist:
        return Response({'error': 'Upload not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    upload.status = 'processing'
    upload.save()
    
    try:
        processor = GroqPrescriptionProcessor()
        result = processor.process_prescription(upload.image.path)
        
        upload.status = result['status']
        upload.extracted_text = result['extracted_text']
        upload.parsed_data = result['parsed_data']
        upload.processed_at = timezone.now()
        upload.save()
        
        serializer = PrescriptionUploadSerializer(upload)
        return Response(serializer.data)
        
    except Exception as e:
        upload.status = 'failed'
        upload.extracted_text = f"Reprocessing failed: {str(e)}"
        upload.processed_at = timezone.now()
        upload.save()
        
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)