
import React, { useState } from 'react';
import { Send, FileText, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    page: number;
    content: string;
    similarity: number;
  }>;
}

const QA = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase.functions.invoke('get-documents', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      return data.documents || [];
    },
  });

  const completedDocuments = documents?.filter((doc: any) => doc.processing_status === 'completed') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (completedDocuments.length === 0) {
      toast({
        title: "No documents available",
        description: "Please upload and process some documents first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('rag-query', {
        body: {
          query: inputValue,
          documentId: selectedDocument,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Query error:', error);
      toast({
        title: "Query failed",
        description: error.message || "There was an error processing your question.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Q&A Assistant</h1>
        <p className="text-gray-400 mt-2">
          Ask questions about your uploaded documents and get intelligent answers
        </p>
      </div>

      {/* Document Selector */}
      {completedDocuments.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Select Document (optional - leave blank to search all documents)
          </label>
          <select
            value={selectedDocument || ''}
            onChange={(e) => setSelectedDocument(e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Documents</option>
            {completedDocuments.map((doc: any) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Start a conversation</h3>
            <p className="text-gray-400">Ask questions about your uploaded documents</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-300">Sources:</p>
                    {message.sources.map((source, index) => (
                      <div key={index} className="bg-gray-600 p-2 rounded text-xs">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="h-3 w-3" />
                          <span>Page {source.page}</span>
                          <span className="text-gray-400">
                            ({Math.round(source.similarity * 100)}% match)
                          </span>
                        </div>
                        <p className="text-gray-300">{source.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="p-2 bg-gray-600 rounded-full">
                  <User className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            completedDocuments.length === 0
              ? "Upload documents first to start asking questions..."
              : "Ask a question about your documents..."
          }
          disabled={isLoading || completedDocuments.length === 0}
          className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-purple-500"
        />
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim() || completedDocuments.length === 0}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {completedDocuments.length === 0 && (
        <div className="text-center bg-gray-800 rounded-lg p-6 border border-gray-700">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No processed documents</h3>
          <p className="text-gray-400">Upload some documents in the Upload section to start asking questions</p>
        </div>
      )}
    </div>
  );
};

export default QA;
