"use client"
import { FiMenu } from "react-icons/fi"

function MobileHeader({ toggleSidebar }) {
  return (
    <div className="sticky top-0 z-10 md:hidden flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Echo</h1>
        </div>
      </div>
    </div>
  )
}

export default MobileHeader

