import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { LaundryItem, Order, User, AppSettings, OrderStatus, PaymentStatus } from "./src/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

const app = express();
const PORT = 3000;

// Increase payload limit to handle base64 image uploads (screenshots and clothes)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Default initial services (defined as raw definitions and programmatically mapped to fit LaundryItem interface)
const baseMenItems = [
  { name: "Shirt", prices: { "Steam Iron": 15, "Wash Fold": 30, "Wash Iron": 40, "Wash & Iron + Starch": 55, "Dry Cleaning": 90 } },
  { name: "T-Shirt", prices: { "Steam Iron": 15, "Wash Fold": 25, "Wash Iron": 35, "Wash & Iron + Starch": 45, "Dry Cleaning": 80 } },
  { name: "Trouser/Pant", prices: { "Steam Iron": 15, "Wash Fold": 35, "Wash Iron": 50, "Wash & Iron + Starch": 65, "Dry Cleaning": 100 } },
  { name: "Kurta", prices: { "Steam Iron": 20, "Wash Fold": 35, "Wash Iron": 50, "Wash & Iron + Starch": 65, "Dry Cleaning": 110 } },
  { name: "Pajama", prices: { "Steam Iron": 15, "Wash Fold": 30, "Wash Iron": 40, "Wash & Iron + Starch": 55, "Dry Cleaning": 80 } },
  { name: "Kurta Pajama", prices: { "Steam Iron": 30, "Wash Fold": 60, "Wash Iron": 80, "Wash & Iron + Starch": 100, "Dry Cleaning": 180 } },
  { name: "Dhoti", prices: { "Steam Iron": 20, "Wash Fold": 40, "Wash Iron": 60, "Wash & Iron + Starch": 80, "Dry Cleaning": 120 } },
  { name: "Waist Coat", prices: { "Steam Iron": 30, "Wash Fold": 60, "Wash Iron": 100, "Wash & Iron + Starch": 120, "Dry Cleaning": 150 } },
  { name: "Dhoti (Set-3)", prices: { "Steam Iron": 40, "Wash Fold": 80, "Wash Iron": 120, "Wash & Iron + Starch": 150, "Dry Cleaning": 220 } },
  { name: "Blazer", prices: { "Steam Iron": 60, "Wash Fold": 100, "Wash Iron": 150, "Wash & Iron + Starch": 180, "Dry Cleaning": 250 } },
  { name: "Suit (2pcs Blazer+Trouser)", prices: { "Steam Iron": 80, "Wash Fold": 160, "Wash Iron": 250, "Wash & Iron + Starch": 300, "Dry Cleaning": 400 } },
  { name: "Suit (3pcs Blazer+Trouser+Shirt)", prices: { "Steam Iron": 100, "Wash Fold": 200, "Wash Iron": 300, "Wash & Iron + Starch": 360, "Dry Cleaning": 500 } },
  { name: "Short", prices: { "Steam Iron": 10, "Wash Fold": 20, "Wash Iron": 30, "Wash & Iron + Starch": 40, "Dry Cleaning": 60 } },
  { name: "Jacket", prices: { "Steam Iron": 40, "Wash Fold": 80, "Wash Iron": 120, "Wash & Iron + Starch": 150, "Dry Cleaning": 250 } },
  { name: "Hoodie", prices: { "Steam Iron": 25, "Wash Fold": 60, "Wash Iron": 80, "Wash & Iron + Starch": 100, "Dry Cleaning": 180 } },
  { name: "Tie", prices: { "Steam Iron": 10, "Wash Fold": 15, "Wash Iron": 20, "Wash & Iron + Starch": 30, "Dry Cleaning": 50 } },
  { name: "Handkerchief", prices: { "Steam Iron": 5, "Wash Fold": 8, "Wash Iron": 10, "Wash & Iron + Starch": 15, "Dry Cleaning": 25 } },
  { name: "Waist", prices: { "Steam Iron": 10, "Wash Fold": 15, "Wash Iron": 25, "Wash & Iron + Starch": 35, "Dry Cleaning": 50 } },
  { name: "Chef Coat", prices: { "Steam Iron": 25, "Wash Fold": 45, "Wash Iron": 60, "Wash & Iron + Starch": 80, "Dry Cleaning": 130 } }
];

