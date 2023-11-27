import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import AnnotationForm from "../components/annotation/AnnotationForm";
import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import axios from "axios";
import Sidebar from "../components/annotation/Sidebar";

const Annotator = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
  <main className="flex-grow">
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="w-full">
          <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />
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
