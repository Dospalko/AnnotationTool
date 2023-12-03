import React from 'react';

const HowItWorksCard = ({ title, step, content, icon }) => {
  return (
    <div className="relative m-10  flex items-center justify-center">
      {/* Background Card for 3D Effect */}
      <div className="absolute  flex items-center justify-center bg-[#F700C6] w-[350px] h-[400px] top-4 left-4 transform -rotate-2"></div>

      {/* Foreground Card */}
      <div className="relative z-10 items-center justify-center bg-white w-[350px] h-[400px] shadow-xl flex flex-col p-6">
        {/* Headline */}
        <div className="mb-4">
          <h2 className="text-4xl font-bold border-b-5 text-green-500">{title}</h2>
          <hr className="border-5 border-black  mt-2"/>
        </div>

        {/* Step and Content */}
        <div className="flex-grow text-center items-center justify-center">
          <h3 className="font-bold bg-black p-2  mb-4">{step}</h3>
          <p className="text-gray-600 text-md text-left">{content}</p>
        </div>

        {/* Icon */}
        <div className="mt-4 text-5xl text-green-500 font-bold">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default HowItWorksCard;
