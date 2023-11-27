import React from "react";

const Heading = () => {
  return (
    <div data-aos="fade-up">
      {" "}
      <h1 className="text-4xl font-bold text-white mb-8 text-center animate-slide-in-from-left">
        Proceed to Annotation
      </h1>
      <p className="text-lg mb-6 text-white max-w-2xl text-center animate-fade-in-up">
        Choose the right form of annotation for your needs. Whether it's the
        AI-driven efficiency of LayoutLM or the precision of manual annotation,
        select your preferred method to get started.
      </p>
    </div>
  );
};

export default Heading;
