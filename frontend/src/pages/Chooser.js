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
    if (window.confirm('Ste si istý ,že chcete zmazať tento projekt?')) {
      try {
        await axios.delete(`http://localhost:5000/projects/${projectId}`);
        fetchProjects(); // Refresh 
      } catch (error) {
        console.error('Nepodarilo sa zmazať projekt:', error);
      }
    }
  };

  return (
    <section className='flex font-base flex-col min-h-screen bg-gray-900'>
      <Header/>
      <div className="flex-grow p-8 container mx-auto">
        <CreateProject fetchProjects={fetchProjects} />
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-6  text-white">Projekty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-6 hover:bg-blue-50 cursor-pointer">
                    <Link to={`/projects/${project.id}`} className="text-xl font-medium hover:text-blue-600">
                      {project.name}
                    </Link>
                  </div>
                  <div className="px-6 py-4 bg-gray-100 flex justify-end">
                    <button onClick={() => navigate(`/projects/${project.id}`)} className="text-white bg-green-500 font-semibold py-2 px-4">
                      Otvoriť
                    </button>
                    <button onClick={() => handleDeleteProject(project.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                      Vymazať
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-200 text-xl">Nebol ešte vytvorený projekt.</p>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </section>
  );
};

export default Chooser;
