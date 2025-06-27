
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Login successful - redirect to home
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        
        // Since email verification is disabled, user should be logged in immediately
        if (data.user) {
          setSuccess('Registrierung erfolgreich! Du wirst weitergeleitet...');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.');
      } else if (error.message.includes('User already registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert. Versuche dich anzumelden.');
      } else if (error.message.includes('Password should be at least')) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      } else {
        setError(error.message || 'Ein Fehler ist aufgetreten.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white text-glow mb-2">
            {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="text-white/70">
            {isLogin ? 'Melden Sie sich an, um fortzufahren' : 'Erstellen Sie Ihr Konto'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="email"
              placeholder="E-Mail Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 glass rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button py-3 rounded-xl text-white font-semibold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Registrieren')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