const baseWomenItems = [
  { name: "Saree (Plain/Silk)", prices: { "Saree Rolling": 80, "Rolling + Starch": 120, "Steam Iron": 40, "Wash & Iron": 120, "Dry Cleaning": 220 } },
  { name: "Saree (Pattu)", prices: { "Saree Rolling": 120, "Rolling + Starch": 180, "Steam Iron": 60, "Wash & Iron": 180, "Dry Cleaning": 300 } },
  { name: "Saree (Fancy/Heavy)", prices: { "Saree Rolling": 150, "Rolling + Starch": 220, "Steam Iron": 80, "Wash & Iron": 220, "Dry Cleaning": 350 } },
  { name: "Dupatta", prices: { "Rolling + Starch": 30, "Steam Iron": 15, "Wash & Iron": 30, "Dry Cleaning": 60 } },
  { name: "Blouse", prices: { "Steam Iron": 15, "Wash & Iron": 40, "Dry Cleaning": 70 } },
  { name: "Blouse (Fancy/Heavy)", prices: { "Steam Iron": 30, "Wash & Iron": 70, "Dry Cleaning": 120 } },
  { name: "Lehanga (Plain)", prices: { "Steam Iron": 60, "Wash & Iron": 150, "Dry Cleaning": 250 } },
  { name: "Lehanga (Heavy)", prices: { "Steam Iron": 120, "Wash & Iron": 300, "Dry Cleaning": 500 } },
  { name: "Kurti (Fancy)", prices: { "Steam Iron": 30, "Wash & Iron": 80, "Dry Cleaning": 130 } },
  { name: "Kurti (Plain)", prices: { "Steam Iron": 20, "Wash & Iron": 60, "Dry Cleaning": 100 } },
  { name: "Pajama/Dupatta", prices: { "Steam Iron": 15, "Wash & Iron": 50, "Dry Cleaning": 80 } },
  { name: "Kurti (3pcs)", prices: { "Steam Iron": 45, "Wash & Iron": 120, "Dry Cleaning": 220 } },
  { name: "Long Dress", prices: { "Steam Iron": 40, "Wash & Iron": 100, "Dry Cleaning": 180 } },
  { name: "Skirt", prices: { "Steam Iron": 25, "Wash & Iron": 60, "Dry Cleaning": 110 } },
  { name: "Tops/Shirt", prices: { "Steam Iron": 20, "Wash & Iron": 50, "Dry Cleaning": 90 } }
];

const baseHouseholdItems = [
  { name: "Curtain", prices: { "Steam Iron": 40, "Wash & Iron": 120, "Dry Cleaning": 180 } },
  { name: "Curtain (Silk/Velvet)", prices: { "Steam Iron": 60, "Wash & Iron": 180, "Dry Cleaning": 250 } },
  { name: "Bed Sheet (S)", prices: { "Steam Iron": 25, "Wash & Iron": 65, "Dry Cleaning": 120 } },
  { name: "Bed Sheet (L)", prices: { "Steam Iron": 35, "Wash & Iron": 85, "Dry Cleaning": 150 } },
  { name: "Blanket (S)", prices: { "Wash & Iron": 150, "Dry Cleaning": 250 } },
  { name: "Blanket (L)", prices: { "Wash & Iron": 220, "Dry Cleaning": 350 } },
  { name: "Covers", prices: { "Steam Iron": 15, "Wash & Iron": 40, "Dry Cleaning": 70 } },
  { name: "Pillow", prices: { "Wash & Iron": 50, "Dry Cleaning": 100 } },
  { name: "Carpet Cleaning", prices: { "Wash & Iron": 350, "Dry Cleaning": 500 } }
];

