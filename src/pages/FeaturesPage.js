import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnotationForm from "../components/annotation/AnnotationForm";
import PdfUpload from "../components/annotation/PdfUpload";
import FileUploader from "../components/annotation/FileUploader";
import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function FeaturesPage() {
  const [pdfTexts, setPdfTexts] = useState([]);

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

  const deletePdfText = async (id) => {
    try {
      await axios.delete(`/delete_pdf_text/${id}`);
      await fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };
  const handleUploadSuccess = (updatedPdfTexts) => {
    setPdfTexts(updatedPdfTexts);
  };
  useEffect(() => {
    fetchPdfTexts();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <section className="bg-gray-200 font-base text-white">
      <Header />
      {/* Heading */}
      <div className="relative group p-1 mt-10 mx-auto w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
        <h1 className="relative z-10 bg-white text-4xl font-bold mb-16 p-2 text-black flex items-center justify-center py-4 px-12 uppercase border-black border-2">
          FEATURES PAGE
        </h1>
        <div className="absolute top-[15px] left-[12px] w-[98%] h-[50%] bg-[#F700C6] lg:block hidden transition-colors"></div>
      </div>
      {/* Search Bar */}
      <div className="relative group p-1 mx-auto w-full sm:w-2/3 md:w-1/2 lg:w-1/3 ">
        <div className="relative z-10 flex w-full items-center bg-white border-2 border-black">
         <FontAwesomeIcon className="ml-5 text-black" icon={faSearch}/>
          <input
            type="text"
            placeholder="Search through your imports or annotations"
            className="flex-grow p-2 placeholder-gray-500 outline-none"
          />
        </div>
        <div className="absolute top-[10px] left-[12px] w-[98%] h-[90%] bg-[#F700C6] lg:block hidden transition-colors"></div>
      </div>
    
      {/* <AnnotationForm/> */}
      <div>
        <PdfUpload onUploadSuccess={handleUploadSuccess} />

        <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />
      </div>
      <Footer />
    </section>
  );
}

export default FeaturesPage;
