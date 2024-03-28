import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!projectName) {
      alert('Please enter a project name.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/projects', { name: projectName });
      alert('Project created successfully');
      setProjectName('');
      navigate(0); // Refreshes the page. For more controlled behavior, consider redirecting to a specific route
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  return (
    <div className="mx-auto w-max">
      <h2 className="text-xl font-semibold mb-4 mx-auto text-center text-white">Vytvorit projekt</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-[#F700C6]  text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out">
          Vytvorit
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
