
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from './Dashboard';
import Upload from './Upload';
import QA from './QA';
import AuthPage from '../components/AuthPage';
import { useAuth } from '../hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl inline-block mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/qa" element={<QA />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Index;
