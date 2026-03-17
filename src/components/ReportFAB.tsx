import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, MapPin, Loader2, Check, Users, AlertTriangle, ImagePlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssueContext';
import { ISSUE_TYPES, IssueType } from '@/types/issue';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE = 1024; // max dimension in px for compression

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      if (width <= MAX_IMAGE_SIZE && height <= MAX_IMAGE_SIZE) {
        resolve(file);
        return;
      }
      const scale = MAX_IMAGE_SIZE / Math.max(width, height);
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: 'image/jpeg' })),
        'image/jpeg',
        0.8
      );
    };
    img.src = url;
  });
}

export default function ReportFAB() {
  const { isAuthenticated, user } = useAuth();
  const { addIssue, findNearbyDuplicate, addReport } = useIssues();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'checking' | 'duplicate' | 'success' | 'error'>('form');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [type, setType] = useState<IssueType>('Pothole');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

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
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Try reverse geocoding
          let name = 'Current Location';
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16`);
            const data = await res.json();
            if (data?.address) {
              const { road, suburb, city, town, village } = data.address;
              name = [road, suburb || city || town || village].filter(Boolean).join(', ') || name;
            }
          } catch { /* fallback to default name */ }
          setLocation({ lat: latitude, lng: longitude, name });
          setLocating(false);
        },
        () => {
          setLocation({ lat: 28.6139, lng: 77.2090, name: 'New Delhi (default)' });
          setLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090, name: 'New Delhi (default)' });
      setLocating(false);
    }
  };

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Compress before preview
    const compressed = await compressImage(file);
    setImageFile(compressed);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(compressed);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) { toast.error('Please add a photo'); return; }
    if (!description.trim()) { toast.error('Please add a description'); return; }
    if (!location || !user) return;

    setStep('checking');

    try {
      const dup = findNearbyDuplicate(type, location.lat, location.lng);
      if (dup) {
        setDuplicateIssue(dup);
        const added = await addReport(dup.id, user.uid);
        setStep('duplicate');
        if (!added) {
          toast.info('You have already reported this issue');
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
          setErrorMsg('Failed to submit report. Please try again.');
          setStep('error');
          return;
        }
        setStep('success');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg('Something went wrong. Please try again.');
      setStep('error');
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
    setErrorMsg('');
  };

  const formValid = !!imageFile && description.trim().length > 0 && !locating;

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
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-foreground">Report a Problem</h2>
                  <button onClick={handleClose} className="p-1 rounded-md hover:bg-muted transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Progress bar for form step */}
                {step === 'form' && (
                  <div className="flex gap-1 mb-5">
                    <div className={`h-1 flex-1 rounded-full ${imageFile ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded-full ${location ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded-full ${description.trim() ? 'bg-primary' : 'bg-muted'}`} />
                  </div>
                )}

                {step === 'form' && (
                  <div className="space-y-4">
                    {/* Photo */}
                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Photo *</label>
                      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                      {imagePreview ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-foreground/60 text-background">
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => fileRef.current?.click()} className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-foreground/60 text-background text-xs font-medium flex items-center gap-1">
                            <ImagePlus className="h-3 w-3" /> Change
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

                    {/* Location */}
                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Location</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-sm">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {locating ? (
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Detecting location...
                          </span>
                        ) : (
                          <span className="text-foreground truncate">{location?.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Problem Type */}
                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Problem Type</label>
                      <div className="flex flex-wrap gap-2">
                        {ISSUE_TYPES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              type === t
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">Description *</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the problem briefly..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground text-right mt-0.5">{description.length}/500</p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!formValid}
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
                      {(duplicateIssue?.reportCount || 0) + 1} people reported this issue
                    </p>
                    <p className="text-sm text-muted-foreground">Your voice has been added to the existing report.</p>
                    <button onClick={handleClose} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                      Done
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="h-12 w-12 rounded-full bg-solved/10 flex items-center justify-center"
                    >
                      <Check className="h-6 w-6 text-solved" />
                    </motion.div>
                    <p className="text-foreground font-semibold">Report submitted!</p>
                    <p className="text-sm text-muted-foreground">Local authorities have been notified.</p>
                    <button onClick={handleClose} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                      Done
                    </button>
                  </div>
                )}

                {step === 'error' && (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-foreground font-semibold">Submission failed</p>
                    <p className="text-sm text-muted-foreground">{errorMsg}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setStep('form')} className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold">
                        Try Again
                      </button>
                      <button onClick={handleClose} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                        Close
                      </button>
                    </div>
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
