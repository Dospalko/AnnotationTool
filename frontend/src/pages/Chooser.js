// Chooser.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CreateProject from './CreateProject';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const Chooser = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const response = await axios.get('http://localhost:5000/projects');
    setProjects(response.data);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:5000/projects/${projectId}`);
        fetchProjects(); // Refresh projects list
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <section>
      <Header/>
      <div className="max-w-4xl mx-auto h-screen p-4">
      <CreateProject fetchProjects={fetchProjects} />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="flex justify-between items-center bg-white shadow-md rounded-lg p-4 mb-4">
              <Link to={`/projects/${project.id}`} className="text-xl font-medium hover:text-blue-600">
                {project.name}
              </Link>
              <button onClick={() => handleDeleteProject(project.id)} className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No projects found.</p>
        )}
      </div>
   
    </div>
    <Footer/>
    </section>
  );
};

export default Chooser;
