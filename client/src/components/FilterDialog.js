"use client"

import { useState, useEffect } from "react"
import { FiX } from "react-icons/fi"

function FilterDialog({ filterOptions, currentFilters, onApplyFilters, onClose }) {
  const [filters, setFilters] = useState(currentFilters || {})

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApplyFilters(filters)
  }

  const handleClear = () => {
    const clearedFilters = {}
    filterOptions.forEach((option) => {
      clearedFilters[option.label] = "All"
    })
    setFilters(clearedFilters)
  }

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Options</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {filterOptions.map((option) => (
                <div key={option.label} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{option.label}</label>
                  <select
                    value={filters[option.label] || "All"}
                    onChange={(e) => handleFilterChange(option.label, e.target.value)}
                    className="input"
                  >
                    {option.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" className="btn btn-primary ml-3" onClick={handleApply}>
              Apply Filters
            </button>
            <button type="button" className="btn btn-outline" onClick={handleClear}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterDialog

