import { CheckCircle, Clock, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Step } from '@/types/proctor';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: Step[];
  startTime: Date | null;
}

export function SummaryModal({ isOpen, onClose, steps, startTime }: SummaryModalProps) {
  if (!isOpen) return null;

  const duration = startTime
    ? Math.floor((Date.now() - startTime.getTime()) / 1000)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-medium border border-border animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-success/10 to-primary/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/20 text-success">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Check-In Complete!</h2>
              <p className="text-sm text-muted-foreground">All verifications passed</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Duration */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Total Duration</span>
            </div>
            <span className="font-mono text-lg font-bold text-primary">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Steps Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Completed Steps
            </h3>
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">{step.title}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Button
            onClick={onClose}
            className="w-full rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
          >
            Start GRE Exam
          </Button>
        </div>
      </div>
    </div>
  );
}
