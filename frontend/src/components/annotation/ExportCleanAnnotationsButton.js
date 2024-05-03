import React from 'react';
import axios from 'axios';

function ExportCleanAnnotationsButton({ pdfTextId }) {
    const handleExport = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/export_clean_annotations/${pdfTextId}?format=json`);
            // Assuming you want to download the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `cleaned_annotations_${pdfTextId}.json`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Failed to export clean annotations:', error);
        }
    };

    return (
        <button onClick={handleExport} className="btn btn-primary">
            Export Clean Annotations
        </button>
    );
}

export default ExportCleanAnnotationsButton;
