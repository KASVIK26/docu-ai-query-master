
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

const QA = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('doc');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Mock documents data
  const documents = [
    { id: '1', title: 'Research Paper on AI.pdf' },
    { id: '2', title: 'Meeting Notes.txt' },
    { id: '3', title: 'Project Proposal.docx' },
  ];

  useEffect(() => {
    if (docId) {
      const doc = documents.find(d => d.id === docId);
      setSelectedDocument(doc);
    }
  }, [docId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Q&A</h1>
          <p className="text-gray-600 mt-1">Ask questions and get AI-powered answers from your documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Document Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-900">Your Documents</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocument(doc);
                  navigate(`/qa?doc=${doc.id}`);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedDocument?.id === doc.id
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300'
                    : 'bg-white/70 border-white/30 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium truncate">{doc.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <ChatInterface 
            selectedDocumentId={selectedDocument?.id} 
            documentTitle={selectedDocument?.title}
          />
        </div>
      </div>
    </div>
  );
};

export default QA;
