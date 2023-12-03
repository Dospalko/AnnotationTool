import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

function PDFTokenViewer(props) {
  const [tokens, setTokens] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  useEffect(() => {
    fetchTokens();
    fetchAnnotations();
  }, [props.pdfTextId]);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/tokenize_pdf/${props.pdfTextId}`);
      const data = await response.json();
      setTokens(data);
    } catch (err) {
      setError(err);
    }
  }, [props.pdfTextId]);

  const fetchAnnotations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/annotations');
      setAnnotations(res.data);
    } catch (err) {
      setError(err);
    }
  };

  const handleAssignAnnotation = useCallback((e, tokenId) => {
    const annotationId = parseInt(e.target.value);
    if (annotationId === -1) {
      removeAnnotationFromToken(tokenId);
    } else {
      assignAnnotationToToken(tokenId, annotationId);
    }
  }, [tokens, annotations]);

  const assignAnnotationToToken = (tokenId, annotationId) => {
    const updatedTokens = tokens.map(token => {
      if (token.id === tokenId) {
        const annotation = annotations.find(ann => ann.id === annotationId);
        return { ...token, annotation };
      }
      return token;
    });
    setTokens(updatedTokens);
  };

  const removeAnnotationFromToken = (tokenId) => {
    const updatedTokens = tokens.map(token => {
      if (token.id === tokenId) {
        return { ...token, annotation: null };
      }
      return token;
    });
    setTokens(updatedTokens);
  };

  const handleSaveTokens = async () => {
    try {
      await axios.post(`http://localhost:5000/save_tokens/${props.pdfTextId}`, { tokens });
      console.log("Tokens saved successfully.");
    } catch (err) {
      setError(err);
    }
  };
  const handleExportAnnotations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/export_annotations/${props.pdfTextId}`);
      const data = response.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotations_${props.pdfTextId}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err);
    }
  };

  const tokenElements = useMemo(() => tokens.map((token, index) => (
    <div key={`${token.word}-${index}`} className={`flex flex-col items-center m-1 p-1 bg-gray-200 rounded hover:bg-blue-200 transition-all duration-300 ease-in-out ${token.annotation ? 'animate-pulse' : ''}`}>
      <span onClick={() => setSelectedTokenId(token.id)} className="cursor-pointer">
        <span className="font-semibold">[Token {token.id}]:</span> {token.word}
      </span>
      {token.annotation && (
        <span className="mt-1 font-bold text-sm text-bold" style={{ color: token.annotation.color }}>
      {token.annotation.text}
        </span>
      )}
      {selectedTokenId === token.id && (
        <select onChange={(e) => handleAssignAnnotation(e, token.id)} className="mt-1">
          <option value="">Assign Annotation</option>
          <option value="-1" className="text-red-500">Remove Annotation</option>
          {annotations.map((annotation) => (
            <option key={annotation.id} value={annotation.id}>{annotation.text}</option>
          ))}
        </select>
      )}
    </div>
  )), [tokens, annotations, selectedTokenId, handleAssignAnnotation]);

  return (
    <div>
      {error && <p className="text-red-500">{error.message}</p>}
      <div className='mt-10 border-t-stone-700 border-black p-2' id="tokenContainer">
        <h1 className="text-xl font-bold mb-2">TOKENIZED</h1>
        <button onClick={handleSaveTokens} className="mt-4 bg-blue-500 text-white p-2 rounded">
          Save Annotations
        </button>
        <button onClick={handleExportAnnotations} className="mt-4 bg-green-500 text-white p-2 rounded">
  Export Annotations
</button>
        <div className="flex flex-wrap gap-2">{tokenElements}</div>
      </div>
    </div>
  );
}

export default PDFTokenViewer;
