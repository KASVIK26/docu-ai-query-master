
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
        return <FileText className="h-8 w-8 text-red-400" />;
      case 'txt':
        return <FileIcon className="h-8 w-8 text-blue-400" />;
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-400" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-500/10 group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300">
          {getFileIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-100 truncate group-hover:text-white transition-colors">
            {document.title}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-400 space-x-4">
              <span>{document.size}</span>
              <span>•</span>
              <span>{document.pages} pages</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
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
