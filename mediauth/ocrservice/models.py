from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PrescriptionUpload(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_prescriptions')
    image = models.ImageField(upload_to='prescription_images/')
    original_filename = models.CharField(max_length=255)
    
    # OCR Results
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    extracted_text = models.TextField(blank=True)
    parsed_data = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Upload by {self.patient.username} - {self.status}"