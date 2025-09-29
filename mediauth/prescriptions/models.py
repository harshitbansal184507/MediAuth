from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('filled', 'Filled'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Core prescription info
    prescription_id = models.CharField(max_length=20, unique=True,  blank=True)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescribed_prescriptions')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_prescriptions')
    
    # Prescription details
    diagnosis = models.TextField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    issued_date = models.DateTimeField(null=True, blank=True)
    
    # Pharmacy info (when filled)
    filled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='filled_prescriptions')
    filled_date = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.prescription_id:
            # Generate prescription ID
            from datetime import datetime
            self.prescription_id = f"RX{datetime.now().strftime('%Y%m%d')}{self.id or '000'}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.prescription_id} - {self.patient.username}"

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)  # e.g., "3 times daily"
    duration = models.CharField(max_length=100)   # e.g., "7 days"
    quantity = models.IntegerField()
    instructions = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.medicine_name} - {self.prescription.prescription_id}"