const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===================== MIDDLEWARE =====================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, JS, images from /public folder)
app.use(express.static(path.join(__dirname, "public")));

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===================== ROUTES =====================
// Root route
app.get("/", (req, res) => {
  res.render("index");  // looks for views/index.ejs
});

// Manager pages
app.get("/manager/managerverification", (req, res) => {
  res.render("manager/managerverification");
});

// PostWork pages
app.get("/postwork/postworkverification", (req, res) => {
  res.render("postwork/postworkverification");
});

app.get("/postwork/postwork", (req, res) => {
  res.render("postwork/postwork");
});

// Worker pages
app.get("/worker/workerverification", (req, res) => {
  res.render("worker/workerverification");
});

app.get("/worker/worker", (req, res) => {
  res.render("worker/worker");
});

// ===================== DATABASE CONNECTION =====================
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "kaam_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database!");
  }
});

// ===================== AUTH ROUTES =====================
// Manager Login + Signup
app.post("/manager/login", (req, res) => {
  const { phone, name, password, location } = req.body;

  db.query("SELECT * FROM managers WHERE phone = ?", [phone], (err, results) => {
    if (err) return res.status(500).send("Database error");

    if (results.length > 0) {
      const user = results[0];
      if (user.password === password) {
        res.send(`✅ Welcome back, ${user.name}! Login successful.`);
      } else {
        res.status(401).send("❌ Wrong password. Please try again.");
      }
    } else {
      db.query(
        "INSERT INTO managers (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err) => {
          if (err) return res.status(500).send("Signup failed");
          res.send(`✅ Signup successful. Welcome, ${name}!`);
        }
      );
    }
  });
});

// Worker Login + Signup
app.post("/worker/login", (req, res) => {
  const { phone, name, password, location } = req.body;

  db.query("SELECT * FROM workers WHERE phone = ?", [phone], (err, results) => {
    if (err) return res.status(500).send("Server error");

    if (results.length > 0) {
      const worker = results[0];
      if (worker.password === password) {
        res.send("✅ Worker login successful");
      } else {
        res.status(401).send("❌ Wrong password");
      }
    } else {
      db.query(
        "INSERT INTO workers (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err) => {
          if (err) return res.status(500).send("Signup failed");
          res.send("✅ Worker registered successfully");
        }
      );
    }
  });
});

// PostWork Login + Signup
app.post("/postwork/login", (req, res) => {
  const { phone, name, password, location } = req.body;
  if (!phone || !name || !password || !location) {
    return res.status(400).send("❌ All fields are required");
  }

  db.query("SELECT * FROM postwork WHERE phone = ?", [phone], (err, results) => {
    if (err) return res.status(500).send("Server error");

    if (results.length > 0) {
      const user = results[0];
      if (user.password === password) {
        res.redirect("/postwork/postwork"); // EJS page
      } else {
        res.status(401).send("❌ Wrong password");
      }
    } else {
      db.query(
        "INSERT INTO postwork (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err) => {
          if (err) return res.status(500).send("Signup failed");
          res.send("✅ PostWork registered successfully");
        }
      );
    }
  });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
