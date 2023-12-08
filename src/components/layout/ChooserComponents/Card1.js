import React from "react";
import { Link } from "react-router-dom";

const Card1 = () => {
  return (
    <Link to="/layoutlm-annotation" className="transform hover:scale-105 transition duration-300">
      <div data-aos="fade-up" className=" border-[#F700C6] border-8 border-dashed  bg-white rounded-xl shadow-lg flex text-center font-extrabold flex-  transition-all duration-300 overflow-hidden">
        
        {/* Image on the left */}
        <div className="w-1/2 flex  justify-center items-center bg-[#F7F7F7] ">
          <img src="/automatic.png" alt="img" className="w-64 h-64 object-cover rounded-full" />
        </div>

        {/* Text content on the right */}
        <div className="w-1/2 p-6">
          <h2 className="text-2xl font-bold text-white bg-[#F700C6] mb-4">Automatic Annotation with LayoutLM</h2>
          <p className="text-gray-700 mb-4">
            Experience AI's power with LayoutLM annotation, ideal for efficiently handling vast text volumes with minimal manual intervention.
          </p>
          <button className="px-6 py-2 bg-[#F700C6] text-white  rounded-lg hover:bg-purple-400 transition-colors duration-300">
            Explore Automatic Annotation
          </button>
        </div>

      </div>
    </Link>
  );
};

export default Card1;
