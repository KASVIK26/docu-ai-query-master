
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import DocumentCard from '../components/DocumentCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const QA = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-documents');
      if (error) throw error;
      return data.documents || [];
    },
  });

  // Filter only completed documents
  const completedDocuments = documents?.filter((doc: any) => doc.processing_status === 'completed') || [];
  const selectedDoc = documents?.find((doc: any) => doc.id === selectedDocument);

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
          {completedDocuments.length > 0 ? (
            <div className="space-y-4">
              {completedDocuments.map((document: any) => (
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
                    document={{
                      id: document.id,
                      title: document.title,
                      size: `${(document.file_size / 1024 / 1024).toFixed(2)} MB`,
                      pages: document.page_count || 1,
                      uploadDate: document.upload_date,
                      type: document.file_type as 'pdf' | 'txt' | 'docx',
                    }}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 rounded-xl border border-gray-700">
              <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No processed documents available</p>
            </div>
          )}
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
