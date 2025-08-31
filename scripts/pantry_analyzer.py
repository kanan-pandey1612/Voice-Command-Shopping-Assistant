import json
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import re

class PantryAnalyzer:
    def __init__(self):
        self.pantry_categories = {
            'grains': ['rice', 'pasta', 'oats', 'quinoa', 'barley', 'couscous', 'bulgur'],
            'spices': ['salt', 'pepper', 'garlic_powder', 'onion_powder', 'paprika', 'cumin', 'oregano', 'basil'],
            'oils_vinegars': ['olive_oil', 'vegetable_oil', 'coconut_oil', 'vinegar', 'balsamic_vinegar'],
            'canned_goods': ['canned_tomatoes', 'tomato_sauce', 'canned_beans', 'chicken_broth', 'coconut_milk'],
            'baking': ['flour', 'sugar', 'baking_powder', 'baking_soda', 'vanilla_extract', 'cocoa_powder'],
            'condiments': ['soy_sauce', 'hot_sauce', 'ketchup', 'mustard', 'mayonnaise', 'honey'],
            'nuts_seeds': ['almonds', 'walnuts', 'peanuts', 'cashews', 'chia_seeds', 'sunflower_seeds'],
            'dried_goods': ['raisins', 'dates', 'dried_cranberries', 'peanut_butter', 'jam']
        }
        
        self.essential_pantry_items = [
            'rice', 'pasta', 'olive_oil', 'salt', 'black_pepper', 'garlic_powder',
            'flour', 'sugar', 'canned_tomatoes', 'chicken_broth', 'soy_sauce',
            'honey', 'oats', 'peanut_butter', 'canned_beans'
        ]
    
    def analyze_shopping_patterns(self, shopping_data):
        """Analyze shopping patterns to suggest pantry restocking"""
        item_frequency = Counter()
        category_frequency = defaultdict(int)
        
        for item in shopping_data:
            clean_name = self.clean_item_name(item['name'])
            item_frequency[clean_name] += 1
            
            category = self.categorize_item(clean_name)
            if category:
                category_frequency[category] += 1
        
        return {
            'most_bought_items': item_frequency.most_common(10),
            'category_distribution': dict(category_frequency),
            'missing_essentials': self.find_missing_essentials(shopping_data)
        }
    
    def clean_item_name(self, name):
        """Clean and normalize item names"""
        return re.sub(r'[^\w\s]', '', name.lower().strip()).replace(' ', '_')
    
    def categorize_item(self, item_name):
        """Categorize pantry items"""
        for category, items in self.pantry_categories.items():
            if any(pantry_item in item_name for pantry_item in items):
                return category
        return None
    
    def find_missing_essentials(self, shopping_data):
        """Find essential pantry items that are missing from recent shopping"""
        recent_items = [self.clean_item_name(item['name']) for item in shopping_data]
        missing = []
        
        for essential in self.essential_pantry_items:
            if not any(essential in item for item in recent_items):
                missing.append(essential.replace('_', ' '))
        
        return missing
    
    def generate_pantry_suggestions(self, current_items, user_preferences=None):
        """Generate smart pantry suggestions based on current items"""
        suggestions = []
        current_clean = [self.clean_item_name(item) for item in current_items]
        
        # Check for complementary items
        complementary_pairs = {
            'pasta': ['tomato_sauce', 'parmesan', 'olive_oil'],
            'rice': ['soy_sauce', 'sesame_oil', 'garlic'],
            'oats': ['honey', 'cinnamon', 'dried_cranberries'],
            'flour': ['baking_powder', 'vanilla_extract', 'sugar'],
            'chicken_broth': ['rice', 'pasta', 'vegetables'],
            'canned_tomatoes': ['basil', 'oregano', 'garlic_powder']
        }
        
        for item in current_clean:
            if item in complementary_pairs:
                for complement in complementary_pairs[item]:
                    if complement not in current_clean:
                        suggestions.append({
                            'item': complement.replace('_', ' '),
                            'reason': f'Great with {item.replace("_", " ")}',
                            'category': 'pantry'
                        })
        
        # Add missing essentials
        for essential in self.essential_pantry_items:
            if essential not in current_clean:
                suggestions.append({
                    'item': essential.replace('_', ' '),
                    'reason': 'Pantry essential',
                    'category': 'pantry'
                })
        
        return suggestions[:8]  # Return top 8 suggestions
    
    def create_pantry_inventory_template(self):
        """Create a template for pantry inventory tracking"""
        template = {
            'last_updated': datetime.now().isoformat(),
            'categories': {}
        }
        
        for category, items in self.pantry_categories.items():
            template['categories'][category] = {
                'items': {item.replace('_', ' '): {
                    'quantity': 0,
                    'unit': 'units',
                    'expiry_date': None,
                    'last_restocked': None,
                    'low_stock_threshold': 1
                } for item in items}
            }
        
        return template

# Example usage and testing
if __name__ == "__main__":
    analyzer = PantryAnalyzer()
    
    # Sample shopping data
    sample_data = [
        {'name': 'pasta', 'category': 'pantry', 'date': '2024-01-15'},
        {'name': 'tomato sauce', 'category': 'pantry', 'date': '2024-01-15'},
        {'name': 'rice', 'category': 'pantry', 'date': '2024-01-10'},
        {'name': 'olive oil', 'category': 'pantry', 'date': '2024-01-08'},
        {'name': 'garlic powder', 'category': 'pantry', 'date': '2024-01-05'}
    ]
    
    # Analyze patterns
    analysis = analyzer.analyze_shopping_patterns(sample_data)
    print("Shopping Pattern Analysis:")
    print(f"Most bought items: {analysis['most_bought_items']}")
    print(f"Missing essentials: {analysis['missing_essentials']}")
    
    # Generate suggestions
    current_items = ['pasta', 'rice', 'olive oil']
    suggestions = analyzer.generate_pantry_suggestions(current_items)
    print(f"\nPantry Suggestions:")
    for suggestion in suggestions:
        print(f"- {suggestion['item']}: {suggestion['reason']}")
    
    # Create inventory template
    template = analyzer.create_pantry_inventory_template()
    print(f"\nInventory template created with {len(template['categories'])} categories")
