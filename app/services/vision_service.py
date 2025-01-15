from google.cloud import vision

class VisionService:
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()

    def detect_food_items(self, image_content):
        vision_image = vision.Image(content=image_content)
        objects = self.client.object_localization(image=vision_image)
        
        food_items = [
            obj.name for obj in objects.localized_object_annotations
            if obj.score > 0.5
        ]
        return food_items 