const baseKidsItems = [
  { name: "Blazer", prices: { "Steam Iron": 40, "Wash & Iron": 90, "Dry Cleaning": 150 } },
  { name: "Shirt + T-Shirt", prices: { "Steam Iron": 10, "Wash & Iron": 30, "Dry Cleaning": 65 } },
  { name: "Skirt + Frock", prices: { "Steam Iron": 15, "Wash & Iron": 50, "Dry Cleaning": 80 } },
  { name: "Trouser / Jeans Pant", prices: { "Steam Iron": 15, "Wash & Iron": 40, "Dry Cleaning": 75 } }
];

const defaultServices: LaundryItem[] = [];

baseMenItems.forEach((item, idx) => {
  Object.entries(item.prices).forEach(([serviceType, price]) => {
    defaultServices.push({
      id: `men_${idx}_${serviceType.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: item.name,
      price,
      category: "MEN",
      serviceType
    });
  });
});

baseWomenItems.forEach((item, idx) => {
  Object.entries(item.prices).forEach(([serviceType, price]) => {
    defaultServices.push({
      id: `women_${idx}_${serviceType.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: item.name,
      price,
      category: "WOMEN",
      serviceType
    });
  });
});

baseHouseholdItems.forEach((item, idx) => {
  Object.entries(item.prices).forEach(([serviceType, price]) => {
    defaultServices.push({
      id: `household_${idx}_${serviceType.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: item.name,
      price,
      category: "HOUSEHOLD",
      serviceType
    });
  });
});

baseKidsItems.forEach((item, idx) => {
  Object.entries(item.prices).forEach(([serviceType, price]) => {
    defaultServices.push({
      id: `kids_${idx}_${serviceType.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: item.name,
      price,
      category: "KIDS",
      serviceType
    });
  });
});

// Default settings
const defaultSettings: AppSettings = {
  address: "Geetha Nagar, 8-4-300, Beside St. Martin School, Kandri Gutta, Balanagar, Hyderabad, Telangana – 500042",
  phones: ["7337427757", "8919501286", "9014025932"],
  upiId: "QR918919501286-0197@unionbankofindia",
  bannerText: "Professional Laundry & Dry Cleaning Services",
  bannerSubtext: "Doorstep Pickup & Delivery Available in Balanagar, Kukatpally & Surrounding Hyderabad Areas.",
  offers: [
    "Flat 10% Off on your first order! Use code: SKFIRST10",
    "Free pickup & delivery on orders above ₹500",
    "Get 5% loyalty cashback points on every order completed!"
  ],
  faqs: [
    { id: "faq-1", question: "What is your turnaround time?", answer: "Our standard turnaround time is 24 to 48 hours depending on the items and service type." },
    { id: "faq-2", question: "Do you provide pickup and delivery?", answer: "Yes, we provide doorstep pickup and delivery services across Balanagar, Kukatpally, Jeedimetla, and surrounding areas." },
    { id: "faq-3", question: "How do I make a payment?", answer: "You can pay using Cash on Delivery (COD) or securely via UPI (Google Pay, PhonePe, Paytm) by scanning our QR code or entering our UPI ID." },
    { id: "faq-4", question: "What is your policy for delicate clothes?", answer: "Delicate clothes like silk sarees, blazers, and designer lehangas are dry cleaned under expert care using eco-friendly processes." }
  ],
  testimonials: [
    { id: "test-1", name: "Anil Kumar", rating: 5, review: "Excellent service! They picked up my suits and returned them steam-ironed and looking brand new in just 24 hours.", date: "2026-06-28" },
    { id: "test-2", name: "Priya Sharma", rating: 5, review: "I regularly give my heavy sarees here. Very professional, highly recommended for delicate women's wear in Balanagar.", date: "2026-06-25" },
    { id: "test-3", name: "Vikram Reddy", rating: 5, review: "Best laundry service near Kandri Gutta. The prices are reasonable and the tracking page is extremely helpful.", date: "2026-06-29" }
  ],
  coupons: [
    { code: "SKFIRST10", discountType: "percentage", value: 10, minOrderValue: 200, description: "Get 10% Off on orders above ₹200", isActive: true },
    { code: "SKFREE50", discountType: "fixed", value: 50, minOrderValue: 500, description: "Save flat ₹50 on orders above ₹500", isActive: true }
  ]
};

// Internal DB state
let database: {
  services: LaundryItem[];
  settings: AppSettings;
  orders: Order[];
  users: User[];
  blockedUserIds: string[];
  auditLogs: { id: string; action: string; user: string; timestamp: string }[];
  ownerPassword?: string;
} = {
  services: defaultServices,
  settings: defaultSettings,
  orders: [],
  users: [
    {
      id: "u-owner",
      name: "SK Laundry Owner",
      email: "owner@sklaundry.com",
      mobile: "7337427757",
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      role: "OWNER"
    }
  ],
  blockedUserIds: [],
  auditLogs: [],
  ownerPassword: "Kalpana@3375"
};

// Load or initialize DB on startup
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(rawData);
    // Merge loaded data with default structure to prevent missing keys
    database = {
      services: parsed.services || defaultServices,
      settings: parsed.settings || defaultSettings,
      orders: parsed.orders || [],
      users: parsed.users || database.users,
      blockedUserIds: parsed.blockedUserIds || [],
      auditLogs: parsed.auditLogs || [],
      ownerPassword: parsed.ownerPassword || "Kalpana@3375"
    };
    console.log("Database successfully loaded from file.");
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
    console.log("Database file created with default records.");
  }
} catch (e) {
  console.error("Error setting up database file, using in-memory fallbacks:", e);
}

