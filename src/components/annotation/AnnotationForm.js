import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlusCircle,
  faStar as faSolidStar,
  faStar as faRegularStar,
} from "@fortawesome/free-solid-svg-icons";

const AnnotationForm = () => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [annotations, setAnnotations] = useState([]);
  const [favoriteAnnotations, setFavoriteAnnotations] = useState([]);
  const [nonFavoriteAnnotations, setNonFavoriteAnnotations] = useState([]);

  // Function to fetch favorite annotations
  const fetchFavoriteAnnotations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/annotations/favorites"
      );
      setFavoriteAnnotations(res.data);
    } catch (error) {
      console.error("Could not fetch favorite annotations:", error);
    }
  };

  // Function to fetch non-favorite annotations
  const fetchNonFavoriteAnnotations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/annotations/non_favorites"
      );
      setNonFavoriteAnnotations(res.data);
    } catch (error) {
      console.error("Could not fetch non-favorite annotations:", error);
    }
  };

  const addAnnotation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/add", {
        text,
        color,
      });
      const newAnnotation = response.data; // The backend should return the full annotation object
      setAnnotations((current) => [...current, newAnnotation]);
      if (!newAnnotation.favorite) {
        setNonFavoriteAnnotations((current) => [...current, newAnnotation]);
      }
      fetchFavoriteAnnotations();
      fetchNonFavoriteAnnotations();
    } catch (error) {
      console.error("Failed to add annotation:", error);
    }
    setText("");
    setColor("#ffffff");
  };
  const deleteAnnotation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      // Update the state to remove the deleted annotation
      setFavoriteAnnotations((favs) => favs.filter((ann) => ann.id !== id));
      setNonFavoriteAnnotations((nonFavs) =>
        nonFavs.filter((ann) => ann.id !== id)
      );
    } catch (error) {
      console.error(`Could not delete annotation with id ${id}:`, error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      await axios.post(`http://localhost:5000/toggle_favorite/${id}`);
      fetchFavoriteAnnotations();
      fetchNonFavoriteAnnotations();
    } catch (error) {
      console.error(
        `Could not toggle favorite for annotation with id ${id}:`,
        error
      );
    }
  };

  useEffect(() => {
    fetchFavoriteAnnotations();
    fetchNonFavoriteAnnotations();
  }, []);

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold mb-2">Manage Annotations</h1>
      <form className="mb-4" onSubmit={addAnnotation}>
        <div className="flex gap-2 text-black items-center mb-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter annotation text"
            className="flex-1 p-2 border rounded-md"
            required
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border rounded-md cursor-pointer"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faPlusCircle} />
          </button>
        </div>
      </form>
      {/* Favorites Section */}
      <div className="favorites-section mb-4">
        <h2 className="text-lg font-bold">Favorite Annotations</h2>
        {favoriteAnnotations.map((annotation) => (
          <AnnotationItem
            key={annotation.id}
            annotation={annotation}
            toggleFavorite={toggleFavorite}
            deleteAnnotation={deleteAnnotation}
          />
        ))}
      </div>

      {/* Non-Favorites Section */}
      <div className="non-favorites-section">
        <h2 className="text-lg font-bold">Other Annotations</h2>
        {nonFavoriteAnnotations.map((annotation) => (
          <AnnotationItem
            key={annotation.id}
            annotation={annotation}
            toggleFavorite={toggleFavorite}
            deleteAnnotation={deleteAnnotation}
          />
        ))}
      </div>
    </div>
  );
};

const AnnotationItem = ({ annotation, toggleFavorite, deleteAnnotation }) => (
  <div
    style={{ backgroundColor: annotation.color }}
    className="p-2 mb-2 flex justify-between items-center rounded shadow"
  >
    <span>{annotation.text}</span>
    <div>
      <button
        onClick={() => toggleFavorite(annotation.id)}
        className={`p-1 mr-2  ${
          annotation.favorite ? "text-yellow-500" : "text-white"
        }`}
      >
        <FontAwesomeIcon
          icon={annotation.favorite ? faSolidStar : faRegularStar}
        />
      </button>

      <button className="p-1 text-blue-500 mx-1">
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <button
        onClick={() => deleteAnnotation(annotation.id)}
        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 mx-1"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  </div>
);

export default AnnotationForm;
