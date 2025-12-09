import { useState, useCallback } from 'react';
import { Step, Message, Detection, StepStatus, ProctorState } from '@/types/proctor';
import { toast } from '@/hooks/use-toast';

const initialSteps: Step[] = [
  { id: 1, title: 'Welcome & Introduction', status: 'pending', apiEndpoint: '/api/step1/welcome' },
  { id: 2, title: 'ID/Documentation Verification', status: 'pending', apiEndpoint: '/api/step2/id-verification' },
  { id: 3, title: 'Physical Items Check', status: 'pending', apiEndpoint: '/api/step3/items-check' },
  { id: 4, title: 'Digital Devices Check', status: 'pending', apiEndpoint: '/api/step4/devices-check' },
  { id: 5, title: 'Environment Scan', status: 'pending', apiEndpoint: '/api/step5/environment-scan' },
  { id: 6, title: 'Phone/Ear/Wrist Verification', status: 'pending', apiEndpoint: '/api/step6/phone-ear-wrist' },
  { id: 7, title: 'Final Confirmation', status: 'pending', apiEndpoint: '/api/step7/final-confirmation' },
];

const initialDetections: Detection[] = [
  { item: 'Phone', status: 'clear' },
  { item: 'Calculator', status: 'clear' },
  { item: 'Smartwatch', status: 'clear' },
  { item: 'Earbuds', status: 'clear' },
];

const stepMessages: Record<number, string> = {
  1: `Hello! Welcome to your GRE exam. I'm your AI Proctor for today's session.

This session is monitored via webcam & screen recording.

We'll complete a 7-step onboarding:
1. Welcome & Introduction
2. ID Verification
3. Physical Items Check
4. Digital Devices Check
5. Environment Scan
6. Phone/Ear/Wrist Verification
7. Final Confirmation

It takes ~5-10 minutes.
Type "Yes" or "Ready" to begin.`,
  2: `Great! Let's verify your identity.

Please hold your government-issued ID close to the camera clearly. Make sure all text is readable.

Both front & back may be asked. Click **Verify ID** when ready.`,
  3: `ID verified successfully! ✓

Now, let's check your physical items.

Show any blank sheets or scratch paper you have. Maximum 3 pages allowed. Display both front and back clearly to the camera.

Click **Verify Items** when ready.`,
  4: `Physical items verified! ✓

Let's scan your workspace for digital devices.

No phones, tablets, or calculators are allowed within reach. Please show your entire desk area.

Click **Scan Workspace** when ready.`,
  5: `Workspace is clear! ✓

Now, let's do a 360° environment scan.

Please rotate your camera slowly to show your entire room. Ensure:
• No other people are present
• No notes or study materials visible
• Only approved items on desk

Click **Start Environment Scan** when ready.`,
  6: `Environment verified! ✓

Final physical verification required.

Please show to the camera:
• Both ears (no earbuds/hearing devices)
• Both wrists (remove smartwatches if any)
• Both hands with fingers spread

Click **Verify** when ready.`,
  7: `Physical verification complete! ✓

This is your final confirmation step.

Please confirm that you understand and agree to:
• No unauthorized materials during the exam
• The session is recorded for review
• Any violations may void your exam

Click **Confirm & Start Exam** to proceed.`,
};

