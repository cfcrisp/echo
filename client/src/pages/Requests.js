import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { FiPlus, FiList, FiGrid, FiSearch, FiFilter } from "react-icons/fi"
import RequestsTable from "../components/RequestsTable"
import RequestsKanban from "../components/RequestsKanban"
import FilterDialog from "../components/FilterDialog"

function Requests() {
  const [view, setView] = useState("list")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({})
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  const filterOptions = [
    {
      label: "Status",
      options: ["All", "Not Started", "In Progress", "In Review", "Blocked", "Completed"],
    },
    {
      label: "Priority",
      options: ["All", "Low", "Medium", "High", "Critical"],
    },
  ]

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token")
        const config = {
          headers: {
            "x-auth-token": token,
          },
        }
        const res = await axios.get("http://localhost:5002/api/requests", config)
        setRequests(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching requests:", err)
        setError("Failed to load requests")
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setShowFilterDialog(false)
  }

  // Filter and search requests
  const filteredRequests = requests.filter((request) => {
    // Apply search filter
    if (searchQuery && !request.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Apply status filter
    if (filters.Status && filters.Status !== "All" && request.status !== filters.Status) {
      return false
    }

    // Apply priority filter
    if (filters.Priority && filters.Priority !== "All" && request.priority !== filters.Priority) {
      return false
    }

    return true
  })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Requests</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage customer feature requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline flex items-center gap-2" onClick={() => setShowFilterDialog(true)}>
            <FiFilter className="h-4 w-4" />
            Filter
          </button>
          <Link to="/dashboard/requests/new" className="btn btn-primary flex items-center gap-2">
            <FiPlus className="h-4 w-4" />
            New Request
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search requests..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md flex items-center gap-1 ${
              view === "list" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setView("list")}
          >
            <FiList className="h-4 w-4" />
            List
          </button>
          <button
            className={`px-3 py-1 rounded-md flex items-center gap-1 ${
              view === "kanban" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setView("kanban")}
          >
            <FiGrid className="h-4 w-4" />
            Kanban
          </button>
        </div>
      </div>

      <div className="card">
        {view === "list" ? (
          <RequestsTable requests={filteredRequests} />
        ) : (
          <RequestsKanban requests={filteredRequests} />
        )}
      </div>

      {/* Filter Dialog */}
      {showFilterDialog && (
        <FilterDialog
          filterOptions={filterOptions}
          currentFilters={filters}
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilterDialog(false)}
        />
      )}
    </div>
  )
}

export default Requests