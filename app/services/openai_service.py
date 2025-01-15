import openai
import os

class OpenAIService:
    def __init__(self):
        openai.api_key = os.getenv('OPENAI_API_KEY')

    def get_recipes(self, ingredients):
        prompt = f"Suggest 3 recipes I can make with these ingredients: {', '.join(ingredients)}"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful cooking assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content 