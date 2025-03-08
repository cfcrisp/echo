require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5002

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require("./src/routes/auth")
const requestsRoutes = require("./src/routes/requests")
const customersRoutes = require("./src/routes/customers")
const statsRoutes = require("./src/routes/stats")

app.use("/api/auth", authRoutes)
app.use("/api/requests", requestsRoutes)
app.use("/api/customers", customersRoutes)
app.use("/api/stats", statsRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Echo API is running")
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

