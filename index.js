import express from "express";
import path from "path";
import bodyParser from "body-parser";
import pkg from "pg";
import { fileURLToPath } from "url";
import { dirname } from "path";

const { Pool } = pkg;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// PostgreSQL Connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "shrawani123",
  port: 5432,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ========================
// ROUTES
// ========================

// Home Page (landing page)
app.get("/", (req, res) => {
  res.render("home"); // renders home.ejs
});

// Portal Page (list of events)
app.get("/portal", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY event_date ASC");
    res.render("index", { events: result.rows }); // renders index.ejs with events
  } catch (err) {
    console.error(err);
    res.send("Database Error");
  }
});

// Registration Route
app.post("/register", async (req, res) => {
  const { event_id, name, email, phone, team_name } = req.body;
  try {
    await pool.query(
      "INSERT INTO registrations(event_id, student_name, email, phone, team_name) VALUES($1,$2,$3,$4,$5)",
      [event_id, name, email, phone, team_name]
    );
    res.send("Registration Successful!");
  } catch (err) {
    console.error(err);
    res.send("Error in Registration");
  }
});

// Admin Login Route
app.post("/admin-login", (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = "admin123";
  if (password === ADMIN_PASSWORD) {
    res.redirect("/admin");
  } else {
    res.send("Incorrect admin password!");
  }
});

// Admin Page Route (Add Event Form)
app.get("/admin", (req, res) => {
  res.render("add-event"); // add-event.ejs
});

// Insert Event Route
app.post("/add-event", async (req, res) => {
  const { event_name, description, event_date, event_type } = req.body;
  try {
    await pool.query(
      "INSERT INTO events(event_name, description, event_date, event_type) VALUES($1,$2,$3,$4)",
      [event_name, description, event_date, event_type]
    );
    res.redirect("/portal");
  } catch (err) {
    console.error(err);
    res.send("Error adding event");
  }
});

// Certificate Page
app.get("/certificate", (req, res) => {
  res.render("certificate");
});

// Download Certificate PDF
app.get("/download-certificate", (req, res) => {
  const filePath = path.join(__dirname, "public", "Certificate.pdf");
  res.download(filePath, "Certificate.pdf", (err) => {
    if (err) {
      console.error("Error downloading certificate:", err);
      res.status(500).send("Server error: Could not download certificate");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});