from rest_framework import serializers
from .models import PrescriptionUpload

class PrescriptionUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionUpload
        fields = ['id', 'image', 'original_filename', 'status', 'extracted_text', 
                 'parsed_data', 'uploaded_at', 'processed_at']
        read_only_fields = ['id', 'status', 'extracted_text', 'parsed_data', 
                           'uploaded_at', 'processed_at']

class PrescriptionUploadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionUpload
        fields = ['image']
    
    def create(self, validated_data):
        image = validated_data['image']
        validated_data['original_filename'] = image.name
        
        upload = PrescriptionUpload.objects.create(
            patient=self.context['request'].user,
            **validated_data
        )
        
        return upload