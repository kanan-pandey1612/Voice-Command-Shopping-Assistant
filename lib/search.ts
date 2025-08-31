// Voice-Shopping-Assistance/lib/search.ts

interface Item {
  name: string;
  brand: string;
  price: number;
}

const items: Item[] = [
  // Fruits
  { name: "Apple", brand: "Organic", price: 100 },
  { name: "Banana", brand: "Fresh", price: 40 },
  { name: "Mango", brand: "Local", price: 120 },
  { name: "Orange", brand: "Imported", price: 90 },
  { name: "Grapes", brand: "Green", price: 80 },
  { name: "Strawberries", brand: "Fresh", price: 150 },
  { name: "Cherries", brand: "Organic", price: 200 },
  { name: "Pineapple", brand: "Queen", price: 110 },
  { name: "Watermelon", brand: "Sweet", price: 70 },

  // Vegetables
  { name: "Potato", brand: "Local", price: 30 },
  { name: "Onion", brand: "Nashik", price: 40 },
  { name: "Tomato", brand: "Desi", price: 50 },
  { name: "Carrot", brand: "Organic", price: 60 },
  { name: "Broccoli", brand: "Fresh", price: 80 },
  { name: "Spinach", brand: "Organic", price: 25 },
  { name: "Cucumber", brand: "Farm Fresh", price: 35 },

  // Grains & Essentials
  { name: "Rice", brand: "Basmati", price: 200 },
  { name: "Brown Rice", brand: "Organic", price: 250 },
  { name: "Wheat Flour", brand: "Aashirvaad", price: 220 },
  { name: "Pasta", brand: "Local", price: 90 },
  { name: "Sugar", brand: "Refined", price: 50 },
  { name: "Jaggery", brand: "Organic", price: 70 },
  { name: "Salt", brand: "Tata", price: 20 },
  { name: "Olive Oil", brand: "Figaro", price: 450 },
  { name: "Vegetable Oil", brand: "Fortune", price: 150 },

  // Dairy & Alternatives
  { name: "Milk", brand: "Amul", price: 30 },
  { name: "Almond Milk", brand: "So Good", price: 120 },
  { name: "Butter", brand: "Amul", price: 55 },
  { name: "Margarine", brand: "Nutralite", price: 60 },
  { name: "Cheese", brand: "Britannia", price: 80 },
  { name: "Yogurt", brand: "Nestle", price: 40 },

  // Snacks
  { name: "Cookies", brand: "Britannia", price: 50 },
  { name: "Chips", brand: "Lays", price: 20 },
  { name: "Baked Chips", brand: "Lays", price: 30 },
  { name: "Salsa", brand: "Doritos", price: 100 },
  { name: "Nuts", brand: "Happilo", price: 300 },

  // Bakery
  { name: "Bread", brand: "Modern", price: 40 },
  { name: "Brown Bread", brand: "Britannia", price: 50 },

  // Pantry & Condiments
  { name: "Pasta Sauce", brand: "Barilla", price: 180 },
  { name: "Ketchup", brand: "Kissan", price: 90 },
  { name: "Honey", brand: "Dabur", price: 150 },
  
  // Personal Care
  { name: "Toothpaste", brand: "Colgate", price: 40 },
  { name: "Soap", brand: "Dove", price: 45 },
  { name: "Shampoo", brand: "Head & Shoulders", price: 180 },
];

function parseQuery(query: string) {
  let cleanQuery = query.toLowerCase();
  let priceFilter: { max?: number; min?: number } = {};
  let brandFilter: string | null = null;

  const underMatch = cleanQuery.match(/under\s*(\d+)/);
  if (underMatch) {
    priceFilter.max = parseInt(underMatch[1], 10);
    cleanQuery = cleanQuery.replace(underMatch[0], "").trim();
  }

  const overMatch = cleanQuery.match(/over\s*(\d+)/);
  if (overMatch) {
    priceFilter.min = parseInt(overMatch[1], 10);
    cleanQuery = cleanQuery.replace(overMatch[0], "").trim();
  }

  const betweenMatch = cleanQuery.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (betweenMatch) {
    priceFilter.min = parseInt(betweenMatch[1], 10);
    priceFilter.max = parseInt(betweenMatch[2], 10);
    cleanQuery = cleanQuery.replace(betweenMatch[0], "").trim();
  }

  const allBrands = [...new Set(items.map((i) => i.brand.toLowerCase()))];
  for (const brand of allBrands) {
    if (cleanQuery.includes(brand)) {
      brandFilter = brand;
      cleanQuery = cleanQuery.replace(brand, "").trim();
    }
  }

  return { cleanQuery, priceFilter, brandFilter };
}

export async function searchItem(
  query: string
): Promise<{ name: string; brand: string; price: number }[]> {
  const { cleanQuery, priceFilter, brandFilter } = parseQuery(query);

  let results = items.filter(
    (item) =>
      item.name.toLowerCase().includes(cleanQuery) ||
      item.brand.toLowerCase().includes(cleanQuery)
  );

  if (priceFilter.max) {
    results = results.filter((item) => item.price <= priceFilter.max!);
  }
  if (priceFilter.min) {
    results = results.filter((item) => item.price >= priceFilter.min!);
  }
  if (brandFilter) {
    results = results.filter(
      (item) => item.brand.toLowerCase() === brandFilter
    );
  }

  return results;
}

export function getItemPrice(itemName: string): number {
    const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    // If the item is found, return its price.
    // Otherwise, return a random price between 10 and 100.
    return item ? item.price : Math.floor(Math.random() * 91) + 10;
}