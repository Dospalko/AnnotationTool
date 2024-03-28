import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Modal from './Modal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectFiles, setProjectFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/projects/${projectId}/files`)
      .then(response => {
        const filesWithProgress = response.data.map(file => ({
          ...file,
          progress: file.annotatedTokensCount / file.tokensCount * 100
        }));
        setProjectFiles(filesWithProgress);
      })
      .catch(error => console.error("Chyba pri načítavaní súborov projektu:", error));
  }, [projectId]);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUploadFiles = async () => {
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });

    try {
      await axios.post(`http://localhost:5000/upload_files_to_project/${projectId}`, formData);
      setShowModal(false);
      alert("Súbory boli úspešne nahrané.");
      // Refresh the project files list
      axios.get(`http://localhost:5000/projects/${projectId}/files`)
        .then(response => {
          const filesWithProgress = response.data.map(file => ({
            ...file,
            progress: file.annotatedTokensCount / file.tokensCount * 100
          }));
          setProjectFiles(filesWithProgress);
        });
    } catch (error) {
      console.error("Chyba pri nahrávaní súborov:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto shadow-lg rounded-lg bg-white p-6">
          <h2 className="text-2xl font-semibold mb-4">Detaily projektu</h2>
          <input type="file" multiple onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
          <button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Potvrdiť nahratie</button>
          {showModal && <Modal onConfirm={handleUploadFiles} onCancel={() => setShowModal(false)} />}
          <div className="mt-6">
            {projectFiles.map(file => (
              <div key={file.id} className="flex justify-between items-center p-3 mb-4 bg-gray-200 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{file.filename}</span>
                  <div className="w-full bg-gray-400 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${file.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => navigate(`/annotator/${file.id}`)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Anotovať</button>
                  <button onClick={async () => {
                    await axios.delete(`http://localhost:5000/delete_pdf_text/${file.id}`);
                    setProjectFiles(prev => prev.filter(f => f.id !== file.id));
                  }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Odstrániť</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
