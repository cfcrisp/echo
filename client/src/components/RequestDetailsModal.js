import { useState, useEffect, useRef } from "react";
import { FiX, FiPaperclip, FiChevronDown } from "react-icons/fi";

function RequestDetailsModal({ request, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState(request?.title || "");
  const [description, setDescription] = useState(request?.description || "");
  const [priority, setPriority] = useState(request?.priority || "Medium");
  const [status, setStatus] = useState(request?.status || "Not Started");
  const [effort, setEffort] = useState(request?.effort || 0);
  const [position, setPosition] = useState(request?.position || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(request?.comments || []);
  const modalRef = useRef(null);
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [isDirty, setIsDirty] = useState(false);

  // Update state when request changes
  useEffect(() => {
    if (request) {
      setTitle(request.title || "");
      setDescription(request.description || "");
      setPriority(request.priority || "Medium");
      setStatus(request.status || "Not Started");
      setEffort(request.effort || 0);
      setPosition(request.position || 0);
      
      // Ensure comments is always an array with valid properties
      const safeComments = request.comments || [];
      // Filter out empty comments and validate the remaining ones
      const validatedComments = safeComments
        .filter(comment => comment && comment.text && comment.text.trim() !== "") // Remove empty comments
        .map(comment => ({
          id: comment.id || Date.now() + Math.random(),
          text: comment.text || "",
          user: {
            name: comment.user && comment.user.name ? comment.user.name : "Unknown User"
          },
          createdAt: comment.createdAt || new Date().toISOString()
        }));
      
      setComments(validatedComments);
    }
  }, [request]);

  // Auto-save when changes are made
  useEffect(() => {
    if (!isDirty) return;
    
    const saveTimer = setTimeout(() => {
      handleSave();
      setLastSaved(Date.now());
      setIsDirty(false);
    }, 1000); // Auto-save after 1 second of inactivity
    
    return () => clearTimeout(saveTimer);
  }, [title, description, priority, status, effort, position, isDirty]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Auto-save before closing
        if (isDirty) {
          handleSave();
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isDirty, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedRequest = {
      ...request,
      title,
      description,
      priority,
      status,
      effort,
      position,
      comments
    };
    onSave(updatedRequest);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: comment,
      user: { name: "You" }, // Replace with actual user data
      createdAt: new Date().toISOString(),
    };
    
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setComment("");
    setIsDirty(true);
  };

  const handleChange = (field, value) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'effort':
        setEffort(value);
        break;
      case 'position':
        setPosition(value);
        break;
      default:
        break;
    }
    setIsDirty(true);
  };

  // Helper function to get priority badge class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "High":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Helper function to get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "In Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Not Started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Editable pill component
  const EditablePill = ({ label, value, options, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pillRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (pillRef.current && !pillRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative" ref={pillRef}>
        <div 
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${className}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {label && <span className="mr-1 text-gray-600 dark:text-gray-400">{label}:</span>}
          {value}
          <FiChevronDown className="ml-1 h-3 w-3" />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
            {options.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Editable number pill
  const EditableNumberPill = ({ label, value, onChange, className }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    return (
      <div className="relative inline-block">
        {isEditing ? (
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
            {label && <span className="mr-1 text-gray-600 dark:text-gray-400">{label}:</span>}
            <input
              ref={inputRef}
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                onChange(parseInt(tempValue) || 0);
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onChange(parseInt(tempValue) || 0);
                  setIsEditing(false);
                }
              }}
              className="w-16 bg-transparent border-none focus:outline-none focus:ring-0 appearance-none p-0"
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
          </div>
        ) : (
          <div 
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer min-w-[100px] ${className}`}
            onClick={() => setIsEditing(true)}
          >
            {label && <span className="mr-1 text-gray-600 dark:text-gray-400">{label}:</span>}
            {value}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <input
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full"
            placeholder="Request Title"
          />
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h3>
            <textarea
              value={description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[150px] resize-none"
              placeholder="Add a detailed description..."
            />
          </div>

          {/* Editable pills section */}
          <div className="flex flex-wrap gap-3 mb-8">
            <EditablePill 
              label="Priority"
              value={priority}
              options={["Low", "Medium", "High", "Critical"]}
              onChange={(value) => handleChange('priority', value)}
              className={getPriorityClass(priority)}
            />
            
            <EditablePill 
              label="Status"
              value={status}
              options={["Not Started", "In Progress", "In Review", "Completed", "Blocked"]}
              onChange={(value) => handleChange('status', value)}
              className={getStatusClass(status)}
            />
            
            <EditableNumberPill 
              label="Effort"
              value={effort}
              onChange={(value) => handleChange('effort', value)}
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            />
            
            <EditableNumberPill 
              label="Position"
              value={position}
              onChange={(value) => handleChange('position', value)}
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
            />
          </div>

          {/* Comments section (renamed from Activity) */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments</h3>
            <div className="space-y-4 mb-6">
              {comments && comments.map((comment) => (
                <div key={comment.id || Date.now()} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {comment.user && comment.user.name ? comment.user.name.charAt(0) : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user && comment.user.name ? comment.user.name : 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown date'}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.text || ''}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment section */}
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Y
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                    placeholder="Add a comment..."
                    rows={1}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <button
                      onClick={handleAddComment}
                      className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isDirty ? "Saving..." : `Last saved: ${new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailsModal;
