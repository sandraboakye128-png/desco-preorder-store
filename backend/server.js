import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import multer from "multer";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- DATABASE ----------
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in environment variables");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// create tables if not exist
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT,
        price NUMERIC,
        category TEXT,
        image1 TEXT,
        image2 TEXT,
        image3 TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        product_id INTEGER,
        quantity INTEGER
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        full_name TEXT,
        phone TEXT,
        delivery_address TEXT,
        products JSONB,
        total_price NUMERIC,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS landing_images (
        id SERIAL PRIMARY KEY,
        image TEXT
      );
    `);

    console.log("📌 PostgreSQL tables ready");
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
    process.exit(1);
  }
}
initTables();

// ---------- MIDDLEWARE ----------
app.use(express.json());

function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.SECRET || "desco_secret");

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://desco-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- MULTER ----------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------- DESCO ADMIN ----------
const DESCO_ADMIN = {
  email: "admin@desco.com",
  password: "desco1234",
  name: "DESCO Admin"
};

// ---------- SUPABASE UPLOADER ----------
async function uploadToSupabase(file, bucketName = "desco-products") {
  if (!file) return "";

  const fileName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return "";
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
}

// ---------- AUTH ----------
app.post("/api/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password)
       VALUES ($1,$2,$3)
       RETURNING id, full_name, email, role`,
      [full_name, email, hashed]
    );

    res.json({ message: "Registration successful", user: result.rows[0] });
    console.log(`[${new Date().toISOString()}] User registered: ${email}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Register error:`, err);
    if (err.code === "23505") {
      res.status(400).json({ message: "Email already registered" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // -------------------------------
    // TEMP: Allow plain-text login for admin@desco.com
    // -------------------------------
    if (user.email === "admin@desco.com" && password === "desco1234") {
      const token = jwt.sign(
        { id: user.id, role: "admin" },
        process.env.SECRET || "desco_secret",
        { expiresIn: "6h" }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: "admin"
        }
      });
    }

    // -------------------------------
    // NORMAL USERS (bcrypt check)
    // -------------------------------
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET || "desco_secret",
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------------------------------------------------------
// --------------------------- PRODUCTS -------------------------------
// --------------------------------------------------------------------

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD PRODUCT (ADMIN ONLY)
app.post("/api/products", requireAdmin, upload.array("images", 3), async (req, res) => {
  try {
    const { name, price, category } = req.body;

    let image1 = "", image2 = "", image3 = "";

    if (req.files?.length) {
      if (req.files[0]) image1 = await uploadToSupabase(req.files[0], "desco-products");
      if (req.files[1]) image2 = await uploadToSupabase(req.files[1], "desco-products");
      if (req.files[2]) image3 = await uploadToSupabase(req.files[2], "desco-products");
    }

    const result = await pool.query(
      `INSERT INTO products (name, price, category, image1, image2, image3)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, price, category, image1, image2, image3]
    );

    res.json(result.rows[0]);
    console.log("Product added:", name);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PRODUCT (ADMIN ONLY)
app.put("/api/products/:id", requireAdmin, upload.array("images", 3), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const existing = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);

    if (!existing.rows.length)
      return res.status(404).json({ message: "Product not found" });

    let { image1, image2, image3 } = existing.rows[0];

    if (req.files?.length) {
      if (req.files[0]) image1 = await uploadToSupabase(req.files[0], "desco-products");
      if (req.files[1]) image2 = await uploadToSupabase(req.files[1], "desco-products");
      if (req.files[2]) image3 = await uploadToSupabase(req.files[2], "desco-products");
    }

    const result = await pool.query(
      `UPDATE products SET name=$1, price=$2, category=$3, image1=$4, image2=$5, image3=$6
       WHERE id=$7 RETURNING *`,
      [name, price, category, image1, image2, image3, req.params.id]
    );

    res.json(result.rows[0]);
    console.log("Product updated:", name);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE PRODUCT (ADMIN ONLY)
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.json({ message: "Product deleted" });
    console.log("Product deleted ID:", req.params.id);
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- CART ----------
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM carts WHERE user_id=$1", [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const existing = await pool.query(
      "SELECT * FROM carts WHERE user_id=$1 AND product_id=$2",
      [userId, productId]
    );

    if (existing.rows.length) {
      await pool.query(
        "UPDATE carts SET quantity = quantity + $1 WHERE id=$2",
        [quantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES ($1,$2,$3)",
        [userId, productId, quantity]
      );
    }

    res.json({ message: "Added to cart" });
    console.log("Cart updated for user ID:", userId);
  } catch (err) {
    console.error("Cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- ORDERS ----------

// CREATE ORDER
app.post("/api/orders", async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      phone,
      delivery_address,
      products,
      total_price
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID required" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Products required" });
    }

    const result = await pool.query(
      `INSERT INTO orders
       (user_id, full_name, phone, delivery_address, products, total_price, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING *`,
      [
        user_id,
        full_name,
        phone,
        delivery_address,
        JSON.stringify(products),
        total_price,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

// GET ALL ORDERS (ADMIN ONLY)
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    const orders = result.rows.map(o => ({
      ...o,
      products: typeof o.products === "string" ? JSON.parse(o.products) : o.products
    }));
    res.json(orders);
  } catch (err) {
    console.error("Admin get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER ORDERS
app.get("/api/orders/user/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC",
      [req.params.userId]
    );

    const orders = result.rows.map(o => ({
      ...o,
      products: typeof o.products === "string"
        ? JSON.parse(o.products)
        : o.products
    }));

    res.json(orders);
  } catch (err) {
    console.error("User orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE ORDER STATUS (ADMIN ONLY)
app.put("/api/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE ORDER (ADMIN ONLY)
app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM orders WHERE id=$1", [req.params.id]);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- LANDING IMAGES (ADMIN ONLY) ----------
app.get("/api/landing-images", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM landing_images ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get landing images error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/landing-images", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = await uploadToSupabase(req.file, "desco-landing");
    if (!imageUrl) return res.status(500).json({ message: "Upload failed" });

    const result = await pool.query("INSERT INTO landing_images (image) VALUES ($1) RETURNING *", [imageUrl]);
    res.json(result.rows[0]);
    console.log("Landing image uploaded →", imageUrl);
  } catch (err) {
    console.error("Landing image upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/landing-images/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM landing_images WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
    console.log("Landing image deleted ID:", req.params.id);
  } catch (err) {
    console.error("Delete landing image error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DESCO backend running on port ${PORT}`);
});
