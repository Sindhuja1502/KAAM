const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Serve frontend folder as static
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your mysql username
  password: "root",   // your mysql password
  database: "kaam_db"
});

db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database!");
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.post("/manager/login", (req, res) => {
  const { phone, name, password, location } = req.body;

  // 1. Check if phone already exists
  db.query("SELECT * FROM managers WHERE phone = ?", [phone], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length > 0) {
      // User already exists → treat as LOGIN
      const user = results[0];

      if (user.password === password) {
        res.send(`✅ Welcome back, ${user.name}! Login successful.`);
      } else {
        res.status(401).send("❌ Wrong password. Please try again.");
      }
    } else {
      // User doesn’t exist → treat as SIGNUP
      db.query(
        "INSERT INTO managers (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err, insertResults) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).send("Signup failed");
          }
          res.send(`✅ Signup successful. Welcome, ${name}!`);
        }
      );
    }
  });
});

// Worker Login + Signup
app.post("/worker/login", (req, res) => {
  const { phone, name, password, location } = req.body;

  // Check if worker already exists
  db.query("SELECT * FROM workers WHERE phone = ?", [phone], (err, results) => {
    if (err) {
      console.error("Error checking worker:", err);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      // ✅ Worker exists → Login check
      const worker = results[0];
      if (worker.password === password) {
        res.send("✅ Worker login successful");
      } else {
        res.status(401).send("❌ Wrong password");
      }
    } else {
      // 🚀 Worker not found → Signup
      db.query(
        "INSERT INTO workers (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err, result) => {
          if (err) {
            console.error("Error inserting worker:", err);
            return res.status(500).send("Signup failed");
          }
          res.send("✅ Worker registered successfully");
        }
      );
    }
  });
});

// PostWork Login + Signup
app.post("/postwork/login", (req, res) => {
  const { phone, name, password, location } = req.body;
  console.log("Request body:", req.body); 
  if (!phone || !name || !password || !location) {
    return res.status(400).send("❌ All fields are required");
  }
  // Check if postwork user already exists
  db.query("SELECT * FROM postwork WHERE phone = ?", [phone], (err, results) => {
    if (err) {
      console.error("Error checking postwork user:", err);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      // ✅ User exists → Login check
      const user = results[0];
      if (user.password === password) {
        res.redirect("/postwork/postwork.html");
      } else {
        res.status(401).send("❌ Wrong password");
      }
    } else {
      // 🚀 User not found → Signup
      db.query(
        "INSERT INTO postwork (phone, name, password, location) VALUES (?, ?, ?, ?)",
        [phone, name, password, location],
        (err, result) => {
          if (err) {
            console.error("Error inserting postwork user:", err);
            return res.status(500).send("Signup failed");
          }
          res.send("✅ PostWork registered successfully");
        }
      );
    }
  });
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