export function useProctorStore() {
  const [state, setState] = useState<ProctorState>({
    currentStep: 1,
    steps: initialSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'inProgress' : 'pending'
    })),
    messages: [],
    detections: initialDetections,
    isLoading: false,
    startTime: null,
    isCompleted: false,
  });

  const addMessage = useCallback((type: 'system' | 'user', content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const initializeSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      startTime: new Date(),
    }));
    addMessage('system', stepMessages[1]);
  }, [addMessage]);

  const updateStepStatus = useCallback((stepId: number, status: StepStatus) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(s => 
        s.id === stepId ? { ...s, status } : s
      ),
    }));
  }, []);

  const mockApiCall = useCallback(async (endpoint: string): Promise<boolean> => {
    // Simulate API call with random success (90% success rate)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return Math.random() > 0.1;
  }, []);

  const processUserMessage = useCallback(async (message: string) => {
    addMessage('user', message);
    
    const { currentStep, steps } = state;
    const currentStepData = steps.find(s => s.id === currentStep);
    
    if (!currentStepData || currentStepData.status === 'success') return;

    // For step 1, check for "yes" or "ready"
    if (currentStep === 1) {
      const lowerMessage = message.toLowerCase().trim();
      if (lowerMessage.includes('yes') || lowerMessage.includes('ready')) {
        setState(prev => ({ ...prev, isLoading: true }));
        
        const success = await mockApiCall(currentStepData.apiEndpoint);
        
        if (success) {
          updateStepStatus(1, 'success');
          updateStepStatus(2, 'inProgress');
          setState(prev => ({ ...prev, currentStep: 2, isLoading: false }));
          
          toast({
            title: "Step Completed",
            description: "Welcome step completed successfully!",
          });
          
          setTimeout(() => addMessage('system', stepMessages[2]), 500);
        } else {
          updateStepStatus(1, 'failure');
          setState(prev => ({ ...prev, isLoading: false }));
          addMessage('system', "There was an issue processing your response. Please try again by typing 'Yes' or 'Ready'.");
          
          toast({
            title: "Error",
            description: "Failed to complete step. Please retry.",
            variant: "destructive",
          });
        }
      } else {
        addMessage('system', "Please type 'Yes' or 'Ready' to begin the verification process.");
      }
    }
  }, [state, addMessage, mockApiCall, updateStepStatus]);

  const completeCurrentStep = useCallback(async () => {
    const { currentStep, steps } = state;
    const currentStepData = steps.find(s => s.id === currentStep);
    
    if (!currentStepData || currentStep === 1) return;

    setState(prev => ({ ...prev, isLoading: true }));
    
    const success = await mockApiCall(currentStepData.apiEndpoint);
    
    if (success) {
      updateStepStatus(currentStep, 'success');
      
      if (currentStep < 7) {
        updateStepStatus(currentStep + 1, 'inProgress');
        setState(prev => ({ 
          ...prev, 
          currentStep: currentStep + 1, 
          isLoading: false 
        }));
        
        toast({
          title: "Step Completed",
          description: `${currentStepData.title} completed successfully!`,
        });
        
        setTimeout(() => addMessage('system', stepMessages[currentStep + 1]), 500);
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isCompleted: true,
        }));
        
        addMessage('system', "🎉 All steps completed successfully!\n\nYou are now ready to start your GRE exam. Good luck!");
        
        toast({
          title: "Check-in Complete!",
          description: "You are ready to start your GRE exam.",
        });
      }
    } else {
      updateStepStatus(currentStep, 'failure');
      setState(prev => ({ ...prev, isLoading: false }));
      
      addMessage('system', `Verification failed. Please ensure you're following the instructions correctly and click 'Retry Step' to try again.`);
      
      toast({
        title: "Verification Failed",
        description: "Please retry the current step.",
        variant: "destructive",
      });
    }
  }, [state, mockApiCall, updateStepStatus, addMessage]);

  const retryCurrentStep = useCallback(() => {
    const { currentStep } = state;
    updateStepStatus(currentStep, 'inProgress');
    addMessage('system', stepMessages[currentStep]);
  }, [state, updateStepStatus, addMessage]);

  const updateDetection = useCallback((item: string, status: 'clear' | 'detected') => {
    setState(prev => ({
      ...prev,
      detections: prev.detections.map(d =>
        d.item === item ? { ...d, status } : d
      ),
    }));
  }, []);

  return {
    state,
    initializeSession,
    processUserMessage,
    completeCurrentStep,
    retryCurrentStep,
    addMessage,
    updateDetection,
  };
}
