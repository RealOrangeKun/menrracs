import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you're using axios for API requests

const FilesPage = () => {
  let [files, setFiles] = useState([
    { id: 1, name: 'Document.pdf', size: 1024 },
  { id: 2, name: 'Presentation.pptx', size: 2048 },
  { id: 3, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 4, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 5, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 6, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 7, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 8, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 9, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 10, name: 'Spreadsheet.xlsx', size: 3072 },
  { id: 11, name: 'Spreadsheet.xlsx', size: 3072 },
  ]);
   
  // Fetch user's files from the backend when the component mounts
  useEffect(() => {
    let fetchFiles = async () => {
      try {
        // Replace 'fetchFilesEndpoint' with your actual API endpoint for fetching files
        const response = await axios.get('fetchFilesEndpoint');
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    // fetchFiles();
  }, []);
  // setFiles();
  // const files  = [{"id":number :1212,"name":"test","size":12}];
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Files</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {files.map(file => (
          <div key={file.id} className="bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">{file.name}</h2>
            <p className="text-sm text-gray-600">{file.size} KB</p>
            {/* Add more file details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilesPage;
