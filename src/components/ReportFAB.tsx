import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, MapPin, Loader2, Check, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssueContext';
import { ISSUE_TYPES, IssueType } from '@/types/issue';
import { toast } from 'sonner';

export default function ReportFAB() {
  const { isAuthenticated, user } = useAuth();
  const { addIssue, findNearbyDuplicate, addReport } = useIssues();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'checking' | 'duplicate' | 'success'>('form');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [type, setType] = useState<IssueType>('Pothole');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState<any>(null);

  const handleFABClick = () => {
    if (!isAuthenticated) {
      toast.info('Please login to report a problem');
      navigate('/login');
      return;
    }
    setOpen(true);
    detectLocation();
  };

  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Current Location' });
          setLocating(false);
        },
        () => {
          setLocation({ lat: 28.6139, lng: 77.2090, name: 'New Delhi (default)' });
          setLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090, name: 'New Delhi (default)' });
      setLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !description.trim() || !location || !user) return;

    setStep('checking');

    const dup = findNearbyDuplicate(type, location.lat, location.lng);
    if (dup) {
      setDuplicateIssue(dup);
      const added = await addReport(dup.id, user.uid);
      setStep('duplicate');
      if (!added) {
        toast.error('You have already reported this issue');
      }
    } else {
      const result = await addIssue({
        type,
        description,
        imageFile,
        status: 'unsolved',
        locationName: location.name,
        lat: location.lat,
        lng: location.lng,
        userId: user.uid,
      });
      if (result === null) {
        toast.error('Failed to submit report');
        setStep('form');
        return;
      }
      setStep('success');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('form');
    setImageFile(null);
    setImagePreview(null);
    setDescription('');
    setType('Pothole');
    setDuplicateIssue(null);
  };

  return (
    <>
      <motion.button
        onClick={handleFABClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-fab flex items-center justify-center text-primary-foreground"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40"
              onClick={handleClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-foreground">Report a Problem</h2>
                  <button onClick={handleClose} className="p-1 rounded-md hover:bg-muted transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {step === 'form' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Photo</label>
                      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                      {imagePreview ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-foreground/60 text-background">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          <Camera className="h-6 w-6" />
                          <span className="text-sm font-medium">Take photo or upload</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Location</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-sm">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {locating ? (
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                          </span>
                        ) : (
                          <span className="text-foreground">{location?.name}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Problem Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as IssueType)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none"
                      >
                        {ISSUE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the problem..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!imageFile || !description.trim() || locating}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Report
                    </button>
                  </div>
                )}

                {step === 'checking' && (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Checking for nearby reports...</p>
                  </div>
                )}

                {step === 'duplicate' && (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">
                      {duplicateIssue?.reportCount} people already reported this.
                    </p>
                    <p className="text-sm text-muted-foreground">Adding your voice to the report.</p>
                    <button onClick={handleClose} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                      Done
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-solved/10 flex items-center justify-center">
                      <Check className="h-6 w-6 text-solved" />
                    </div>
                    <p className="text-foreground font-semibold">Report submitted successfully.</p>
                    <p className="text-sm text-muted-foreground">Local authorities have been notified.</p>
                    <button onClick={handleClose} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
