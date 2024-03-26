import React, { useState, useEffect } from "react";
import PDFTokenViewer from "./PDFTokenViewer";
import { ThreeDots } from 'react-loader-spinner';
import { useTranslation } from "react-i18next";

const PdfTextDisplay = ({ pdfTexts, onDelete }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showTokenizedText, setShowTokenizedText] = useState(false);
  const [loading, setLoading] = useState(false); // General loading state
  const [loadingTokens, setLoadingTokens] = useState(false); // Specific loading state for tokenization
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightedTexts, setHighlightedTexts] = useState([]);

  useEffect(() => {
    setShowText(false);
    setShowTokenizedText(false);
  }, [selectedIndex]);

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
    setLoading(true); // Consider setting loading true when delete operation starts
    await onDelete(pdfTexts[selectedIndex].id);
    if (selectedIndex >= pdfTexts.length - 1) {
      setSelectedIndex(pdfTexts.length - 2);
    }
    setLoading(false); // Reset loading state once delete operation is complete
  };

  const handleShowTextToggle = () => {
    setLoading(true);
    setTimeout(() => {
      setShowText(!showText);
      setLoading(false);
    }, 200);
  };

  const handleShowTokensToggle = async () => {
    setLoadingTokens(true); // Set loadingTokens to true to indicate tokenization is in process
    // Simulate or await the tokenization process
    setTimeout(() => {
      setShowTokenizedText(!showTokenizedText);
      setLoadingTokens(false); // Reset loadingTokens state once tokenization is complete
    }, 200); // Replace this with your actual tokenization call if asynchronous
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

  const selectedPdfText = pdfTexts.length > 0 ? pdfTexts[selectedIndex] : null;
  const t = useTranslation().t;


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
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleShowTextToggle} disabled={loading}>
            {showText ? t("Hide Text") : t("Show Text")}
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleShowTokensToggle} disabled={loading}>
            {showTokenizedText ? t("Hide Tokens") : t("Show Tokens")}
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleDelete} disabled={loading}>
            {t("Delete")}
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={handleHighlightToggle} disabled={loading}>
            {highlightMode ? t("Disable Highlighter") : t("Enable Highlighter")}
          </button>
        </div>
      )}
      {selectedPdfText && showText && !loading && (
        <div className="mt-4 border p-4 rounded" onClick={handleTextClick}>
          <p>{selectedPdfText.text}</p>
        </div>
      )}
       {loadingTokens && (
        <div className="flex justify-center items-center">
          <ThreeDots color="#4A90E2" height={80} width={80} />
        </div>
      )}

      {selectedPdfText && showTokenizedText && !loadingTokens && (
        <PDFTokenViewer pdfTextId={selectedPdfText.id} />
      )}
      {loading && (
        <div className="flex justify-center items-center">
          <ThreeDots color="purple" height={80} width={80} />
        </div>
      )}
      {highlightedTexts.length > 0 && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">{t("Highlighted Texts:")}</h3>
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
