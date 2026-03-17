import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Loader2, Phone, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { firebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase';
import { toast } from 'sonner';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (verifierRef.current) {
        verifierRef.current.clear();
        verifierRef.current = null;
      }
    };
  }, []);

  const getRecaptchaVerifier = useCallback(() => {
    // Clear previous verifier if it exists
    if (verifierRef.current) {
      verifierRef.current.clear();
      verifierRef.current = null;
    }

    // Clear the container's children to prevent "already rendered" error
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = '';
    }

    const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerRef.current!, {
      size: 'invisible',
    });
    verifierRef.current = verifier;
    return verifier;
  }, []);

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const verifier = getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(firebaseAuth, cleaned, verifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent to ' + cleaned);
    } catch (err: any) {
      console.error('OTP send error:', err);
      const msg = err?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err?.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number format. Use +91XXXXXXXXXX'
        : err.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await confirmationResult!.confirm(otp);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('OTP verify error:', err);
      const msg = err?.code === 'auth/invalid-verification-code'
        ? 'Invalid OTP. Please check and try again.'
        : err.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
  };

  return (
    <main className="container max-w-sm py-12">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">Welcome to CivicVoice</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {step === 'phone' ? 'Enter your phone number to get started' : `Enter the OTP sent to ${phone}`}
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'phone' ? 'bg-primary' : 'bg-primary/30'}`} />
        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'otp' ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: step === 'otp' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        {step === 'phone' ? (
          <>
            <div>
              <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Phone Number</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="flex-1 bg-transparent text-sm text-foreground border-0 outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Include country code (e.g. +91)</p>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              Send OTP
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">OTP Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground text-center tracking-[0.5em] font-mono border-0 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground placeholder:tracking-[0.5em]"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              />
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              Verify & Login
            </button>
            <button
              onClick={handleBack}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Use a different number
            </button>
          </>
        )}
      </motion.div>

      <div ref={recaptchaContainerRef} />
    </main>
  );
}
