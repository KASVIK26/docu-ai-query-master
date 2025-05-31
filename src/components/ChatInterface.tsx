
import React, { useState } from 'react';
import { Send, MessageSquare, FileText, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatInterfaceProps {
  selectedDocumentId?: string;
  documentTitle?: string;
}

const ChatInterface = ({ selectedDocumentId, documentTitle }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedDocumentId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on the document "${documentTitle}", here's what I found: This is a simulated response to your question "${inputValue}". The actual RAG implementation will provide contextual answers from the document content.`,
        timestamp: new Date(),
        sources: ['Page 1', 'Page 3'],
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/70 backdrop-blur-sm rounded-xl border border-white/30">
      {/* Header */}
      <div className="p-4 border-b border-white/30 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">
            {selectedDocumentId ? `Chat with "${documentTitle}"` : 'Select a document to start chatting'}
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && selectedDocumentId && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Ask me anything about this document!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              {message.sources && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Sources: {message.sources.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/30">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={selectedDocumentId ? "Ask a question about this document..." : "Select a document first..."}
            disabled={!selectedDocumentId || isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !selectedDocumentId || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
