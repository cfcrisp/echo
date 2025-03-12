"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMoreHorizontal, FiTrash2 } from "react-icons/fi";

function RequestsKanban({ requests = [] }) {
  const [showDropdown, setShowDropdown] = useState(null);
  const statuses = ["Not Started", "In Progress", "In Review", "Completed", "Blocked"]

  // Group requests by status
  const groupedRequests = statuses.map((status) => ({
    title: status,
    requests: requests.filter((r) => r.status === status),
  }))


  const handleDelete = async (e, requestId) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      try {
        console.log("Deleting request:", requestId);
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5002/api/requests/${requestId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
            'Accept': 'application/json'
          }
        });
        
        // Log the response for debugging
        console.log("Delete response status:", response.status);
        
        if (!response.ok) {
          let errorMessage = 'Failed to delete request';
          try {
            const errorData = await response.json();
            errorMessage = errorData.msg || errorMessage;
          } catch (parseError) {
            // If response is not JSON, get text instead
            const errorText = await response.text();
            console.error("Non-JSON response:", errorText);
          }
          throw new Error(errorMessage);
        }
        
        // Instead of reloading the page, we'll update the URL with a query parameter
        // to preserve the kanban view
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('view', 'kanban');
        
        // Use history.pushState to update URL without reloading
        window.history.pushState({}, '', currentUrl);
        
        // Reload the page but maintain the view parameter
        window.location.href = currentUrl.toString();
        
      } catch (error) {
        console.error("Error deleting request:", error);
        alert(`Failed to delete request: ${error.message}`);
      }
    }
    setShowDropdown(null);
  };

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
                  <div className="text-sm font-medium">{request.title || "Untitled"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{request.id}</div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {request.labels &&
                      request.labels
                        .filter(label => label)
                        .map((label, index) => (
                          <span key={index} className="badge badge-secondary text-xs">
                            {label}
                          </span>
                        ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`badge ${getPriorityClass(request.priority)}`}>{request.priority || "None"}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {request.effort || 0} {(request.effort || 0) === 1 ? "week" : "weeks"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex -space-x-2">
                      {request.customers &&
                        request.customers
                          .filter(customer => customer && customer.name)
                          .map((customer, index) => (
                            <div
                              key={index}
                              className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 border border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300"
                              title={customer.name}
                            >
                              {customer.name.charAt(0)}
                            </div>
                          ))}
                    </div>
                    <div className="relative">
                      <button
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDropdown(showDropdown === request.id ? null : request.id);
                        }}
                      >
                        <FiMoreHorizontal className="h-4 w-4" />
                      </button>
                      
                      {showDropdown === request.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={(e) => handleDelete(e, request.id)}
                              role="menuitem"
                            >
                              <FiTrash2 className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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

export default RequestsKanban;

