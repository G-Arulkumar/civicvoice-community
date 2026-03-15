import { motion } from 'framer-motion';
import { Shield, Mail, Phone } from 'lucide-react';

export default function About() {
  return (
    <main className="container max-w-2xl py-12 pb-24">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">About CivicVoice</h1>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              CivicVoice is a high-trust reporting tool for urban infrastructure. We empower citizens to report civic problems — from potholes to broken street lights — and track their resolution in real time. Every report is a step toward a safer, better-maintained city.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">How It Works</h2>
            <div className="grid gap-3">
              {[
                { step: '01', title: 'Spot a Problem', desc: 'See a pothole, garbage dump, or broken light? Open CivicVoice.' },
                { step: '02', title: 'Report It', desc: 'Take a photo, confirm your location, and submit. Takes 30 seconds.' },
                { step: '03', title: 'Track Progress', desc: 'Watch as reports gain visibility and authorities respond.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-muted/50">
                  <span className="text-primary font-bold tabular-nums text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Transparency</h2>
            <p className="text-muted-foreground leading-relaxed">
              CivicVoice functions as a transparent ledger of public accountability. Every issue, every report count, and every status update is visible to all. When citizens see problems getting fixed, trust in local governance grows.
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                hello@civicvoice.in
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +91 11 2345 6789
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  );
}