// Function to persist DB changes
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save database changes to disk:", e);
  }
}

// Helper to log actions
function logAudit(action: string, user: string) {
  const log = {
    id: "log-" + Math.random().toString(36).substring(2, 9),
    action,
    user,
    timestamp: new Date().toISOString()
  };
  database.auditLogs.unshift(log);
  if (database.auditLogs.length > 500) database.auditLogs.pop();
  saveDatabase();
}

// ---------------- API ENDPOINTS ----------------

// Services Endpoints
app.get("/api/services", (req, res) => {
  res.json(database.services);
});

app.post("/api/services", (req, res) => {
  const { id, name, price, category, serviceType } = req.body;
  if (!name || isNaN(Number(price)) || !category) {
    return res.status(400).json({ error: "Missing or invalid service details." });
  }

  const existingIndex = database.services.findIndex(s => s.id === id);
  if (existingIndex > -1) {
    database.services[existingIndex] = { 
      id, 
      name, 
      price: Number(price), 
      category, 
      serviceType: serviceType || database.services[existingIndex].serviceType || "Wash Iron" 
    };
    logAudit(`Updated service: ${name} (${serviceType || 'Wash Iron'}) (Price: ₹${price})`, "Owner/Admin");
  } else {
    const newId = "s-" + Math.random().toString(36).substring(2, 9);
    database.services.push({ 
      id: newId, 
      name, 
      price: Number(price), 
      category, 
      serviceType: serviceType || "Wash Iron" 
    });
    logAudit(`Added new service: ${name} (${serviceType || 'Wash Iron'}) (Price: ₹${price})`, "Owner/Admin");
  }
  saveDatabase();
  res.json({ success: true, services: database.services });
});

app.delete("/api/services/:id", (req, res) => {
  const { id } = req.params;
  const item = database.services.find(s => s.id === id);
  database.services = database.services.filter(s => s.id !== id);
  if (item) {
    logAudit(`Deleted service: ${item.name}`, "Owner/Admin");
  }
  saveDatabase();
  res.json({ success: true, services: database.services });
});

// Settings & Pricing Endpoints
app.get("/api/settings", (req, res) => {
  res.json(database.settings);
});

