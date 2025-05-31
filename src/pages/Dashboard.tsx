
import React, { useState } from 'react';
import { FileText, Upload, Search, Filter } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const documents = [
    {
      id: '1',
      title: 'Research Paper on AI.pdf',
      size: '2.3 MB',
      pages: 45,
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
      title: 'Project Proposal.docx',
      size: '1.8 MB',
      pages: 12,
      uploadDate: '2024-01-13',
      type: 'docx' as const,
    },
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocumentClick = (documentId: string) => {
    navigate(`/qa?doc=${documentId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-600 mt-1">Manage and explore your uploaded documents</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              <p className="text-gray-600">Total Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.reduce((sum, doc) => sum + doc.pages, 0)}
              </p>
              <p className="text-gray-600">Total Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">100%</p>
              <p className="text-gray-600">Processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-3 bg-white/70 border border-white/30 rounded-lg hover:bg-white/90 transition-all duration-200 backdrop-blur-sm">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700">Filter</span>
        </button>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onClick={() => handleDocumentClick(document.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">
            {searchTerm ? 'No documents found' : 'No documents uploaded yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Upload Document
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
