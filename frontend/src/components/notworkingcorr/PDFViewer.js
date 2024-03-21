import React, { useState } from 'react';
import axios from 'axios';

function PDFViewer() {
    const [pdfTexts, setPDFTexts] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isTextVisible, setIsTextVisible] = useState([]);

    const cleanUpPDFText = (text) => { //vymazeme whitespaces kvoli lepsej tokenizacii
        return text.replace(/\s+/g, ' ');
    };

    const handleFileChange = (e) => {
        const files = e.target.files; //premenna s nasimi pdfkami

        for (let i = 0; i < files.length; i++) { //cyklus na prechod cez vsetky pdf ich upload a zobrazenie
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);

            axios
                .post('/upload_pdf', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((response) => {
                    const cleanedText = cleanUpPDFText(response.data.text);
                    setPDFTexts((prevPDFTexts) => [...prevPDFTexts, cleanedText]); //nahrame uz vycisteny
                    setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, file]);
                    setIsTextVisible((prevVisibility) => [...prevVisibility, true]);
                })
                .catch((error) => {
                    console.error('Error converting PDF:', error);
                });
        }
    };

    const handleClear = (index) => {
        setPDFTexts((prevPDFTexts) => {
            const updatedTexts = [...prevPDFTexts];
            updatedTexts.splice(index, 1);
            return updatedTexts;
        });

        setSelectedFiles((prevSelectedFiles) => {
            const updatedFiles = [...prevSelectedFiles];
            updatedFiles.splice(index, 1);
            return updatedFiles;
        });

        setIsTextVisible((prevVisibility) => {
            const updatedVisibility = [...prevVisibility];
            updatedVisibility.splice(index, 1);
            return updatedVisibility;
        });
    };

    const handleToggleVisibility = (index) => {
        setIsTextVisible((prevVisibility) => {
            const updatedVisibility = [...prevVisibility];
            updatedVisibility[index] = !updatedVisibility[index];
            return updatedVisibility;
        });
    };

    return (
        <div className="bg-black text-white p-10">
          <h1 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r bg-clip-text from-blue-500 to-purple-500">
            PDF Texts
          </h1>
          <input className="p-2 bg-white text-black rounded" type="file" accept=".pdf" onChange={uploadPdf} />
          <div className="mt-5">
            <label className="text-[#F700C6]">Select PDF: </label>
            <select
              className="bg-white text-black rounded p-2"
              onChange={(e) => {
                // ... (existing code)
              }}
            >
              {/* ... (existing options) */}
            </select>
          </div>
    
          {selectedPdfText && (
            <div className="mt-5 border-2 border-white p-4 rounded">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:border-2 border-white transition-all duration-200 ease-in-out"
                onClick={() => setShowText(!showText)}
              >
                {showText ? "Hide Text" : "Show Text"}
              </button>
              <button
                className="px-4 py-2 ml-3 bg-red-500 text-white rounded hover:border-2 border-white transition-all duration-200 ease-in-out"
                onClick={() => deletePdfText(selectedPdfText.id)}
              >
                Delete
              </button>
              {showText && (
                <div className="mt-5">
                  <p>{selectedPdfText.text}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    
    export default PdfViewer;
    