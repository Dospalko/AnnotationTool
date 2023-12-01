import React from "react";

const Heading = () => {


  return (
    <div  className="relative text-center w-[500px]  m-20 gap-14">
      {/* Dynamic Background */}
      <div className={`w-full  h-full bg-black rounded-lg absolute inset-0 transform -translate-x-1/2 left-1/2 transition-all duration-700 ease-in-out`}></div>

      {/* Text Content */}
      <h1 className="text-4xl font-bold my-5 text-white z-10 relative">
        Proceed to Annotation
      </h1>
      <p className="text-lg text-white mb-5 z-10 relative max-w-2xl mx-auto">
        Choose the right form of annotation for your needs. Whether it's the
        AI-driven efficiency of LayoutLM or the precision of manual annotation,
        select your preferred method to get started.
      </p>
    </div>
  );
};

export default Heading;