app.post("/api/settings", (req, res) => {
  const { address, phones, upiId, bannerText, bannerSubtext, offers } = req.body;
  database.settings = {
    ...database.settings,
    address: address || database.settings.address,
    phones: phones || database.settings.phones,
    upiId: upiId || database.settings.upiId,
    bannerText: bannerText || database.settings.bannerText,
    bannerSubtext: bannerSubtext || database.settings.bannerSubtext,
    offers: offers || database.settings.offers
  };
  logAudit("Updated global website settings", "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

// FAQs Endpoints
app.post("/api/settings/faqs", (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "Question and answer are required." });
  const newFaq = { id: "faq-" + Math.random().toString(36).substring(2, 9), question, answer };
  database.settings.faqs.push(newFaq);
  logAudit(`Added FAQ: ${question.substring(0, 30)}...`, "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

app.put("/api/settings/faqs/:id", (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  const index = database.settings.faqs.findIndex(f => f.id === id);
  if (index > -1) {
    database.settings.faqs[index] = { id, question, answer };
    logAudit(`Updated FAQ ID: ${id}`, "Owner/Admin");
    saveDatabase();
    res.json({ success: true, settings: database.settings });
  } else {
    res.status(404).json({ error: "FAQ not found." });
  }
});

app.delete("/api/settings/faqs/:id", (req, res) => {
  const { id } = req.params;
  database.settings.faqs = database.settings.faqs.filter(f => f.id !== id);
  logAudit(`Deleted FAQ ID: ${id}`, "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

// Testimonials Endpoints
app.post("/api/settings/testimonials", (req, res) => {
  const { name, rating, review } = req.body;
  if (!name || !rating || !review) return res.status(400).json({ error: "All feedback details are required." });
  const newTestimonial = {
    id: "test-" + Math.random().toString(36).substring(2, 9),
    name,
    rating: Number(rating),
    review,
    date: new Date().toISOString().split("T")[0]
  };
  database.settings.testimonials.unshift(newTestimonial);
  logAudit(`Added testimonial from ${name}`, name);
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

app.delete("/api/settings/testimonials/:id", (req, res) => {
  const { id } = req.params;
  database.settings.testimonials = database.settings.testimonials.filter(t => t.id !== id);
  logAudit(`Deleted Testimonial ID: ${id}`, "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

// Coupons Endpoints
app.post("/api/settings/coupons", (req, res) => {
  const { code, discountType, value, minOrderValue, description } = req.body;
  if (!code || !value) return res.status(400).json({ error: "Coupon code and value are required." });
  
  const formattedCode = code.toUpperCase().trim();
  const index = database.settings.coupons.findIndex(c => c.code === formattedCode);
  if (index > -1) return res.status(400).json({ error: "Coupon code already exists." });

  database.settings.coupons.push({
    code: formattedCode,
    discountType: discountType || "percentage",
    value: Number(value),
    minOrderValue: Number(minOrderValue) || 0,
    description: description || `Save on your laundry!`,
    isActive: true
  });
  logAudit(`Created Coupon: ${formattedCode}`, "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

app.put("/api/settings/coupons/:code", (req, res) => {
  const { code } = req.params;
  const { discountType, value, minOrderValue, description, isActive } = req.body;
  const index = database.settings.coupons.findIndex(c => c.code === code.toUpperCase());
  if (index > -1) {
    database.settings.coupons[index] = {
      ...database.settings.coupons[index],
      discountType: discountType || database.settings.coupons[index].discountType,
      value: value !== undefined ? Number(value) : database.settings.coupons[index].value,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : database.settings.coupons[index].minOrderValue,
      description: description || database.settings.coupons[index].description,
      isActive: isActive !== undefined ? Boolean(isActive) : database.settings.coupons[index].isActive
    };
    logAudit(`Updated Coupon: ${code}`, "Owner/Admin");
    saveDatabase();
    res.json({ success: true, settings: database.settings });
  } else {
    res.status(404).json({ error: "Coupon not found" });
  }
});

app.delete("/api/settings/coupons/:code", (req, res) => {
  const { code } = req.params;
  database.settings.coupons = database.settings.coupons.filter(c => c.code !== code.toUpperCase());
  logAudit(`Deleted Coupon: ${code}`, "Owner/Admin");
  saveDatabase();
  res.json({ success: true, settings: database.settings });
});

// Authentication Endpoints
// Secure user registration with local database, bcrypt encryption, duplicate checks, and JWT
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    // Validate fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: "Please enter all required fields (Name, Email, Mobile, Password)." });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format. Please provide a valid email address." });
    }

    // Mobile check (10 digits)
    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ error: "Invalid mobile number. Must be exactly 10 digits." });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({ error: "Weak password! Password must be at least 6 characters long." });
    }

    const duplicateEmail = database.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (duplicateEmail) {
      return res.status(400).json({ error: "Email already exists. Please use a different email or log in." });
    }

    const duplicatePhone = database.users.find(u => u.mobile === cleanMobile);
    if (duplicatePhone) {
      return res.status(400).json({ error: "Mobile number already registered. Please use a different phone number." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = "u-" + Math.random().toString(36).substring(2, 9);
    const userResponse = {
      id: userId,
      name,
      email: email.toLowerCase(),
      mobile: cleanMobile,
      address: address || "",
      loyaltyPoints: 10,
      createdAt: new Date().toISOString(),
      role: "CUSTOMER" as const,
      password: hashedPassword
    };

    database.users.push(userResponse as any);
    saveDatabase();

    const token = jwt.sign(
      { id: userId, email: userResponse.email, role: userResponse.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    logAudit(`New user registered: ${name} (${email})`, userResponse.name);

    const { password: _, ...cleanUser } = userResponse;

    return res.json({
      success: true,
      message: "Account Created Successfully",
      user: cleanUser,
      token
    });

  } catch (err: any) {
    console.error("Registration endpoint error:", err);
    return res.status(500).json({ error: "Internal server issue. Please try again later." });
  }
});

// Secure user login verifying password with bcrypt and returning a JWT token
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter your credentials." });
    }

    // Check if owner login
    if (email === "Sklaundry_3375" && password === (database.ownerPassword || "Kalpana@3375")) {
      const owner = database.users.find(u => u.role === "OWNER") || {
        id: "u-owner",
        name: "SK Laundry Owner",
        email: "owner@sklaundry.com",
        mobile: "7337427757",
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        role: "OWNER"
      };
      logAudit("Owner logged in successfully", "Owner/Admin");
      const token = jwt.sign({ id: owner.id, email: owner.email, role: "OWNER" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, user: owner, token });
    }

    const customer: any = database.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === "CUSTOMER");
    if (!customer) {
      return res.status(401).json({ error: "Invalid credentials or customer not registered." });
    }

    if (database.blockedUserIds.includes(customer.id)) {
      return res.status(403).json({ error: "Your account is temporarily suspended. Please contact SK Laundry Services." });
    }

    if (customer.password) {
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials or customer not registered." });
      }
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: customer.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...cleanUser } = customer;

    logAudit(`Customer logged in: ${customer.name}`, customer.name);
    return res.json({ success: true, user: cleanUser, token });

  } catch (err) {
    console.error("Login endpoint error:", err);
    return res.status(500).json({ error: "Internal server issue. Please try again later." });
  }
});

// Admin password change endpoint
// Admin password change endpoint
app.post("/api/auth/verify-password", async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ error: "Please enter your current password." });
    }

    const actualPassword = database.ownerPassword || "Kalpana@3375";
    if (currentPassword !== actualPassword) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    return res.json({ success: true, message: "Password verified successfully." });
  } catch (err) {
    console.error("Verify password error:", err);
    return res.status(500).json({ error: "Internal server issue. Please try again later." });
  }
});

app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please enter your current and new password." });
    }

    const actualPassword = database.ownerPassword || "Kalpana@3375";
    if (currentPassword !== actualPassword) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    database.ownerPassword = newPassword;
    logAudit("Owner password updated successfully", "Owner/Admin");
    saveDatabase();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server issue. Please try again later." });
  }
});


