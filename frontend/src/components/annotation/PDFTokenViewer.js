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
    const mergedTokens = [];
    let currentMergedToken = '';
  
    tokens.forEach((token, index) => {
        // Check if the current token has an annotation
        if (token.annotation) {
            // Check if there's a previous merged token and it belongs to the same annotation
            
            const prevMergedToken = mergedTokens[mergedTokens.length];
            if (prevMergedToken && prevMergedToken.annotation && prevMergedToken.annotation.id === token.annotation.id) {
                // If the previous merged token belongs to the same annotation, concatenate the current token with it
                if (/^[a-z]/.test(token.word)) {
                    prevMergedToken.text += token.word;
                } else {
                    mergedTokens.push({
                        text: token.word,
                        annotation: token.annotation
                    });
                }
            } else {
                // If there's no previous merged token or it belongs to a different annotation, start a new merged token
                mergedTokens.push({
                    text: token.word,
                    annotation: token.annotation
                });
            }
        } else {
            // If the token doesn't have an annotation, push the current merged token (if any) and reset it
            if (currentMergedToken) {
                mergedTokens.push({
                    text: currentMergedToken,
                    annotation: null
                });
                currentMergedToken = '';
            }
            // Push the standalone token without merging
            mergedTokens.push({
                text: token.word,
                annotation: null
            });
        }
    });

    // Push the remaining currentMergedToken if any
    if (currentMergedToken) {
        mergedTokens.push({
            text: currentMergedToken,
            annotation: null
        });
    }
  
    return mergedTokens.map((mergedToken, index) => {
        const isSelected = currentSelection.has(tokens[index].id);
  
        return (
            <span
                key={`${mergedToken.text}-${index}`}
                className={`inline-block cursor-pointer px-1 py-0.5 m-0.5 rounded ${isSelected ? "bg-blue-200" : "bg-gray-100"} hover:bg-blue-300`}
                onMouseDown={() => handleDragStart(tokens[index].id)}
                onMouseEnter={() => handleTokenMouseEnter(tokens[index].id)}
                onMouseUp={handleDragEnd}
                style={{ 
                    backgroundColor: mergedToken.annotation ? `rgba(${hexToRgb(mergedToken.annotation.color)}, 0.5)` : '', // Set background color with 50% opacity
                    border: isSelected ? '2px solid red' : '', // Add a border for selected tokens
                }}
            >
                {mergedToken.text}
                {mergedToken.annotation && (
                    <span className="text-xs text-white m-2 p-1" style={{ backgroundColor: mergedToken.annotation.color }}>
                        ({mergedToken.annotation.text})
                    </span>
                )}
            </span>
        );
    });
}, [tokens, currentSelection]);


  
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
    <div onMouseLeave={handleDragEnd}>
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
  
      <div className="flex flex-wrap">{tokenElements}</div>
      {showAnnotationModal && <AnnotationModal />}
    </div>
  );
}

export default PDFTokenViewer;
