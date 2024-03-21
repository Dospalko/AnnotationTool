import React, { useState } from "react";

function TextEditor({ text }) {
  const [selectedText, setSelectedText] = useState("");
  const [selectedColor, setSelectedColor] = useState("black");

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleTextSelection = () => {
    const textArea = document.getElementById("textArea");
    const selectedText = textArea.value.substring(
      textArea.selectionStart,
      textArea.selectionEnd
    );
    setSelectedText(selectedText);
  };

  const handleColorApply = () => {
    // Apply the selected color to the selected text in the textarea
    const textArea = document.getElementById("textArea");
    const textBeforeSelection = textArea.value.substring(
      0,
      textArea.selectionStart
    );
    const textAfterSelection = textArea.value.substring(textArea.selectionEnd);
    textArea.value =
      textBeforeSelection +
      `<span style="color: ${selectedColor}">${selectedText}</span>` +
      textAfterSelection;

    // Clear the selected text and reset color
    setSelectedText("");
    setSelectedColor("black");
  };

  return (
    <div>
      <textarea
        id="textArea"
        rows="10"
        cols="40"
        defaultValue={text}
        onSelect={handleTextSelection}
      ></textarea>
      <br />
      <select onChange={handleColorChange} value={selectedColor}>
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>
      <button onClick={handleColorApply}>Apply Color</button>
      <div>
        <strong>Selected Text:</strong> {selectedText}
      </div>
    </div>
  );
}

export default TextEditor;
