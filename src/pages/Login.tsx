import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Authentication failed');
      return;
    }
    toast.success(isSignUp ? 'Account created!' : 'Logged in successfully');
    navigate('/');
  };

  return (
    <main className="container max-w-sm py-12">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">Welcome to CivicVoice</h1>
        <p className="text-muted-foreground text-sm mt-1">{isSignUp ? 'Create your account' : 'Login to report problems'}</p>
      </motion.div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </main>
  );
}
