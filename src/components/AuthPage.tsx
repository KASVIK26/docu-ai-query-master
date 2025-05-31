
import React, { useState } from 'react';
import { Eye, EyeOff, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Check your email to confirm your account",
        });
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in",
        });
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) throw error;

        toast({
          title: "Reset email sent!",
          description: "Check your email for password reset instructions",
        });
        setMode('login');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            DocuMind AI
          </h1>
          <p className="text-gray-400 mt-2">
            {mode === 'login' && 'Welcome back! Sign in to your account'}
            {mode === 'signup' && 'Create your account to get started'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-500"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Loading...' : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </Button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 space-y-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot your password?
                </button>
                <div className="text-center text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center justify-center w-full text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
