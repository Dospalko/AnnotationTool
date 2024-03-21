import React, { useState } from "react";
import PDFTokenViewer from "./PDFTokenViewer";
import { ThreeDots } from 'react-loader-spinner';
import { useTranslation } from "react-i18next";

const PdfTextDisplay = ({ pdfTexts, onDelete }) => {
  const [selectedPdfText, setSelectedPdfText] = useState(null);
  const [showText, setShowText] = useState(false);
  const [showTokenizedText, setShowTokenizedText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightedTexts, setHighlightedTexts] = useState([]);

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

  const handleShowTextToggle = () => {
    setLoading(true);
    setTimeout(() => {
      setShowText(!showText);
      setLoading(false);
    }, 200);
  };

  const handleShowTokensToggle = () => {
    setLoading(true);
    setTimeout(() => {
      setShowTokenizedText(!showTokenizedText);
      setLoading(false);
    }, 200);
  };

  const handleHighlightToggle = () => {
    setHighlightMode(!highlightMode);
  };

  const handleTextClick = (e) => {
    if (!highlightMode) return;
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      setHighlightedTexts([...highlightedTexts, selectedText]);
      window.getSelection().removeAllRanges();
    }
  };
  const t = useTranslation().t;
  return (
    <div className="my-4 font-base">
      {pdfTexts.length > 0 && (
        <div className="flex items-center justify-center text-center space-x-3">
          <label className="text-2xl font-bold">{t('Choose file for annotation')}</label>
          <select
            className="border rounded-md p-2 shadow focus:border-blue-400 focus:ring focus:ring-blue-200 transition"
            onChange={handlePdfSelect}
          >
            <option value="">--Choose file--</option>
            {pdfTexts.map((text) => (
              <option key={text.id} value={text.id}>{text.filename}</option>
            ))}
          </select>
        </div>
      )}
      {selectedPdfText && (
        <div className="mt-5 border flex items-center justify-center text-center space-x-3 p-4 rounded">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-3" onClick={handleShowTextToggle} disabled={loading}>
            {showText ? "Hide Text" : "Show Text"}
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleShowTokensToggle} disabled={loading}>
            {showTokenizedText ? "Hide Tokens" : "Show Tokens"}
          </button>
          <button className="ml-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(selectedPdfText.id)}>
            Delete
          </button>
          <button className="ml-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={handleHighlightToggle}>
            {highlightMode ? "Disable Highlighter" : "Enable Highlighter"}
          </button>
        </div>
      )}
      {selectedPdfText && showText && !loading && (
        <div className="mt-4 border p-4 rounded" onClick={handleTextClick}>
          <p>{selectedPdfText.text}</p>
        </div>
      )}
      {selectedPdfText && showTokenizedText && !loading && (
        <PDFTokenViewer pdfTextId={selectedPdfText.id} />
      )}
      {loading && (
        <div className="flex justify-center items-center">
          <ThreeDots color="purple" height={80} width={80} />
        </div>
      )}
      {highlightedTexts.length > 0 && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">Highlighted Texts:</h3>
          <ul>
            {highlightedTexts.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfTextDisplay;
