import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import axios from "axios";
import Sidebar from "../components/annotation/Sidebar";

const Annotator = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

  const deletePdfText = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete_pdf_text/${id}`);
      await fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow bg-black">
        <div className="flex flex-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}  />
          <div className="flex flex-col w-full p-4">
            {/* Container for PDF Text Display */}
            <div className="flex-1 bg-white shadow-lg rounded-lg p-4">
              <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />
            </div>
            {/* Optionally, add more components or contents here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Annotator;

// <AnnotationForm />
// <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />
