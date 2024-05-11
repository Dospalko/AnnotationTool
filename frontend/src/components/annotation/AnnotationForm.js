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
import { useTranslation } from "react-i18next";

const AnnotationForm = () => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [favoriteAnnotations, setFavoriteAnnotations] = useState([]);
  const [nonFavoriteAnnotations, setNonFavoriteAnnotations] = useState([]);
  const [editingAnnotation, setEditingAnnotation] = useState(null);

  const fetchAnnotations = async () => {
    try {
      const favRes = await axios.get(
        "http://localhost:5000/annotations/favorites"
      );
      setFavoriteAnnotations(favRes.data);
      const nonFavRes = await axios.get(
        "http://localhost:5000/annotations/non_favorites"
      );
      setNonFavoriteAnnotations(nonFavRes.data);
    } catch (error) {
      console.error("Could not fetch annotations:", error);
    }
  };

  const addAnnotation = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/add", { text, color });
      await fetchAnnotations();
    } catch (error) {
      console.error("Failed to add annotation:", error);
    }
    setText("");
    setColor("#ffffff");
  };

  const deleteAnnotation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      await fetchAnnotations();
    } catch (error) {
      console.error(`Could not delete annotation with id ${id}:`, error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      await axios.post(`http://localhost:5000/toggle_favorite/${id}`);
      await fetchAnnotations();
    } catch (error) {
      console.error(
        `Could not toggle favorite for annotation with id ${id}:`,
        error
      );
    }
  };

  const handleEdit = async (id, editedText, editedColor) => {
    try {
      await axios.put(`http://localhost:5000/edit/${id}`, {
        text: editedText,
        color: editedColor,
      });
      await fetchAnnotations(); // Update the annotations after editing
    } catch (error) {
      console.error(`Could not edit annotation with id ${id}:`, error);
    }
    setEditingAnnotation(null); // Reset editing state
  };

  useEffect(() => {
    fetchAnnotations();
  }, []);
  const t = useTranslation().t;
  return (
    <div className="w-max font-base">
      <h1 className="text-xl font-bold mb-4">{t('Manage Annotations')}</h1>
      <form onSubmit={addAnnotation}>
        <div className="mb-4 md:flex text-black gap-4 md:justify-between">
          <div className="mb-2 md:w-2/3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vložte názov anotácie"
              className="w-full p-2 border rounded-md transition-opacity duration-300 hover:opacity-80"
              required
            />
          </div>
          <div className="md:w-1/3 flex gap-4 justify-end">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border rounded-md cursor-pointer"
            />
            <button
              type="submit"
              className="w-10 h-10  bg-blue-500 text-white rounded hover:bg-blue-600 transition-opacity duration-300 hover:opacity-80"
            >
              <FontAwesomeIcon icon={faPlusCircle} />
            </button>
          </div>
        </div>
      </form>
      <AnnotationsSection
        title={t('favorite')}
        annotations={favoriteAnnotations}
        toggleFavorite={toggleFavorite}
        deleteAnnotation={deleteAnnotation}
        setEditingAnnotation={setEditingAnnotation}
        handleEdit={handleEdit}
      />
      <AnnotationsSection
        title={t('other')}
        annotations={nonFavoriteAnnotations}
        toggleFavorite={toggleFavorite}
        deleteAnnotation={deleteAnnotation}
        setEditingAnnotation={setEditingAnnotation}
        handleEdit={handleEdit}
      />
    </div>
  );
};

const AnnotationsSection = ({
  title,
  annotations,
  toggleFavorite,
  deleteAnnotation,
  setEditingAnnotation,
  handleEdit,
}) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold">{title}</h2>
    {annotations.map((annotation) => (
      <AnnotationItem
        key={annotation.id}
        annotation={annotation}
        toggleFavorite={toggleFavorite}
        deleteAnnotation={deleteAnnotation}
        setEditingAnnotation={setEditingAnnotation}
        handleEdit={handleEdit}
      />
    ))}
  </div>
);
const AnnotationItem = ({
  annotation,
  toggleFavorite,
  deleteAnnotation,
  setEditingAnnotation,
  handleEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(annotation.text);
  const [editedColor, setEditedColor] = useState(annotation.color); // Define editedColor state

  const t = useTranslation().t;
  const saveEdit = () => {
    handleEdit(annotation.id, editedText, editedColor); // Pass editedColor
    setIsEditing(false);
  };

  return (
    <div
      style={{ backgroundColor: annotation.color }}
      className="p-2  mb-2 border-2 border-white bg-opacity-5 flex justify-between items-center rounded shadow transition-transform duration-300 hover:scale-105"
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={saveEdit}
            className="w-max text-black p-2 border rounded-md"
            autoFocus
          />
          <input
            type="color"
            value={editedColor}
            onChange={(e) => setEditedColor(e.target.value)} // Update editedColor
            className="w-10 h-10 border rounded-md cursor-pointer ml-2"
          />
        </>
      ) : (
        <span>{editedText}</span>
      )}
      <div>
        {isEditing ? (
          <button onClick={saveEdit} className="p-1 text-blue-500 mx-1">
            {t('save')}
          </button>
        ) : (
          <>
            <button
              onClick={() => toggleFavorite(annotation.id)}
              className={`p-1 mr-2 ${
                annotation.favorite ? "text-yellow-500" : "text-white"
              }`}
            >
              <FontAwesomeIcon
                icon={annotation.favorite ? faSolidStar : faRegularStar}
              />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-500 mx-1"
            >
              Edit
            </button>
            <button
              onClick={() => deleteAnnotation(annotation.id)}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 mx-1"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AnnotationForm;
