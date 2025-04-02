import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.vision_routes import setVisionRoutes
from routes.chatgpt_routes import setChatgptRoutes  # Import the function
from routes.recipe_routes import setRecipeRoutes

# Load environment variables from .env file
load_dotenv()

recipes = [
    {
        "id": 1,
        "name": "Vegetable Stir Fry",
        "image": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-bSVmNUgE2KYWW9VY22ayel1T/user-s07IbpcgucXWt59a4O0FbakN/img-kw2kwid3QayrJdexJqAwlQjx.png?st=2025-04-01T17%3A40%3A27Z&se=2025-04-01T19%3A40%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-01T00%3A36%3A34Z&ske=2025-04-02T00%3A36%3A34Z&sks=b&skv=2024-08-04&sig=MCB5CY5g/GLildluYdAQ4uZlVzUEa6KzucOBXQSNKik%3D",
        "ingredients": [
            "2 tablespoons vegetable oil",
            "1 onion, sliced",
            "2 bell peppers, sliced",
            "2 carrots, julienned",
            "2 cups broccoli florets",
            "3 cloves garlic, minced",
            "2 tablespoons soy sauce",
            "1 tablespoon sesame oil",
            "Salt and pepper to taste"
        ],
        "steps": [
            "Heat oil in a large pan or wok over high heat.",
            "Add onions and stir fry for 1 minute.",
            "Add garlic and cook for 30 seconds.",
            "Add vegetables and stir fry for 5-7 minutes until crisp-tender.",
            "Add soy sauce, sesame oil, salt, and pepper.",
            "Serve hot over rice or noodles."
        ],
    },
    {
        "id": 2,
        "name": "Pasta Carbonara",
        "image": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-bSVmNUgE2KYWW9VY22ayel1T/user-s07IbpcgucXWt59a4O0FbakN/img-kw2kwid3QayrJdexJqAwlQjx.png?st=2025-04-01T17%3A40%3A27Z&se=2025-04-01T19%3A40%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-01T00%3A36%3A34Z&ske=2025-04-02T00%3A36%3A34Z&sks=b&skv=2024-08-04&sig=MCB5CY5g/GLildluYdAQ4uZlVzUEa6KzucOBXQSNKik%3D",
        "ingredients": [
            "8 oz spaghetti",
            "2 large eggs",
            "1 cup grated Parmesan cheese",
            "4 slices bacon, diced",
            "2 cloves garlic, minced",
            "Salt and pepper to taste",
            "Chopped parsley for garnish"
        ],
        "steps": [
            "Cook pasta according to package directions.",
            "In a bowl, whisk together eggs and Parmesan cheese.",
            "In a skillet, cook bacon until crispy. Add garlic and cook for 30 seconds.",
            "Drain pasta, reserving 1/2 cup pasta water.",
            "Add hot pasta to the skillet with bacon and garlic.",
            "Remove from heat and quickly stir in egg mixture and a splash of pasta water.",
            "Season with salt and pepper, garnish with parsley."
        ],
    },
    {
        "id": 3,
        "name": "Spinach and Feta Salad",
        "image": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-bSVmNUgE2KYWW9VY22ayel1T/user-s07IbpcgucXWt59a4O0FbakN/img-kw2kwid3QayrJdexJqAwlQjx.png?st=2025-04-01T17%3A40%3A27Z&se=2025-04-01T19%3A40%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-01T00%3A36%3A34Z&ske=2025-04-02T00%3A36%3A34Z&sks=b&skv=2024-08-04&sig=MCB5CY5g/GLildluYdAQ4uZlVzUEa6KzucOBXQSNKik%3D",
        "ingredients": [
            "4 cups fresh spinach leaves",
            "1/4 cup crumbled feta cheese",
            "1/4 cup sliced red onion",
            "1/4 cup sliced almonds, toasted",
            "1/4 cup dried cranberries",
            "2 tablespoons olive oil",
            "1 tablespoon balsamic vinegar",
            "Salt and pepper to taste"
        ],
        "steps": [
            "In a large bowl, combine spinach, feta, red onion, almonds, and cranberries.",
            "In a small bowl, whisk together olive oil, balsamic vinegar, salt, and pepper.",
            "Pour dressing over salad and toss to coat.",
            "Serve immediately."
        ]
    },
    {
        "id": 4,
        "name": "Chicken Curry",
        "image": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-bSVmNUgE2KYWW9VY22ayel1T/user-s07IbpcgucXWt59a4O0FbakN/img-kw2kwid3QayrJdexJqAwlQjx.png?st=2025-04-01T17%3A40%3A27Z&se=2025-04-01T19%3A40%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-01T00%3A36%3A34Z&ske=2025-04-02T00%3A36%3A34Z&sks=b&skv=2024-08-04&sig=MCB5CY5g/GLildluYdAQ4uZlVzUEa6KzucOBXQSNKik%3D",
        "ingredients": [
            "1 lb boneless chicken, cubed",
            "2 tablespoons vegetable oil",
            "1 onion, diced",
            "2 cloves garlic, minced",
            "1 tablespoon ginger, grated",
            "2 tablespoons curry powder",
            "1 can (14 oz) coconut milk",
            "1 cup diced tomatoes",
            "Salt to taste",
            "Fresh cilantro for garnish"
        ],
        "steps": [
            "Heat oil in a large pan over medium heat.",
            "Add onions and cook until translucent.",
            "Add garlic and ginger, cook for 1 minute.",
            "Add chicken and cook until browned.",
            "Stir in curry powder and cook for 1 minute.",
            "Add coconut milk and tomatoes, simmer for 15-20 minutes.",
            "Season with salt and garnish with cilantro.",
            "Serve with rice."
        ]
    },
]

app = Flask(__name__)
CORS(app)

setRecipeRoutes(app)
setVisionRoutes(app)
setChatgptRoutes(app)  # Use the function

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({"message": "Welcome to the Recipe API!"})

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    
    """Return all recipes"""

    return jsonify(recipes)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")