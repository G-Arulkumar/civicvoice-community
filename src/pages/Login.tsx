import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const { signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      toast.error('Enter a valid mobile number');
      return;
    }
    setLoading(true);
    const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
    const { error } = await signInWithOtp(formatted);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Failed to send OTP');
      return;
    }
    setPhone(formatted);
    setStep('otp');
    toast.success('OTP sent!');
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Invalid OTP');
      return;
    }
    toast.success('Logged in successfully');
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
        <p className="text-muted-foreground text-sm mt-1">Login with your mobile number</p>
      </motion.div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button onClick={handleSendOtp} disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send OTP
          </button>
          <p className="text-xs text-muted-foreground text-center">Test number: +919876543210 / OTP: 123456</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="● ● ● ● ● ●"
              className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none text-center tracking-[0.5em] placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Sent to {phone}</p>
          </div>
          <button onClick={handleVerify} disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & Login
          </button>
          <button onClick={() => setStep('phone')} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Change number
          </button>
        </div>
      )}
    </main>
  );
}
