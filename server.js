const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const SECRET_KEY = "blyat";
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./public/db/db.sqlite", (err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err.message);
  } else {
    console.log("Connecté à la base de données SQLite.");
  }
});

db.run("CREATE INDEX IF NOT EXISTS idx_users_email ON users_new(email)");
db.run("CREATE INDEX IF NOT EXISTS idx_recipes_id ON final_cocktails(id)");

app.get("/", (req, res) => {
  res.redirect("/recipes");
});

app.get("/recipes", (req, res) => {
  db.all(
    "SELECT id, name, alcoholic, category, instructions, drinkThumbnail, ingredients FROM final_cocktails ORDER BY id",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const recipes = rows.map((row) => ({
        ...row,
        ingredients: row.ingredients.split(",").map((ing) => ing.trim()),
      }));
      res.json(recipes);
    }
  );
});

app.post("/recipes", authenticate, authorizeAdmin, (req, res) => {
  const {
    name,
    alcoholic,
    category,
    instructions,
    drinkThumbnail,
    ingredients,
  } = req.body;

  if (!name || !instructions || !ingredients) {
    return res
      .status(400)
      .json({ error: "Name, instructions, and ingredients are required." });
  }

  const ingredientsStr = ingredients.join(",");

  db.run(
    "INSERT INTO final_cocktails (name, alcoholic, category, instructions, drinkThumbnail, ingredients) VALUES (?, ?, ?, ?, ?, ?)",
    [name, alcoholic, category, instructions, drinkThumbnail, ingredientsStr],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res
        .status(201)
        .json({ message: "Recipe added successfully.", id: this.lastID });
    }
  );
});

app.put("/recipes/:id", authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { name, alcoholic, category, instructions, ingredients } = req.body;

  if (!name || !instructions || !ingredients) {
    return res
      .status(400)
      .json({ error: "Name, instructions, and ingredients are required." });
  }

  db.run(
    "UPDATE final_cocktails SET name = ?, alcoholic = ?, category = ?, instructions = ?, ingredients = ? WHERE id = ?",
    [name, alcoholic, category, instructions, ingredients.join(","), id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Recipe updated successfully." });
    }
  );
});

app.delete("/recipes/:id", authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM final_cocktails WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Recipe deleted successfully." });
  });
});

app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users_new (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role || "user"],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully." });
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  db.get(
    "SELECT id, name, email, password, role FROM users_new WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: "1h",
      });

      res.cookie("token", token, { httpOnly: true });
      res.json({ message: "Login successful." });
    }
  );
});

function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only." });
  }
  next();
}

app.get("/auth/status", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ loggedIn: false, role: null });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ loggedIn: true, role: decoded.role });
  } catch (err) {
    res.status(200).json({ loggedIn: false, role: null });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful." });
});

app.get("/users", authenticate, authorizeAdmin, (req, res) => {
  db.all(
    "SELECT id, name, email, role FROM users_new ORDER BY id",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get("/users/:id", authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, name, email, role FROM users_new WHERE id = ?",
    [id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.json(user);
    }
  );
});

app.put("/users/:id", authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  db.run(
    "UPDATE users_new SET name = ?, email = ?, role = ? WHERE id = ?",
    [name, email, role, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "User updated successfully." });
    }
  );
});

app.delete("/users/:id", authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM users_new WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User deleted successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}/recipes.html`);
});
