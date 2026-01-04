"use client";
import { Fingerprint, Pause, Play, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Page = () => {
  const [isPacing, setIsPacing] = useState(false);
  const [paceRate, setPaceRate] = useState(3000);

  // Haptic Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPacing && "vibrate" in navigator) {
      interval = setInterval(() => {
        navigator.vibrate([100, 50, 100]);
      }, paceRate);
    }
    return () => clearInterval(interval);
  }, [isPacing, paceRate]);

  return (
    <main className="p-10 max-w-lg mx-auto">
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center py-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Guided Sensation
          </h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
            Sync your rhythm
          </p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-4 border-fuchsia-500/10 transition-all duration-700 ${
              isPacing ? "scale-125 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{ transitionDuration: `${paceRate}ms` }}
          />
          <button
            onClick={() => setIsPacing(!isPacing)}
            style={{ "--pace-rate": `${paceRate}ms` } as React.CSSProperties}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all relative z-10 shadow-[0_0_60px_rgba(192,38,211,0.2)] ${
              isPacing
                ? `bg-fuchsia-600 text-white scale-110 animate-[heartbeat_var(--pace-rate)_infinite]`
                : "bg-slate-900 text-fuchsia-500 border border-fuchsia-500/30"
            }`}
          >
            {isPacing ? (
              <Pause size={48} fill="currentColor" />
            ) : (
              <Play size={48} fill="currentColor" className="ml-2" />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              {isPacing ? "Active" : "Begin"}
            </span>
          </button>
        </div>

        <div className="w-full space-y-6 pt-10">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
              <span>Rhythm Control</span>
              <span className="text-fuchsia-500">
                {(60000 / paceRate).toFixed(0)} BPM
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={paceRate}
              onChange={(e) => setPaceRate(Number(e.target.value))}
              className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full appearance-none"
            />
          </div>
          <Alert variant="default">
            <Fingerprint size={24} />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              Pace your strokes with the pulse. Stop all contact when heat hits
              9/10. Use deep breaths to settle the biological surge.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  );
};

export default Page;
