
import React from 'react';
import { FileText, Calendar, FileIcon } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  size: string;
  pages: number;
  uploadDate: string;
  type: 'pdf' | 'txt' | 'docx';
}

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
}

const DocumentCard = ({ document, onClick }: DocumentCardProps) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'txt':
        return <FileIcon className="h-8 w-8 text-blue-500" />;
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-100 group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
          {getFileIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
            {document.title}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>{document.size}</span>
              <span>•</span>
              <span>{document.pages} pages</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(document.uploadDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
