from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Prescription, PrescriptionItem

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'user_type']

class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['medicine_name', 'dosage', 'frequency', 'duration', 'quantity', 'instructions']
        read_only_fields = ['id']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, required=False)
    doctor = UserBasicSerializer(read_only=True)
    patient = UserBasicSerializer(read_only=True)
    filled_by = UserBasicSerializer(read_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'prescription_id', 'doctor', 'patient', 'patient_id',
            'diagnosis', 'notes', 'status', 'created_at', 'updated_at',
            'issued_date', 'filled_by', 'filled_date', 'items'
        ]
        read_only_fields = ['id', 'prescription_id', 'doctor', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        prescription = Prescription.objects.create(**validated_data)
        
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        
        return prescription
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update prescription fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items
        if items_data:
            # Clear existing items and create new ones
            instance.items.all().delete()
            for item_data in items_data:
                PrescriptionItem.objects.create(prescription=instance, **item_data)
        
        return instance

class PrescriptionCreateSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)
    patient_id = serializers.IntegerField()
    
    class Meta:
        model = Prescription
        fields = ['patient_id', 'diagnosis', 'notes', 'items']
    
    def validate_patient_id(self, value):
        try:
            patient = User.objects.get(id=value, user_type='patient')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Valid patient required.")
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one medicine item is required.")
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        patient_id = validated_data.pop('patient_id')
        
        # Get patient object
        try:
            patient = User.objects.get(id=patient_id, user_type='patient')
        except User.DoesNotExist:
            raise serializers.ValidationError("Valid patient required.")
        
        # Create prescription
        prescription = Prescription.objects.create(
            patient=patient,
            **validated_data
        )
        
        # Create items
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
        
        return prescription