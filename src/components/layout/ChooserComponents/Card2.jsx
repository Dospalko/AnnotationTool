// AnnotatorCard.js
import React from "react";
import { Link } from "react-router-dom";

const Card2 = () => {
  return (
    <Link
      to="/annotator"
      className="transform hover:scale-105 transition duration-300"
    >
      {/* Apply AOS Animation */}
      <div
        data-aos="fade-up"
        className="bg-white rounded-xl shadow-lg p-6 text-center hover:bg-green-100 transition-all duration-300"
      >
        {/* Card content */}
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Manual Annotation
        </h2>
        <p className="text-gray-700 mb-4">
          Take full control with manual annotation, <br />
          perfect for tasks where detailed human judgment <br />
          and specific annotations are crucial.
        </p>
        <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300">
          Start Manual Annotation
        </button>
      </div>
    </Link>
  );
};

export default Card2;
