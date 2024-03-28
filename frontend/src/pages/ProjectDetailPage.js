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
    fetchFilesOverview();
  }, [projectId]);

  const fetchFilesOverview = async () => {
    try {
      const overviewResponse = await axios.get(`http://localhost:5000/api/files-overview`);
      const projectFilesResponse = await axios.get(`http://localhost:5000/projects/${projectId}/files`);
      const filesOverview = overviewResponse.data;

      const combinedFilesData = projectFilesResponse.data.map(projectFile => {
        const overviewData = filesOverview.find(overview => overview.id === projectFile.id);

        return {
          ...projectFile,
          tokensCount: overviewData ? overviewData.tokensCount : 0,
          annotatedTokensCount: overviewData ? overviewData.annotatedTokensCount : 0,
          uniqueAnnotationsCount: overviewData ? overviewData.uniqueAnnotationsCount : 0,
          annotatedPercentage: overviewData ? overviewData.annotatedPercentage : 0,
        };
      });

      setProjectFiles(combinedFilesData);
    } catch (error) {
      console.error("Error fetching project files and overview:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUploadFiles = async () => {
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append('files', file));

    try {
      await axios.post(`http://localhost:5000/upload_files_to_project/${projectId}`, formData);
      setShowModal(false);
      alert("Files were successfully uploaded.");
      fetchFilesOverview(); // Refetch the files overview to update the UI
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow p-12 bg-gray-900">
        <div className="max-w-4xl mx-auto shadow-lg rounded-lg bg-white text-black font-base p-6">
          <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
          <input type="file" multiple onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
          <button onClick={() => setShowModal(true)} className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Confirm Upload</button>
          {showModal && <Modal onConfirm={handleUploadFiles} onCancel={() => setShowModal(false)} />}
          <div className="mt-6">
            {projectFiles.map(file => (
              <div key={file.id} className="flex justify-between items-center p-3 mb-4 bg-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">{file.filename}</h3>
                  <p>Total Tokens: {file.tokensCount}</p>
                  <p>Annotated Tokens: {file.annotatedTokensCount}</p>
                  <p>Unique Annotations: {file.uniqueAnnotationsCount}</p>
                  <p>Annotation Progress: {file.annotatedPercentage.toFixed(2)}%</p>
                  <div className="bg-gray-300 w-full rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${file.annotatedPercentage}%` }}></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => navigate(`/annotator/${file.id}`)} className="bg-green-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Annotate</button>
                  <button onClick={async () => {
                    await axios.delete(`http://localhost:5000/delete_pdf_text/${file.id}`);
                    setProjectFiles(prev => prev.filter(f => f.id !== file.id));
                  }} className="bg-[#F700C6] hover:bg-[#F700C6]/50 text-white font-bold py-2 px-4 rounded">Remove</button>
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
