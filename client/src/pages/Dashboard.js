import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { FiTrendingUp, FiUsers, FiCheckCircle, FiActivity } from "react-icons/fi"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { format } from "date-fns"
import NewRequestButton from "../components/NewRequestButton"

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const config = {
          headers: {
            "x-auth-token": token,
          },
        }
        const res = await axios.get("http://localhost:5002/api/stats", config)
        setStats(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Failed to load dashboard data")
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  // Prepare chart data
  const statusChartData = {
    labels: stats.requestsByStatus.map((item) => item.status),
    datasets: [
      {
        label: "Requests",
        data: stats.requestsByStatus.map((item) => item.count),
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)", // primary
          "rgba(59, 130, 246, 0.7)", // blue
          "rgba(245, 158, 11, 0.7)", // amber
          "rgba(239, 68, 68, 0.7)", // red
          "rgba(107, 114, 128, 0.7)", // gray
        ],
        borderWidth: 1,
      },
    ],
  }

  const priorityChartData = {
    labels: stats.requestsByPriority.map((item) => item.priority),
    datasets: [
      {
        label: "Requests",
        data: stats.requestsByPriority.map((item) => item.count),
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)", // red for Critical
          "rgba(245, 158, 11, 0.7)", // amber for High
          "rgba(59, 130, 246, 0.7)", // blue for Medium
          "rgba(107, 114, 128, 0.7)", // gray for Low
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <NewRequestButton />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</h3>
            <FiTrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.metrics.totalRequests}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+12% from last month</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Customers</h3>
            <FiUsers className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.metrics.activeCustomers}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+3 new this month</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
            <FiCheckCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.metrics.completionRate}%</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+5% from last month</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Request to Customer Ratio</h3>
            <FiActivity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.metrics.requestToCustomerRatio}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+0.5 from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Request Status</h3>
          <div className="h-64">
            <Bar
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Requests by Priority</h3>
          <div className="h-64">
            <Pie
              data={priorityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card p-4">
        <h3 className="text-lg font-medium mb-4">Recent Requests</h3>
        <div className="space-y-4">
          {stats.recentRequests.map((request) => (
            <Link
              key={request.id}
              to={`/dashboard/requests/${request.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{request.id}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(request.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="font-medium mt-1">{request.title}</div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`badge ${
                    request.priority === "Critical"
                      ? "badge-danger"
                      : request.priority === "High"
                        ? "badge-warning"
                        : request.priority === "Medium"
                          ? "badge-primary"
                          : "badge-secondary"
                  }`}
                >
                  {request.priority}
                </span>
                <span
                  className={`badge ${
                    request.status === "Completed"
                      ? "badge-success"
                      : request.status === "In Progress"
                        ? "badge-primary"
                        : request.status === "In Review"
                          ? "badge-warning"
                          : request.status === "Blocked"
                            ? "badge-danger"
                            : "badge-secondary"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/dashboard/requests" className="text-primary-500 hover:text-primary-600 font-medium">
            View all requests
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard