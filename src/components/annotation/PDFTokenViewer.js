import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PDFTokenViewer(props) {
  const [tokens, setTokens] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  useEffect(() => {
    fetch(`/tokenize_pdf/${props.pdfTextId}`)
      .then(response => response.json())
      .then(data => setTokens(data))
      .catch(err => setError(err));

    axios.get('http://localhost:5000/annotations')
      .then(res => setAnnotations(res.data))
      .catch(err => setError(err));
  }, [props.pdfTextId]);

  const handleTokenClick = (tokenId) => {
    setSelectedTokenId(tokenId);
  };

  const handleAssignAnnotation = (token_id, annotation_id) => {
    axios.post('/assign_annotation', {
      token_id,
      annotation_id
    })
    .then(() => {
      setSelectedAnnotationId(annotation_id);
      console.log(`Assigned annotation ${annotation_id} to token ${token_id}`);
    })
    .catch(err => setError(err));
  };

  return (
    <div>
      {error && <p className="text-red-500">{error.message}</p>}
      <div className='mt-10 border-t-stone-700 border-black p-2' id="tokenContainer">
        <h1 className="text-xl font-bold mb-2">TOKENIZED</h1>
        <div className="flex flex-wrap gap-2">
         {tokens.map((token, index) => (
            <div key={`${token.word}-${index}`} className="flex flex-col items-center m-1 p-1 bg-gray-200 rounded hover:bg-blue-200 transition-all duration-300 ease-in-out">
              <span onClick={() => handleTokenClick(token.id)} className="cursor-pointer">
                <span className="font-semibold">[Token {token.id}]:</span> {token.word}
              </span>
              {token.annotation && (
                <span className="mt-1 text-xs" style={{ color: token.annotation.color }}>
                  Annotation: {token.annotation.text}
                </span>
              )}
              {selectedTokenId === token.id && (
                <select onChange={(e) => handleAssignAnnotation(token.id, e.target.value)} className="mt-1">
                  <option value="">Assign Annotation</option>
                  {annotations.map((annotation) => (
                    <option key={annotation.id} value={annotation.id}>{annotation.text}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PDFTokenViewer;
