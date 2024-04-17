import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import ExportAnnotationsButton from "./ExportAnnotationsButton";
import { useTranslation } from "react-i18next";

function PDFTokenViewer(props) {
  const t = useTranslation().t;
  const [tokens, setTokens] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [error, setError] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(new Set());
  const dragStart = useRef(false);

  const autoSaveInterval = 5000;

  useEffect(() => {
    let source = axios.CancelToken.source(); // Create a cancel token source
  
    const fetchTokensAndAnnotations = async () => {
      try {
        const tokenResponse = await axios.get(
          `http://localhost:5000/tokenize_pdf/${props.pdfTextId}`,
          { cancelToken: source.token } // Pass cancel token to the request
        );
        setTokens(tokenResponse.data);
        const annotationResponse = await axios.get(
          "http://localhost:5000/annotations",
          { cancelToken: source.token } // Pass cancel token to the request
        );
        setAnnotations(annotationResponse.data);
      } catch (error) {
        if (!axios.isCancel(error)) { // Check if the error is due to cancellation
          setError(error);
        }
      }
    };
  
    fetchTokensAndAnnotations();
  
    // Cleanup function to cancel ongoing requests when component unmounts
    return () => {
      source.cancel("Component unmounted"); // Cancel ongoing requests
    };
  }, [props.pdfTextId]);

  const handleSaveTokens = useCallback(async () => {
    try {
      await axios.post(`http://localhost:5000/save_tokens/${props.pdfTextId}`, {
        tokens,
      });
    } catch (err) {
      setError(err);
    }
  }, [tokens, props.pdfTextId]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveTokens();
    }, autoSaveInterval);
    return () => clearInterval(interval);
  }, [handleSaveTokens]);

  const handleDragStart = (tokenId) => {
    dragStart.current = true;
    selectedTokens.current.clear();
    selectedTokens.current.add(tokenId);
    setCurrentSelection(new Set(selectedTokens.current));
  };

  const handleTokenMouseEnter = (tokenId) => {
    if (dragStart.current) {
      selectedTokens.current.add(tokenId);
      setCurrentSelection(new Set(selectedTokens.current));
    }
  };

  const handleDragEnd = () => {
    if (dragStart.current && selectedTokens.current.size > 0) {
      setShowAnnotationModal(true);
    }
    dragStart.current = false;
    // Once selection is done, clear current selection visual indication
    setCurrentSelection(new Set());
  };

  const assignAnnotationToSelectedTokens = useCallback(
    (annotationId) => {
      const updatedTokens = tokens.map((token) => {
        if (selectedTokens.current.has(token.id)) {
          const annotation = annotations.find((ann) => ann.id === annotationId);
          return { ...token, annotation };
        }
        return token;
      });
      setTokens(updatedTokens);
      selectedTokens.current.clear();
      setShowAnnotationModal(false);
    },
    [tokens, annotations]
  );

  const AnnotationModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{t('Manage Annotations')}</h2>
        <div className="flex flex-col space-y-2">
          {/* Existing annotation buttons */}
          {annotations.map((annotation) => (
            <button
              key={annotation.id}
              className="px-4 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-100"
              onClick={() => assignAnnotationToSelectedTokens(annotation.id)}
            >
              {annotation.text}
            </button>
          ))}
          {/* Button for removing annotations from all selected tokens */}
          {selectedTokens.current.size > 0 && (
            <button
              className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={removeAnnotationsFromSelectedTokens}
            >
              {t('Remove Annotations from Selected Tokens')}
            </button>
          )}
          <button
            className="mt-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowAnnotationModal(false)}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );

  const removeAnnotationsFromSelectedTokens = useCallback(() => {
    const updatedTokens = tokens.map((token) => {
      if (selectedTokens.current.has(token.id)) {
        return { ...token, annotation: null };
      }
      return token;
    });
    setTokens(updatedTokens);
    setShowAnnotationModal(false); // Hide the modal after removing annotations
  }, [tokens]);

  const selectedTokens = useRef(new Set());

  const tokenElements = useMemo(() => {
  return tokens.map((token, index) => {
    const isSelected = currentSelection.has(token.id);
    return (
      <React.Fragment key={`${token.id}-${index}`}>
        <span
          className={`inline-block cursor-pointer px-1 py-0.5 m-0.5 rounded ${isSelected ? "bg-blue-200" : "bg-white"} hover:bg-blue-300`}
          onMouseDown={() => handleDragStart(token.id)}
          onMouseEnter={() => handleTokenMouseEnter(token.id)}
          onMouseUp={handleDragEnd}
          style={{
            backgroundColor: token.annotation ? `rgba(${hexToRgb(token.annotation.color)}, 0.5)` : '',
            border: isSelected ? '2px solid red' : '',
          }}
        >
          {token.word}
          {token.annotation && (
            <span className="text-xs text-white m-2 p-1" style={{ backgroundColor: token.annotation.color }}>
              ({token.annotation.text})
            </span>
          )}
        </span>
        {token.word === '\n' && <hr className="w-full h-full"/>}  {/* Insert line break for newline tokens */}
      </React.Fragment>
    );
  });
}, [tokens, currentSelection, handleDragStart, handleTokenMouseEnter, handleDragEnd]);



  
  // Function to convert hex color to RGB format
  function hexToRgb(hex) {
    // Remove '#' from the beginning of the hex color
    hex = hex.replace(/^#/, '');
  
    // Parse the hex color to obtain RGB components
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    // Return the RGB values as a string
    return `${r}, ${g}, ${b}`;
  }
  
  

  return (
    <div className=" whitespace-pre-wrap" onMouseLeave={handleDragEnd}>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <div className="flex justify-center m-auto items-center text-center mb-10">
        <button
          onClick={handleSaveTokens}
          className="my-8 bg-blue-500 text-white p-2 rounded"
        >
          {t('save')}
        </button>
        <ExportAnnotationsButton pdfTextId={props.pdfTextId} />
      </div>
      <div className="flex flex-wrap whitespace-pre-wrap">{tokenElements}</div>
      {showAnnotationModal && <AnnotationModal />}
    </div>
  );
}

export default PDFTokenViewer;
