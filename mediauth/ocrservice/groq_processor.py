import base64
import json
from groq import Groq
from django.conf import settings

class GroqPrescriptionProcessor:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in settings")
        
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"  # Updated Groq vision model
        print(f"Groq client initialized with model: {self.model}")  # Debug log
    
    def encode_image(self, image_path):
        """Encode image to base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def process_prescription(self, image_path):
        """Process prescription image using Groq Vision API"""
        try:
            # Encode image
            base64_image = self.encode_image(image_path)
            
            # Create prompt for structured extraction
            prompt = """Analyze this prescription image and extract the following information in JSON format:

{
  "doctor_name": "Doctor's full name",
  "patient_name": "Patient's full name",
  "date": "Date on prescription (format: DD/MM/YYYY)",
  "diagnosis": "Diagnosis or condition mentioned",
  "medicines": [
    {
      "medicine_name": "Full medicine name",
      "dosage": "Dosage (e.g., 500mg, 10ml)",
      "frequency": "How often to take (e.g., twice daily, 3 times a day)",
      "duration": "Duration (e.g., 7 days, 2 weeks)",
      "quantity": "Total quantity",
      "instructions": "Special instructions (e.g., after food, before sleep)"
    }
  ],
  "notes": "Any additional notes or instructions"
}

Only return the JSON object. If any field is not found or unclear, use an empty string "" for text fields or empty array [] for medicines.
Extract all medicines you can identify from the prescription."""

            # Call Groq Vision API
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                model=self.model,
                temperature=0.1,
                max_completion_tokens=2000,  # Updated parameter name
            )
            
            # Extract response
            response_text = chat_completion.choices[0].message.content
            
            # Parse JSON from response
            # Sometimes the model wraps JSON in markdown code blocks
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            parsed_data = json.loads(json_str)
            
            return {
                'status': 'completed',
                'extracted_text': response_text,
                'parsed_data': parsed_data,
                'success': True
            }
            
        except json.JSONDecodeError as e:
            return {
                'status': 'failed',
                'extracted_text': response_text if 'response_text' in locals() else '',
                'parsed_data': {},
                'success': False,
                'error': f"Failed to parse JSON: {str(e)}"
            }
        except Exception as e:
            return {
                'status': 'failed',
                'extracted_text': '',
                'parsed_data': {},
                'success': False,
                'error': str(e)
            }