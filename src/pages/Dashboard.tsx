
import React, { useState } from 'react';
import { FileText, Upload as UploadIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';

const Dashboard = () => {
  const [documents] = useState([
    {
      id: '1',
      title: 'Research Paper on AI.pdf',
      size: '2.4 MB',
      pages: 15,
      uploadDate: '2024-01-15',
      type: 'pdf' as const,
    },
    {
      id: '2',
      title: 'Meeting Notes.txt',
      size: '45 KB',
      pages: 3,
      uploadDate: '2024-01-14',
      type: 'txt' as const,
    },
    {
      id: '3',
      title: 'Project Documentation.docx',
      size: '1.2 MB',
      pages: 8,
      uploadDate: '2024-01-13',
      type: 'docx' as const,
    },
  ]);

  const handleDocumentClick = (documentId: string) => {
    console.log('Opening document:', documentId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Document Library</h1>
          <p className="text-gray-400 mt-1">Manage and interact with your uploaded documents</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/upload"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            <UploadIcon className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
          <Link
            to="/qa"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            <span>Q&A Chat</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Documents</p>
              <p className="text-2xl font-bold text-gray-100">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Pages</p>
              <p className="text-2xl font-bold text-gray-100">
                {documents.reduce((acc, doc) => acc + doc.pages, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-pink-500/20 rounded-lg">
              <UploadIcon className="h-6 w-6 text-pink-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-gray-100">3.6 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Documents</h2>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No documents uploaded yet</p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              <UploadIcon className="h-4 w-4" />
              <span>Upload your first document</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onClick={() => handleDocumentClick(document.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