// MOCK SMS/WhatsApp OTP Verification helper
let activeOtps: Record<string, string> = {};

app.post("/api/auth/otp-send", (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: "Mobile number is required." });

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[mobile] = code;

  // In production this would hitTwilio/SMS API. Here we respond with code so user can see it!
  console.log(`[OTP Sent to ${mobile}]: ${code}`);
  res.json({
    success: true,
    message: "OTP sent successfully to " + mobile,
    otpDebug: code // For easy local validation/testing
  });
});

app.post("/api/auth/otp-verify", (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ error: "Mobile number and OTP are required." });

  if (activeOtps[mobile] === otp) {
    delete activeOtps[mobile];
    // Find or create customer
    let customer = database.users.find(u => u.mobile === mobile);
    if (!customer) {
      customer = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        name: "User " + mobile.substring(6),
        email: `user_${mobile}@sklaundry.com`,
        mobile,
        loyaltyPoints: 5,
        createdAt: new Date().toISOString(),
        role: "CUSTOMER"
      };
      database.users.push(customer);
      saveDatabase();
      logAudit(`New user verified & auto-created via OTP: ${mobile}`, customer.name);
    } else {
      logAudit(`User verified login via OTP: ${customer.name}`, customer.name);
    }
    return res.json({ success: true, user: customer });
  } else {
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }
});

