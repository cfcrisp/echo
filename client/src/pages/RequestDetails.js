import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RequestDetailsModal from "../components/RequestDetailsModal";

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5002/api/requests/${id}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch request details");
        }

        const data = await response.json();
        setRequest(data);
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleSave = async (updatedRequest) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5002/api/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to update request");
      }

      const data = await response.json();
      setRequest(data);
    } catch (err) {
      console.error("Error updating request:", err);
      // We don't alert here since it's auto-saving
    }
  };

  const handleClose = () => {
    navigate("/dashboard/requests");
  };

  const handleDelete = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5002/api/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      // Navigate back to requests list after successful deletion
      navigate("/dashboard/requests");
    } catch (err) {
      console.error("Error deleting request:", err);
      alert(`Failed to delete request: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => navigate("/dashboard/requests")}
            className="px-4 py-2 mt-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequestDetailsModal
      request={request}
      isOpen={true}
      onClose={handleClose}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}

export default RequestDetails;