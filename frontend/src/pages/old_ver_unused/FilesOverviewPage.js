import React, { useState, useEffect } from "react";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer/Footer";

const FilesOverviewPage = () => {
  const [filesData, setFilesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/files-overview");
        setFilesData(response.data);
      } catch (error) {
        console.error("Error fetching files data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin color="#00BFFF" height={80} width={80} />
      </div>
    );
  }

  return (
    <div className="mx-auto h-max bg-black text-white font-base bg-cover bg-center sbg-no-repeat" style={{ backgroundImage: `url('/bgr.jpg.jpg')` }}> 
     
      <Header />
     
      <div className="grid grid-cols-1 h-max my-10 text-white justify-center text-justify  items-center  md:grid-cols-2 container mx-auto lg:grid-cols-3 gap-6">
      <h1 className="text-4xl bg-[#F700C6] p-20  font-bold text-center   text-black">
       <span className="
       bg-black text-white flex p-2">Files Overview</span>
      </h1>
        {filesData.map((file) => (
          <div
            key={file.id}
            className="border-2 bg-black hover:scale-105 transition duration-300 border-gray-300 p-6 rounded-lg shadow-lg hover:shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-[#53F541] mb-2">
              {file.filename}
            </h2>
            <p className="text-md text-white mb-1">
              Number of Entities Used:{" "}
              <span className="font-semibold">
                {file.uniqueAnnotationsCount}
              </span>
            </p>
            <p className="text-md text-white mb-1">
              Number of Tokens:{" "}
              <span className="font-semibold">{file.tokensCount}</span>
            </p>
            <p className="text-md text-white mb-1">
              Number of annotated Tokens:{" "}
              <span className="font-semibold">{file.annotatedTokensCount}</span>
            </p>
            <p className="text-md text-white mb-1">
              Annotated Percentage:{" "}
              <span className="font-semibold">{file.annotatedPercentage}%</span>
            </p>
            <div className="mt-4">
              <Link
                to={{ pathname: "/annotator", state: { selectedFile: file } }}
              >
                <button className="bg-[#F700C6] text-white px-4 py-2 rounded hover:bg-[#53F541] hover:text-black transition duration-300">
                  Annotate
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Footer/>
    </div>
    
  );
};

export default FilesOverviewPage;
