# Import necessary libraries
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) to allow your frontend to communicate with this backend
CORS(app)

# This function contains the logic for generating smart suggestions
def get_smart_suggestions(history):
    seasonal_items = [
        "mango", "orange", "watermelon", "grapes", "apple", "strawberries", "cherries"
    ]
    substitutes = {
        "milk": "almond milk",
        "butter": "margarine",
        "bread": "brown bread",
        "sugar": "jaggery",
    }

    suggestions = []

    # Add suggestions based on common item pairings
    if "bread" in history: suggestions.append("butter")
    if "milk" in history: suggestions.append("cookies")
    if "pasta" in history: suggestions.append("pasta sauce")

    # Add seasonal items
    suggestions.extend(seasonal_items)

    # Add substitutes for items in the list
    for item in history:
        if item in substitutes:
            suggestions.append(substitutes[item])

    # Ensure suggestions are unique and not already in the user's list
    unique_suggestions = list(set(suggestions))
    return [item for item in unique_suggestions if item not in history]

# Define an API endpoint at the URL '/api/suggestions'
@app.route('/api/suggestions', methods=['POST'])
def suggestions_endpoint():
    # Get the shopping list history sent from the frontend
    data = request.get_json()
    history = data.get('history', [])
    
    # Generate suggestions based on the history
    suggestions = get_smart_suggestions(history)
    
    # Send the suggestions back to the frontend
    return jsonify(suggestions)

# This block runs the server when you execute the file
if __name__ == '__main__':
    # Runs the app on http://127.0.0.1:5000
    app.run(host='0.0.0.0', port=5000)