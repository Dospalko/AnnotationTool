import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignFilesToProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get('http://localhost:5000/projects');
      setProjects(response.data);
    };
    fetchProjects();

    const fetchFiles = async () => {
      const response = await axios.get('http://localhost:5000/files/unassigned');
      setFiles(response.data);
    };
    fetchFiles();
  }, []);

  const handleFileSelection = (fileId) => {
    setSelectedFiles(prevSelectedFiles =>
      prevSelectedFiles.includes(fileId)
        ? prevSelectedFiles.filter(id => id !== fileId)
        : [...prevSelectedFiles, fileId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedProject) {
      alert('Please select a project.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/assign-files', {
        project_id: selectedProject,
        file_ids: selectedFiles,
      });
      alert('Files assigned successfully');
    } catch (error) {
      console.error('Error assigning files:', error);
      alert('Failed to assign files');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Assign Files to Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select onChange={(e) => setSelectedProject(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>

        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={() => handleFileSelection(file.id)}
                className="mr-2"
              />
              <span className="text-gray-700">{file.filename}</span>
            </li>
          ))}
        </ul>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Assign
        </button>
      </form>
    </div>
  );
};

export default AssignFilesToProject;
