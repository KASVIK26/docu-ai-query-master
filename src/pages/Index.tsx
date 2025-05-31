
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from './Dashboard';
import Upload from './Upload';
import QA from './QA';

const Index = () => {
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
