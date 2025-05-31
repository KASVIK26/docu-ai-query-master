
import React, { useState } from 'react';
import { CheckCircle, Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">Add new documents to your AI-powered library</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/30">
        {uploadStatus === 'success' ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">Your documents have been processed and are ready for AI analysis.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} />
            
            {selectedFiles.length > 0 && uploadStatus !== 'uploading' && (
              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <UploadIcon className="h-5 w-5" />
                  <span>Process Documents</span>
                </button>
              </div>
            )}
            
            {uploadStatus === 'uploading' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Processing Documents...</h3>
                  <p className="text-gray-600">Analyzing content and generating embeddings</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <h3 className="font-semibold text-gray-900 mb-3">Supported Formats</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• PDF documents (.pdf)</li>
            <li>• Text files (.txt)</li>
            <li>• Word documents (.docx)</li>
          </ul>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <h3 className="font-semibold text-gray-900 mb-3">Processing Features</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Smart text chunking</li>
            <li>• Vector embeddings generation</li>
            <li>• Semantic search indexing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;
