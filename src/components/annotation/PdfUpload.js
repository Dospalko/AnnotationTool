import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PdfTextDisplay from "./PdfTextDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileWord,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

const PdfUpload = ({ onUploadSuccess }) => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedPdfText, setSelectedPdfText] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

  const uploadPdf = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("/upload_pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Po úspešnom nahratí pridajte nový súbor do zoznamu pdfTexts
      setPdfTexts((prevPdfTexts) => [...prevPdfTexts, response.data]);
      // A nastavte ho ako aktuálny vybraný súbor pre zobrazenie
      setSelectedPdfText(response.data);

      setSelectedFile(null); // Clear the selected file after upload

      fetchPdfTexts(); // Re-fetch the list of PDFs after a successful upload
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    }
  };

  const deletePdfText = async (id) => {
    try {
      await axios.delete(`/delete_pdf_text/${id}`);
      if (selectedPdfText && selectedPdfText.id === id) {
        setSelectedPdfText(null);
      }
      await fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (filename) => {
    const fileExtension = filename.split(".").pop();

    switch (fileExtension) {
      case "pdf":
        return faFilePdf;
      case "docx":
        return faFileWord;
      case "txt":
        return faFileAlt;
      default:
        return faFileAlt; // Výchozí ikona pro ostatní typy souborů
    }
  };

  const cancelUpload = (event) => {
    event.stopPropagation(); // Stops the click event from reaching the parent div
    setSelectedFile(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const enhancedUploadPdf = async () => {
    setIsUploading(true);
    await uploadPdf();
    setIsUploading(false);
  };
  return (
    <div className="p-10 m-auto text-white">
      <div className="flex flex-col">
        <div className="flex flex-row h-[300px] justify-center gap-32">
          <div className="mt-5 border-dashed border-4 w-1/3  border-white  relative">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              ref={fileInputRef}
            />
            {selectedFile ? (
              <div className="flex flex-col mt-20 items-center justify-center">
                <span>{selectedFile.name}</span>
                <button
                  onClick={cancelUpload}
                  className="text-red-500 z-10 bg-white rounded-full p-1"
                >
                  x
                </button>
              
          <button
            onClick={enhancedUploadPdf}
            disabled={!selectedFile || isUploading}
            className="mt-5 px-6 z-20 py-2 bg-green-500 text-white rounded shadow-lg hover:bg-green-600"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
       
              </div>
            ) : (
              <div className="flex flex-col mt-10 items-center self-center w-full justify-center py-10 z-10">
                <p className="mb-2">Drag & Drop file here</p>
                <p className="mb-2">OR</p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          <div className=" flex-2 mt-5 font-base relative group">
            {pdfTexts.length > 0 && (
              <div className="h-[calc(7*2.5rem)] z-10 relative overflow-y-auto">
                {" "}
                {/* Pevná výška pro 3 soubory a povolený vertikální posun */}
                <table className="min-w-full  bg-black text-white z-10">
                  <thead className=" bg-[#F700C6]">
                    <tr className="my-10">
                      <th className="w-1/3 z-10    border-b border-[#F700C6] bg-[#F700C6]   py-2 text-black uppercase tracking-wider">
                        
                        <span className="bg-black my-4 text-white p-2">Icon</span>
                      </th>
                      <th className="w-1/3 z-10 border-b border-[#F700C6] bg-[#F700C6] text-left px-4 py-2 text-black uppercase tracking-wider">
                        <span className="bg-black text-white p-2">Filename</span>
                      </th>
                      <th className="w-1/3 z-10 border-b border-[#F700C6] bg-[#F700C6] text-left px-4 py-2 text-black uppercase tracking-wider">
                        <span className="bg-black text-white p-2 mt-10">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdfTexts.map((text) => (
                      <tr key={text.id} className="text-white border-b-2 border-dashed">
                        <td className="w-1/3 m-auto mt-4 items-center text-center justify-center align-middle  flex  py-3">
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            className="text-4xl"
                          />
                        </td>
                        <td className="w-1/3 text-left py-3 px-4">
                          {text.filename}
                        </td>{" "}
                        {/* Zmenili sme z text.id na text.filename */}
                        <td className="w-1/3 text-left py-3 px-4">
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            onClick={() => deletePdfText(text.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="absolute top-[10px] left-[30px] w-[95%] h-[100%] bg-[#1AFF15] lg:block hidden transition-colors"></div>
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default PdfUpload;