// Orders Management
app.post("/api/orders", async (req, res) => {
  const {
    customerId,
    customerName,
    mobileNumber,
    items,
    totalPrice,
    pickupDate,
    pickupTime,
    deliveryDate,
    address,
    notes,
    clothImages,
    paymentMethod,
    paymentScreenshot,
    couponCode,
    discountAmount
  } = req.body;

  if (!customerName || !mobileNumber || !items || items.length === 0 || !pickupDate || !pickupTime || !address) {
    return res.status(400).json({ error: "Please enter all required order details." });
  }

  try {
    const year = new Date().getFullYear();
    const sequenceNum = String(database.orders.length + 1).padStart(4, "0");
    const orderId = `SK${year}${sequenceNum}`;

    const calculatedDeliveryDate = deliveryDate || new Date(new Date(pickupDate).getTime() + 48 * 60 * 60 * 1000).toISOString().split("T")[0];

    const orderResponse: Order = {
      id: orderId,
      customerId,
      customerName,
      mobileNumber,
      items: items.map((it: any) => ({
        id: it.id,
        name: it.name,
        category: it.category,
        quantity: Number(it.quantity),
        price: Number(it.price),
        serviceType: it.serviceType || "Wash Iron"
      })),
      totalPrice: Number(totalPrice),
      pickupDate,
      pickupTime,
      deliveryDate: calculatedDeliveryDate,
      address,
      notes: notes || "",
      clothImages: clothImages || [],
      status: "Pending",
      timeline: [
        { status: "Pending", timestamp: new Date().toISOString(), notes: "Order submitted successfully." }
      ],
      paymentMethod,
      paymentStatus: "Pending",
      paymentScreenshot: paymentScreenshot || undefined,
      createdAt: new Date().toISOString(),
      couponCode,
      discountAmount: Number(discountAmount) || 0
    };

    database.orders.unshift(orderResponse);

    if (customerId) {
      const userIndex = database.users.findIndex(u => u.id === customerId);
      if (userIndex > -1) {
        const pointsEarned = Math.floor(Number(totalPrice) / 100);
        database.users[userIndex].loyaltyPoints += pointsEarned;
        logAudit(`Order ${orderId} placed. Customer earned ${pointsEarned} loyalty points.`, customerName);
      }
    } else {
      logAudit(`Order ${orderId} placed as Guest by ${customerName}`, customerName);
    }

    saveDatabase();

    return res.json({
      success: true,
      order: orderResponse,
      smsTriggerMessage: `[SK LAUNDRY]: Hello ${customerName}, your Order ${orderId} of ₹${totalPrice} has been registered! Pickup is scheduled on ${pickupDate} (${pickupTime}).`
    });

  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Failed to place order. Please try again later." });
  }
});

app.get("/api/orders", (req, res) => {
  const customerId = req.query.customerId as string | undefined;
  // Local fallback
  if (customerId) {
    return res.json(database.orders.filter(o => o.customerId === customerId));
  }
  return res.json(database.orders);
});

// Single Order Search / Track public endpoint
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = database.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: "Order details not found. Please verify the Order ID." });
  }
  return res.json(order);
});

