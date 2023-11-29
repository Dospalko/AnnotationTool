import React from "react";
import { Link } from "react-router-dom";

const Card1 = () => {
  return (
    <Link
      to="/layoutlm-annotation"
      className="transform hover:scale-105 transition duration-300"
    >
      {/* Apply AOS Animation */}
      <div
        data-aos="fade-up"
        className="bg-white rounded-xl shadow-lg p-6 text-center font-extrabold hover:bg-purple-100 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold text-[#F700C6] mb-4">
          Automatic Annotation with LayoutLM
        </h2>
        <p className="text-gray-700 mb-4">
          Experience AI's power with LayoutLM annotation, <br />
          ideal for efficiently handling vast text volumes <br />
          with minimal manual intervention.
        </p>
        <button className="px-6 py-2 bg-[#F700C6] text-white rounded-lg hover:bg-purple-400 transition-colors duration-300">
          Explore Automatic Annotation
        </button>
      </div>
    </Link>
  );
};
export default Card1;
