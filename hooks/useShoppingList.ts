import { useState, useEffect, useMemo } from "react";
import { getItemPrice } from "../lib/search";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  addedAt: Date;
  completed: boolean;
}

// **FIX:** Separated 'Produce' into 'Fruits' and 'Vegetables'
const categories: Record<string, string> = {
  // Fruits
  apple: "Fruits", banana: "Fruits", orange: "Fruits", grapes: "Fruits", mango: "Fruits", watermelon: "Fruits", strawberries: "Fruits", cherries: "Fruits", pineapple: "Fruits",

  // Vegetables
  potato: "Vegetables", onion: "Vegetables", tomato: "Vegetables", carrot: "Vegetables", spinach: "Vegetables", broccoli: "Vegetables", cucumber: "Vegetables",
  
  // Dairy & Alternatives
  milk: "Dairy", cheese: "Dairy", butter: "Dairy", yogurt: "Dairy",
  
  // Snacks
  chips: "Snacks", cookies: "Snacks", nuts: "Snacks",
  
  // Bakery
  bread: "Bakery", cake: "Bakery", muffins: "Bakery",
  
  // Grains & Pantry
  rice: "Grains", pasta: "Grains", flour: "Grains",
  sugar: "Pantry", salt: "Pantry", oil: "Pantry", ketchup: "Pantry", honey: "Pantry",
  
  // Household & Personal Care
  soap: "Household",
  toothpaste: "Personal Care", shampoo: "Personal Care",
};

const numberWords: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseItem(command: string): { quantity: number; name: string } {
  const cleanedCommand = command.toLowerCase().trim();
  const words = cleanedCommand.split(' ');
  const firstWord = words[0];

  if (numberWords[firstWord]) {
    return {
      quantity: numberWords[firstWord],
      name: words.slice(1).join(' '),
    };
  }

  const digitMatch = cleanedCommand.match(/^(\d+)\s*(.*)/);
  if (digitMatch) {
    return {
      quantity: parseInt(digitMatch[1], 10),
      name: digitMatch[2].trim(),
    };
  }
  
  return { quantity: 1, name: cleanedCommand };
}


export default function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    try {
      const savedItemsJSON = localStorage.getItem("shoppingItems");
      if (savedItemsJSON) {
        const savedItems = JSON.parse(savedItemsJSON);
        
        const migratedItems = savedItems.map((item: any) => {
          if (typeof item.price !== 'number') {
            console.log(`Migrating old item: ${item.name}`);
            return { ...item, price: getItemPrice(item.name) };
          }
          return item;
        });
        
        setItems(migratedItems);
      }
    } catch (error) {
      console.error("Failed to parse/migrate shopping items from localStorage:", error);
      localStorage.removeItem("shoppingItems");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shoppingItems", JSON.stringify(items));
  }, [items]);

  const addItem = (command: string) => {
    const { quantity, name } = parseItem(command);
    if (!name) return;

    const existingItem = items.find(i => i.name.toLowerCase() === name.toLowerCase());

    if (existingItem) {
        increaseQuantity(existingItem.id, quantity);
    } else {
        const categoryKey = Object.keys(categories).find((key) => name.includes(key)) || "other";
        const price = getItemPrice(name);

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name,
            quantity,
            category: categories[categoryKey] || "Other",
            price,
            addedAt: new Date(),
            completed: false,
        };
        setItems((prev) => [...prev, newItem]);
    }
  };

  const removeItemByName = (name: string): boolean => {
    if (!name) return false;
    const itemExists = items.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (itemExists) {
      setItems((prev) => prev.filter((i) => i.name.toLowerCase() !== name.toLowerCase()));
    }
    return itemExists;
  };
  
  const increaseQuantity = (id: string, amount = 1) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item));
  };

  const decreaseQuantity = (id: string, amount = 1) => {
    setItems(items.map(item => 
        item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity - amount) } 
        : item
    ));
  };

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  };

  const clearList = () => setItems([]);

  const groupedItems = useMemo(() => items.reduce(
    (groups, item) => {
      const category = item.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    },
    {} as Record<string, ShoppingItem[]>
  ), [items]);
  
  const totalCost = useMemo(() => 
    items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
  [items]);

  return { items, addItem, removeItemByName, increaseQuantity, decreaseQuantity, toggleItem, clearList, groupedItems, totalCost };
}