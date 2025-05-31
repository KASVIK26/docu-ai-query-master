
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import DocumentCard from '../components/DocumentCard';

const QA = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
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
  ]);

  const selectedDoc = documents.find(doc => doc.id === selectedDocument);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Q&A Assistant</h1>
        <p className="text-gray-400 mt-2">
          Select a document and ask questions to get intelligent, contextual answers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Selection */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Select Document</h2>
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedDocument === document.id 
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' 
                    : ''
                }`}
                onClick={() => setSelectedDocument(document.id)}
              >
                <DocumentCard
                  document={document}
                  onClick={() => {}}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
            Chat Interface
          </h2>
          <ChatInterface
            selectedDocumentId={selectedDocument || undefined}
            documentTitle={selectedDoc?.title}
          />
        </div>
      </div>

      {!selectedDocument && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select a document from the left to start asking questions</p>
        </div>
      )}
    </div>
  );
};

export default QA;
