import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { gapi } from 'gapi-script';
import { initClient, signIn, signOut } from './googleDriveSetup';
import { useTranslation } from 'react-i18next';

function ExportAnnotationsButton({ pdfTextId }) {
  const [exportFormat, setExportFormat] = useState('json'); // Default to JSON
  const [exportStyle, setExportStyle] = useState('normal'); // Default to normal
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    initClient((isSignedInStatus) => setIsSignedIn(isSignedInStatus));
  }, []);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleCloseModal = () => {
    setShowExportModal(false);
  };

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
  };

  const handleExportAnnotations = async (saveToDrive = false) => {
    try {
      let exportURL = `http://localhost:5000/export_annotations/${pdfTextId}?format=${exportFormat}&style=${exportStyle}`;
      const response = await axios.get(exportURL, { responseType: 'blob' }); // Ensure to get response as a blob
      const data = response.data;

      if (saveToDrive) {
        if (!isSignedIn) {
          signIn();
          return;
        }
        const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        const metadata = { name: `annotations_${pdfTextId}.${exportFormat}`, mimeType: data.type };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', data);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
          body: form,
        });

        alert('Saved to Google Drive');
      } else {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `annotations_${pdfTextId}.${exportFormat}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting annotations:', err);
      alert('Failed to export annotations. Please try again.');
    }
  };

  return (
    <>
      <button onClick={handleExportClick} className="my-8 ml-4 gap-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300">{t('Export Annotations')}</button>
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">X</button>
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
            <button onClick={() => handleExportAnnotations(false)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">Download</button>
            <button onClick={() => handleExportAnnotations(true)} className="ml-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">Save to Google Drive</button>
            {!isSignedIn ? (
              <button onClick={handleSignIn} className="ml-4 bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition duration-300">{t('Login')}</button>
            ) : (
              <button onClick={handleSignOut} className="ml-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300">{t('Logout')}</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ExportAnnotationsButton;
