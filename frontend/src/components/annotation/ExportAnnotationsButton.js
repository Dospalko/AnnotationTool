import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { gapi } from 'gapi-script';
import { useTranslation } from 'react-i18next';
import { signIn, signOut, initClient } from './googleDriveSetup';

function ExportAnnotationsButton({ pdfTextId }) {
  const [exportFormat, setExportFormat] = useState('json');  // Default to JSON
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { t } = useTranslation();
  const [alertInfo, setAlertInfo] = useState({ message: '', type: '' }); // Custom alert state
 
  useEffect(() => {
    initClient((isSignedInStatus) => {
      setIsSignedIn(isSignedInStatus);
    });
  }, []);

  useEffect(() => {
    // Auto-clear the alert after 5 seconds
    const timer = setTimeout(() => setAlertInfo({ message: '', type: '' }), 5000);
    return () => clearTimeout(timer);
  }, [alertInfo]);

  const handleExportAnnotations = async (saveToDrive = false) => {
    try {
      let exportStyle = exportFormat === 'csv' ? 'bio' : 'normal'; // Always use 'bio' for CSV
      const exportURL = `http://localhost:5000/export_annotations/${pdfTextId}?format=${exportFormat}&style=${exportStyle}`;
      const response = await axios.get(exportURL, { responseType: 'blob' });
      const data = response.data;

      if (saveToDrive && isSignedIn) {
        const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        const metadata = { name: `annotations_${pdfTextId}.${exportFormat}`, mimeType: data.type };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', data);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + accessToken },
          body: form,
        });

        setAlertInfo({ message: 'Súbor bol uložený na Google Drive.', type: 'success' });
 
      } else {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `annotations_${pdfTextId}.${exportFormat}`);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        setAlertInfo({ message: 'Súbor bol stiahnutý.', type: 'success' });
      }
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting annotations:', err);
      setAlertInfo({ message: 'Zlyhalo exportovanie anotácií. Skúste to znova.', type: 'error' });
  
    }
  };

  return (
    <>
     {alertInfo.message && (
        <div className={`fixed bottom-5 right-5 p-4 mb-4 rounded-md text-white ${alertInfo.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} role="alert">
          {alertInfo.message}
        </div>
      )}
      <button onClick={() => setShowExportModal(true)} className="my-8 ml-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300">
        Exportovať súbor
      </button>
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button onClick={() => setShowExportModal(false)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">X</button>
            <h2 className="text-xl font-bold mb-4">{t('Export Options')}</h2>
            <select onChange={(e) => setExportFormat(e.target.value)} className="mb-4 p-2 border border-gray-300 rounded">
              <option value="json">JSON</option>
              <option value="csv">CSV (BIO)</option>
            </select>
            <button onClick={() => handleExportAnnotations(false)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">
              Stiahnut
            </button>
            <button onClick={() => handleExportAnnotations(true)} className="ml-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">
              Ulozit na drive
            </button>
            {!isSignedIn ? (
              <button onClick={signIn} className="ml-4 bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition duration-300">
                {t('Login')}
              </button>
            ) : (
              <button onClick={signOut} className="ml-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300">
                {t('Logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ExportAnnotationsButton;
