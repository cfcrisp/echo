import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import RequestModal from "./RequestModal";

function NewRequestButton({ variant = "primary", className = "" }) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <button
        onClick={openModal}
        className={`btn btn-${variant} flex items-center gap-2 ${className}`}
      >
        <FiPlus className="h-4 w-4" />
        New Request
      </button>
      
      <RequestModal 
        isOpen={showModal} 
        onClose={closeModal} 
      />
    </>
  );
}

export default NewRequestButton;