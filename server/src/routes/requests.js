const express = require("express")
const router = express.Router()
const db = require("../db")
const auth = require("../middleware/auth")

// @route   GET api/requests
// @desc    Get all requests
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, 
        ARRAY_AGG(DISTINCT rl.label) AS labels,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) AS customers
      FROM requests r
      LEFT JOIN request_labels rl ON r.id = rl.request_id
      LEFT JOIN customer_requests cr ON r.id = cr.request_id
      LEFT JOIN customers c ON cr.customer_id = c.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/requests/:id
// @desc    Get request by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    // Get request details
    const requestResult = await db.query(
      `
      SELECT r.*, 
        ARRAY_AGG(DISTINCT rl.label) AS labels,
        ARRAY_AGG(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) AS customers
      FROM requests r
      LEFT JOIN request_labels rl ON r.id = rl.request_id
      LEFT JOIN customer_requests cr ON r.id = cr.request_id
      LEFT JOIN customers c ON cr.customer_id = c.id
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [req.params.id],
    )

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ msg: "Request not found" })
    }

    // Get comments
    const commentsResult = await db.query(
      `
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.request_id = $1
      ORDER BY c.created_at ASC
    `,
      [req.params.id],
    )

    // Get activities
    const activitiesResult = await db.query(
      `
      SELECT a.*, u.name as user_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.target_type = 'request' AND a.target_id = $1
      ORDER BY a.created_at DESC
    `,
      [req.params.id],
    )

    const request = requestResult.rows[0]
    request.comments = commentsResult.rows
    request.activities = activitiesResult.rows

    res.json(request)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/requests
// @desc    Create a request
// @access  Private
router.post("/", auth, async (req, res) => {
  const { title, description, priority, effort, status, position, customers, labels } = req.body

  try {
    // Start a transaction
    await db.query("BEGIN")

    // Generate request ID
    const countResult = await db.query("SELECT COUNT(*) FROM requests")
    const count = Number.parseInt(countResult.rows[0].count) + 1
    const requestId = `REQ-${count.toString().padStart(3, "0")}`

    // Create request
    const requestResult = await db.query(
      `INSERT INTO requests 
        (id, title, description, priority, effort, status, position, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [requestId, title, description, priority, effort, status, position, req.user.id],
    )

    const request = requestResult.rows[0]

    // Add customers
    if (customers && customers.length > 0) {
      for (const customerId of customers) {
        await db.query("INSERT INTO customer_requests (customer_id, request_id) VALUES ($1, $2)", [
          customerId,
          requestId,
        ])
      }
    }

    // Add labels
    if (labels && labels.length > 0) {
      for (const label of labels) {
        await db.query("INSERT INTO request_labels (request_id, label) VALUES ($1, $2)", [requestId, label])
      }
    }

    // Record activity
    await db.query("INSERT INTO activities (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)", [
      req.user.id,
      "created",
      "request",
      requestId,
    ])

    // Commit transaction
    await db.query("COMMIT")

    res.json(request)
  } catch (err) {
    // Rollback transaction on error
    await db.query("ROLLBACK")
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/requests/:id
// @desc    Update a request
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const { title, description, priority, effort, status, position, customers, labels } = req.body

  try {
    // Start a transaction
    await db.query("BEGIN")

    // Check if request exists
    const checkResult = await db.query("SELECT * FROM requests WHERE id = $1", [req.params.id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: "Request not found" })
    }

    // Update request
    const requestResult = await db.query(
      `UPDATE requests 
       SET title = $1, description = $2, priority = $3, effort = $4, status = $5, position = $6, updated_at = NOW() 
       WHERE id = $7 
       RETURNING *`,
      [title, description, priority, effort, status, position, req.params.id],
    )

    // Update customers
    if (customers) {
      // Remove existing customer associations
      await db.query("DELETE FROM customer_requests WHERE request_id = $1", [req.params.id])

      // Add new customer associations
      if (customers.length > 0) {
        for (const customerId of customers) {
          await db.query("INSERT INTO customer_requests (customer_id, request_id) VALUES ($1, $2)", [
            customerId,
            req.params.id,
          ])
        }
      }
    }

    // Update labels
    if (labels) {
      // Remove existing labels
      await db.query("DELETE FROM request_labels WHERE request_id = $1", [req.params.id])

      // Add new labels
      if (labels.length > 0) {
        for (const label of labels) {
          await db.query("INSERT INTO request_labels (request_id, label) VALUES ($1, $2)", [req.params.id, label])
        }
      }
    }

    // Record activity
    await db.query("INSERT INTO activities (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)", [
      req.user.id,
      "updated",
      "request",
      req.params.id,
    ])

    // Commit transaction
    await db.query("COMMIT")

    res.json(requestResult.rows[0])
  } catch (err) {
    // Rollback transaction on error
    await db.query("ROLLBACK")
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE api/requests/:id
// @desc    Delete a request
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if request exists
    const checkResult = await db.query("SELECT * FROM requests WHERE id = $1", [req.params.id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: "Request not found" })
    }

    // Delete request (cascade will handle related records)
    await db.query("DELETE FROM requests WHERE id = $1", [req.params.id])

    res.json({ msg: "Request removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/requests/:id/comments
// @desc    Add a comment to a request
// @access  Private
router.post("/:id/comments", auth, async (req, res) => {
  const { content } = req.body

  try {
    // Check if request exists
    const checkResult = await db.query("SELECT * FROM requests WHERE id = $1", [req.params.id])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: "Request not found" })
    }

    // Add comment
    const commentResult = await db.query(
      "INSERT INTO comments (request_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [req.params.id, req.user.id, content],
    )

    // Get user name for the response
    const userResult = await db.query("SELECT name FROM users WHERE id = $1", [req.user.id])
    const comment = commentResult.rows[0]
    comment.user_name = userResult.rows[0].name

    // Record activity
    await db.query("INSERT INTO activities (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)", [
      req.user.id,
      "commented on",
      "request",
      req.params.id,
    ])

    res.json(comment)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/requests/:id/comments
// @desc    Get comments for a request
// @access  Private
router.get("/:id/comments", auth, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.request_id = $1
      ORDER BY c.created_at ASC
    `,
      [req.params.id],
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router

