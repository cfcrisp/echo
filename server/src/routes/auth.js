const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const auth = require("../middleware/auth");

router.use(express.json());

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", {
    message: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers,
    },
    response: {
      status: err.status || 500,
      data: err.data || "Internal Server Error",
    },
  });
  res.status(err.status || 500).json({
    msg: err.message || "Server error",
    details: err.data || null,
  });
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      const error = new Error("User already exists");
      error.status = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, "member"]
    );

    const user = result.rows[0];

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        const error = new Error("Failed to generate token");
        error.status = 500;
        error.data = err.message;
        return next(error);
      }
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    err.status = err.status || 500;
    err.data = err.message;
    next(err);
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      const error = new Error("Invalid credentials");
      error.status = 400;
      throw error;
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.status = 400;
      throw error;
    }

    // Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        const error = new Error("Failed to generate token");
        error.status = 500;
        error.data = err.message;
        return next(error);
      }
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    err.status = err.status || 500;
    err.data = err.message;
    next(err);
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get("/user", auth, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, created_at, last_login FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    err.status = err.status || 500;
    err.data = err.message;
    next(err);
  }
});

router.use(errorHandler); // Apply error handler middleware

module.exports = router;