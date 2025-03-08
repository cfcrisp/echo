"use client"
import { Link } from "react-router-dom"
import { FiMoreHorizontal } from "react-icons/fi"

function RequestsKanban({ requests }) {
  const statuses = ["Not Started", "In Progress", "In Review", "Completed", "Blocked"]

  // Group requests by status
  const groupedRequests = statuses.map((status) => ({
    title: status,
    requests: requests.filter((r) => r.status === status),
  }))

  // Helper function to get priority badge class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "badge-danger"
      case "High":
        return "badge-warning"
      case "Medium":
        return "badge-primary"
      case "Low":
        return "badge-secondary"
      default:
        return "badge-secondary"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-4">
      {groupedRequests.map((group) => (
        <div key={group.title} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">{group.title}</h3>
            <span className="badge badge-secondary bg-gray-200 dark:bg-gray-700">{group.requests.length}</span>
          </div>
          <div className="space-y-3">
            {group.requests.map((request) => (
              <Link
                key={request.id}
                to={`/dashboard/requests/${request.id}`}
                className="block card border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-3">
                  <div className="text-sm font-medium">{request.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{request.id}</div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {request.labels &&
                      request.labels.map((label, index) => (
                        <span key={index} className="badge badge-secondary text-xs">
                          {label}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`badge ${getPriorityClass(request.priority)}`}>{request.priority}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {request.effort} {request.effort === 1 ? "week" : "weeks"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex -space-x-2">
                      {request.customers &&
                        request.customers.map((customer, index) => (
                          <div
                            key={index}
                            className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 border border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300"
                            title={customer.name}
                          >
                            {customer.name.charAt(0)}
                          </div>
                        ))}
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.preventDefault()
                        // Add dropdown menu logic here
                      }}
                    >
                      <FiMoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RequestsKanban

