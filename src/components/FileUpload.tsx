
import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    onFileSelect(validFiles);
  }, [onFileSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      onFileSelect(files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-gray-600 hover:border-purple-500 bg-gray-800'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".txt,.pdf,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-200">
              Drop your documents here, or <span className="text-purple-400">browse</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Supports TXT, PDF, and DOCX files up to 10MB
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-200">Uploaded Files:</h3>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
