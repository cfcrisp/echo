const express = require("express")
const router = express.Router()
const db = require("../db")
const auth = require("../middleware/auth")

// @route   GET api/stats
// @desc    Get dashboard statistics
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Get total requests
    const totalRequestsResult = await db.query("SELECT COUNT(*) FROM requests")
    const totalRequests = Number.parseInt(totalRequestsResult.rows[0].count)

    // Get active customers
    const activeCustomersResult = await db.query("SELECT COUNT(*) FROM customers WHERE stage = 'Active'")
    const activeCustomers = Number.parseInt(activeCustomersResult.rows[0].count)

    // Get completion rate
    const completedRequestsResult = await db.query("SELECT COUNT(*) FROM requests WHERE status = 'Completed'")
    const completedRequests = Number.parseInt(completedRequestsResult.rows[0].count)
    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0

    // Get request to customer ratio
    const requestToCustomerRatio =
      activeCustomers > 0 ? Number.parseFloat((totalRequests / activeCustomers).toFixed(1)) : 0

    // Get requests by status
    const requestsByStatusResult = await db.query(`
      SELECT status, COUNT(*) as count
      FROM requests
      GROUP BY status
      ORDER BY count DESC
    `)

    // Get requests by priority
    const requestsByPriorityResult = await db.query(`
      SELECT priority, COUNT(*) as count
      FROM requests
      GROUP BY priority
      ORDER BY 
        CASE 
          WHEN priority = 'Critical' THEN 1
          WHEN priority = 'High' THEN 2
          WHEN priority = 'Medium' THEN 3
          WHEN priority = 'Low' THEN 4
          ELSE 5
        END
    `)

    // Get recent requests
    const recentRequestsResult = await db.query(`
      SELECT id, title, priority, status, created_at
      FROM requests
      ORDER BY created_at DESC
      LIMIT 5
    `)

    // Get recent activities
    const recentActivitiesResult = await db.query(`
      SELECT a.*, u.name as user_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `)

    // Get top customers
    const topCustomersResult = await db.query(`
      SELECT c.id, c.name, c.tier, c.revenue, COUNT(cr.request_id) as requests
      FROM customers c
      JOIN customer_requests cr ON c.id = cr.customer_id
      GROUP BY c.id
      ORDER BY requests DESC
      LIMIT 5
    `)

    const stats = {
      metrics: {
        totalRequests,
        activeCustomers,
        completionRate,
        requestToCustomerRatio,
      },
      requestsByStatus: requestsByStatusResult.rows,
      requestsByPriority: requestsByPriorityResult.rows,
      recentRequests: recentRequestsResult.rows,
      recentActivities: recentActivitiesResult.rows,
      topCustomers: topCustomersResult.rows,
    }

    res.json(stats)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router

