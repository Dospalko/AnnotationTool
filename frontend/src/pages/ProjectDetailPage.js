import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Modal from "./Modal";

import { ThreeDots } from "react-loader-spinner";
const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectFiles, setProjectFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("SlovakBert");
  const [isLoading, setIsLoading] = useState(false);
  // Define your model options here
  const modelOptions = ["SlovakBert"]; // Add more models as needed
  const [selectedJSONLFile, setSelectedJSONLFile] = useState(null);
  const [selectedImportFile, setSelectedImportFile] = useState(null);

  const handleJSONLFileChange = (event) => {
    setSelectedJSONLFile(event.target.files[0]);
  };

  const uploadJSONLFile = async () => {
    if (!selectedJSONLFile) {
      alert("Please select a JSONL file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("jsonl_file", selectedJSONLFile);
    setIsLoading(true); // Show the loader
    try {
      const response = await axios.post(
        `http://localhost:5000/upload_jsonl_to_project/${projectId}`,
        formData
      );
      alert("JSONL file processed successfully.");
      console.log(response.data); // Optionally process data
      setSelectedJSONLFile(null); // Clear the selected file
    } catch (error) {
      alert("Failed to upload JSONL file.");
      console.error("Error uploading JSONL:", error);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetchProjectDetails();
    fetchFilesOverview();
  }, [projectId]);

  const fetchFilesOverview = async () => {
    setIsLoading(true);
    try {
      const overviewResponse = await axios.get(
        `http://localhost:5000/api/files-overview`
      );
      const projectFilesResponse = await axios.get(
        `http://localhost:5000/projects/${projectId}/files`
      );
      const filesOverview = overviewResponse.data;

      const combinedFilesData = projectFilesResponse.data.map((projectFile) => {
        const overviewData = filesOverview.find(
          (overview) => overview.id === projectFile.id
        );

        return {
          ...projectFile,
          tokensCount: overviewData ? overviewData.tokensCount : 0,
          annotatedTokensCount: overviewData
            ? overviewData.annotatedTokensCount
            : 0,
          uniqueAnnotationsCount: overviewData
            ? overviewData.uniqueAnnotationsCount
            : 0,
          annotatedPercentage: overviewData
            ? overviewData.annotatedPercentage
            : 0,
        };
      });

      setProjectFiles(combinedFilesData);
    } catch (error) {
      console.error("Error fetching project files and overview:", error);
    } finally {
      setIsLoading(false); // Stop loading after the fetch
    }
  };
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/projects/${projectId}`
      );
      console.log(response.data); // Log the response data to see if the project name is fetched correctly
      setProjectName(response.data.name);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const [extractionOptions, setExtractionOptions] = useState({
    bold: false,
    italic: false,
    colored: false,
    sized: false,
    ssized: false
});

const handleUploadFiles = async (options) => {
    if (selectedFiles.length === 0) {
        alert("Please select at least one file to upload.");
        return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append("files", file));
    formData.append("extractionOptions", JSON.stringify(options)); // Send options as JSON

    try {
        const response = await axios.post(`http://localhost:5000/upload_files_to_project/${projectId}`, formData);
        alert("Files uploaded successfully.");
        setShowModal(false); // Close the modal
        fetchFilesOverview(); // Refresh files list
    } catch (error) {
        console.error("Failed to upload files:", error);
        alert("Error uploading files.");
    }
};
  const deleteAllFiles = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/delete_all_files_in_project/${projectId}`
      );
      alert("All files deleted successfully.");
      setProjectFiles([]); // Clear the state holding the files
    } catch (error) {
      alert("Failed to delete files.");
      console.error("Error deleting files:", error);
    }
  };
  const handleImportFileChange = (event) => {
    setSelectedImportFile(event.target.files[0]);
  };

  const handleImportFile = async () => {
    if (!selectedImportFile) {
      alert("Please select a file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImportFile);
    setIsLoading(true);

    try {
      await axios.post(
        `http://localhost:5000/import_annotated_text/${projectId}`,
        formData
      );
      alert("File imported successfully.");
      fetchFilesOverview(); // Refresh the list of files
    } catch (error) {
      alert("Failed to import file.");
      console.error("Error importing file:", error);
    } finally {
      setIsLoading(false);
      setSelectedImportFile(null); // Clear the selected file
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
  <Header />
  <div className="flex-grow p-12 bg-gray-900">
    <div className="max-w-4xl mx-auto shadow-lg rounded-lg bg-white text-black font-base p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Detaily projektu: {projectName}
      </h2>
      <div className="flex flex-col">
      <input
        type="file"
        onChange={handleImportFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />
      <button
        onClick={handleImportFile}
        className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Import Annotated File
      </button>
      {isLoading && <ThreeDots />}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />
      <button
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Upload Files
      </button>
      {showModal && (
        <Modal
          onConfirm={handleUploadFiles}
          extractionOptions={extractionOptions}
          setExtractionOptions={setExtractionOptions}
          onCancel={() => setShowModal(false)}
        />
      )}
      <input
        type="file"
        accept=".jsonl"
        onChange={handleJSONLFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />
      <button
        onClick={uploadJSONLFile}
        className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Upload JSONL File
      </button>
      <button
        onClick={deleteAllFiles}
        className="w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Delete All Files
      </button>
      </div>
          {isLoading && <ThreeDots />} {/* Display the Spinner when loading */}
          <div className="mt-6">
            {projectFiles.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-3 mb-4 bg-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{file.filename}</h3>
        
                  <p>Total Tokens: {file.tokensCount}</p>
                  <p>Annotated Tokens: {file.annotatedTokensCount}</p>
                  <p>Unique Annotations: {file.uniqueAnnotationsCount}</p>
                  <p>
                    Annotation Progress: {file.annotatedPercentage.toFixed(2)}%
                  </p>
                  <div className="bg-gray-300 w-full rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${file.annotatedPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="model-selection"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Select a Model
                  </label>
                  <select
                    id="model-selection"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {modelOptions.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/annotator/${file.id}`)}
                    className="bg-green-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                  >
                    Annotate
                  </button>
                  <button
                    onClick={async () => {
                      await axios.delete(
                        `http://localhost:5000/delete_pdf_text/${file.id}`
                      );
                      setProjectFiles((prev) =>
                        prev.filter((f) => f.id !== file.id)
                      );
                    }}
                    className="bg-[#F700C6] hover:bg-[#F700C6]/50 text-white font-bold py-2 px-4 rounded"
                  >
                    Remove
                  </button>
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
