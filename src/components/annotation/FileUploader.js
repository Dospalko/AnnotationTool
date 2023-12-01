import React, { useState } from 'react';
import axios from 'axios';

function FileUploader() {
  const [fileText, setFileText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    axios
      .post('http://localhost:5000/upload_txt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setFileText(response.data.fileContent);
      })
      .catch((error) => {
        console.error('Error uploading TXT file:', error);
      });
  };

  const changeColor = (event) => {
    const newColor = prompt('Enter a color:');
    if (newColor) {
      event.target.style.color = newColor;
      saveModifiedText();
    };
  };

  const attachEntity = (event) => {
    const entityName = prompt('Enter an entity name:');
    if (entityName) {
      const selectedText = window.getSelection().toString();
      event.target.innerHTML = `<span class="entity" data-entity="${entityName}">${selectedText}</span>`;
      saveModifiedText();
    }
  };

  const saveModifiedText = () => {
    const modifiedText = document.getElementById('modifiedText').innerHTML;

    axios
      .post('http://localhost:5000/save_modified_text', {
        modifiedText,
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error('Error saving modified text:', error);
      });
  };

  return (
    <div className="p-4 border container mx-auto rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Upload and Display Text File</h2>
      <input type="file" accept=".txt" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleFileUpload} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        Upload
      </button>
      {fileText && (
        <div className="mt-4">
          <h3>File Content:</h3>
          <div id="modifiedText" className="text-sm">
            {fileText.split(' ').map((word, index) => (
              <span
                key={index}
                onClick={changeColor}
                onDoubleClick={attachEntity}
                className="cursor-pointer"
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
