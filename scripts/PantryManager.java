import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class PantryManager {
    private Map<String, List<String>> pantryCategories;
    private List<String> essentialItems;
    private Map<String, PantryItem> inventory;
    
    public PantryManager() {
        initializePantryCategories();
        initializeEssentialItems();
        this.inventory = new HashMap<>();
    }
    
    private void initializePantryCategories() {
        pantryCategories = new HashMap<>();
        
        pantryCategories.put("grains", Arrays.asList(
            "rice", "pasta", "oats", "quinoa", "barley", "couscous", "bulgur"
        ));
        
        pantryCategories.put("spices", Arrays.asList(
            "salt", "black_pepper", "garlic_powder", "onion_powder", "paprika", 
            "cumin", "oregano", "basil", "thyme", "rosemary", "cinnamon"
        ));
        
        pantryCategories.put("oils_vinegars", Arrays.asList(
            "olive_oil", "vegetable_oil", "coconut_oil", "vinegar", "balsamic_vinegar"
        ));
        
        pantryCategories.put("canned_goods", Arrays.asList(
            "canned_tomatoes", "tomato_sauce", "canned_beans", "chicken_broth", 
            "coconut_milk", "canned_corn", "canned_tuna"
        ));
        
        pantryCategories.put("baking", Arrays.asList(
            "flour", "sugar", "brown_sugar", "baking_powder", "baking_soda", 
            "vanilla_extract", "cocoa_powder", "chocolate_chips"
        ));
        
        pantryCategories.put("condiments", Arrays.asList(
            "soy_sauce", "hot_sauce", "ketchup", "mustard", "mayonnaise", 
            "honey", "maple_syrup", "worcestershire_sauce"
        ));
        
        pantryCategories.put("nuts_seeds", Arrays.asList(
            "almonds", "walnuts", "peanuts", "cashews", "chia_seeds", 
            "sunflower_seeds", "pumpkin_seeds", "flax_seeds"
        ));
    }
    
    private void initializeEssentialItems() {
        essentialItems = Arrays.asList(
            "rice", "pasta", "olive_oil", "salt", "black_pepper", "garlic_powder",
            "flour", "sugar", "canned_tomatoes", "chicken_broth", "soy_sauce",
            "honey", "oats", "peanut_butter", "canned_beans"
        );
    }
    
    public class PantryItem {
        private String name;
        private String category;
        private int quantity;
        private String unit;
        private LocalDate expiryDate;
        private LocalDate lastRestocked;
        private int lowStockThreshold;
        
        public PantryItem(String name, String category, int quantity, String unit) {
            this.name = name;
            this.category = category;
            this.quantity = quantity;
            this.unit = unit;
            this.lastRestocked = LocalDate.now();
            this.lowStockThreshold = 1;
        }
        
        // Getters and setters
        public String getName() { return name; }
        public String getCategory() { return category; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public boolean isLowStock() { return quantity <= lowStockThreshold; }
        public boolean isExpired() { 
            return expiryDate != null && LocalDate.now().isAfter(expiryDate); 
        }
        
        @Override
        public String toString() {
            return String.format("%s (%d %s) - Category: %s", 
                name, quantity, unit, category);
        }
    }
    
    public void addItem(String name, String category, int quantity, String unit) {
        String key = name.toLowerCase().replace(" ", "_");
        if (inventory.containsKey(key)) {
            PantryItem existing = inventory.get(key);
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            inventory.put(key, new PantryItem(name, category, quantity, unit));
        }
        System.out.println("Added: " + name + " (" + quantity + " " + unit + ")");
    }
    
    public void removeItem(String name, int quantity) {
        String key = name.toLowerCase().replace(" ", "_");
        if (inventory.containsKey(key)) {
            PantryItem item = inventory.get(key);
            int newQuantity = Math.max(0, item.getQuantity() - quantity);
            item.setQuantity(newQuantity);
            System.out.println("Removed: " + quantity + " " + name + 
                             " (Remaining: " + newQuantity + ")");
        } else {
            System.out.println("Item not found: " + name);
        }
    }
    
    public List<String> getLowStockItems() {
        List<String> lowStock = new ArrayList<>();
        for (PantryItem item : inventory.values()) {
            if (item.isLowStock()) {
                lowStock.add(item.getName());
            }
        }
        return lowStock;
    }
    
    public List<String> getMissingEssentials() {
        List<String> missing = new ArrayList<>();
        for (String essential : essentialItems) {
            if (!inventory.containsKey(essential) || 
                inventory.get(essential).getQuantity() == 0) {
                missing.add(essential.replace("_", " "));
            }
        }
        return missing;
    }
    
    public Map<String, List<PantryItem>> getItemsByCategory() {
        Map<String, List<PantryItem>> categorized = new HashMap<>();
        
        for (PantryItem item : inventory.values()) {
            categorized.computeIfAbsent(item.getCategory(), k -> new ArrayList<>())
                      .add(item);
        }
        
        return categorized;
    }
    
    public void generateShoppingList() {
        System.out.println("\n=== SHOPPING LIST ===");
        
        List<String> lowStock = getLowStockItems();
        if (!lowStock.isEmpty()) {
            System.out.println("Low Stock Items:");
            lowStock.forEach(item -> System.out.println("- " + item));
        }
        
        List<String> missing = getMissingEssentials();
        if (!missing.isEmpty()) {
            System.out.println("\nMissing Essentials:");
            missing.forEach(item -> System.out.println("- " + item));
        }
        
        if (lowStock.isEmpty() && missing.isEmpty()) {
            System.out.println("Your pantry is well stocked!");
        }
    }
    
    public void displayInventory() {
        System.out.println("\n=== PANTRY INVENTORY ===");
        Map<String, List<PantryItem>> categorized = getItemsByCategory();
        
        for (Map.Entry<String, List<PantryItem>> entry : categorized.entrySet()) {
            System.out.println("\n" + entry.getKey().toUpperCase() + ":");
            for (PantryItem item : entry.getValue()) {
                String status = item.isLowStock() ? " (LOW STOCK)" : "";
                System.out.println("  " + item + status);
            }
        }
    }
    
    public static void main(String[] args) {
        PantryManager manager = new PantryManager();
        
        // Add some sample items
        manager.addItem("Rice", "grains", 5, "lbs");
        manager.addItem("Pasta", "grains", 3, "boxes");
        manager.addItem("Olive Oil", "oils_vinegars", 1, "bottle");
        manager.addItem("Salt", "spices", 1, "container");
        manager.addItem("Canned Tomatoes", "canned_goods", 4, "cans");
        
        // Display inventory
        manager.displayInventory();
        
        // Generate shopping list
        manager.generateShoppingList();
        
        // Simulate using some items
        manager.removeItem("Rice", 2);
        manager.removeItem("Pasta", 3);
        
        // Check for low stock
        System.out.println("\nAfter using some items:");
        manager.generateShoppingList();
    }
}
