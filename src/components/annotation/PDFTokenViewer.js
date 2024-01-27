import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

function PDFTokenViewer(props) {
  const [tokens, setTokens] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [exportFormat, setExportFormat] = useState("json");
  const [exportStyle, setExportStyle] = useState("normal");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isTokensLoaded, setIsTokensLoaded] = useState(false);
  const [isAnnotationsLoaded, setIsAnnotationsLoaded] = useState(false);

  const autoSaveInterval = 5000;

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/tokenize_pdf/${props.pdfTextId}`);
      const data = await response.json();
      setTokens(data);
      setIsTokensLoaded(true);
    } catch (err) {
      setError(err);
    }
  }, [props.pdfTextId]);

  const fetchAnnotations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/annotations");
      setAnnotations(res.data);
      setIsAnnotationsLoaded(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleSaveTokens = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/save_tokens/${props.pdfTextId}`, { tokens });
    } catch (err) {
      setError(err);
    }
  }, [tokens, props.pdfTextId]);

  useEffect(() => {
    if (!isTokensLoaded) {
      fetchTokens();
    }
    if (!isAnnotationsLoaded) {
      fetchAnnotations();
    }
  }, [props.pdfTextId, isTokensLoaded, isAnnotationsLoaded, fetchTokens]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveTokens();
    }, autoSaveInterval);
    return () => clearInterval(interval);
  }, [handleSaveTokens]);

  const assignAnnotationToToken = useCallback((tokenId, annotationId) => {
    const updatedTokens = tokens.map(token => {
      if (token.id === tokenId) {
        const annotation = annotations.find(ann => ann.id === annotationId);
        return { ...token, annotation };
      }
      return token;
    });
    setTokens(updatedTokens);
  }, [tokens, annotations]);

  const removeAnnotationFromToken = useCallback((tokenId) => {
    const updatedTokens = tokens.map(token => {
      if (token.id === tokenId) {
        return { ...token, annotation: null };
      }
      return token;
    });
    setTokens(updatedTokens);
  }, [tokens]);

  const handleAssignAnnotation = useCallback((e, tokenId) => {
    const annotationId = parseInt(e.target.value);
    if (annotationId === -1) {
      removeAnnotationFromToken(tokenId);
    } else {
      assignAnnotationToToken(tokenId, annotationId);
    }
  }, [assignAnnotationToToken, removeAnnotationFromToken]);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportAnnotations = async () => {
    try {
      let exportURL = `http://localhost:5000/export_annotations/${props.pdfTextId}`;
      if (exportStyle === "bio") {
        exportURL = `http://localhost:5000/export_annotations_bio/${props.pdfTextId}?format=${exportFormat}`;
      }
      const response = await axios.get(exportURL);
      const data = response.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `annotations_${props.pdfTextId}.${exportFormat}`;
      link.click();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      setError(err);
    }
  };

  const handleCloseModal = () => {
    setShowExportModal(false);
  };

  const tokenElements = useMemo(() => tokens.map((token, index) => (
    <div key={`${token.word}-${index}`} className="relative flex space-x-2">
      <span className={`font-semibold cursor-pointer p-1 rounded ${token.annotation ? "text-white" : "text-gray-800"}`}
            style={{ backgroundColor: token.annotation?.color }}
            onClick={() => setSelectedTokenId(token.id)}>
        {token.word}
      </span>
      {token.annotation && (
        <div className="flex items-center justify-center">
          <span className="font-bold text-xs text-white p-2"
                style={{ backgroundColor: token.annotation.color }}>
            {token.annotation.text}
          </span>
          <button onClick={() => removeAnnotationFromToken(token.id)}
                  className=" bg-red-500 p-2 hover:bg-red-700 text-white text-xs">
            X
          </button>
        </div>
      )}
      {selectedTokenId === token.id && (
        <select onChange={(e) => handleAssignAnnotation(e, token.id)}
                className="flex justify-center items-center absolute transform -translate-y-full mr-10  cursor-pointer shadow-md"
                defaultValue="">
          <option value="" disabled hidden>Assign Annotation</option>
          <option value="-1" className="text-red-500">Remove Annotation</option>
          {annotations.map(annotation => (
            <option key={annotation.id} value={annotation.id}>{annotation.text}</option>
          ))}
        </select>
      )}
    </div>
  )), [tokens, annotations, selectedTokenId, handleAssignAnnotation, removeAnnotationFromToken]);

  return (
    <div className="font-base">
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="border-t border-black p-2" id="tokenContainer">
        <h1 className="text-2xl m-auto font-bold flex justify-center items-center bg-black w-max text-white  p-2 text-center my-4">TOKENIZED</h1>
        <div className="flex justify-center m-auto items-center text-center mb-10">
          <button onClick={handleSaveTokens} className="my-8 bg-blue-500 text-white p-2 rounded">Save Annotations</button>
          <button onClick={handleExportClick} className="my-8 ml-4 gap-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300">Export Annotations</button>
        </div>
        {showExportModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
              <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className="text-xl font-bold mb-4">Export Options</h2>
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
        <div className="flex flex-wrap gap-2 justify-start">{tokenElements}</div>
      </div>
    </div>
  );
}

export default PDFTokenViewer;
