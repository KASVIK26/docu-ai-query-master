
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Upload as UploadIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const Upload = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
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
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Upload Documents</h1>
        <p className="text-gray-400 mt-2">
          Upload your documents to start asking questions and getting intelligent answers
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <FileUpload onFileSelect={handleFileSelect} />
        
        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon className="h-5 w-5" />
              <span>
                {uploadStatus === 'uploading' ? 'Processing...' : 'Upload Documents'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="text-green-400 font-medium">Upload Successful!</p>
              <p className="text-green-300 text-sm">Your documents have been processed and are ready for questioning.</p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-400 font-medium">Upload Failed</p>
              <p className="text-red-300 text-sm">There was an error processing your documents. Please try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">How it works</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              1
            </div>
            <div>
              <p className="text-gray-200 font-medium">Upload your documents</p>
              <p className="text-gray-400 text-sm">Support for PDF, DOCX, and TXT files up to 10MB each</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              2
            </div>
            <div>
              <p className="text-gray-200 font-medium">AI processes your content</p>
              <p className="text-gray-400 text-sm">Documents are chunked and converted to embeddings for intelligent search</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              3
            </div>
            <div>
              <p className="text-gray-200 font-medium">Ask questions and get answers</p>
              <p className="text-gray-400 text-sm">Natural language queries with contextual responses and source citations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
