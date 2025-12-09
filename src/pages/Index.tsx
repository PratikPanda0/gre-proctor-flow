import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { CameraFeed, CameraFeedHandle } from '@/components/CameraFeed';
import { ChatWindow } from '@/components/ChatWindow';
import { ProgressPanel } from '@/components/ProgressPanel';
import { SummaryModal } from '@/components/SummaryModal';
import { useProctorStore } from '@/hooks/useProctorStore';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const cameraRef = useRef<CameraFeedHandle>(null);
  const {
    state,
    initializeSession,
    processUserMessage,
    completeCurrentStep,
    retryCurrentStep,
    addMessage,
  } = useProctorStore();
  
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Initialize session on mount
    const timer = setTimeout(() => {
      initializeSession();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [initializeSession]);

  useEffect(() => {
    // Show summary modal when completed
    if (state.isCompleted) {
      const timer = setTimeout(() => setShowSummary(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isCompleted]);

  const handleCaptureAndVerify = async () => {
    const imageData = cameraRef.current?.captureFrame();
    
    if (!imageData) {
      toast({
        title: "Capture Failed",
        description: "Could not capture image from camera. Please check camera permissions.",
        variant: "destructive",
      });
      return;
    }

    // Add a user message showing the capture action
    addMessage('user', '📸 [ID Image Captured]');
    
    toast({
      title: "Image Captured",
      description: "Sending ID image for verification...",
    });

    // Here you would send the imageData to your API
    // For now, we'll simulate the API call through the existing flow
    console.log('Captured image data length:', imageData.length);
    
    // Trigger the step completion (which includes mock API call)
    completeCurrentStep();
  };

  const canSendMessage = state.currentStep === 1 && 
    state.steps[0]?.status === 'inProgress' && 
    !state.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header
        startTime={state.startTime}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-7rem)]">
          {/* Column 1: Camera Feed */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-soft p-4 lg:p-5 overflow-hidden">
            <CameraFeed ref={cameraRef} detections={state.detections} />
          </div>

          {/* Column 2: Chat Window */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-soft p-4 lg:p-5 overflow-hidden">
            <ChatWindow
              messages={state.messages}
              isLoading={state.isLoading}
              canSend={canSendMessage}
              currentStep={state.currentStep}
              onSendMessage={processUserMessage}
              onCaptureAndVerify={handleCaptureAndVerify}
              onStepAction={completeCurrentStep}
            />
          </div>

          {/* Column 3: Progress Panel */}
          <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-soft p-4 lg:p-5 overflow-hidden">
            <ProgressPanel
              steps={state.steps}
              currentStep={state.currentStep}
              isLoading={state.isLoading}
              isCompleted={state.isCompleted}
              onAction={completeCurrentStep}
              onRetry={retryCurrentStep}
            />
          </div>
        </div>
      </main>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        steps={state.steps}
        startTime={state.startTime}
      />
    </div>
  );
};

export default Index;
