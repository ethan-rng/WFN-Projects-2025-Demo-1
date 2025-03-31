from google.cloud import vision
from google.oauth2 import service_account
import logging
import os

class VisionController:
    def __init__(self):

        credentials = service_account.Credentials.from_service_account_file(
            'supaTopSecret.json')
        self.client = vision.ImageAnnotatorClient(credentials=credentials)

    def allowed_file(self, filename):
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def analyze_image(self, image_file):
        try:
            if image_file and self.allowed_file(image_file.filename):
                content = image_file.read()
                image = vision.Image(content=content)

                # Perform object localization on the image file
                object_response = self.client.object_localization(image=image)
                objects = object_response.localized_object_annotations

                # Perform label detection on the image file
                label_response = self.client.label_detection(image=image)
                labels = label_response.label_annotations

                # Combine results from object localization and label detection
                ingredients = self.get_ingredients(objects, labels)
                return ingredients
            return []
        except Exception as e:
            logging.error(f"Error analyzing image: {e}")
            raise

    def get_ingredients(self, objects, labels):
        ingredients = set()

        for obj in objects:
            ingredients.add(obj.name)

        for label in labels:
            if label.score > 0.1:
                ingredients.add(label.description)

        return list(ingredients)