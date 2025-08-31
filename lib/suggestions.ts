export function getSmartSuggestions(history: string[]) {
  const seasonalItems = [
    "mango",
    "orange",
    "watermelon",
    "grapes",
    "apple",
    "strawberries",
    "cherries",
  ];
  const substitutes: Record<string, string> = {
    milk: "almond milk",
    butter: "margarine",
    bread: "brown bread",
    sugar: "jaggery",
    chips: "baked chips",
    "white rice": "brown rice",
  };

  const suggestions: string[] = [];

  // History-based
  if (history.includes("bread")) suggestions.push("butter");
  if (history.includes("milk")) suggestions.push("cookies");
  if (history.includes("pasta")) suggestions.push("pasta sauce");
  if (history.includes("chips")) suggestions.push("salsa");

  // Add seasonal items
  suggestions.push(...seasonalItems);

  // Substitutes
  history.forEach((item) => {
    if (substitutes[item]) suggestions.push(substitutes[item]);
  });

  // Remove duplicates and items already in the list
  const uniqueSuggestions = [...new Set(suggestions)];
  return uniqueSuggestions.filter((item) => !history.includes(item));
}