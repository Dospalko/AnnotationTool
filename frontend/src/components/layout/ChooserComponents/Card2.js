import React from "react";
import { Link } from "react-router-dom";

const Card1 = () => {
  return (
    <Link
      to="/annotator"
      className="transform hover:scale-105 transition duration-300 "
    >
      <div
        data-aos="fade-up"
        className="relative bg-white rounded-xl shadow-lg border-[#53F541] border-8 border-dashed flex text-center font-extrabold hover:bg-purple-100 transition-all duration-300 overflow-hidden"
      >
        {/* Image on the left */}
        <div className="w-1/2 flex justify-center items-center bg-[#F7F7F7]">
          <img
            src="/manual.png"
            alt="img"
            className="w-64 h-64 object-fit  rounded-full"
          />
        </div>

        {/* Text content on the right */}
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold bg-[#53F541] mb-4">
            Manual annotation
          </h2>
          <p className="text-gray-700 mb-4">
            Take full control with manual annotation, 
            perfect for tasks where detailed human judgment 
            and specific annotations are crucial.
          </p>
          <button className="px-6 py-2 bg-[#53F541] text-black rounded-lg hover:bg-[#3e8f35] transition-colors duration-300">
            Explore Manual Annotation
          </button>
        </div>
      </div>
    </Link>
  );
};

export default Card1;
