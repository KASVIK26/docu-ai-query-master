
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FileText, Upload, MessageSquare, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/qa', icon: MessageSquare, label: 'Q&A' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DocuMind AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex space-x-1">
                  {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === path
                          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:block">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
