/**
 * BiteCraft - Centralized Product & Business Data
 * Fully customizable menu items with realistic Indian Rupee (₹) pricing,
 * categorization, dietary indicators, nutrition, spice meters, and customizable add-ons.
 *
 * Stored on window.BiteCraftData for 100% local file:// and web server compatibility.
 */

(function () {
  'use strict';

  // Fallback placeholder SVG generator so no image ever breaks
  function createFallbackSvg(title, bg = '#ff6f00') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="100%" height="100%" fill="${bg}"/>
      <circle cx="200" cy="130" r="60" fill="rgba(255,255,255,0.2)"/>
      <text x="50%" y="140" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#ffffff">🥪</text>
      <text x="50%" y="220" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ffffff">${title}</text>
      <text x="50%" y="245" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">BiteCraft Premium</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const INITIAL_PRODUCTS = [
    // --- SANDWICHES ---
    {
      id: "prod-1",
      name: "Cheese-Loaded Grilled Sandwich",
      category: "Sandwiches",
      price: 169,
      description: "Triple-layer sandwich bursting with melted mozzarella, processed cheddar, sweet corn, and secret herbs.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Cheese Grilled Sandwich", "#d97706"),
      rating: 4.9,
      spiceLevel: 1, // 0 = None, 1 = Mild, 2 = Medium, 3 = Fiery
      nutrition: { calories: 420, protein: "14g", carbs: "48g", fat: "19g" },
      allergens: ["Dairy", "Gluten"],
      customizations: [
        {
          group: "Bread Choice",
          type: "single",
          required: true,
          options: [
            { name: "White Bread (Classic)", price: 0, default: true },
            { name: "Whole Wheat Bread", price: 15 },
            { name: "Multigrain Sourdough", price: 25 }
          ]
        },
        {
          group: "Toasting Preference",
          type: "single",
          required: true,
          options: [
            { name: "Crispy Grilled (Recommended)", price: 0, default: true },
            { name: "Soft Toasted", price: 0 },
            { name: "Non-Toasted", price: 0 }
          ]
        },
        {
          group: "Delicious Add-Ons",
          type: "multiple",
          options: [
            { name: "Extra Melted Cheese Blend", price: 35 },
            { name: "Diced Jalapeños & Olives", price: 20 },
            { name: "Tandoori Mayo Drizzle", price: 15 },
            { name: "Paneer Cubes", price: 30 }
          ]
        }
      ]
    },
    {
      id: "prod-2",
      name: "Tandoori Paneer Tikka Sandwich",
      category: "Sandwiches",
      price: 189,
      description: "Char-grilled marinated paneer cubes, crisp capsicum, mint chutney, and chipotle mayo.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Paneer Tikka Sandwich", "#b45309"),
      rating: 4.8,
      spiceLevel: 2,
      nutrition: { calories: 450, protein: "18g", carbs: "44g", fat: "22g" },
      allergens: ["Dairy", "Gluten"],
      customizations: [
        {
          group: "Bread Choice",
          type: "single",
          required: true,
          options: [
            { name: "White Bread", price: 0, default: true },
            { name: "Whole Wheat Bread", price: 15 },
            { name: "Garlic Infused Bread", price: 25 }
          ]
        },
        {
          group: "Spice Level",
          type: "single",
          required: true,
          options: [
            { name: "Medium Spicy", price: 0, default: true },
            { name: "Mild", price: 0 },
            { name: "Extra Desi Spicy 🔥", price: 0 }
          ]
        },
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Double Paneer Portion", price: 45 },
            { name: "Extra Cheese Slice", price: 25 },
            { name: "Caramelized Onions", price: 20 }
          ]
        }
      ]
    },
    {
      id: "prod-3",
      name: "Mexican Salsa & Corn Sandwich",
      category: "Sandwiches",
      price: 159,
      description: "Zesty Mexican tomato salsa, sweet golden corn, crunchy nachos crumbles, and cheddar cheese.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Mexican Salsa Sandwich", "#ea580c"),
      rating: 4.7,
      spiceLevel: 2,
      nutrition: { calories: 380, protein: "11g", carbs: "52g", fat: "14g" },
      allergens: ["Dairy", "Gluten"],
      customizations: [
        {
          group: "Bread Choice",
          type: "single",
          required: true,
          options: [
            { name: "White Bread", price: 0, default: true },
            { name: "Whole Wheat Bread", price: 15 }
          ]
        },
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Extra Salsa & Cheese", price: 30 },
            { name: "Sliced Jalapeños", price: 15 },
            { name: "Guacamole Spread", price: 40 }
          ]
        }
      ]
    },
    {
      id: "prod-4",
      name: "Classic Veggie Club Sandwich",
      category: "Sandwiches",
      price: 149,
      description: "Timeless 3-decker layered with fresh cucumber, tomato, boiled potato slices, and tangy mint mayo.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Veggie Club Sandwich", "#16a34a"),
      rating: 4.6,
      spiceLevel: 1,
      nutrition: { calories: 340, protein: "9g", carbs: "56g", fat: "10g" },
      allergens: ["Gluten"],
      customizations: [
        {
          group: "Bread Choice",
          type: "single",
          required: true,
          options: [
            { name: "White Bread", price: 0, default: true },
            { name: "Brown Bread", price: 15 }
          ]
        },
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Cheese Slice", price: 25 },
            { name: "Peri-Peri Masala Sprinkle", price: 10 }
          ]
        }
      ]
    },
    {
      id: "prod-5",
      name: "Peri-Peri Crispy Chicken Sandwich",
      category: "Sandwiches",
      price: 219,
      description: "Golden spiced chicken breast fillets with fiery African peri-peri glaze and crisp iceberg lettuce.",
      vegetarian: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Peri-Peri Chicken", "#dc2626"),
      rating: 4.9,
      spiceLevel: 3,
      nutrition: { calories: 510, protein: "32g", carbs: "42g", fat: "22g" },
      allergens: ["Gluten"],
      customizations: [
        {
          group: "Spice Level",
          type: "single",
          required: true,
          options: [
            { name: "Classic Peri-Peri", price: 0, default: true },
            { name: "Mild Lemon Herb", price: 0 },
            { name: "Extra Fiery Ghost Pepper", price: 10 }
          ]
        },
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Double Smoked Cheese", price: 30 },
            { name: "Fried Egg", price: 25 }
          ]
        }
      ]
    },

    // --- BURGERS ---
    {
      id: "prod-6",
      name: "The BiteCraft Ultimate Aloo Tikki Burger",
      category: "Burgers",
      price: 119,
      description: "Crispy spiced herb potato patty, tomato slice, crunchy onions, and signature house cream dressing.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Ultimate Aloo Burger", "#d97706"),
      rating: 4.8,
      spiceLevel: 1,
      nutrition: { calories: 390, protein: "8g", carbs: "58g", fat: "14g" },
      allergens: ["Gluten", "Dairy"],
      customizations: [
        {
          group: "Patty & Cheese",
          type: "multiple",
          options: [
            { name: "Extra Cheese Slice", price: 25 },
            { name: "Double Patty", price: 40 },
            { name: "Chipotle Dip", price: 20 }
          ]
        }
      ]
    },
    {
      id: "prod-7",
      name: "Smokey Paneer Crunch Burger",
      category: "Burgers",
      price: 179,
      description: "Thick panko-crusted cottage cheese patty with smokey BBQ relish, pickled onions, and cheddar.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Smokey Paneer Burger", "#ca8a04"),
      rating: 4.7,
      spiceLevel: 2,
      nutrition: { calories: 480, protein: "20g", carbs: "46g", fat: "24g" },
      allergens: ["Gluten", "Dairy"],
      customizations: [
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Extra Cheese Slice", price: 25 },
            { name: "Jalapeño Poppers on Top", price: 35 }
          ]
        }
      ]
    },
    {
      id: "prod-8",
      name: "Crispy Fried Chicken Feast Burger",
      category: "Burgers",
      price: 229,
      description: "100% whole muscle chicken tossed in 11 secret herbs, topped with garlic aioli and crunchy slaw.",
      vegetarian: false,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Crispy Chicken Burger", "#b91c1c"),
      rating: 4.9,
      spiceLevel: 2,
      nutrition: { calories: 560, protein: "34g", carbs: "45g", fat: "26g" },
      allergens: ["Gluten", "Eggs"],
      customizations: [
        {
          group: "Options",
          type: "multiple",
          options: [
            { name: "Make it a Double Chicken Patty", price: 79 },
            { name: "Extra Cheese Melt", price: 30 }
          ]
        }
      ]
    },

    // --- FRIES & SIDES ---
    {
      id: "prod-9",
      name: "Overloaded Cheesy Peri-Peri Fries",
      category: "Fries",
      price: 149,
      description: "Golden shoestring fries tossed in fiery peri-peri dust, smothered in liquid cheddar & garlic herbs.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Loaded Fries", "#f59e0b"),
      rating: 4.9,
      spiceLevel: 2,
      nutrition: { calories: 430, protein: "7g", carbs: "52g", fat: "21g" },
      allergens: ["Dairy"],
      customizations: [
        {
          group: "Portion Size",
          type: "single",
          required: true,
          options: [
            { name: "Regular Tub", price: 0, default: true },
            { name: "Jumbo Sharing Tub", price: 50 }
          ]
        },
        {
          group: "Extra Toppings",
          type: "multiple",
          options: [
            { name: "Extra Liquid Cheese Dip", price: 30 },
            { name: "Spicy Mexican Beans", price: 25 }
          ]
        }
      ]
    },
    {
      id: "prod-10",
      name: "Classic Salted French Fries",
      category: "Fries",
      price: 99,
      description: "Crispy on the outside, fluffy on the inside. Lightly dusted with sea salt.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Salted French Fries", "#eab308"),
      rating: 4.5,
      spiceLevel: 0,
      nutrition: { calories: 310, protein: "4g", carbs: "44g", fat: "14g" },
      allergens: [],
      customizations: [
        {
          group: "Size",
          type: "single",
          required: true,
          options: [
            { name: "Regular", price: 0, default: true },
            { name: "Large", price: 35 }
          ]
        }
      ]
    },
    {
      id: "prod-11",
      name: "Cheesy Garlic Breadsticks (4 Pcs)",
      category: "Snacks",
      price: 139,
      description: "Freshly baked herb bread infused with roasted garlic butter and overflowing with melted mozzarella.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Garlic Breadsticks", "#d97706"),
      rating: 4.8,
      spiceLevel: 1,
      nutrition: { calories: 360, protein: "12g", carbs: "38g", fat: "18g" },
      allergens: ["Gluten", "Dairy"]
    },

    // --- PIZZAS ---
    {
      id: "prod-12",
      name: "Farmhouse Delight Thin-Crust Pizza",
      category: "Pizza",
      price: 279,
      description: "Stone-baked hand-tossed crust with San Marzano tomato sauce, bell peppers, sweet corn, mushrooms & basil.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Farmhouse Pizza", "#dc2626"),
      rating: 4.8,
      spiceLevel: 1,
      nutrition: { calories: 640, protein: "24g", carbs: "78g", fat: "26g" },
      allergens: ["Gluten", "Dairy"],
      customizations: [
        {
          group: "Crust Choice",
          type: "single",
          required: true,
          options: [
            { name: "Classic Hand Tossed", price: 0, default: true },
            { name: "Cheese Burst Crust", price: 65 }
          ]
        }
      ]
    },
    {
      id: "prod-13",
      name: "Paneer Makhani Fusion Pizza",
      category: "Pizza",
      price: 299,
      description: "Indian butter gravy base, tandoori spiced paneer cubes, red paprika, and stretchy mozzarella.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Paneer Makhani Pizza", "#c2410c"),
      rating: 4.7,
      spiceLevel: 2,
      nutrition: { calories: 690, protein: "28g", carbs: "74g", fat: "32g" },
      allergens: ["Gluten", "Dairy"]
    },

    // --- WRAPS & ROLLS ---
    {
      id: "prod-14",
      name: "Crispy Falafel & Hummus Wrap",
      category: "Wraps",
      price: 159,
      description: "Authentic Mediterranean chickpea patties, garlic tahini, pickled beetroot, and mixed greens in soft tortilla.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Falafel Hummus Wrap", "#15803d"),
      rating: 4.7,
      spiceLevel: 1,
      nutrition: { calories: 410, protein: "14g", carbs: "56g", fat: "15g" },
      allergens: ["Gluten", "Sesame"]
    },
    {
      id: "prod-15",
      name: "Fiery Paneer Kathi Roll",
      category: "Wraps",
      price: 169,
      description: "Flaky paratha wrap filled with charred spicy paneer, crunchy sliced onions, and fresh lemon mint dressing.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Paneer Kathi Roll", "#b45309"),
      rating: 4.8,
      spiceLevel: 3,
      nutrition: { calories: 480, protein: "18g", carbs: "50g", fat: "23g" },
      allergens: ["Gluten", "Dairy"]
    },

    // --- MOMOS & PASTA ---
    {
      id: "prod-16",
      name: "Pan-Fried Steamed Veg Momos (6 Pcs)",
      category: "Momos",
      price: 129,
      description: "Thin-wrapper dumplings packed with ginger-scented shredded vegetables, served with fiery spicy red chutney.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Steamed Veg Momos", "#ea580c"),
      rating: 4.6,
      spiceLevel: 2,
      nutrition: { calories: 290, protein: "8g", carbs: "46g", fat: "8g" },
      allergens: ["Gluten", "Soy"]
    },
    {
      id: "prod-17",
      name: "Creamy Alfredo White Sauce Pasta",
      category: "Pasta",
      price: 219,
      description: "Penne pasta tossed in velvety garlic parmesan cream sauce with sauteed broccoli, bell peppers, and olives.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Alfredo Pasta", "#f59e0b"),
      rating: 4.7,
      spiceLevel: 1,
      nutrition: { calories: 530, protein: "16g", carbs: "64g", fat: "24g" },
      allergens: ["Gluten", "Dairy"]
    },

    // --- BEVERAGES ---
    {
      id: "prod-18",
      name: "Signature Cold Coffee Frappé",
      category: "Beverages",
      price: 119,
      description: "Slow-brewed dark roast espresso whipped thick with creamy milk, chocolate drizzle, and vanilla ice cream scoop.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Cold Coffee Frappé", "#78350f"),
      rating: 4.9,
      spiceLevel: 0,
      nutrition: { calories: 280, protein: "6g", carbs: "38g", fat: "12g" },
      allergens: ["Dairy"],
      customizations: [
        {
          group: "Sweetness & Ice",
          type: "single",
          required: true,
          options: [
            { name: "Regular Sweetness", price: 0, default: true },
            { name: "Less Sugar", price: 0 },
            { name: "No Added Sugar", price: 0 }
          ]
        },
        {
          group: "Add-Ons",
          type: "multiple",
          options: [
            { name: "Extra Espresso Shot", price: 30 },
            { name: "Whipped Cream Topping", price: 25 },
            { name: "Hazelnut Flavour Shot", price: 25 }
          ]
        }
      ]
    },
    {
      id: "prod-19",
      name: "Mint Lime Sparkling Mojito",
      category: "Beverages",
      price: 99,
      description: "Crushed garden mint, freshly squeezed tangy lime wedges, organic sugar syrup, and fizzy sparkling soda.",
      vegetarian: true,
      bestseller: false,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Mint Mojito", "#16a34a"),
      rating: 4.8,
      spiceLevel: 0,
      nutrition: { calories: 120, protein: "0g", carbs: "30g", fat: "0g" },
      allergens: []
    },
    {
      id: "prod-20",
      name: "Nutella Thick Shake",
      category: "Beverages",
      price: 149,
      description: "Decadent hazelnut cocoa spread blended with chilled whole milk, topped with chocolate vermicelli.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Nutella Thick Shake", "#451a03"),
      rating: 4.9,
      spiceLevel: 0,
      nutrition: { calories: 440, protein: "9g", carbs: "56g", fat: "20g" },
      allergens: ["Dairy", "Nuts"]
    },

    // --- DESSERTS ---
    {
      id: "prod-21",
      name: "Sizzling Chocolate Walnut Brownie",
      category: "Desserts",
      price: 139,
      description: "Warm fudgy dark chocolate walnut brownie accompanied by a scoop of vanilla bean gelato and hot fudge.",
      vegetarian: true,
      bestseller: true,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
      fallbackImage: createFallbackSvg("Sizzling Brownie", "#3b1e10"),
      rating: 4.9,
      spiceLevel: 0,
      nutrition: { calories: 460, protein: "7g", carbs: "58g", fat: "23g" },
      allergens: ["Dairy", "Gluten", "Nuts"]
    }
  ];

  // Categories list
  const CATEGORIES = [
    { id: "All", name: "All Items", icon: "utensils" },
    { id: "Sandwiches", name: "Sandwiches", icon: "sandwich" },
    { id: "Burgers", name: "Burgers", icon: "sandwich" },
    { id: "Fries", name: "Fries & Sides", icon: "french-fries" },
    { id: "Pizza", name: "Pizzas", icon: "pizza" },
    { id: "Wraps", name: "Wraps & Rolls", icon: "scroll" },
    { id: "Snacks", name: "Snacks & Bread", icon: "croissant" },
    { id: "Momos", name: "Momos", icon: "cookie" },
    { id: "Pasta", name: "Pasta", icon: "soup" },
    { id: "Beverages", name: "Beverages", icon: "coffee" },
    { id: "Desserts", name: "Desserts", icon: "cake" }
  ];

  // Outlets / Locations
  const OUTLETS = [
    { id: "downtown", name: "Metro Downtown Hub", eta: "20 - 30 mins", address: "42 MG Road, Central Plaza", phone: "+91 98765 43210" },
    { id: "westside", name: "Westside Mall Express", eta: "30 - 40 mins", address: "Food Court L2, Westside Mall", phone: "+91 98765 43211" },
    { id: "airport", name: "Airport Express Cloud Kitchen", eta: "35 - 45 mins", address: "Terminal Concourse, Aero Hub", phone: "+91 98765 43212" }
  ];

  // Default Demo Coupons
  const DEFAULT_COUPONS = {
    "BITE10": { code: "BITE10", type: "percent", value: 10, minOrder: 199, label: "10% OFF on orders above ₹199" },
    "SUPER20": { code: "SUPER20", type: "percent", value: 20, minOrder: 499, label: "20% OFF on orders above ₹499" },
    "FLAT50": { code: "FLAT50", type: "flat", value: 50, minOrder: 299, label: "Flat ₹50 OFF on orders above ₹299" },
    "FREESHIP": { code: "FREESHIP", type: "delivery", value: 40, minOrder: 150, label: "Free Demo Delivery (Min ₹150)" }
  };

  const STORAGE_KEY_PRODUCTS = "bitecraft_demo_products";
  const STORAGE_KEY_COUPONS = "bitecraft_demo_coupons";

  function getStoredProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read products from localStorage", e);
    }
    return INITIAL_PRODUCTS;
  }

  function saveStoredProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      return true;
    } catch (e) {
      console.error("Could not write products to localStorage", e);
      return false;
    }
  }

  function resetToDefaultProducts() {
    try {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    } catch (e) {}
    return INITIAL_PRODUCTS;
  }

  function getStoredCoupons() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COUPONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read coupons from localStorage", e);
    }
    return DEFAULT_COUPONS;
  }

  function saveStoredCoupons(coupons) {
    try {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
      return true;
    } catch (e) {
      console.error("Could not write coupons to localStorage", e);
      return false;
    }
  }

  function resetToDefaultCoupons() {
    try {
      localStorage.removeItem(STORAGE_KEY_COUPONS);
    } catch (e) {}
    return DEFAULT_COUPONS;
  }

  window.BiteCraftData = {
    initialProducts: INITIAL_PRODUCTS,
    getProducts: getStoredProducts,
    saveProducts: saveStoredProducts,
    resetProducts: resetToDefaultProducts,
    categories: CATEGORIES,
    outlets: OUTLETS,
    coupons: getStoredCoupons(),
    getCoupons: getStoredCoupons,
    saveCoupons: saveStoredCoupons,
    resetCoupons: resetToDefaultCoupons,
    deliveryFee: 40,
    freeDeliveryThreshold: 499
  };

})();
