// Sidebar.js
import React, { useState } from "react";
import AnnotationForm from "./AnnotationForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // State to keep track of the sidebar being open or not

  // Function to toggle the sidebar's state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`h-screen  text-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-[90%]'}`}>
      <div className="flex justify-between  items-center p-4 border-b border-gray-500">
        <h2 className="text-xl font-semibold">Annotator</h2>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="p-4">
        <AnnotationForm />
      </div>
    </div>
  );
};

export default Sidebar;
