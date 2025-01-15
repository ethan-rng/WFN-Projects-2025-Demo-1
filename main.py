from flask import Flask, request, jsonify
from google.cloud import vision
import openai
import os
from dotenv import load_dotenv
from flask_cors import CORS  # For handling CORS with React

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS

vision_client = vision.ImageAnnotatorClient()
openai.api_key = os.getenv('OPENAI_API_KEY')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image = request.files['image']
        
        if not allowed_file(image.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Process with Google Vision API
        content = image.read()
        vision_image = vision.Image(content=content)
        objects = vision_client.object_localization(image=vision_image)
        
        # Extract food items
        food_items = [
            obj.name for obj in objects.localized_object_annotations
            if obj.score > 0.5  # Confidence threshold
        ]
        
        # Get recipe suggestions from ChatGPT
        prompt = f"Suggest 9 recipes I can make with these ingredients: {', '.join(food_items)}"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful cooking assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        
        recipes = response.choices[0].message.content
        
        return jsonify({
            'ingredients': food_items,
            'recipes': recipes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

