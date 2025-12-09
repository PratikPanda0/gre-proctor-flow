import { CheckCircle, Circle, XCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Step, StepStatus } from '@/types/proctor';
import { cn } from '@/lib/utils';

interface ProgressPanelProps {
  steps: Step[];
  currentStep: number;
  isLoading: boolean;
  isCompleted: boolean;
  onAction: () => void;
  onRetry: () => void;
}

const stepIcons: Record<StepStatus, React.ReactNode> = {
  pending: <Circle className="w-5 h-5" />,
  inProgress: <Loader2 className="w-5 h-5 animate-spin" />,
  success: <CheckCircle className="w-5 h-5" />,
  failure: <XCircle className="w-5 h-5" />,
};

const actionLabels: Record<number, string> = {
  1: 'Type "Yes" or "Ready" to begin',
  2: 'Verify ID',
  3: 'Verify Items',
  4: 'Scan Workspace',
  5: 'Start Environment Scan',
  6: 'Verify',
  7: 'Confirm & Start Exam',
};

export function ProgressPanel({
  steps,
  currentStep,
  isLoading,
  isCompleted,
  onAction,
  onRetry,
}: ProgressPanelProps) {
  const currentStepData = steps.find(s => s.id === currentStep);
  const showRetry = currentStepData?.status === 'failure';
  const showAction = currentStep > 1 && currentStepData?.status === 'inProgress';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Verification Progress</h2>
          <p className="text-xs text-muted-foreground">
            {isCompleted ? 'All steps completed' : `Step ${currentStep} of ${steps.length}`}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex-1 space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-xl transition-all duration-300",
              step.status === 'inProgress' && "bg-warning/10 border border-warning/30 shadow-soft",
              step.status === 'success' && "bg-success/5",
              step.status === 'failure' && "bg-destructive/5",
              step.status === 'pending' && "opacity-60"
            )}
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[26px] top-12 w-0.5 h-[calc(100%-24px)]",
                  step.status === 'success' ? "bg-success/30" : "bg-border"
                )}
              />
            )}

            {/* Status Icon */}
            <div
              className={cn(
                "relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                step.status === 'pending' && "bg-muted text-muted-foreground",
                step.status === 'inProgress' && "bg-warning/20 text-warning shadow-md",
                step.status === 'success' && "bg-success/20 text-success",
                step.status === 'failure' && "bg-destructive/20 text-destructive"
              )}
            >
              {stepIcons[step.status]}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={cn(
                    "text-sm font-medium truncate",
                    step.status === 'pending' ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {step.title}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                    step.status === 'pending' && "bg-muted text-muted-foreground",
                    step.status === 'inProgress' && "bg-warning/20 text-warning",
                    step.status === 'success' && "bg-success/20 text-success",
                    step.status === 'failure' && "bg-destructive/20 text-destructive"
                  )}
                >
                  {step.status === 'inProgress' ? 'In Progress' : step.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {showRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Step
          </Button>
        )}
        
        {showAction && (
          <Button
            onClick={onAction}
            disabled={isLoading}
            className="w-full rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabels[currentStep]
            )}
          </Button>
        )}

        {isCompleted && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">Ready to Start Exam</p>
          </div>
        )}
      </div>
    </div>
  );
}
