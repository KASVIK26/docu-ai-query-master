
import React from 'react';
import { FileText, Upload, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DocumentCard from '../components/DocumentCard';

const Dashboard = () => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-documents');
      if (error) throw error;
      return data.documents || [];
    },
  });

  const stats = [
    {
      icon: FileText,
      label: 'Total Documents',
      value: documents?.length || 0,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Upload,
      label: 'Documents Processed',
      value: documents?.filter((doc: any) => doc.processing_status === 'completed').length || 0,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: MessageSquare,
      label: 'Q&A Sessions',
      value: '0', // We'll implement this later
      gradient: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Welcome to DocuMind AI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Transform your documents into intelligent conversations. Upload, analyze, and get instant answers from your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/upload"
          className="group bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                Upload New Document
              </h3>
              <p className="text-gray-400 mt-1">
                Add documents to start asking questions
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/qa"
          className="group bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                Start Q&A Session
              </h3>
              <p className="text-gray-400 mt-1">
                Ask questions about your documents
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Recent Documents</h2>
          <Link
            to="/upload"
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.slice(0, 6).map((document: any) => (
              <DocumentCard
                key={document.id}
                document={{
                  id: document.id,
                  title: document.title,
                  size: `${(document.file_size / 1024 / 1024).toFixed(2)} MB`,
                  pages: document.page_count || 1,
                  uploadDate: document.upload_date,
                  type: document.file_type as 'pdf' | 'txt' | 'docx',
                }}
                onClick={() => {
                  // Navigate to Q&A with this document
                  window.location.href = `/qa?doc=${document.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No documents yet</h3>
            <p className="text-gray-400 mb-6">Get started by uploading your first document</p>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
