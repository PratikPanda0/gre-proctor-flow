import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: Date | null;
}

export function Timer({ startTime }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!startTime) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-soft">
      <Clock className="w-4 h-4 text-primary" />
      <span className="font-mono text-sm font-medium text-foreground">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
