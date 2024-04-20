import React, { useState, useEffect } from "react";
import PDFTokenViewer from "./PDFTokenViewer";
import { ThreeDots } from 'react-loader-spinner';
import { useTranslation } from "react-i18next";

const PdfTextDisplay = ({ pdfTexts, onDelete }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false); // General loading state
  const [showTokenizedText, setShowTokenizedText] = useState(false); // State to manage tokenized text visibility
  const { t } = useTranslation();

  useEffect(() => {
    if (pdfTexts.length > 0) {
      fetchTokenizedText(pdfTexts[selectedIndex].id);
    }
  }, [selectedIndex, pdfTexts]);

  const fetchTokenizedText = async (pdfTextId) => {
    setLoading(true);
    setTimeout(() => {
      // Assuming tokenization is ready
      setShowTokenizedText(true); 
      setLoading(false);
    }, 3000); // Simulate a 3-second loading process
  };

  const handleNext = () => {
    if (selectedIndex < pdfTexts.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(pdfTexts[selectedIndex].id);
    if (selectedIndex >= pdfTexts.length - 1) {
      setSelectedIndex(pdfTexts.length - 2);
    }
    setLoading(false);
  };

  const selectedPdfText = pdfTexts.length > 0 ? pdfTexts[selectedIndex] : null;

  return (
    <div className="my-4 font-base">
      {pdfTexts.length > 0 && (
        <>
          <div className="flex items-center justify-center text-center space-x-3 my-2">
            <button onClick={handlePrevious}>&lt;</button>
            <select
              className="border rounded-md p-2 shadow focus:border-blue-400 focus:ring focus:ring-blue-200 transition"
              value={selectedPdfText ? selectedPdfText.id : ''}
              onChange={(e) => setSelectedIndex(pdfTexts.findIndex(text => text.id === parseInt(e.target.value)))}
            >
              {pdfTexts.map((text) => (
                <option key={text.id} value={text.id}>{text.filename}</option>
              ))}
            </select>
            <button onClick={handleNext}>&gt;</button>
          </div>
          <div className="flex justify-center items-center">
            <span className="text-lg font-semibold">{selectedPdfText ? selectedPdfText.filename : ''}</span>
          </div>
        </>
      )}
      {selectedPdfText && (
        <div className="mt-5 border flex flex-col items-center justify-center text-center space-y-3 p-4 rounded">
          {loading ? (
            <div className="flex justify-center items-center">
              <ThreeDots color="#4A90E2" height={80} width={80} />
            </div>
          ) : (
            showTokenizedText && <PDFTokenViewer pdfTextId={selectedPdfText.id} />
          )}
        </div>
      )}
    </div>
  );
};

export default PdfTextDisplay;
