import React, { useState } from "react";
import PDFTokenViewer from "./PDFTokenViewer";
import axios from "axios";
const PdfTextDisplay = ({ pdfTexts, onDelete }) => {
  const [selectedPdfText, setSelectedPdfText] = useState(null);
  const [showText, setShowText] = useState(false);
  const [showTokenizedText, setShowTokenizedText] = useState(false);

  const handlePdfSelect = async (e) => {
    const selectedText = pdfTexts.find(text => text.id === parseInt(e.target.value));
    setSelectedPdfText(selectedText);
    setShowText(false);
    setShowTokenizedText(false);
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    setSelectedPdfText(null);
    setShowText(false);
    setShowTokenizedText(false);
  };

  return (
    <div className="my-4">
      {pdfTexts.length > 0 && (
        <div className="flex items-center space-x-3">
          <label className="text-lg font-medium">Select PDF:</label>
          
          <select
            className="border rounded-md p-2 shadow focus:border-blue-400 focus:ring focus:ring-blue-200 transition"
            onChange={handlePdfSelect}
          >
            <option value="">--Choose PDF--</option>
            {pdfTexts.map((text) => (
              <option key={text.id} value={text.id}>{text.filename}</option>
            ))}
          </select>
        </div>
      )}
      {selectedPdfText && (
        <div className="mt-5 border p-4 rounded">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-3"
            onClick={() => setShowText(!showText)}
          >
            {showText ? "Hide Text" : "Show Text"}
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setShowTokenizedText(!showTokenizedText)}
          >
            {showTokenizedText ? "Hide Tokens" : "Show Tokens"}
          </button>
          <button
            className="ml-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDelete(selectedPdfText.id)}
          >
            Delete
          </button>
        </div>
      )}

      {selectedPdfText && showText && (
        <div className="mt-4 border p-4 rounded">
          <p>{selectedPdfText.text}</p>
        </div>
      )}

      {selectedPdfText && showTokenizedText && (
        <PDFTokenViewer pdfTextId={selectedPdfText.id} />
      )}
    </div>
  );
};

export default PdfTextDisplay;
