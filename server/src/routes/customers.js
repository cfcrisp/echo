const express = require("express")
const router = express.Router()
const db = require("../db")
const auth = require("../middleware/auth")

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(cr.request_id) as requests
      FROM customers c
      LEFT JOIN customer_requests cr ON c.id = cr.customer_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    // Get customer details
    const customerResult = await db.query("SELECT * FROM customers WHERE id = $1", [req.params.id])

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ msg: "Customer not found" })
    }

    // Get customer requests
    const requestsResult = await db.query(
      `
      SELECT r.*
      FROM requests r
      JOIN customer_requests cr ON r.id = cr.request_id
      WHERE cr.customer_id = $1
      ORDER BY r.created_at DESC
    `,
      [req.params.id],
    )

    const customer = customerResult.rows[0]
    customer.requests = requestsResult.rows

    res.json(customer)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/customers
// @desc    Create a customer
// @access  Private
router.post("/", auth, async (req, res) => {
  const { name, stage, revenue, tier } = req.body

  try {
    const result = await db.query(
      "INSERT INTO customers (name, stage, revenue, tier, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, stage, revenue, tier, req.user.id],
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/customers/:id
// @desc    Update a customer
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const { name, stage, revenue, tier } = req.body

  try {
    // Check if customer exists
    const checkResult = await db.query("SELECT * FROM customers WHERE id = $1", [req.params.id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: "Customer not found" })
    }

    // Update customer
    const result = await db.query(
      "UPDATE customers SET name = $1, stage = $2, revenue = $3, tier = $4 WHERE id = $5 RETURNING *",
      [name, stage, revenue, tier, req.params.id],
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if customer exists
    const checkResult = await db.query("SELECT * FROM customers WHERE id = $1", [req.params.id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: "Customer not found" })
    }

    // Delete customer (cascade will handle related records)
    await db.query("DELETE FROM customers WHERE id = $1", [req.params.id])

    res.json({ msg: "Customer removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router

