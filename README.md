# Voice Command Shopping Assistant

Voice Command Shopping Assistant is a modern, voice-enabled smart shopping list manager built with Next.js and Python. It allows users to interact with their shopping list using natural language commands, provides intelligent product suggestions, and supports multiple languages.

## Features Implemented

### Voice Input and NLP
- **Voice Command Recognition:** Add, remove, clear, and search items using spoken commands (e.g., “Add 2 liters of milk”).
- **Natural Language Processing (NLP):** Understands varied user phrases for commands and quantities, including commands at the beginning or end of a sentence.
- **Multilingual Support:** Accepts voice input in English and Hindi.

### Smart Suggestions
- **Product Recommendations:** Suggests items based on common pairings from the shopping list history (e.g., suggests "butter" if "bread" is added).
- **Seasonal Items:** Recommends items that are currently in season.
- **Substitutes:** Offers alternative items (e.g., "almond milk" for "milk").

### Shopping List Management
- **Add/Remove Items:** Dynamically manage items and quantities using voice or UI buttons.
- **Categorization:** Automatically categorizes items into groups like Dairy, Produce, and Snacks.
- **Quantity Management:** Detects quantities from voice input and allows for adjustments in the UI.
- **Total Cost:** Automatically calculates and displays the total cost of all items in the list.

### Voice-Activated Search
- **Item Search:** Search for items by name or brand using voice.
- **Price Filtering:** Supports natural voice filters like “under 100 rupees”.

### User Interface & Experience
- **Modern Design:** Clean and appealing interface built with Next.js and Shadcn/UI, featuring a custom color theme.
- **Real-Time Feedback:** Displays recognized speech, actions, and loading states immediately.
- **Mobile-Friendly:** The interface is fully responsive and optimized for mobile devices.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, Flask (for API-driven smart suggestions)
- **UI Components:** Shadcn/UI
- **State Management:** React Hooks

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Python (v3.8 or later)
- npm (or yarn/pnpm)

### Clone the Repository

git clone [https://github.com/kanan-pandey1612/Voice-Command-Shopping-Assistant.git](https://github.com/kanan-pandey1612/Voice-Command-Shopping-Assistant.git)

### Setup and Run

Install Frontend Dependencies:
```
npm install --legacy-peer-deps
```

Install Backend Dependencies:
```
pip install Flask Flask-Cors
```

Run the Backend Server (Open a terminal and run):
```
python api/main.py
```

The backend will be running on http://127.0.0.1:5000.

Run the Frontend Server (Open a second terminal and run):
```
npm run dev
```
The application will be available at http://localhost:3000.
