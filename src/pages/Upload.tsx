
import React, { useState } from 'react';
import { Upload as UploadIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-documents', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      return data.documents || [];
    },
  });

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('upload-document', {
          body: formData,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        toast({
          title: "Upload successful!",
          description: `${file.name} has been uploaded and is being processed.`,
        });
      }

      // Refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready for Q&A';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Upload Documents</h1>
        <p className="text-gray-400 mt-2">
          Upload your documents to start asking intelligent questions about their content
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        <FileUpload onFileSelect={handleFileUpload} />
        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-blue-400">Uploading and processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Document Status */}
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Your Documents</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((document: any) => (
              <div
                key={document.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <UploadIcon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200">{document.title}</h3>
                      <p className="text-sm text-gray-400">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(document.processing_status)}
                    <span className="text-sm text-gray-400">
                      {getStatusText(document.processing_status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <UploadIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No documents uploaded yet</h3>
            <p className="text-gray-400">Upload your first document to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