// Admin update order endpoint
app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, timelineNotes, address, deliveryDate } = req.body;

  const orderIndex = database.orders.findIndex(o => o.id.toUpperCase() === id.toUpperCase());
  if (orderIndex === -1) {
    return res.json({ success: true });
  }

  const order = database.orders[orderIndex];

  if (status && status !== order.status) {
    order.status = status as OrderStatus;
    order.timeline.push({
      status: status as OrderStatus,
      timestamp: new Date().toISOString(),
      notes: timelineNotes || `Status updated to ${status}`
    });
    logAudit(`Order ${order.id} status updated to: ${status}`, "Owner/Admin");
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus as PaymentStatus;
    logAudit(`Order ${order.id} payment status verified as: ${paymentStatus}`, "Owner/Admin");
  }

  if (address) order.address = address;
  if (deliveryDate) order.deliveryDate = deliveryDate;

  database.orders[orderIndex] = order;
  saveDatabase();

  return res.json({
    success: true,
    order,
    smsTriggerMessage: `[SK LAUNDRY]: Status update for Order ${order.id} -> ${order.status}. Thank you!`
  });
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  const exists = database.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  database.orders = database.orders.filter(o => o.id.toUpperCase() !== id.toUpperCase());
  if (exists) {
    logAudit(`Deleted Order ID: ${exists.id}`, "Owner/Admin");
  }
  saveDatabase();

  return res.json({ success: true, orders: database.orders });
});


// Customer management
app.get("/api/users", (req, res) => {
  const customersOnly = database.users.filter(u => u.role === "CUSTOMER");
  return res.json(customersOnly);
});

app.put("/api/users/:id/block", (req, res) => {
  const { id } = req.params;
  const { block } = req.body; // boolean

  // fallback/sync local
  const user = database.users.find(u => u.id === id);
  if (user) {
    if (block) {
      if (!database.blockedUserIds.includes(id)) {
        database.blockedUserIds.push(id);
        logAudit(`Blocked customer account: ${user.name}`, "Owner/Admin");
      }
    } else {
      database.blockedUserIds = database.blockedUserIds.filter(bid => bid !== id);
      logAudit(`Unblocked customer account: ${user.name}`, "Owner/Admin");
    }
  }
  saveDatabase();
  return res.json({ success: true, blockedUserIds: database.blockedUserIds });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  const user = database.users.find(u => u.id === id);
  database.users = database.users.filter(u => u.id !== id);
  database.blockedUserIds = database.blockedUserIds.filter(bid => bid !== id);
  if (user) {
    logAudit(`Deleted customer account: ${user.name}`, "Owner/Admin");
  }
  saveDatabase();

  return res.json({ success: true, users: database.users.filter(u => u.role === "CUSTOMER") });
});

// Dashboard Statistics & Reports Endpoints
app.get("/api/reports", (req, res) => {
  const orders = database.orders;
  const usersCount = database.users.filter(u => u.role === "CUSTOMER").length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== "Delivered").length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;

  const totalRevenue = orders
    .filter(o => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalCustomers = usersCount;

  // Today's orders
  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr));

  // Generate charts data
  // Daily reports (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
    const revenue = dayOrders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.totalPrice, 0);
    return {
      date: dateStr.substring(5), // MM-DD
      orders: dayOrders.length,
      revenue
    };
  }).reverse();

  // Monthly reports
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const yearlyData = months.map((month, idx) => {
    const monthPrefix = `${currentYear}-${String(idx + 1).padStart(2, "0")}`;
    const mOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(monthPrefix));
    const revenue = mOrders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.totalPrice, 0);
    return {
      month,
      orders: mOrders.length,
      revenue
    };
  });

  return res.json({
    stats: {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalCustomers,
      todayOrdersCount: todayOrders.length,
      todayRevenue: todayOrders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.totalPrice, 0)
    },
    last7Days,
    yearlyData,
    auditLogs: database.auditLogs.slice(0, 15) // top 15 logs
  });
});


// ---------------- VITE MIDDLEWARE SETUP ----------------

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SK LAUNDRY SERVER] Express running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
