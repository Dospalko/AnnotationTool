import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EntitySelector({ onSelectEntity }) {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedColor, setSelectedColor] = useState('black');

  useEffect(() => {
    // Fetch entities from the backend when the component mounts
    axios.get('/get_entities')
      .then((response) => {
        setEntities(response.data.entities);
      })
      .catch((error) => {
        console.error('Error fetching entities:', error);
      });
  }, []);

  const handleEntityChange = (event) => {
    setSelectedEntity(event.target.value);
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleApplyEntity = () => {
    onSelectEntity(selectedEntity, selectedColor);
  };

  return (
    <div>
      <h3>Select Entity and Color:</h3>
      <select onChange={handleEntityChange} value={selectedEntity}>
        <option value="">Select an entity</option>
        {entities.map((entity) => (
          <option key={entity} value={entity}>
            {entity}
          </option>
        ))}
      </select>
      <input
        type="color"
        value={selectedColor}
        onChange={handleColorChange}
      />
      <button onClick={handleApplyEntity}>Apply Entity</button>
    </div>
  );
}

function Annotator() {
  const [text, setText] = useState('');
  const [annotatedText, setAnnotatedText] = useState('');

  const annotateText = (selectedEntity, selectedColor) => {
    // Call the backend endpoint to annotate the text
    axios.post('/annotate_text', {
      text,
      entity: selectedEntity,
      color: selectedColor,
    })
      .then((response) => {
        setAnnotatedText(response.data.annotatedText);
      })
      .catch((error) => {
        console.error('Error annotating text:', error);
      });
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div>
      <h2>Text Annotator</h2>
      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={handleTextChange}
      />
      <EntitySelector onSelectEntity={annotateText} />
      <div>
        <h3>Annotated Text:</h3>
        <div dangerouslySetInnerHTML={{ __html: annotatedText }} />
      </div>
    </div>
  );
}

export default Annotator;
