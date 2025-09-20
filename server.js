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

// ✅ Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Manager pages
app.get("/manager/managerverification.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "manager", "managerverification.html"));
});

// Postwork pages
app.get("/postwork/postworkverification.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "postwork", "postworkverification.html"));
});

app.get("/postwork/postwork.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "postwork", "postwork.html"));
});

// Worker pages
app.get("/worker/workerverification.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "worker", "workerverification.html"));
});

app.get("/worker/worker.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "worker", "worker.html"));
});

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
        res.redirect("/postwork/postwork.html");
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
