import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function ExportAnnotationsButton({ pdfTextId }) {
  const [exportFormat, setExportFormat] = useState("json");
  const [exportStyle, setExportStyle] = useState("normal");
  const [showExportModal, setShowExportModal] = useState(false);

  const t = useTranslation().t;
  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportAnnotations = async () => {
    try {
      // Update the URL to include both format and style as query parameters
      let exportURL = `http://localhost:5000/export_annotations/${pdfTextId}?format=${exportFormat}&style=${exportStyle}`;
      
      const response = await axios.get(exportURL);
      const data = response.data;

      // Determine the MIME type based on the exportFormat
      let mimeType = "application/json";
      if (exportFormat === "csv") {
        mimeType = "text/csv";
      } else if (exportFormat === "xml") {
        mimeType = "application/xml";
      }

      // Create a Blob object with the appropriate MIME type
      const blob = new Blob([exportFormat === 'json' ? JSON.stringify(data, null, 2) : data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotations_${pdfTextId}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setShowExportModal(false);
  };

  return (
    <>
      <button onClick={handleExportClick} className="my-8 ml-4 gap-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300">Export Annotations</button>
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
              X
            </button>
            <h2 className="text-xl font-bold mb-4">{t('Export Options')}</h2>
            <select onChange={(e) => setExportFormat(e.target.value)} className="mb-4 p-2 border border-gray-300 rounded">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
            <select onChange={(e) => setExportStyle(e.target.value)} className="mb-4 p-2 border border-gray-300 rounded">
              <option value="normal">Normal</option>
              <option value="bio">BIO</option>
            </select>
            <button onClick={handleExportAnnotations} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">Export</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ExportAnnotationsButton;
