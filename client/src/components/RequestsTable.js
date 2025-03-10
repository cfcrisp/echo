"use client";

import { useState } from "react";
import { FiMoreHorizontal, FiChevronUp, FiChevronDown } from "react-icons/fi";

function RequestsTable({ requests }) {
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort requests
  const sortedRequests = [...requests].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center gap-1">
                Title
                {getSortIcon("title")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("priority")}
            >
              <div className="flex items-center gap-1">
                Priority
                {getSortIcon("priority")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("effort")}
            >
              <div className="flex items-center gap-1">
                Effort (weeks)
                {getSortIcon("effort")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-1">
                Status
                {getSortIcon("status")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Customers
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Labels
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 dark:text-white">{request.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{request.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${getPriorityClass(request.priority)}`}>{request.priority}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{request.effort}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${getStatusClass(request.status)}`}>{request.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {request.labels &&
                    request.labels.map((label, index) => (
                      <span key={index} className="badge badge-secondary text-xs">
                        {label}
                      </span>
                    ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add dropdown menu logic here
                  }}
                >
                  <FiMoreHorizontal className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsTable;