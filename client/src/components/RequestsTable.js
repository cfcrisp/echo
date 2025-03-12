"use client";

import { useState, useEffect } from "react";
import { FiMoreHorizontal, FiChevronUp, FiChevronDown, FiTrash2, FiSettings, FiMenu } from "react-icons/fi";

function RequestsTable({ requests = [] }) {
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showDropdown, setShowDropdown] = useState(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  
  // Define all available columns
  const [allColumns, setAllColumns] = useState(() => {
    const savedOrder = localStorage.getItem('tableColumnsOrder');
    if (savedOrder) {
      return JSON.parse(savedOrder);
    }
    return [
      { id: "id", label: "ID", default: true },
      { id: "title", label: "Title", default: true },
      { id: "priority", label: "Priority", default: true },
      { id: "effort", label: "Effort", default: true },
      { id: "status", label: "Status", default: true },
      { id: "customers", label: "Customers", default: true },
      { id: "labels", label: "Labels", default: true },
      { id: "description", label: "Description", default: false },
      { id: "position", label: "Position", default: false }
    ];
  });
  
  // Initialize column visibility from localStorage or defaults
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('tableVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return allColumns.reduce((acc, col) => {
      acc[col.id] = col.default;
      return acc;
    }, {});
  });
  
  // Save column visibility preferences to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tableVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  
  // Save column order to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tableColumnsOrder', JSON.stringify(allColumns));
  }, [allColumns]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Toggle column visibility
  const toggleColumn = (columnId) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };
  
  // Handle column drag start
  const handleDragStart = (e, columnId) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('bg-primary-100', 'p-2', 'rounded');
    ghostElement.textContent = allColumns.find(col => col.id === columnId)?.label || '';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  // Handle column drag over
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (draggedColumn === columnId) return;
    
    const draggedIndex = allColumns.findIndex(col => col.id === draggedColumn);
    const targetIndex = allColumns.findIndex(col => col.id === columnId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newColumns = [...allColumns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      setAllColumns(newColumns);
    }
  };
  
  // Handle column drag end
  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  // Sort requests - with null checks
  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Helper function to get priority badge class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "badge-danger";
      case "High":
        return "badge-warning";
      case "Medium":
        return "badge-primary";
      case "Low":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  // Helper function to get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "badge-success";
      case "In Progress":
        return "badge-primary";
      case "In Review":
        return "badge-warning";
      case "Blocked":
        return "badge-danger";
      case "Not Started":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  // Helper function to get the sort icon based on the current field and order
  const getSortIcon = (field) => {
    if (field === sortField) {
      return sortOrder === "asc" ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />;
    }
    return <FiChevronUp className="h-4 w-4 opacity-50" />; // Default neutral icon
  };

  // In the handleDelete function
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
        
        // Try to parse response as JSON, but don't fail if it's not
        try {
          const data = await response.json();
          console.log("Delete response data:", data);
        } catch (e) {
          console.log("Response was not JSON, but delete was successful");
        }
        
        // Refresh the page to show updated list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting request:", error);
        alert(`Failed to delete request: ${error.message}`);
      }
    }
    setShowDropdown(null);
  };

  // Get visible columns in the order they should appear
  const getVisibleColumnsList = () => {
    return allColumns.filter(col => visibleColumns[col.id]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-compact">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {getVisibleColumnsList().map(column => (
              <th
                key={column.id}
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                onClick={() => handleSort(column.id)}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, column.id)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center">
                  <FiMenu className="h-3 w-3 mr-1 cursor-grab opacity-50" />
                  {column.label}
                  <span className="ml-1">{getSortIcon(column.id)}</span>
                </div>
              </th>
            ))}
            <th scope="col" className="relative px-3 py-3 w-16">
              <div className="flex items-center justify-end">
                <div className="relative">
                  <button 
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColumnSettings(!showColumnSettings);
                    }}
                    title="Column settings"
                  >
                    <FiSettings className="h-4 w-4" />
                  </button>
                  
                  {showColumnSettings && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1 px-2" role="menu">
                        <div className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                          Customize Columns
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {allColumns.map(column => (
                            <div 
                              key={column.id} 
                              className="flex items-center px-2 py-2 border-b border-gray-100 dark:border-gray-600 last:border-0"
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, column.id)}
                              onDragOver={(e) => handleDragOver(e, column.id)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="mr-2 cursor-grab">
                                <FiMenu className="h-4 w-4 text-gray-400" />
                              </div>
                              <label className="flex items-center w-full cursor-pointer">
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`column-${column.id}`}
                                    checked={visibleColumns[column.id]}
                                    onChange={() => toggleColumn(column.id)}
                                    className="sr-only"
                                  />
                                  <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors ${
                                    visibleColumns[column.id] 
                                      ? 'bg-primary-500 border-primary-500' 
                                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
                                  }`}>
                                    {visibleColumns[column.id] && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                  {column.label}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="ml-2 sr-only">Actions</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {sortedRequests.map((request) => (
            <tr
              key={request.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => (window.location.href = `/dashboard/requests/${request.id}`)}
            >
              {/* Render cells based on visible columns in the correct order */}
              {getVisibleColumnsList().map(column => {
                switch(column.id) {
                  case 'id':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap text-xs">
                        <div className="text-gray-500 dark:text-gray-400">{request.id}</div>
                      </td>
                    );
                  case 'title':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{request.title || "Untitled"}</div>
                      </td>
                    );
                  case 'description':
                    return (
                      <td key={column.id} className="px-3 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                          {request.description || "No description"}
                        </div>
                      </td>
                    );
                  case 'priority':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">
                        <span className={`badge ${getPriorityClass(request.priority)}`}>{request.priority || "None"}</span>
                      </td>
                    );
                  case 'effort':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">{request.effort || 0}</td>
                    );
                  case 'status':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusClass(request.status)}`}>{request.status || "None"}</span>
                      </td>
                    );
                  case 'position':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">{request.position || 0}</td>
                    );
                  case 'customers':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">
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
                      </td>
                    );
                  case 'labels':
                    return (
                      <td key={column.id} className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {request.labels &&
                            request.labels
                              .filter(label => label)
                              .map((label, index) => (
                                <span key={index} className="badge badge-secondary text-xs">
                                  {label}
                                </span>
                              ))}
                        </div>
                      </td>
                    );
                  default:
                    return null;
                }
              })}
              
              <td className="px-3 py-4 text-right relative">
                <div className="relative" style={{ position: 'static' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === request.id ? null : request.id);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FiMoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  {showDropdown === request.id && (
                    <div 
                      className="fixed mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-[100] border border-gray-200 dark:border-gray-700"
                      style={{
                        top: 'auto',
                        right: '20px'
                      }}
                    >
                      <div className="py-1">
                        <button
                          onClick={(e) => handleDelete(e, request.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiTrash2 className="mr-2 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsTable;